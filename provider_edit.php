<?php
require __DIR__ . '/provider_store.php';
require_login();

$id = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);

try {
    $row = $id > 0 ? provider_get($id) : null;
} catch (Throwable $e) {
    $row = null;
}
if (!$row) {
    render_header('Not found');
    echo '<div class="notice error">That provider could not be found. <a href="providers.php">Back to providers</a>.</div>';
    render_footer();
    exit;
}

$errors = [];
$p = $row;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $p = $_POST;
    $p['id'] = $id;
    $data = provider_collect($_POST);
    $errors = provider_validate($data);
    if (!$errors) {
        try {
            provider_update($id, $data);
            redirect('providers.php?saved=updated');
        } catch (Throwable $e) {
            $errors[] = 'Could not save your changes.';
        }
    }
}

render_header('Edit provider');
?>
<p class="crumb"><a href="providers.php">Providers</a> <span>/</span> Edit</p>
<div class="page-head">
  <div><p class="eyebrow">Edit · #<?= (int) $id ?></p><h1><?= h((string) ($row['Name'] ?? 'Provider')) ?></h1></div>
</div>

<?php if ($errors): ?><div class="notice error"><?= h(implode(' ', $errors)) ?></div><?php endif; ?>

<form method="post" class="pform" autocomplete="off">
  <?= csrf_field() ?>
  <input type="hidden" name="id" value="<?= (int) $id ?>">
  <?php include __DIR__ . '/_form_fields.php'; ?>
  <div class="pform-actions">
    <button class="btn-primary" type="submit">Save changes</button>
    <a class="btn-sm" href="providers.php">Cancel</a>
  </div>
</form>
<?php
render_footer();
