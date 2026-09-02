/* ============================================================
   Kantin Dapo Hakaksado — db.js  (shared data layer)
   ------------------------------------------------------------
   Two modes, same API for every page:
     • local  – data in this browser only (localStorage). Used when
                config.js has no Firebase details, or as a fallback.
     • cloud  – data in Firebase Firestore, shared live between all
                devices, with offline cache + queue.
   ============================================================ */
(function () {
  'use strict';

  const SDK_VER = '12.18.0';
  const SDK_BASE = 'https://www.gstatic.com/firebasejs/' + SDK_VER + '/';
  const LS = {
    sales: 'hakaksado_sales_v1',      // same key as the original system
    menu: 'hakaksado_menu_v1',
    migrated: 'hakaksado_migrated_v1',
    device: 'hakaksado_device_v1'
  };

  const CFG = window.KANTIN_CONFIG || {};
  const FB = CFG.firebase || {};
  const cloudConfigured = !!(FB.apiKey && FB.projectId && !/^\s*(paste|xxx|your|isi)/i.test(FB.apiKey));
  const requireLogin = CFG.requireLogin !== false;

  const state = {
    mode: cloudConfigured ? 'cloud' : 'local',
    configured: cloudConfigured,
    requireLogin,
    ready: false,
    user: null,
    online: navigator.onLine,
    pending: 0,
    persistence: false,
    error: null,
    errorDetail: '',
    project: FB.projectId || '',
    shopName: CFG.shopName || 'Kantin Dapo Hakaksado'
  };
  const stateListeners = new Set();
  function emit() {
    stateListeners.forEach(f => { try { f(state); } catch (e) { console.error(e); } });
    renderBadge();
  }

  /* ---------------------------------------------------------- helpers */
  const money = n => Math.round((Number(n) || 0) * 100) / 100;
  const rm = n => 'RM' + money(n).toFixed(2);
  const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const pad = n => String(n).padStart(2, '0');
  const startOfDay = d => { d = new Date(d); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const fmtDate = d => { d = new Date(d); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtShort = d => { d = new Date(d); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
  const fmtTime = d => { d = new Date(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const fmtTimeS = d => { d = new Date(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const ymd = d => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const lsGet = (k, dflt) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? dflt : v; } catch (e) { return dflt; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error(e); } };

  function startClock(dateId, timeId) {
    const tick = () => {
      const d = new Date();
      const t = document.getElementById(timeId), dd = document.getElementById(dateId);
      if (t) t.textContent = fmtTimeS(d);
      if (dd) dd.textContent = fmtDate(d);
    };
    tick(); setInterval(tick, 1000);
  }

  /* category colours – same as the cards on index.html */
  const CAT_STYLE = {
    'Sarapan Pagi': { c1: '#ef7aa0', c2: '#d7548a', emoji: '🍳' },
    'Nasi & Telur': { c1: '#c4d0de', c2: '#a3b4c8', emoji: '🍚', dark: true },
    'Lauk (Ikan & Ayam)': { c1: '#86c4e6', c2: '#4a95c9', emoji: '🐟' },
    'Sayur-Sayuran': { c1: '#8ad3cd', c2: '#4fa3a8', emoji: '🥬' },
    'Minuman (Panas / Sejuk)': { c1: '#b6abe6', c2: '#7f6fcb', emoji: '☕️' },
    'Minuman Lain': { c1: '#f19163', c2: '#e06522', emoji: '🥤' }
  };
  const CAT_FALLBACK = [
    { c1: '#f7c948', c2: '#d99a00', emoji: '🍽️', dark: true },
    { c1: '#9ad6a0', c2: '#5fae6a', emoji: '🥗' },
    { c1: '#f2a2c2', c2: '#c96b95', emoji: '🍰' },
    { c1: '#a0c4ff', c2: '#6a93d8', emoji: '🍜' },
    { c1: '#ffb47a', c2: '#e07a2a', emoji: '🍢' }
  ];
  function catStyle(name, idx) {
    if (CAT_STYLE[name]) return CAT_STYLE[name];
    let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return CAT_FALLBACK[(idx != null ? idx : h) % CAT_FALLBACK.length];
  }

  /* ---------------------------------------------------------- normalisers */
  function normItem(it) {
    it = it || {};
    const name = String(it.name ?? it.nama ?? it.n ?? '').trim();
    const price = money(it.price ?? it.harga ?? it.p ?? 0);
    const qty = Math.max(1, Math.round(Number(it.qty ?? it.q ?? it.quantity ?? it.count ?? 1) || 1));
    const orig = money(it.orig ?? it.origPrice ?? price);
    return { name, price, qty, cat: String(it.cat ?? it.kategori ?? ''), orig };
  }

  /** Accepts a sale in any old/new shape and returns the canonical shape. */
  function normSale(s, i) {
    s = s || {};
    let ts = s.ts ?? s.time ?? s.date ?? s.timestamp;
    if (ts && typeof ts === 'object' && typeof ts.toMillis === 'function') ts = ts.toMillis();
    ts = typeof ts === 'number' ? ts : (Date.parse(ts) || Date.now());
    const src = Array.isArray(s.items) ? s.items : Array.isArray(s.cart) ? s.cart : [];
    const items = src.map(normItem).filter(it => it.name);
    const calc = money(items.reduce((a, it) => a + it.price * it.qty, 0));
    const total = money(s.total ?? s.jumlah ?? calc);
    const subtotal = money(s.subtotal ?? (items.length ? calc : total));
    const method = (s.method === 'qr' || s.kaedah === 'qr' || s.qr === true) ? 'qr' : 'cash';
    const paid = money(s.paid ?? s.cash ?? s.tunai ?? total);
    const change = money(s.change ?? s.baki ?? (method === 'cash' ? Math.max(0, paid - total) : 0));
    const id = (typeof s.id === 'string' && s.id.length >= 10) ? s.id : ('L' + ts + '-' + (i || 0));
    return {
      id, ts, items, subtotal, total, adj: money(total - subtotal),
      note: String(s.note ?? s.adjNote ?? ''),
      method, paid, change, device: String(s.device || '')
    };
  }

  function defaultMenu() {
    const d = window.KANTIN_DEFAULT_MENU || { cats: [], items: [] };
    const items = (d.items || []).map(r => Array.isArray(r)
      ? { id: 'd-' + slug(r[0] + '-' + r[1]), cat: String(r[0]), name: String(r[1]), price: money(r[2]) }
      : r);
    return normMenu({ cats: d.cats || [], items });
  }

  function normMenu(m) {
    m = m || {};
    const items = (Array.isArray(m.items) ? m.items : [])
      .map(it => ({ id: String(it.id || uid('m')), name: String(it.name || '').trim(), price: money(it.price), cat: String(it.cat || 'Lain-lain').trim() || 'Lain-lain' }))
      .filter(it => it.name);
    const cats = [...new Set([...(Array.isArray(m.cats) ? m.cats : []).map(c => String(c).trim()).filter(Boolean), ...items.map(it => it.cat)])];
    return { cats, items, updatedAt: Number(m.updatedAt) || 0 };
  }

  /* ---------------------------------------------------------- local store */
  const localListeners = { sales: new Set(), menu: new Set() };
  window.addEventListener('storage', e => {
    if (e.key === LS.sales) localListeners.sales.forEach(f => f());
    if (e.key === LS.menu) localListeners.menu.forEach(f => f());
  });
  const localSalesRaw = () => { const v = lsGet(LS.sales, []); return Array.isArray(v) ? v : []; };
  function localNormalise() {           // one-off: give every old sale a stable id
    const raw = localSalesRaw();
    if (raw.length && raw.some(s => !(typeof s.id === 'string' && s.id.length >= 10))) {
      lsSet(LS.sales, raw.map((s, i) => normSale(s, i)));
    }
  }
  const localSales = () => localSalesRaw().map((s, i) => normSale(s, i));
  const localMenu = () => { const m = lsGet(LS.menu, null); if (m) return normMenu(m); const d = defaultMenu(); lsSet(LS.menu, d); return d; };
  const inRange = (s, r) => (r.from == null || s.ts >= r.from) && (r.to == null || s.ts < r.to);

  /* ---------------------------------------------------------- cloud (Firebase) */
  let fdb = null, fauth = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res;
      s.onerror = () => rej(new Error('Tidak dapat memuatkan ' + src));
      document.head.appendChild(s);
    });
  }
  function track(promise) {
    state.pending++; emit();
    return promise.catch(setError).finally(() => { state.pending = Math.max(0, state.pending - 1); emit(); });
  }
  function setError(e) {
    if (!e) return;
    console.error(e);
    state.error = e.code || 'error';
    state.errorDetail = e.message || String(e);
    emit();
  }
  function clearError() { if (state.error) { state.error = null; state.errorDetail = ''; emit(); } }

  async function initCloud() {
    await loadScript(SDK_BASE + 'firebase-app-compat.js');
    await Promise.all([
      loadScript(SDK_BASE + 'firebase-firestore-compat.js'),
      requireLogin ? loadScript(SDK_BASE + 'firebase-auth-compat.js') : Promise.resolve()
    ]);
    firebase.initializeApp(FB);
    fdb = firebase.firestore();
    try { await fdb.enablePersistence({ synchronizeTabs: true }); state.persistence = true; }
    catch (e) { state.persistence = false; console.warn('Offline cache not available:', e && e.code); }
    window.addEventListener('online', () => { state.online = true; emit(); });
    window.addEventListener('offline', () => { state.online = false; emit(); });
    if (requireLogin) {
      fauth = firebase.auth();
      try { await fauth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) { /* ignore */ }
      state.user = await new Promise(res => { const un = fauth.onAuthStateChanged(u => { un(); res(u); }); });
      fauth.onAuthStateChanged(u => { state.user = u; if (u) clearError(); emit(); });
    }
  }

  const AUTH_MSG = {
    'auth/invalid-credential': 'E-mel atau kata laluan salah.',
    'auth/wrong-password': 'Kata laluan salah.',
    'auth/user-not-found': 'E-mel ini belum didaftarkan dalam Firebase Authentication.',
    'auth/invalid-email': 'Format e-mel tidak sah.',
    'auth/user-disabled': 'Akaun ini telah dinyahaktifkan.',
    'auth/too-many-requests': 'Terlalu banyak percubaan. Cuba lagi sebentar nanti.',
    'auth/network-request-failed': 'Tiada sambungan internet.',
    'auth/operation-not-allowed': 'Log masuk E-mel/Kata laluan belum diaktifkan di Firebase (Authentication › Sign-in method).',
    'auth/configuration-not-found': 'Firebase Authentication belum disediakan untuk projek ini (Authentication › Get started).',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'apiKey dalam config.js tidak sah.'
  };
  const authMessage = e => AUTH_MSG[e && e.code] || ((e && e.message) || 'Log masuk gagal.');

  async function login(email, pass) {
    if (!fauth) throw new Error('Mod tempatan — tiada log masuk diperlukan.');
    const cred = await fauth.signInWithEmailAndPassword(String(email).trim(), pass);
    state.user = cred.user; clearError(); emit();
    return cred.user;
  }
  async function logout() { if (fauth) await fauth.signOut(); state.user = null; emit(); }

  function showLogin() {
    return new Promise(resolve => {
      const back = document.createElement('div');
      back.className = 'login-back';
      back.innerHTML = `
        <div class="login" role="dialog" aria-labelledby="loginTitle">
          <div class="brand">${esc(state.shopName)}</div>
          <h2 id="loginTitle">Log masuk kaunter</h2>
          <p>Masukkan e-mel dan kata laluan yang didaftarkan dalam Firebase. Anda hanya perlu log masuk sekali pada peranti ini.</p>
          <form>
            <label class="field">E-mel<input class="input" type="email" name="email" autocomplete="username" required autofocus></label>
            <label class="field">Kata laluan<input class="input" type="password" name="pass" autocomplete="current-password" required></label>
            <div class="err" aria-live="polite"></div>
            <button class="btn primary lg block" type="submit">Log masuk</button>
          </form>
          <p style="margin:16px 0 0;font-size:.78rem">Masalah log masuk? <a href="settings.html">Buka Tetapan &amp; bantuan</a></p>
        </div>`;
      const form = back.querySelector('form'), err = back.querySelector('.err'), btn = back.querySelector('button');
      form.addEventListener('submit', async ev => {
        ev.preventDefault();
        err.textContent = ''; btn.disabled = true; btn.textContent = 'Sedang log masuk…';
        try {
          await login(form.email.value, form.pass.value);
          back.remove(); resolve();
        } catch (e) {
          err.textContent = authMessage(e);
          btn.disabled = false; btn.textContent = 'Log masuk';
        }
      });
      const mount = () => { document.body.appendChild(back); setTimeout(() => form.email.focus(), 50); };
      document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);
    });
  }

  /* ---------------------------------------------------------- ready() */
  let readyPromise = null;
  function ready(opts) {
    if (readyPromise) return readyPromise;
    opts = opts || {};
    readyPromise = (async () => {
      if (state.mode === 'cloud') {
        try {
          await initCloud();
          if (requireLogin && !state.user && opts.loginOverlay !== false) await showLogin();
        } catch (e) {
          console.error('Cloud init failed, falling back to local mode', e);
          state.mode = 'local'; state.error = 'sdk'; state.errorDetail = e.message || String(e);
        }
      }
      if (state.mode === 'local') localNormalise();
      state.ready = true; emit();
      const canWrite = state.mode === 'cloud' && (!requireLogin || !!state.user);
      if (canWrite) {
        if (pendingLocalCount() > 0 && opts.autoMigrate !== false) {
          migrateLocal().then(r => { if (r.uploaded) toast(`Data lama dimuat naik ke cloud: ${r.uploaded} transaksi`, 'ok'); }).catch(() => { });
        }
      }
      return state;
    })();
    return readyPromise;
  }
  const cloud = () => state.mode === 'cloud' && !!fdb;
  const MENU_DOC = () => fdb.collection('config').doc('menu');

  /* ---------------------------------------------------------- menu API */
  let seeding = false;
  function watchMenu(cb) {
    if (cloud()) {
      return MENU_DOC().onSnapshot(snap => {
        clearError();
        if (snap.exists) cb(normMenu(snap.data()));
        else if (!snap.metadata.fromCache) {           // server confirmed: no menu yet → seed once
          if (!seeding) { seeding = true; const d = defaultMenu(); d.updatedAt = Date.now(); track(MENU_DOC().set(d)); }
        } else cb(defaultMenu());                        // offline, nothing cached yet
      }, setError);
    }
    const fire = () => cb(localMenu());
    fire(); localListeners.menu.add(fire);
    return () => localListeners.menu.delete(fire);
  }
  async function getMenu() {
    if (cloud()) {
      const snap = await MENU_DOC().get();
      if (snap.exists) return normMenu(snap.data());
      const d = defaultMenu(); d.updatedAt = Date.now(); await MENU_DOC().set(d); return d;
    }
    return localMenu();
  }
  async function saveMenu(menu) {
    const m = normMenu(menu); m.updatedAt = Date.now();
    if (cloud()) { track(MENU_DOC().set(m)); return m; }
    lsSet(LS.menu, m); localListeners.menu.forEach(f => f()); return m;
  }
  const resetMenuToDefault = () => saveMenu(defaultMenu());

  /* ---------------------------------------------------------- sales API */
  function salesQuery(range) {
    let q = fdb.collection('sales');
    if (range.from != null) q = q.where('ts', '>=', +range.from);
    if (range.to != null) q = q.where('ts', '<', +range.to);
    return q.orderBy('ts', 'asc');
  }
  function watchSales(range, cb) {
    range = range || {};
    if (cloud()) {
      return salesQuery(range).onSnapshot(snap => { clearError(); cb(snap.docs.map(d => normSale(d.data()))); }, setError);
    }
    const fire = () => cb(localSales().filter(s => inRange(s, range)).sort((a, b) => a.ts - b.ts));
    fire(); localListeners.sales.add(fire);
    return () => localListeners.sales.delete(fire);
  }
  async function getSales(range) {
    range = range || {};
    if (cloud()) { const snap = await salesQuery(range).get(); return snap.docs.map(d => normSale(d.data())); }
    return localSales().filter(s => inRange(s, range)).sort((a, b) => a.ts - b.ts);
  }
  async function getLastSale() {
    if (cloud()) { const snap = await fdb.collection('sales').orderBy('ts', 'desc').limit(1).get(); return snap.empty ? null : normSale(snap.docs[0].data()); }
    const all = localSales(); if (!all.length) return null;
    return all.reduce((a, b) => (b.ts > a.ts ? b : a));
  }
  async function addSale(sale) {
    const s = normSale(Object.assign({}, sale, { id: sale.id || uid('S'), ts: sale.ts || Date.now(), device: sale.device || deviceName() }));
    if (cloud()) { track(fdb.collection('sales').doc(s.id).set(s)); return s; }
    const arr = localSalesRaw(); arr.push(s); lsSet(LS.sales, arr);
    localListeners.sales.forEach(f => f());
    return s;
  }
  async function updateSale(id, patch) {
    if (cloud()) { track(fdb.collection('sales').doc(id).set(patch, { merge: true })); return; }
    const arr = localSales().map(s => s.id === id ? normSale(Object.assign({}, s, patch)) : s);
    lsSet(LS.sales, arr); localListeners.sales.forEach(f => f());
  }
  async function deleteSale(id) {
    if (cloud()) { track(fdb.collection('sales').doc(id).delete()); return; }
    lsSet(LS.sales, localSales().filter(s => s.id !== id)); localListeners.sales.forEach(f => f());
  }

  /* ---------------------------------------------------------- migration (old browser data → cloud) */
  function pendingLocalCount() {
    if (!cloudConfigured) return 0;
    const raw = localSalesRaw(); if (!raw.length) return 0;
    const m = lsGet(LS.migrated, null);
    return (!m || m.count !== raw.length) ? raw.length : 0;
  }
  async function migrateLocal() {
    if (!cloud()) return { uploaded: 0 };
    localNormalise();
    const sales = localSales();
    if (!sales.length) return { uploaded: 0 };
    for (let i = 0; i < sales.length; i += 400) {
      const batch = fdb.batch();
      sales.slice(i, i + 400).forEach(s => batch.set(fdb.collection('sales').doc(s.id), s, { merge: true }));
      await batch.commit();
    }
    lsSet(LS.migrated, { count: sales.length, at: Date.now() });
    emit();
    return { uploaded: sales.length };
  }
  function clearLocal() { localStorage.removeItem(LS.sales); localStorage.removeItem(LS.menu); localStorage.removeItem(LS.migrated); localListeners.sales.forEach(f => f()); localListeners.menu.forEach(f => f()); }

  /* ---------------------------------------------------------- backup / restore */
  async function exportAll() {
    const menu = await getMenu(); const sales = await getSales({});
    return { app: 'kantin-dapo-hakaksado', version: 2, exportedAt: new Date().toISOString(), device: deviceName(), menu, sales };
  }
  async function importAll(data, opts) {
    opts = opts || {};
    const sales = Array.isArray(data.sales) ? data.sales.map((s, i) => normSale(s, i)) : [];
    if (cloud()) {
      for (let i = 0; i < sales.length; i += 400) {
        const batch = fdb.batch();
        sales.slice(i, i + 400).forEach(s => batch.set(fdb.collection('sales').doc(s.id), s, { merge: true }));
        await batch.commit();
      }
    } else {
      const map = new Map(localSales().map(s => [s.id, s]));
      sales.forEach(s => map.set(s.id, s));
      lsSet(LS.sales, [...map.values()].sort((a, b) => a.ts - b.ts));
      localListeners.sales.forEach(f => f());
    }
    if (opts.menu && data.menu) await saveMenu(data.menu);
    return { sales: sales.length, menu: !!(opts.menu && data.menu) };
  }
  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type: type || 'application/octet-stream' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function csv(rows) {
    const cell = v => { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return '\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n');
  }

  /* ---------------------------------------------------------- diagnostics */
  async function testConnection() {
    if (!cloud()) return { ok: false, code: 'local', message: state.error === 'sdk' ? ('Firebase SDK gagal dimuatkan: ' + state.errorDetail) : 'Mod tempatan — config.js belum diisi.' };
    const t0 = performance.now();
    try {
      const ref = fdb.collection('config').doc('_ping');
      await Promise.race([ref.set({ at: Date.now(), device: deviceName() }), new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('Tamat masa (15s) — tiada sambungan ke Firestore.'), { code: 'timeout' })), 15000))]);
      const snap = await ref.get({ source: 'server' });
      clearError();
      return { ok: true, ms: Math.round(performance.now() - t0), message: 'Sambungan OK (' + Math.round(performance.now() - t0) + ' ms). Data dibaca & ditulis dengan jayanya.', at: snap.data() && snap.data().at };
    } catch (e) {
      setError(e);
      return { ok: false, code: e.code || 'error', message: explainError(e) };
    }
  }
  function explainError(e) {
    const code = (e && e.code) || '';
    if (code === 'permission-denied') return requireLogin
      ? (state.user ? 'Akses ditolak: peraturan (Rules) Firestore belum ditampal/diterbitkan — lihat README.md langkah 3.' : 'Akses ditolak: anda belum log masuk.')
      : 'Akses ditolak: requireLogin = false memerlukan peraturan "terbuka" (lihat README.md).';
    if (code === 'unavailable' || code === 'timeout') return 'Tidak dapat menghubungi Firestore. Semak internet, dan pastikan Firestore Database telah dicipta dalam projek Firebase.';
    if (code === 'not-found') return 'Pangkalan data Firestore tidak dijumpai — cipta "Firestore Database" dalam projek Firebase (langkah 3).';
    if (code === 'failed-precondition') return 'Firestore belum sedia (failed-precondition). Pastikan pangkalan data dicipta dalam mod Native, bukan Datastore.';
    return (e && (e.message || e.code)) || 'Ralat tidak diketahui.';
  }

  /* ---------------------------------------------------------- device name */
  const deviceName = () => String(lsGet(LS.device, '') || '');
  const setDeviceName = n => lsSet(LS.device, String(n || '').trim().slice(0, 40));

  /* ---------------------------------------------------------- sync badge */
  function renderBadge() {
    const el = document.getElementById('syncBadge');
    if (!el) return;
    let cls = '', text = '', title = '';
    if (state.mode === 'local') {
      if (state.configured) { cls = 'err'; text = 'Cloud gagal · mod tempatan'; title = state.errorDetail; }
      else { cls = ''; text = 'Tempatan · tidak disegerak'; title = 'Data hanya dalam pelayar ini. Isi config.js untuk segerak semua peranti.'; }
    } else if (!state.ready) { cls = 'warn'; text = 'Menyambung…'; }
    else if (state.error === 'permission-denied') { cls = 'err'; text = 'Akses ditolak'; title = 'Semak peraturan Firestore / log masuk (Tetapan).'; }
    else if (state.error && state.error !== 'sdk') { cls = 'err'; text = 'Ralat cloud'; title = state.errorDetail; }
    else if (!state.online) { cls = 'warn'; text = state.pending ? `Offline · ${state.pending} menunggu` : 'Offline · guna cache'; title = 'Jualan akan dihantar apabila internet kembali.'; }
    else if (state.pending) { cls = 'warn'; text = 'Menyegerak…'; }
    else { cls = 'ok'; text = 'Cloud · segerak'; title = state.user ? state.user.email : state.project; }
    el.className = 'sync ' + cls;
    el.innerHTML = '<i></i>' + esc(text);
    el.title = title;
  }
  document.addEventListener('DOMContentLoaded', renderBadge);

  /* ---------------------------------------------------------- toast / dialogs */
  function toast(msg, kind, ms) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div'); t.className = 'toast ' + (kind || ''); t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, ms || 2600);
  }
  function modal(html) {
    const back = document.createElement('div'); back.className = 'modal-back';
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(back);
    const close = () => back.remove();
    back.addEventListener('click', e => { if (e.target === back) { close(); back.dispatchEvent(new CustomEvent('cancel')); } });
    const onKey = e => { if (e.key === 'Escape') { close(); back.dispatchEvent(new CustomEvent('cancel')); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
    return { back, close: () => { close(); document.removeEventListener('keydown', onKey); } };
  }
  function confirmDlg(o) {
    o = o || {};
    return new Promise(res => {
      const m = modal(`<h3>${esc(o.title || 'Sahkan')}</h3><p>${o.html || esc(o.text || '')}</p>
        <div class="actions"><button class="btn" data-x>${esc(o.cancel || 'Batal')}</button><button class="btn ${o.danger ? 'danger' : 'primary'}" data-ok>${esc(o.ok || 'Ya')}</button></div>`);
      m.back.addEventListener('cancel', () => res(false));
      m.back.querySelector('[data-x]').onclick = () => { m.close(); res(false); };
      const ok = m.back.querySelector('[data-ok]'); ok.onclick = () => { m.close(); res(true); }; ok.focus();
    });
  }
  function promptDlg(o) {
    o = o || {};
    return new Promise(res => {
      const m = modal(`<h3>${esc(o.title || '')}</h3>${o.text ? `<p>${esc(o.text)}</p>` : ''}
        <form style="margin-top:14px"><label class="field">${esc(o.label || '')}<input class="input" type="${o.type || 'text'}" ${o.type === 'number' ? 'step="0.01" min="0" inputmode="decimal"' : ''} value="${esc(o.value == null ? '' : o.value)}" placeholder="${esc(o.placeholder || '')}"></label>
        <div class="actions"><button class="btn" type="button" data-x>${esc(o.cancel || 'Batal')}</button><button class="btn primary" type="submit">${esc(o.ok || 'Simpan')}</button></div></form>`);
      const input = m.back.querySelector('input');
      m.back.addEventListener('cancel', () => res(null));
      m.back.querySelector('[data-x]').onclick = () => { m.close(); res(null); };
      m.back.querySelector('form').onsubmit = e => { e.preventDefault(); m.close(); res(input.value); };
      setTimeout(() => { input.focus(); input.select(); }, 30);
    });
  }

  /* ---------------------------------------------------------- export */
  window.KantinDB = {
    ready, state, onState: f => { stateListeners.add(f); return () => stateListeners.delete(f); },
    login, logout, authMessage,
    watchMenu, getMenu, saveMenu, resetMenuToDefault, defaultMenu,
    watchSales, getSales, getLastSale, addSale, updateSale, deleteSale, normSale,
    pendingLocalCount, migrateLocal, clearLocal, localSalesCount: () => localSalesRaw().length,
    exportAll, importAll, downloadFile, csv, testConnection, explainError,
    deviceName, setDeviceName, catStyle,
    h: { rm, money, uid, esc, slug, csv, MONTHS, DAYS, pad, startOfDay, fmtDate, fmtShort, fmtTime, fmtTimeS, ymd, startClock, toast, confirm: confirmDlg, prompt: promptDlg, modal }
  };
})();
