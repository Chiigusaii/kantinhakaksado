# Kantin Dapo Hakaksado — Sistem Kantin

A small point-of-sale system for the canteen, hosted as plain files on GitHub Pages.

| Page | File | What it does |
|---|---|---|
| Utama | `index.html` | Today / week / month totals (split cash vs QR) and category cards |
| Kaunter | `foodmenu.html` | Take orders, adjust totals, accept **cash** or **QR** |
| Laporan | `salesdata.html` | Reports by day / week / month / custom range, cash vs QR, top items, delete a transaction, CSV export |
| Menu | `menu.html` | Add, rename, re-price, re-order and delete food/drink items and categories |
| Tetapan | `settings.html` | Sync status, login, device name, backup / restore, setup checklist |

Shared files: `app.css` (design), `db.js` (data layer), `config.js` (**your Firebase details go here**), `menu-default.js` (starting menu), `firestore.rules` (security rules to paste into Firebase).

---

## 1. Why a database is needed

GitHub Pages only serves files — it cannot store anything. The old system kept sales in the browser's `localStorage`, which is why each phone/laptop/tablet had different data.

The new version stores everything in **Firebase Firestore** (Google, free tier is far more than a canteen needs). Every device that opens the site sees the same menu and the same sales, live. If the internet drops, the counter keeps working from a local cache and sends the sales when the connection returns.

Until you fill in `config.js`, the system runs in **local mode** (works, but data stays in one browser — the badge at the top says *Tempatan · tidak disegerak*).

## 2. One-time setup (about 10 minutes)

### Step 1 — Create a Firebase project
1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. **Create a project** → name it e.g. `kantin-hakaksado` → **Continue**.
3. Turn **off** Google Analytics → **Create project** → **Continue**.

### Step 2 — Register the web app and copy the config
1. On the project overview page click the **`</>`** (Web) icon.
2. App nickname: `kantin` → **Register app** (leave Firebase Hosting unticked).
3. You will see a code block containing `const firebaseConfig = { apiKey: "...", ... }`.
4. Open **`config.js`** in this repository and copy each value into the matching field:

```js
firebase: {
  apiKey: "AIza...",                       // from firebaseConfig
  authDomain: "kantin-xxxx.firebaseapp.com",
  projectId: "kantin-xxxx",
  storageBucket: "kantin-xxxx.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
},
requireLogin: true,
```

> The `apiKey` is not a secret — Firebase web keys are designed to be public. Your data is protected by the login and the security rules below.

### Step 3 — Create the Firestore database and paste the rules
1. Left menu: **Build → Firestore Database → Create database**.
2. Location: **asia-southeast1 (Singapore)** → **Next**.
3. Choose **Start in production mode** → **Create**.
4. Open the **Rules** tab, delete everything, paste the contents of **`firestore.rules`** (the uncommented block at the top) → **Publish**.

### Step 4 — Turn on login and create the cashier account
1. **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Email/Password** → **Enable** → **Save**.
3. **Users** tab → **Add user** → enter an email and a password for the counter (e.g. `kaunter@kantin.com`) → **Add user**.
   You can add more users later (one per cashier if you like).

### Step 5 — Allow your GitHub Pages domain
**Authentication → Settings → Authorized domains → Add domain** → enter your site's domain, e.g. `yourname.github.io`.

### Step 6 — Upload to GitHub
Upload **all** files in this folder to the repository (replacing the old `index.html`, `foodmenu.html`, `salesdata.html`). Make sure the filled-in `config.js` is included. Wait a minute for GitHub Pages to update, then open the site and press **Ctrl+F5** (hard refresh).

### Step 7 — Log in on each device
Open the site on every phone/tablet/laptop, log in once with the email and password from Step 4. The badge at the top should now say **Cloud · segerak**.

The device that has your **old sales data** in its browser will upload it automatically the first time it connects (you'll see a toast *"Data lama dimuat naik ke cloud"*). You can also trigger this from **Tetapan → Muat naik ke cloud**.

## 3. Check that it works
**Tetapan → Uji sambungan** writes and reads a test record. If something is wrong it tells you which step to fix:

| Message | Fix |
|---|---|
| *Mod tempatan — config.js belum diisi* | Step 2 — values are still empty in `config.js` |
| *Akses ditolak: peraturan (Rules) …* | Step 3 — rules not pasted / published |
| *Log masuk E-mel/Kata laluan belum diaktifkan* | Step 4 — enable Email/Password |
| *E-mel ini belum didaftarkan* | Step 4 — add the user in the Users tab |
| *Pangkalan data Firestore tidak dijumpai* | Step 3 — create the Firestore database |
| Badge says *Cloud gagal · mod tempatan* | The Firebase library could not load (no internet / blocked). Reload when online. |

## 4. Using the system

**Kaunter (counter)**
* Tap items to add them; tap again for more. Use **−/+/×** in the order panel to change quantity or remove.
* **Change the price of one item for this sale only** — tap the dashed price under the item name in the order panel (e.g. small portion of rice). The menu price is untouched.
* **Ubah jumlah** — change the final amount the customer pays (with an optional reason). The difference is recorded as *Pelarasan* and shown in reports.
* **Cash**: type the cash received (or use the +1 / +5 / +10 … buttons, or leave it empty for exact payment) → **Terima Tunai**. Change is shown on screen.
* **QR**: **Bayar QR** → confirm the amount after the customer's QR payment succeeds → **Sahkan bayaran QR**. The sale is recorded as *QR Pay* with that exact amount.
* On phones the order panel is a bottom sheet — tap **Bayar ▴** to open it.

**Laporan (reports)** — totals are split into **Tunai** and **QR Pay** with transaction counts, plus per-day (or per-hour) bars, best-selling items, and the full transaction list. Tap a transaction to see details, switch its payment method, or delete it. **Muat turun CSV** exports the current period (opens in Excel).

**Menu** — add items at the top, edit any name or price directly in the list (saves automatically), move items up/down, change category, or delete. Click a category chip to rename or delete it. Changes appear on every device immediately.

**Tetapan** — give each device a name (recorded on every sale), download a full JSON backup (do this weekly — keep a copy somewhere safe), restore from JSON, reset the menu to `menu-default.js`.

## 5. Notes
* **Menu prices**: the starting list in `menu-default.js` is copied into the database the first time the system runs. Check every price on the **Menu** page before opening — after that the file is no longer used (unless you press *Tetapkan semula menu*).
* **Test sales**: if you made practice sales before setting up the cloud, delete them in Laporan (or clear local data in Tetapan **before** adding `config.js`) so they are not uploaded as real sales.
* **Cost**: Firebase's free plan allows 50,000 reads and 20,000 writes per day. A canteen uses a few hundred. No credit card is needed.
* **Security**: only signed-in users can read or write. Never set `requireLogin: false` unless you also switch to the "open" rules in `firestore.rules`, and understand that anyone with the link could then change your data.
* **Offline**: if wifi drops, keep selling — the badge shows *Offline · n menunggu* and everything syncs when the connection returns. Don't clear the browser data while sales are still waiting.
