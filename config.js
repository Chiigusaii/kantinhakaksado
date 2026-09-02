/* ============================================================
   Kantin Dapo Hakaksado — TETAPAN / SETTINGS
   ------------------------------------------------------------
   Paste your Firebase web-app config below (see SETUP.md).
   While these fields are empty the system runs in LOCAL mode:
   everything still works, but data stays inside one browser only.
   Once filled in, every phone / tablet / laptop that opens the
   site shares the same live data.
   ============================================================ */
window.KANTIN_CONFIG = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  // true  = cashier must log in with the email + password you create in
  //         Firebase Authentication (recommended - keeps sales data private).
  // false = no login screen. Only use this with the "open" rules in SETUP.md.
  requireLogin: true,

  // Name shown in the header. Change if you like.
  shopName: "Kantin Dapo Hakaksado"
};
