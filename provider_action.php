<?php
require __DIR__ . '/provider_store.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('providers.php');
}
csrf_check();

$id     = (int) ($_POST['id'] ?? 0);
$action = (string) ($_POST['action'] ?? '');
$back   = (string) ($_POST['back'] ?? 'providers.php');

/* Only allow redirecting back to a local portal page. */
if (!preg_match('#^[a-z_]+\.php(\?[\w=&%.\-\+]*)?$#i', $back)) {
    $back = 'providers.php';
}

if ($id > 0) {
    try {
        if ($action === 'approve') {
            db()->prepare("UPDATE `providers` SET `Status` = 'approved' WHERE `id` = ?")->execute([$id]);
        } elseif ($action === 'reject') {
            db()->prepare("UPDATE `providers` SET `Status` = 'rejected' WHERE `id` = ?")->execute([$id]);
        } elseif ($action === 'delete') {
            db()->prepare("DELETE FROM `providers` WHERE `id` = ?")->execute([$id]);
        }
    } catch (Throwable $e) {
        /* fall through to redirect */
    }
}

redirect($back);
