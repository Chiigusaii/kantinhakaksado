/* ============================================================
   Kantin Dapo Hakaksado — i18n.js  (shared language engine)
   ------------------------------------------------------------
   Per-device language switch: Bahasa Melayu (ms) / English (en) / 中文 (zh).
   Stored in localStorage so it's independent per browser/device,
   same pattern as the device name in Tetapan.
   ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'hakaksado_lang_v1';
  const SUPPORTED = ['ms', 'en', 'zh'];
  const LANG_META = {
    ms: { label: 'Bahasa Melayu', flag: '🇲🇾', sub: 'Malaysia' },
    en: { label: 'English', flag: '🇬🇧', sub: 'United Kingdom' },
    zh: { label: '中文', flag: '🇨🇳', sub: 'Mandarin' }
  };

  function detect() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch (e) { /* ignore */ }
    return 'ms';
  }

  let current = detect();
  const listeners = new Set();

  /* ---------------------------------------------------------- dictionary */
  const D = {
    /* ---- nav ---- */
    'nav.home': { ms: 'Utama', en: 'Home', zh: '首页' },
    'nav.counter': { ms: 'Kaunter', en: 'Counter', zh: '收银台' },
    'nav.reports': { ms: 'Laporan', en: 'Reports', zh: '报表' },
    'nav.menu': { ms: 'Menu', en: 'Menu', zh: '菜单' },
    'nav.settings': { ms: 'Tetapan', en: 'Settings', zh: '设置' },

    /* ---- common ---- */
    'common.save': { ms: 'Simpan', en: 'Save', zh: '保存' },
    'common.cancel': { ms: 'Batal', en: 'Cancel', zh: '取消' },
    'common.delete': { ms: 'Padam', en: 'Delete', zh: '删除' },
    'common.close': { ms: 'Tutup', en: 'Close', zh: '关闭' },
    'common.edit': { ms: 'Ubah', en: 'Edit', zh: '编辑' },
    'common.add': { ms: 'Tambah', en: 'Add', zh: '添加' },
    'common.loading': { ms: 'Memuatkan…', en: 'Loading…', zh: '加载中…' },
    'common.today': { ms: 'Hari ini', en: 'Today', zh: '今天' },
    'common.yes': { ms: 'Ya', en: 'Yes', zh: '是' },
    'common.no': { ms: 'Tidak', en: 'No', zh: '否' },
    'common.txCount': { ms: '{n} transaksi', en: '{n} transactions', zh: '{n} 笔交易' },
    'common.itemsSold': { ms: '{n} item terjual', en: '{n} items sold', zh: '已售出 {n} 件商品' },
    'common.and': { ms: ' dan ', en: ' and ', zh: '和' },
    'common.andMore': { ms: ' dan lain-lain', en: ' and more', zh: ' 等' },
    'common.cash': { ms: 'Tunai', en: 'Cash', zh: '现金' },
    'common.qr': { ms: 'QR Pay', en: 'QR Pay', zh: '二维码支付' },

    /* ---- home (index.html) ---- */
    'home.title': { ms: '<b>Menu</b> Kategori', en: '<b>Menu</b> Categories', zh: '<b>菜单</b>分类' },
    'home.statToday': { ms: 'Jualan hari ini', en: "Today's sales", zh: '今日销售额' },
    'home.statWeek': { ms: 'Minggu ini', en: 'This week', zh: '本周' },
    'home.statMonth': { ms: 'Bulan ini', en: 'This month', zh: '本月' },
    'home.statLast': { ms: 'Transaksi terakhir', en: 'Last transaction', zh: '最近交易' },
    'home.noSalesYet': { ms: 'Belum ada jualan', en: 'No sales yet', zh: '尚无销售' },
    'home.openCounter': { ms: 'Buka Kaunter', en: 'Open Counter', zh: '打开收银台' },
    'home.counterCardTitle': { ms: 'Kaunter Bayaran', en: 'Payment Counter', zh: '收银台' },
    'home.counterCardDesc': { ms: 'Klik makanan yang dipilih pelanggan dan jumlah dikira automatik. Terima tunai atau QR, baki keluar serta-merta.', en: "Tap what the customer picks and the total is calculated automatically. Accept cash or QR, change shown instantly.", zh: '点击顾客选择的餐点，总额自动计算。支持现金或二维码付款，找零即时显示。' },
    'home.viewMenu': { ms: 'Lihat Menu', en: 'View Menu', zh: '查看菜单' },
    'home.hours': { ms: 'Waktu operasi', en: 'Operating hours', zh: '营业时间' },
    'home.hoursValue': { ms: '7.00 pagi – 3.00 petang', en: '7:00 AM – 3:00 PM', zh: '上午7点 – 下午3点' },
    'home.orderNote': { ms: 'Pesanan', en: 'Ordering', zh: '点餐须知' },
    'home.orderNoteValue': { ms: 'Sila beratur dan bayar sebelum makan', en: 'Please queue and pay before eating', zh: '请排队并在用餐前付款' },
    'home.storageNote': { ms: 'Simpanan data', en: 'Data storage', zh: '数据存储' },
    'home.storageCloud': { ms: 'Data jualan disegerakkan ke cloud dan sama pada semua peranti. Buat sandaran di halaman Tetapan sekali-sekala.', en: 'Sales data is synced to the cloud and matches on every device. Back it up from the Settings page now and then.', zh: '销售数据已同步至云端，所有设备保持一致。请不时在设置页面进行备份。' },
    'home.storageLocalPrefix': { ms: 'Data jualan disimpan dalam pelayar ini sahaja. Untuk segerak semua peranti, sediakan cloud di halaman ', en: 'Sales data is stored in this browser only. To sync across devices, set up the cloud from the ', zh: '销售数据仅保存在此浏览器中。要在所有设备间同步，请在' },
    'home.storageLocalLink': { ms: 'Tetapan', en: 'Settings page', zh: '设置页面' },
    'home.storageLocalSuffix': { ms: '. Buat backup CSV di halaman Laporan setiap hari.', en: '. Export a CSV backup from Reports daily.', zh: '设置数据同步。请每天在报表页面导出CSV备份。' },
    'home.footer': { ms: 'Terima kasih kerana membeli di kantin kami. Sila datang lagi.', en: 'Thank you for shopping at our canteen. Please come again.', zh: '感谢惠顾本食堂，欢迎再次光临。' },
    'home.noItemsDesc': { ms: 'Belum ada item. Tambah di halaman Menu.', en: 'No items yet. Add some on the Menu page.', zh: '暂无项目，请在菜单页面添加。' },
    'home.greetMorning': { ms: 'Selamat pagi', en: 'Good morning', zh: '早上好' },
    'home.greetAfternoon': { ms: 'Selamat tengahari', en: 'Good afternoon', zh: '下午好' },
    'home.greetEvening': { ms: 'Selamat petang', en: 'Good evening', zh: '晚上好' },

    /* ---- foodmenu.html (counter) ---- */
    'counter.title': { ms: '<b>Kaunter</b> Bayaran', en: '<b>Payment</b> Counter', zh: '<b>收银</b>台' },
    'counter.todayPill': { ms: 'Hari ini <b>{total}</b> · {n} transaksi', en: 'Today <b>{total}</b> · {n} transactions', zh: '今日 <b>{total}</b> · {n} 笔交易' },
    'counter.searchPlaceholder': { ms: 'Cari makanan atau minuman…', en: 'Search food or drinks…', zh: '搜索食物或饮料…' },
    'counter.manageMenu': { ms: 'Urus menu', en: 'Manage menu', zh: '管理菜单' },
    'counter.chipAll': { ms: 'Semua', en: 'All', zh: '全部' },
    'counter.emptyTitle': { ms: 'Tiada item', en: 'No items', zh: '无项目' },
    'counter.emptyTrySearch': { ms: 'Cuba carian lain.', en: 'Try a different search.', zh: '请尝试其他搜索关键词。' },
    'counter.emptyAddMenu': { ms: 'Tambah item di halaman Menu.', en: 'Add items on the Menu page.', zh: '请在菜单页面添加项目。' },
    'counter.cartTitle': { ms: 'Pesanan', en: 'Order', zh: '订单' },
    'counter.clear': { ms: 'Kosongkan', en: 'Clear', zh: '清空' },
    'counter.cartEmptyTitle': { ms: 'Tiada pesanan lagi', en: 'No order yet', zh: '暂无订单' },
    'counter.cartEmptyDesc': { ms: 'Klik makanan di sebelah untuk mula.', en: 'Tap a food item to start.', zh: '点击左侧的食物开始点餐。' },
    'counter.subtotal': { ms: 'Subtotal', en: 'Subtotal', zh: '小计' },
    'counter.adjustment': { ms: 'Pelarasan', en: 'Adjustment', zh: '调整' },
    'counter.changeTotal': { ms: 'Ubah jumlah', en: 'Adjust total', zh: '修改总额' },
    'counter.resetTotal': { ms: 'Tetapkan semula jumlah', en: 'Reset total', zh: '重置总额' },
    'counter.total': { ms: 'Jumlah', en: 'Total', zh: '总额' },
    'counter.item': { ms: 'item', en: 'items', zh: '项' },
    'counter.noItem': { ms: 'Tiada item', en: 'No items', zh: '无项目' },
    'counter.payBtn': { ms: 'Bayar', en: 'Pay', zh: '支付' },
    'counter.payHint': { ms: 'Klik Bayar untuk pilih kaedah dan sahkan pembayaran.', en: 'Tap Pay to choose a method and confirm payment.', zh: '点击“支付”以选择方式并确认付款。' },
    'counter.confirmClearTitle': { ms: 'Kosongkan pesanan?', en: 'Clear the order?', zh: '清空订单？' },
    'counter.confirmClearText': { ms: 'Semua item dalam pesanan ini akan dibuang.', en: 'All items in this order will be removed.', zh: '此订单中的所有项目将被清除。' },
    'counter.priceChangedTag': { ms: 'ubah', en: 'edited', zh: '已改' },
    'counter.adjCancelled': { ms: 'Jumlah ubah dibatalkan kerana pesanan berubah', en: 'The adjusted total was cancelled because the order changed', zh: '订单已更改，已取消调整后的总额' },
    /* detail modal */
    'counter.detailTitle': { ms: 'Butiran Produk', en: 'Product Details', zh: '产品详情' },
    'counter.qty': { ms: 'Kuantiti', en: 'Quantity', zh: '数量' },
    'counter.unitPrice': { ms: 'Harga seunit', en: 'Unit price', zh: '单价' },
    'counter.discountHint': { ms: 'Tukar harga jika pelanggan ambil porsi kecil / diskaun. Harga menu tidak berubah.', en: 'Change the price if the customer takes a small portion / gets a discount. The menu price stays the same.', zh: '如顾客取小份量/享受折扣，可在此更改价格，菜单价格不受影响。' },
    'counter.resetPrice': { ms: 'Harga asal', en: 'Original price', zh: '原价' },
    'counter.addToCart': { ms: 'Tambah · {amt}', en: 'Add · {amt}', zh: '添加 · {amt}' },
    'counter.updateCart': { ms: 'Kemas kini · {amt}', en: 'Update · {amt}', zh: '更新 · {amt}' },
    /* payment modal */
    'counter.paymentTitle': { ms: 'Bayaran', en: 'Payment', zh: '付款' },
    'counter.methodCash': { ms: 'Tunai (Cash)', en: 'Cash', zh: '现金' },
    'counter.methodQr': { ms: 'QR Pay', en: 'QR Pay', zh: '二维码支付' },
    'counter.amountDue': { ms: 'Jumlah perlu dibayar', en: 'Amount due', zh: '应付金额' },
    'counter.amountReceived': { ms: 'Jumlah diterima', en: 'Amount received', zh: '收款金额' },
    'counter.exact': { ms: 'Wang Tepat', en: 'Exact', zh: '准确金额' },
    'counter.change': { ms: 'Baki pelanggan', en: 'Change due', zh: '找零' },
    'counter.insufficientCash': { ms: 'Tunai tidak mencukupi', en: 'Insufficient cash', zh: '现金不足' },
    'counter.confirmPay': { ms: 'Sahkan Bayaran', en: 'Confirm Payment', zh: '确认付款' },
    'counter.qrConfirmHint': { ms: 'Pastikan pelanggan telah mengimbas QR kedai dan bayaran berjaya sebelum sahkan.', en: "Make sure the customer scanned the shop's QR and payment succeeded before confirming.", zh: '请确认顾客已扫描店铺二维码并付款成功后再确认。' },
    'counter.enterValidAmount': { ms: 'Masukkan jumlah yang sah', en: 'Enter a valid amount', zh: '请输入有效金额' },
    'counter.addItemsFirst': { ms: 'Tambah item dahulu', en: 'Add items first', zh: '请先添加项目' },
    /* success modal */
    'counter.successTitle': { ms: 'Sukses!', en: 'Success!', zh: '成功！' },
    'counter.totalBill': { ms: 'Jumlah Tagihan', en: 'Total Bill', zh: '账单总额' },
    'counter.cashReceived': { ms: 'Tunai Diterima', en: 'Cash Received', zh: '收到现金' },
    'counter.qrReceived': { ms: 'Jumlah Diterima (QR)', en: 'Amount Received (QR)', zh: '收到金额（二维码）' },
    'counter.changeDue': { ms: 'Baki', en: 'Change', zh: '找零' },
    'counter.printReceipt': { ms: 'Cetak Resit', en: 'Print Receipt', zh: '打印收据' },
    'counter.noReceipt': { ms: 'Tiada Resit', en: 'No Receipt', zh: '不需要收据' },
    'counter.receiptFor': { ms: 'Baki untuk pelanggan', en: 'Change for customer', zh: '找给顾客的零钱' },
    'counter.receiptQrTotal': { ms: 'Jumlah dibayar melalui QR', en: 'Amount paid via QR', zh: '通过二维码支付的金额' },
    'counter.receiptShopThanks': { ms: 'Terima kasih!', en: 'Thank you!', zh: '谢谢惠顾！' },
    'counter.receiptCashierCopy': { ms: 'Resit', en: 'Receipt', zh: '收据' },
    'counter.itemAdded': { ms: '{name} ditambah ke troli', en: '{name} added to cart', zh: '{name} 已加入购物车' },
    'counter.decrease': { ms: 'Kurang', en: 'Decrease', zh: '减少' },
    'counter.increase': { ms: 'Tambah', en: 'Increase', zh: '增加' },
    'counter.remove': { ms: 'Buang', en: 'Remove', zh: '移除' },
    'counter.priceForSaleTitle': { ms: 'Harga untuk transaksi ini', en: 'Price for this sale', zh: '本次交易价格' },
    'counter.priceForSaleText': { ms: 'Harga asal {name}: {orig}. Harga menu tidak berubah — hanya pesanan ini.', en: 'Original price of {name}: {orig}. The menu price is unchanged — only this order.', zh: '{name}的原价：{orig}。菜单价格不变，仅本订单更改。' },
    'counter.priceForSaleTooltip': { ms: 'Tukar harga untuk transaksi ini', en: 'Change the price for this sale', zh: '更改本次交易的价格' },
    'counter.unitPriceRM': { ms: 'Harga seunit (RM)', en: 'Unit price (RM)', zh: '单价（RM）' },
    'counter.useThisPrice': { ms: 'Guna harga ini', en: 'Use this price', zh: '使用此价格' },
    'counter.adjTitle': { ms: 'Ubah jumlah bayaran', en: 'Adjust the amount due', zh: '调整应付金额' },
    'counter.adjDesc': { ms: 'Guna apabila pelanggan ambil porsi kecil atau diberi diskaun. Harga menu tidak berubah — hanya transaksi ini.', en: 'Use this when a customer takes a smaller portion or gets a discount. The menu price stays the same — only this transaction changes.', zh: '当顾客取较小份量或享受折扣时使用。菜单价格不变——仅本次交易更改。' },
    'counter.newAmountLabel': { ms: 'Jumlah baru (RM) — subtotal {sub}', en: 'New amount (RM) — subtotal {sub}', zh: '新金额（RM）——小计 {sub}' },
    'counter.reasonOptional': { ms: 'Sebab (pilihan)', en: 'Reason (optional)', zh: '原因（可选）' },
    'counter.reasonPlaceholder': { ms: 'cth. porsi kecil, diskaun', en: 'e.g. small portion, discount', zh: '例如：小份、折扣' },
    'counter.saveAmount': { ms: 'Simpan jumlah', en: 'Save amount', zh: '保存金额' },
    'counter.orderCount': { ms: '{n} item dalam pesanan', en: '{n} items in the order', zh: '订单中有 {n} 项' },
    'counter.viewOrder': { ms: 'Lihat pesanan', en: 'View order', zh: '查看订单' },
    'counter.hideOrder': { ms: 'Tutup pesanan', en: 'Hide order', zh: '收起订单' },
    'counter.backToCounter': { ms: 'Kembali', en: 'Back', zh: '返回' },
    'counter.done': { ms: 'Selesai', en: 'Done', zh: '完成' },
    'counter.quickAmounts': { ms: 'Jumlah pantas', en: 'Quick amounts', zh: '快捷金额' },
    'counter.clearAmount': { ms: 'Kosongkan', en: 'Clear', zh: '清除' },
    'counter.searchResults': { ms: 'Hasil carian', en: 'Search results', zh: '搜索结果' },
    'counter.addNote': { ms: 'Catatan (pilihan)', en: 'Note (optional)', zh: '备注（可选）' },
    'counter.notePlaceholder': { ms: 'cth. kurang pedas, bungkus', en: 'e.g. less spicy, takeaway', zh: '例如：少辣、打包' },
    'counter.inOrder': { ms: 'Dalam pesanan', en: 'In the order', zh: '已在订单中' },
    'counter.nextCustomer': { ms: 'Pelanggan seterusnya', en: 'Next customer', zh: '下一位顾客' },

    /* ---- menu.html ---- */
    'menuPage.title': { ms: '<b>Urus</b> Menu &amp; Harga', en: '<b>Manage</b> Menu &amp; Prices', zh: '<b>管理</b>菜单和价格' },
    'menuPage.addSection': { ms: 'Tambah item baru', en: 'Add a new item', zh: '添加新项目' },
    'menuPage.nameLabel': { ms: 'Nama makanan / minuman', en: 'Food / drink name', zh: '食品/饮料名称' },
    'menuPage.namePlaceholder': { ms: 'cth. Nasi Goreng Kampung', en: 'e.g. Fried Rice', zh: '例如：炒饭' },
    'menuPage.priceLabel': { ms: 'Harga', en: 'Price', zh: '价格' },
    'menuPage.catLabel': { ms: 'Kategori', en: 'Category', zh: '类别' },
    'menuPage.addItemBtn': { ms: 'Tambah item', en: 'Add item', zh: '添加项目' },
    'menuPage.imageLabel': { ms: 'Gambar', en: 'Image', zh: '图片' },
    'menuPage.uploadImage': { ms: 'Muat naik', en: 'Upload', zh: '上传' },
    'menuPage.useUrl': { ms: 'URL', en: 'URL', zh: '网址' },
    'menuPage.removeImage': { ms: 'Buang', en: 'Remove', zh: '移除' },
    'menuPage.urlPromptTitle': { ms: 'URL gambar', en: 'Image URL', zh: '图片网址' },
    'menuPage.urlPromptLabel': { ms: 'Pautan gambar (https://…)', en: 'Image link (https://…)', zh: '图片链接（https://…）' },
    'menuPage.imageTooBig': { ms: 'Gambar terlalu besar, cuba gambar lain', en: 'Image is too large, try another one', zh: '图片过大，请尝试其他图片' },
    'menuPage.imageProcessing': { ms: 'Memproses gambar…', en: 'Processing image…', zh: '正在处理图片…' },
    'menuPage.catsTitle': { ms: 'Kategori', en: 'Categories', zh: '类别' },
    'menuPage.catsHint': { ms: 'klik untuk tukar nama atau padam', en: 'tap to rename or delete', zh: '点击以重命名或删除' },
    'menuPage.searchPlaceholder': { ms: 'Cari item…', en: 'Search items…', zh: '搜索项目…' },
    'menuPage.newCatOption': { ms: '＋ Kategori baru…', en: '＋ New category…', zh: '＋ 新类别…' },
    'menuPage.addCatChip': { ms: '＋ Tambah kategori', en: '＋ Add category', zh: '＋ 添加类别' },
    'menuPage.emptyCat': { ms: 'Tiada item dalam kategori ini.', en: 'No items in this category.', zh: '此类别中暂无项目。' },
    'menuPage.emptyAllTitle': { ms: 'Tiada item', en: 'No items', zh: '无项目' },
    'menuPage.emptyAllDesc': { ms: 'Tambah kategori dan item di atas.', en: 'Add a category and items above.', zh: '请在上方添加类别和项目。' },
    'menuPage.itemCount': { ms: '{n} item', en: '{n} items', zh: '{n} 项' },
    'menuPage.saving': { ms: 'Menyimpan…', en: 'Saving…', zh: '保存中…' },
    'menuPage.saved': { ms: 'Disimpan ✓', en: 'Saved ✓', zh: '已保存 ✓' },
    'menuPage.saveFailed': { ms: 'Gagal simpan', en: 'Save failed', zh: '保存失败' },
    'menuPage.unsaved': { ms: 'Perubahan belum disimpan…', en: 'Unsaved changes…', zh: '有未保存的更改…' },
    'menuPage.nameEmpty': { ms: 'Nama tidak boleh kosong', en: 'Name cannot be empty', zh: '名称不能为空' },
    'menuPage.enterName': { ms: 'Masukkan nama item', en: 'Enter an item name', zh: '请输入项目名称' },
    'menuPage.enterPrice': { ms: 'Masukkan harga', en: 'Enter a price', zh: '请输入价格' },
    'menuPage.pickCat': { ms: 'Pilih kategori', en: 'Choose a category', zh: '请选择类别' },
    'menuPage.itemAdded': { ms: '{name} ditambah', en: '{name} added', zh: '已添加 {name}' },
    'menuPage.itemExists': { ms: '"{name}" sudah ada dalam {cat}', en: '"{name}" already exists in {cat}', zh: '"{name}" 已存在于 {cat} 中' },
    'menuPage.newCatTitle': { ms: 'Kategori baru', en: 'New category', zh: '新类别' },
    'menuPage.newCatLabel': { ms: 'Nama kategori', en: 'Category name', zh: '类别名称' },
    'menuPage.newCatPlaceholder': { ms: 'cth. Kuih-Muih', en: 'e.g. Snacks', zh: '例如：小吃' },
    'menuPage.catExists': { ms: 'Kategori ini sudah ada', en: 'This category already exists', zh: '该类别已存在' },
    'menuPage.catAdded': { ms: 'Kategori ditambah', en: 'Category added', zh: '类别已添加' },
    'menuPage.catItemsCount': { ms: '{n} item dalam kategori ini.', en: '{n} items in this category.', zh: '此类别中有 {n} 项。' },
    'menuPage.catNameLabel': { ms: 'Nama kategori', en: 'Category name', zh: '类别名称' },
    'menuPage.deleteCat': { ms: 'Padam kategori', en: 'Delete category', zh: '删除类别' },
    'menuPage.moveFirstHint': { ms: 'Pindahkan atau padam semua item dahulu', en: 'Move or delete all its items first', zh: '请先移动或删除其中所有项目' },
    'menuPage.moveFirstNote': { ms: 'Untuk memadam kategori, pindahkan atau padam semua itemnya dahulu.', en: 'To delete a category, move or delete all its items first.', zh: '要删除类别，请先移动或删除其所有项目。' },
    'menuPage.catNameUsed': { ms: 'Nama kategori sudah digunakan', en: 'Category name already in use', zh: '该类别名称已被使用' },
    'menuPage.catUpdated': { ms: 'Kategori dikemas kini', en: 'Category updated', zh: '类别已更新' },
    'menuPage.deleteCatTitle': { ms: 'Padam kategori "{cat}"?', en: 'Delete category "{cat}"?', zh: '删除类别 "{cat}"？' },
    'menuPage.deleteCatText': { ms: 'Kategori kosong ini akan dibuang dari menu.', en: 'This empty category will be removed from the menu.', zh: '该空类别将从菜单中移除。' },
    'menuPage.catDeleted': { ms: 'Kategori dipadam', en: 'Category deleted', zh: '类别已删除' },
    'menuPage.itemMoved': { ms: '{name} dipindah ke {cat}', en: '{name} moved to {cat}', zh: '{name} 已移至 {cat}' },
    'menuPage.deleteItemTitle': { ms: 'Padam "{name}"?', en: 'Delete "{name}"?', zh: '删除 "{name}"？' },
    'menuPage.deleteItemText': { ms: 'Item ini akan dibuang dari menu. Rekod jualan lama tidak terjejas.', en: 'This item will be removed from the menu. Past sales records are unaffected.', zh: '该项目将从菜单中移除，历史销售记录不受影响。' },
    'menuPage.itemDeleted': { ms: '{name} dipadam', en: '{name} deleted', zh: '{name} 已删除' },
    'menuPage.up': { ms: 'Naik', en: 'Move up', zh: '上移' },
    'menuPage.down': { ms: 'Turun', en: 'Move down', zh: '下移' },
    'menuPage.delete': { ms: 'Padam', en: 'Delete', zh: '删除' },

    /* ---- settings.html ---- */
    'settingsPage.title': { ms: '<b>Tetapan</b> &amp; Penyegerakan', en: '<b>Settings</b> &amp; Sync', zh: '<b>设置</b>与同步' },
    'settingsPage.syncStatus': { ms: 'Status penyegerakan', en: 'Sync status', zh: '同步状态' },
    'settingsPage.testConn': { ms: 'Uji sambungan', en: 'Test connection', zh: '测试连接' },
    'settingsPage.logout': { ms: 'Log keluar', en: 'Log out', zh: '登出' },
    'settingsPage.reload': { ms: 'Muat semula halaman', en: 'Reload page', zh: '重新加载页面' },
    'settingsPage.deviceTitle': { ms: 'Peranti ini', en: 'This device', zh: '此设备' },
    'settingsPage.deviceDesc': { ms: 'Nama peranti direkod pada setiap transaksi supaya anda tahu kaunter mana yang membuat jualan.', en: 'The device name is recorded on every sale so you know which counter made it.', zh: '设备名称会记录在每笔交易中，方便您了解销售来自哪个柜台。' },
    'settingsPage.deviceNameLabel': { ms: 'Nama peranti', en: 'Device name', zh: '设备名称' },
    'settingsPage.deviceNamePlaceholder': { ms: 'cth. Tablet kaunter 1', en: 'e.g. Counter tablet 1', zh: '例如：柜台平板1' },
    'settingsPage.deviceNameSaved': { ms: 'Nama peranti disimpan', en: 'Device name saved', zh: '设备名称已保存' },
    'settingsPage.langTitle': { ms: 'Bahasa', en: 'Language', zh: '语言' },
    'settingsPage.langDesc': { ms: 'Pilih bahasa paparan untuk peranti ini. Tetapan ini disimpan pada peranti sahaja.', en: 'Choose the display language for this device. This is saved on this device only.', zh: '为此设备选择显示语言。此设置仅保存在本设备上。' },
    'settingsPage.langChanged': { ms: 'Bahasa ditukar ke Bahasa Melayu', en: 'Language changed to English', zh: '语言已切换为中文' },
    'settingsPage.sizeTitle': { ms: 'Saiz paparan', en: 'Display size', zh: '显示尺寸' },
    'settingsPage.sizeDesc': { ms: 'Besarkan teks dan butang supaya lebih mudah ditekan pada tablet. Tetapan ini disimpan pada peranti ini sahaja.', en: 'Make text and buttons larger so they are easier to tap on a tablet. This is saved on this device only.', zh: '放大文字和按钮，方便在平板上点按。此设置仅保存在本设备上。' },
    'settingsPage.sizeM': { ms: 'Sederhana', en: 'Standard', zh: '标准' },
    'settingsPage.sizeMSub': { ms: 'Komputer riba', en: 'Laptop', zh: '笔记本电脑' },
    'settingsPage.sizeL': { ms: 'Besar', en: 'Large', zh: '大' },
    'settingsPage.sizeLSub': { ms: 'iPad · disyorkan', en: 'iPad · recommended', zh: 'iPad · 推荐' },
    'settingsPage.sizeXL': { ms: 'Sangat besar', en: 'Extra large', zh: '特大' },
    'settingsPage.sizeXLSub': { ms: 'Kaunter sibuk', en: 'Busy counter', zh: '繁忙收银台' },
    'settingsPage.sizeChanged': { ms: 'Saiz paparan dikemas kini', en: 'Display size updated', zh: '显示尺寸已更新' },
    'settingsPage.backupTitle': { ms: 'Sandaran data', en: 'Data backup', zh: '数据备份' },
    'settingsPage.backupDesc': { ms: 'Muat turun sandaran penuh (menu + semua transaksi) sekali-sekala dan simpan di tempat selamat. Fail JSON boleh dipulihkan semula di sini; CSV boleh dibuka dalam Excel.', en: 'Download a full backup (menu + all transactions) now and then and keep it somewhere safe. JSON files can be restored here; CSV opens in Excel.', zh: '请定期下载完整备份（菜单+所有交易）并妥善保存。JSON文件可在此恢复；CSV文件可用Excel打开。' },
    'settingsPage.downloadJson': { ms: 'Muat turun sandaran (JSON)', en: 'Download backup (JSON)', zh: '下载备份（JSON）' },
    'settingsPage.downloadCsv': { ms: 'Muat turun semua transaksi (CSV)', en: 'Download all transactions (CSV)', zh: '下载所有交易（CSV）' },
    'settingsPage.restoreLabel': { ms: 'Pulihkan dari fail JSON', en: 'Restore from a JSON file', zh: '从JSON文件恢复' },
    'settingsPage.restoreBtn': { ms: 'Pulihkan', en: 'Restore', zh: '恢复' },
    'settingsPage.otherActions': { ms: 'Tindakan lain', en: 'Other actions', zh: '其他操作' },
    'settingsPage.resetMenuDesc': { ms: '<b style="color:#fff">Tetapkan semula menu</b> — gantikan menu semasa dengan senarai dalam fail <code>menu-default.js</code>. Rekod jualan tidak terjejas.', en: '<b style="color:#fff">Reset menu</b> — replace the current menu with the list in <code>menu-default.js</code>. Sales records are unaffected.', zh: '<b style="color:#fff">重置菜单</b> — 用 <code>menu-default.js</code> 中的列表替换当前菜单。销售记录不受影响。' },
    'settingsPage.resetMenuBtn': { ms: 'Tetapkan semula menu ke lalai', en: 'Reset menu to default', zh: '将菜单重置为默认' },
    'settingsPage.clearLocalDesc': { ms: '<b style="color:#fff">Padam data tempatan pelayar ini</b> — hanya untuk pelayar ini; data cloud tidak dipadam. Pastikan data lama telah dimuat naik ke cloud atau disandarkan dahulu.', en: '<b style="color:#fff">Clear this browser\'s local data</b> — affects only this browser; cloud data is not deleted. Make sure old data has been uploaded to the cloud or backed up first.', zh: '<b style="color:#fff">清除此浏览器的本地数据</b> — 仅影响此浏览器，云端数据不会被删除。请确保旧数据已上传至云端或已备份。' },
    'settingsPage.clearLocalBtn': { ms: 'Padam data tempatan', en: 'Clear local data', zh: '清除本地数据' },
    'settingsPage.guideSummary': { ms: 'Panduan: segerakkan data ke semua peranti (Firebase, percuma)', en: 'Guide: sync data across all devices (Firebase, free)', zh: '指南：在所有设备间同步数据（Firebase，免费）' },
    'settingsPage.statusMode': { ms: 'Mod', en: 'Mode', zh: '模式' },
    'settingsPage.statusLocalFailed': { ms: 'Tempatan (cloud gagal dimuatkan)', en: 'Local (cloud failed to load)', zh: '本地（云端加载失败）' },
    'settingsPage.statusLocalOnly': { ms: 'Tempatan — data dalam pelayar ini sahaja', en: 'Local — data stays in this browser only', zh: '本地——数据仅保存在此浏览器中' },
    'settingsPage.statusError': { ms: 'Ralat', en: 'Error', zh: '错误' },
    'settingsPage.statusCloud': { ms: 'Cloud', en: 'Cloud', zh: '云端' },
    'settingsPage.statusCloudNotSet': { ms: 'Belum disediakan — isi <code>config.js</code> (lihat panduan di bawah)', en: 'Not set up yet — fill in <code>config.js</code> (see the guide below)', zh: '尚未设置——请填写 <code>config.js</code>（见下方指南）' },
    'settingsPage.statusCloudShared': { ms: 'Cloud — dikongsi semua peranti', en: 'Cloud — shared across every device', zh: '云端——所有设备共享' },
    'settingsPage.statusConnecting': { ms: 'Menyambung…', en: 'Connecting…', zh: '连接中…' },
    'settingsPage.statusProject': { ms: 'Projek Firebase', en: 'Firebase project', zh: 'Firebase 项目' },
    'settingsPage.statusLogin': { ms: 'Log masuk', en: 'Login', zh: '登录' },
    'settingsPage.statusNotLoggedIn': { ms: 'Belum log masuk', en: 'Not logged in', zh: '尚未登录' },
    'settingsPage.statusLoginOff': { ms: 'Dimatikan (requireLogin: false)', en: 'Disabled (requireLogin: false)', zh: '已禁用（requireLogin: false）' },
    'settingsPage.statusInternet': { ms: 'Internet', en: 'Internet', zh: '网络' },
    'settingsPage.statusOnline': { ms: 'Dalam talian', en: 'Online', zh: '在线' },
    'settingsPage.statusOffline': { ms: 'Luar talian — perubahan disimpan & dihantar kemudian', en: 'Offline — changes are saved and sent later', zh: '离线——更改已保存，将稍后发送' },
    'settingsPage.statusOfflineCache': { ms: 'Cache luar talian', en: 'Offline cache', zh: '离线缓存' },
    'settingsPage.statusActive': { ms: 'Aktif', en: 'Active', zh: '已启用' },
    'settingsPage.statusInactive': { ms: 'Tidak aktif (pelayar ini tidak menyokong / tab lain terbuka)', en: "Inactive (this browser doesn't support it / another tab is open)", zh: '未启用（此浏览器不支持/其他标签页已打开）' },
    'settingsPage.statusPending': { ms: 'Menunggu hantar', en: 'Pending upload', zh: '待上传' },
    'settingsPage.statusPendingCount': { ms: '{n} perubahan', en: '{n} changes', zh: '{n} 项更改' },
    'settingsPage.statusNone': { ms: 'Tiada', en: 'None', zh: '无' },
    'settingsPage.statusLastError': { ms: 'Ralat terakhir', en: 'Last error', zh: '最近错误' },
    'settingsPage.loginEmail': { ms: 'E-mel', en: 'Email', zh: '电子邮件' },
    'settingsPage.loginPass': { ms: 'Kata laluan', en: 'Password', zh: '密码' },
    'settingsPage.loginBtn': { ms: 'Log masuk', en: 'Log in', zh: '登录' },
    'settingsPage.loginSuccess': { ms: 'Berjaya log masuk', en: 'Logged in successfully', zh: '登录成功' },
    'settingsPage.localTx': { ms: 'Transaksi tempatan', en: 'Local transactions', zh: '本地交易' },
    'settingsPage.localTxCount': { ms: '{n} transaksi dalam pelayar ini', en: '{n} transactions in this browser', zh: '此浏览器中有 {n} 笔交易' },
    'settingsPage.localPending': { ms: '{n} transaksi lama dalam pelayar ini belum disahkan berada di cloud.', en: '{n} old transactions in this browser have not been confirmed in the cloud yet.', zh: '此浏览器中有 {n} 笔旧交易尚未确认已上传至云端。' },
    'settingsPage.migrateBtn': { ms: 'Muat naik ke cloud sekarang', en: 'Upload to cloud now', zh: '立即上传到云端' },
    'settingsPage.migrateUploading': { ms: 'Memuat naik…', en: 'Uploading…', zh: '上传中…' },
    'settingsPage.migrateDone': { ms: '{n} transaksi dimuat naik', en: '{n} transactions uploaded', zh: '已上传 {n} 笔交易' },
    'settingsPage.allUploaded': { ms: 'Semua transaksi lama pelayar ini telah dimuat naik ke cloud.', en: "All of this browser's old transactions have been uploaded to the cloud.", zh: '此浏览器中所有旧交易均已上传至云端。' },
    'settingsPage.failedPrefix': { ms: 'Gagal: ', en: 'Failed: ', zh: '失败：' },
    'settingsPage.logoutConfirmTitle': { ms: 'Log keluar?', en: 'Log out?', zh: '登出？' },
    'settingsPage.logoutConfirmText': { ms: 'Anda perlu log masuk semula untuk menggunakan kaunter pada peranti ini.', en: 'You will need to log in again to use the counter on this device.', zh: '您需要重新登录才能在此设备上使用收银台。' },
    'settingsPage.testing': { ms: 'Menguji…', en: 'Testing…', zh: '测试中…' },
    'settingsPage.backupDone': { ms: 'Sandaran: {n} transaksi', en: 'Backup: {n} transactions', zh: '备份：{n} 笔交易' },
    'settingsPage.chooseJsonFirst': { ms: 'Pilih fail JSON dahulu', en: 'Choose a JSON file first', zh: '请先选择JSON文件' },
    'settingsPage.invalidJson': { ms: 'Fail bukan JSON yang sah.', en: 'The file is not valid JSON.', zh: '该文件不是有效的JSON。' },
    'settingsPage.noTxInFile': { ms: 'Fail ini tidak mengandungi senarai transaksi.', en: 'This file does not contain a list of transactions.', zh: '该文件不包含交易列表。' },
    'settingsPage.restoreMenuTitle': { ms: 'Pulihkan menu juga?', en: 'Restore the menu too?', zh: '同时恢复菜单？' },
    'settingsPage.restoreMenuText': { ms: 'Fail ini mengandungi menu. Gantikan menu semasa dengan menu dari fail?', en: 'This file contains a menu. Replace the current menu with the one from the file?', zh: '该文件包含菜单。是否用文件中的菜单替换当前菜单？' },
    'settingsPage.restoreMenuYes': { ms: 'Ya, gantikan menu', en: 'Yes, replace the menu', zh: '是，替换菜单' },
    'settingsPage.restoreMenuNo': { ms: 'Tidak, transaksi sahaja', en: 'No, transactions only', zh: '否，仅交易' },
    'settingsPage.restoreConfirmTitle': { ms: 'Pulihkan data?', en: 'Restore data?', zh: '恢复数据？' },
    'settingsPage.restoreConfirmText': { ms: '{n} transaksi akan ditambah/dikemas kini{menu}. Transaksi sedia ada dengan ID sama akan ditulis ganti.', en: '{n} transactions will be added/updated{menu}. Existing transactions with the same ID will be overwritten.', zh: '将添加/更新 {n} 笔交易{menu}。具有相同ID的现有交易将被覆盖。' },
    'settingsPage.andMenuReplaced': { ms: ' dan menu akan digantikan', en: ' and the menu will be replaced', zh: '，菜单也将被替换' },
    'settingsPage.restoreDone': { ms: '{n} transaksi dipulihkan{menu}.', en: '{n} transactions restored{menu}.', zh: '已恢复 {n} 笔交易{menu}。' },
    'settingsPage.menuReplacedSuffix': { ms: ', menu digantikan', en: ', menu replaced', zh: '，菜单已替换' },
    'settingsPage.resetMenuConfirmTitle': { ms: 'Tetapkan semula menu?', en: 'Reset the menu?', zh: '重置菜单？' },
    'settingsPage.resetMenuConfirmText': { ms: 'Menu semasa (termasuk item dan harga yang anda ubah) akan digantikan dengan senarai dalam menu-default.js.', en: 'The current menu (including items and prices you changed) will be replaced with the list in menu-default.js.', zh: '当前菜单（包括您更改的项目和价格）将被 menu-default.js 中的列表替换。' },
    'settingsPage.resetMenuOk': { ms: 'Tetapkan semula', en: 'Reset', zh: '重置' },
    'settingsPage.menuReset': { ms: 'Menu ditetapkan semula', en: 'Menu has been reset', zh: '菜单已重置' },
    'settingsPage.clearLocalConfirmTitle': { ms: 'Padam data tempatan?', en: 'Clear local data?', zh: '清除本地数据？' },
    'settingsPage.clearLocalConfirmText': { ms: 'Semua transaksi dan menu yang disimpan dalam pelayar ini akan dipadam. Data cloud tidak terjejas.', en: 'All transactions and the menu stored in this browser will be deleted. Cloud data is unaffected.', zh: '此浏览器中存储的所有交易和菜单都将被删除。云端数据不受影响。' },
    'settingsPage.localDataCleared': { ms: 'Data tempatan dipadam', en: 'Local data cleared', zh: '本地数据已清除' },

    /* ---- salesdata.html (reports) ---- */
    'reports.title': { ms: '<b>Laporan</b> Jualan', en: '<b>Sales</b> Reports', zh: '<b>销售</b>报表' },
    'reports.pDay': { ms: 'Hari ini', en: 'Today', zh: '今天' },
    'reports.pYesterday': { ms: 'Semalam', en: 'Yesterday', zh: '昨天' },
    'reports.pWeek': { ms: 'Minggu ini', en: 'This week', zh: '本周' },
    'reports.pMonth': { ms: 'Bulan ini', en: 'This month', zh: '本月' },
    'reports.pLastMonth': { ms: 'Bulan lepas', en: 'Last month', zh: '上个月' },
    'reports.pCustom': { ms: 'Pilih tarikh', en: 'Choose dates', zh: '选择日期' },
    'reports.to': { ms: 'hingga', en: 'to', zh: '至' },
    'reports.apply': { ms: 'Papar', en: 'Show', zh: '显示' },
    'reports.statTotal': { ms: 'Jumlah jualan', en: 'Total sales', zh: '总销售额' },
    'reports.statAvg': { ms: 'Purata setiap transaksi', en: 'Average per transaction', zh: '每笔平均金额' },
    'reports.statAdj': { ms: 'Pelarasan harga', en: 'Price adjustments', zh: '价格调整' },
    'reports.statMax': { ms: 'Jualan tertinggi', en: 'Highest sale', zh: '最高销售额' },
    'reports.adjCount': { ms: '{n} transaksi diubah', en: '{n} transactions adjusted', zh: '{n} 笔交易已调整' },
    'reports.byDay': { ms: 'Jualan mengikut hari', en: 'Sales by day', zh: '按日销售' },
    'reports.byHour': { ms: 'Jualan mengikut jam', en: 'Sales by hour', zh: '按小时销售' },
    'reports.topItems': { ms: 'Item terlaris', en: 'Best-selling items', zh: '畅销商品' },
    'reports.byQty': { ms: 'mengikut kuantiti', en: 'by quantity', zh: '按数量' },
    'reports.colItem': { ms: 'Item', en: 'Item', zh: '项目' },
    'reports.colQty': { ms: 'Kuantiti', en: 'Quantity', zh: '数量' },
    'reports.colSales': { ms: 'Jualan', en: 'Sales', zh: '销售额' },
    'reports.colTime': { ms: 'Masa', en: 'Time', zh: '时间' },
    'reports.colMethod': { ms: 'Kaedah', en: 'Method', zh: '方式' },
    'reports.colTotal': { ms: 'Jumlah', en: 'Total', zh: '总额' },
    'reports.transactions': { ms: 'Transaksi', en: 'Transactions', zh: '交易' },
    'reports.downloadCsv': { ms: 'Muat turun CSV', en: 'Download CSV', zh: '下载CSV' },
    'reports.csvByItem': { ms: 'CSV mengikut item', en: 'CSV by item', zh: '按项目下载CSV' },
    'reports.showMore': { ms: 'Papar lagi ({n} lagi)', en: 'Show more ({n} more)', zh: '显示更多（还有{n}项）' },
    'reports.emptyTxTitle': { ms: 'Tiada transaksi', en: 'No transactions', zh: '无交易' },
    'reports.emptyTxDesc': { ms: 'Tiada jualan direkod dalam tempoh ini.', en: 'No sales were recorded in this period.', zh: '此期间内没有记录到销售。' },
    'reports.emptyChartTitle': { ms: 'Tiada jualan', en: 'No sales', zh: '无销售' },
    'reports.emptyChartDesc': { ms: 'Tiada transaksi dalam tempoh ini.', en: 'No transactions in this period.', zh: '此期间内无交易。' },
    'reports.noItemDetail': { ms: 'tiada butiran item', en: 'no item details', zh: '无项目详情' },
    'reports.noItems': { ms: 'Tiada data lagi.', en: 'No data yet.', zh: '暂无数据。' },
    'reports.detailTitle': { ms: 'Transaksi', en: 'Transaction', zh: '交易详情' },
    'reports.priceChanged': { ms: 'harga ubah', en: 'price edited', zh: '价格已改' },
    'reports.subtotal': { ms: 'Subtotal', en: 'Subtotal', zh: '小计' },
    'reports.adjustment': { ms: 'Pelarasan', en: 'Adjustment', zh: '调整' },
    'reports.total': { ms: 'Jumlah', en: 'Total', zh: '总额' },
    'reports.receivedQr': { ms: 'Diterima melalui QR', en: 'Received via QR', zh: '通过二维码收到' },
    'reports.receivedCash': { ms: 'Tunai diterima', en: 'Cash received', zh: '收到现金' },
    'reports.change': { ms: 'Baki', en: 'Change', zh: '找零' },
    'reports.device': { ms: 'Peranti', en: 'Device', zh: '设备' },
    'reports.id': { ms: 'ID', en: 'ID', zh: 'ID' },
    'reports.switchTo': { ms: 'Tukar ke {method}', en: 'Switch to {method}', zh: '切换为{method}' },
    'reports.deleteTx': { ms: 'Padam transaksi', en: 'Delete transaction', zh: '删除交易' },
    'reports.switchMethodTitle': { ms: 'Tukar kaedah bayaran?', en: 'Change payment method?', zh: '更改付款方式？' },
    'reports.switchMethodText': { ms: 'Transaksi {amt} akan direkod sebagai {method}.', en: 'The {amt} transaction will be recorded as {method}.', zh: '该 {amt} 交易将被记录为{method}。' },
    'reports.switch': { ms: 'Tukar', en: 'Switch', zh: '切换' },
    'reports.methodChanged': { ms: 'Kaedah bayaran ditukar', en: 'Payment method changed', zh: '付款方式已更改' },
    'reports.deleteTxTitle': { ms: 'Padam transaksi ini?', en: 'Delete this transaction?', zh: '删除此交易？' },
    'reports.deleteTxText': { ms: '{amt} pada {time}, {date}. Tindakan ini tidak boleh dibatalkan.', en: '{amt} at {time}, {date}. This cannot be undone.', zh: '{amt}，于{time}，{date}。此操作无法撤销。' },
    'reports.txDeleted': { ms: 'Transaksi dipadam', en: 'Transaction deleted', zh: '交易已删除' }
  };

  function t(key, vars) {
    const row = D[key];
    let s = row ? (row[current] || row.ms || key) : key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  /** Replace an element's own text without disturbing its child elements.
   *  Several labels wrap the control they describe, e.g.
   *    <label data-i18n="...">Harga<input id="newPrice"><span>RM</span></label>
   *  Assigning to textContent there would delete the input and the span, so the
   *  form silently loses its fields. Only text nodes are rewritten. */
  function setText(el, str) {
    let written = false;
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType !== 3) continue;              // keep inputs, selects, spans
      if (written) { node.nodeValue = ''; continue; } // collapse any extra text
      node.nodeValue = str; written = true;
    }
    if (!written) el.insertBefore(document.createTextNode(str), el.firstChild);
  }

  function applyTo(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => { setText(el, t(el.getAttribute('data-i18n'))); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.getAttribute('data-i18n-title')); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    document.documentElement.lang = current === 'zh' ? 'zh' : (current === 'en' ? 'en' : 'ms');
  }

  function setLang(code) {
    if (!SUPPORTED.includes(code) || code === current) return;
    current = code;
    try { localStorage.setItem(LS_KEY, code); } catch (e) { /* ignore */ }
    applyTo(document);
    listeners.forEach(f => { try { f(current); } catch (e) { console.error(e); } });
  }

  document.addEventListener('DOMContentLoaded', () => applyTo(document));

  window.I18N = {
    t,
    get lang() { return current; },
    setLang,
    apply: applyTo,
    onChange: f => { listeners.add(f); return () => listeners.delete(f); },
    supported: SUPPORTED,
    meta: LANG_META
  };
})();
