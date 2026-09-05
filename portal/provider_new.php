<?php
require __DIR__ . '/provider_store.php';
require_login();

$errors = [];
$p = ['Status' => 'approved'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $p = $_POST;                      // repopulate on error
    $data = provider_collect($_POST);
    $errors = provider_validate($data);
    if (!$errors) {
        try {
            provider_insert($data);
            redirect('providers.php?saved=added');
        } catch (Throwable $e) {
            $errors[] = 'Could not save. Make sure the providers table has been imported.';
        }
    }
}

render_header('Add provider');
?>
<p class="crumb"><a href="providers.php">Providers</a> <span>/</span> Add</p>
<div class="page-head"><div><p class="eyebrow">New</p><h1>Add a provider</h1></div></div>

<?php if ($errors): ?><div class="notice error"><?= h(implode(' ', $errors)) ?></div><?php endif; ?>

<form method="post" class="pform" autocomplete="off">
  <?= csrf_field() ?>
  <?php include __DIR__ . '/_form_fields.php'; ?>
  <div class="pform-actions">
    <button class="btn-primary" type="submit">Add provider</button>
    <a class="btn-sm" href="providers.php">Cancel</a>
  </div>
</form>
<?php
render_footer();
