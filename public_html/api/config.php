<?php
/* WellFinder API — configuration.
   Same database as the portal. Keep this file private (see .htaccess).
   Remember to rotate this password in hPanel since it was shared in chat. */

return [
    'db_host'  => 'localhost',
    'db_name'  => 'u718027464_WFproviders',
    'db_user'  => 'u718027464_wellfinder',
    'db_pass'  => '$6iRrze$4tQ',

    // Directory types the site understands.
    'types'    => ['Pilates', 'Naturopath', 'Golf'],
];
