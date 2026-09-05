<?php
/* =============================================================
   WellFinder Data Portal — configuration  (PRE-FILLED)
   -------------------------------------------------------------
   These values were set up for your Hostinger database.
   IMPORTANT:
   • Set 'portal_password' below before uploading.
   • This file contains your DB password — do NOT commit it to a
     public Git repo. Upload the portal to Hostinger via File
     Manager / FTP. (A .gitignore is included that excludes it.)
   ============================================================= */

return [

    /* ---- Database connection ---- */
    // Running on Hostinger, the DB host is normally 'localhost'.
    // If the portal can't connect, try the hostname shown in
    // hPanel → Databases (sometimes 127.0.0.1 or a specific host).
    'db_host' => 'localhost',
    'db_user' => 'u718027464_wellfinder',
    'db_pass' => '$6iRrze$4tQ',

    // Every database this portal may browse (add more anytime).
    'databases' => [
        'u718027464_WFproviders',
    ],

    /* ---- Portal login ----
       CHANGE THIS before uploading. It's the only lock on the door. */
    'portal_password' => 'CHANGE_ME_choose_a_strong_password',

    /* ---- Appearance ---- */
    'title'    => 'WellFinder Data Portal',
    'per_page' => 50,       // rows per page (25 / 50 / 100)
    'csv_cap'  => 10000,    // max rows per CSV export
];
