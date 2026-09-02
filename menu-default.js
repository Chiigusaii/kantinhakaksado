/* ============================================================
   Kantin Dapo Hakaksado — MENU LALAI / DEFAULT MENU
   ------------------------------------------------------------
   This list is only used the FIRST time the system starts (it is
   copied into the shared database). After that, manage the menu
   from the "Menu" page inside the app - editing this file will not
   change a menu that already exists (use Tetapan > "Tetapkan semula
   menu" to reload it).

   Format:  [ "Kategori", "Nama makanan / minuman", harga ]
   ============================================================ */
window.KANTIN_DEFAULT_MENU = {
  cats: [
    "Sarapan Pagi",
    "Nasi & Telur",
    "Lauk (Ikan & Ayam)",
    "Sayur-Sayuran",
    "Minuman (Panas / Sejuk)",
    "Minuman Lain"
  ],
  items: [
    /* --- Sarapan Pagi --- */
    ["Sarapan Pagi", "Roti Canai", 1.50],
    ["Sarapan Pagi", "Roti Telur", 2.50],
    ["Sarapan Pagi", "Nasi Lemak", 2.00],
    ["Sarapan Pagi", "Nasi Lemak Telur", 3.00],
    ["Sarapan Pagi", "Mee Goreng", 3.00],
    ["Sarapan Pagi", "Mee Goreng Telur", 4.00],
    ["Sarapan Pagi", "Soto", 4.00],
    ["Sarapan Pagi", "Lontong", 4.00],

    /* --- Nasi & Telur --- */
    ["Nasi & Telur", "Nasi Putih", 1.50],
    ["Nasi & Telur", "Nasi Minyak", 2.50],
    ["Nasi & Telur", "Nasi Briyani", 3.00],
    ["Nasi & Telur", "Nasi Tomato", 2.50],
    ["Nasi & Telur", "Telur Mata", 1.50],
    ["Nasi & Telur", "Telur Dadar", 1.50],
    ["Nasi & Telur", "Telur Rebus", 1.00],
    ["Nasi & Telur", "Telur Masak Kicap", 1.50],

    /* --- Lauk (Ikan & Ayam) --- */
    ["Lauk (Ikan & Ayam)", "Ikan Kembong", 3.00],
    ["Lauk (Ikan & Ayam)", "Ikan Selar", 3.00],
    ["Lauk (Ikan & Ayam)", "Ikan Bawal", 5.00],
    ["Lauk (Ikan & Ayam)", "Ikan Siakap", 6.00],
    ["Lauk (Ikan & Ayam)", "Ayam Goreng", 3.50],

    /* --- Sayur-Sayuran --- */
    ["Sayur-Sayuran", "Kangkung Goreng", 1.50],
    ["Sayur-Sayuran", "Bayam", 1.50],
    ["Sayur-Sayuran", "Sawi", 1.50],
    ["Sayur-Sayuran", "Brokoli", 2.00],
    ["Sayur-Sayuran", "Sambal Jawa", 1.50],

    /* --- Minuman (Panas / Sejuk) --- */
    ["Minuman (Panas / Sejuk)", "Teh O Panas", 1.20],
    ["Minuman (Panas / Sejuk)", "Teh O Ais", 1.80],
    ["Minuman (Panas / Sejuk)", "Teh Panas", 1.50],
    ["Minuman (Panas / Sejuk)", "Teh Ais", 2.00],
    ["Minuman (Panas / Sejuk)", "Kopi O Panas", 1.20],
    ["Minuman (Panas / Sejuk)", "Kopi O Ais", 1.80],
    ["Minuman (Panas / Sejuk)", "Kopi Panas", 1.50],
    ["Minuman (Panas / Sejuk)", "Kopi Ais", 2.00],
    ["Minuman (Panas / Sejuk)", "Nes O Panas", 1.50],
    ["Minuman (Panas / Sejuk)", "Nes O Ais", 2.00],
    ["Minuman (Panas / Sejuk)", "Nes Panas", 2.00],
    ["Minuman (Panas / Sejuk)", "Nes Ais", 2.50],
    ["Minuman (Panas / Sejuk)", "Milo Panas", 2.00],
    ["Minuman (Panas / Sejuk)", "Milo Ais", 2.50],
    ["Minuman (Panas / Sejuk)", "Limau Panas", 1.50],
    ["Minuman (Panas / Sejuk)", "Limau Ais", 2.00],

    /* --- Minuman Lain --- */
    ["Minuman Lain", "Cordial", 1.00],
    ["Minuman Lain", "Air Tin", 2.00],
    ["Minuman Lain", "Air Mineral", 1.00],
    ["Minuman Lain", "Extra Joss", 3.00]
  ]
};
