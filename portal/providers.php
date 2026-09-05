<?php
require __DIR__ . '/provider_store.php';
require_login();

$type   = (string) ($_GET['type'] ?? '');
$status = (string) ($_GET['status'] ?? '');
$q      = trim((string) ($_GET['q'] ?? ''));

$where = [];
$params = [];
if (in_array($type, PROVIDER_TYPES, true))       { $where[] = '`Type` = ?';   $params[] = $type; }
if (in_array($status, PROVIDER_STATUSES, true))  { $where[] = '`Status` = ?'; $params[] = $status; }
if ($q !== '') {
    $where[] = '(`Name` LIKE ? OR `City` LIKE ? OR `Location` LIKE ?)';
    $like = '%' . $q . '%';
    array_push($params, $like, $like, $like);
}

$sql = 'SELECT * FROM `providers`';
if ($where) { $sql .= ' WHERE ' . implode(' AND ', $where); }
$sql .= ' ORDER BY `CreatedAt` DESC, `id` DESC LIMIT 500';

$tableMissing = false;
$rows = [];
try {
    $st = db()->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll();
} catch (Throwable $e) {
    $tableMissing = true;
}

/* back-link for action redirects = current filter view */
$backParams = array_filter(['type' => $type, 'status' => $status, 'q' => $q], fn($v) => $v !== '' && $v !== null);
$backUrl = 'providers.php' . ($backParams ? '?' . http_build_query($backParams) : '');

function action_form($id, $action, $label, $cls, $back, $confirm = false): void {
    $c = $confirm ? " onsubmit=\"return confirm('Delete this provider permanently? This cannot be undone.')\"" : '';
    echo '<form method="post" action="provider_action.php" class="inline-actions"' . $c . '>';
    echo csrf_field();
    echo '<input type="hidden" name="id" value="' . (int) $id . '">';
    echo '<input type="hidden" name="action" value="' . h($action) . '">';
    echo '<input type="hidden" name="back" value="' . h($back) . '">';
    echo '<button class="btn-sm ' . h($cls) . '" type="submit">' . h($label) . '</button>';
    echo '</form>';
}

$saved = $_GET['saved'] ?? '';

render_header('Providers');
?>
<div class="page-head">
  <div><p class="eyebrow">Directory</p><h1>Providers</h1></div>
  <div class="head-actions">
    <a class="btn-primary" href="provider_new.php">+ Add provider</a>
    <a class="btn-primary" href="import_csv.php" style="background:#6b7280;margin-left:8px;">⬆ Import CSV</a>
  </div>
</div>

<?php if ($saved === 'added'): ?><div class="form-flash">Provider added.</div>
<?php elseif ($saved === 'updated'): ?><div class="form-flash">Changes saved.</div><?php endif; ?>

<?php if ($tableMissing): ?>
  <div class="notice error">The <code>providers</code> table isn't in this database yet. Import
  <code>database/wellfinder_providers.sql</code> via phpMyAdmin, then reload this page.</div>
<?php else: ?>

<form method="get" action="providers.php" class="admin-filters">
  <div class="field">
    <label for="type">Type</label>
    <select id="type" name="type" onchange="this.form.submit()">
      <option value="">All</option>
      <?php foreach (PROVIDER_TYPES as $t): ?><option <?= $t === $type ? 'selected' : '' ?>><?= h($t) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field">
    <label for="status">Status</label>
    <select id="status" name="status" onchange="this.form.submit()">
      <option value="">All</option>
      <?php foreach (PROVIDER_STATUSES as $s): ?><option <?= $s === $status ? 'selected' : '' ?>><?= h(ucfirst($s)) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field">
    <label for="q">Search</label>
    <input type="search" id="q" name="q" value="<?= h($q) ?>" placeholder="Name, city, location…">
  </div>
  <button class="btn-sm" type="submit">Filter</button>
  <?php if ($type || $status || $q): ?><a class="btn-sm" href="providers.php">Clear</a><?php endif; ?>
</form>

<div class="result-meta"><span><strong><?= number_format(count($rows)) ?></strong> provider<?= count($rows) === 1 ? '' : 's' ?><?= count($rows) === 500 ? ' (showing first 500)' : '' ?></span></div>

<?php if (!$rows): ?>
  <div class="notice">No providers match those filters.</div>
<?php else: ?>
<div class="table-scroll">
  <table class="data-table admin-table">
    <thead><tr><th>Name</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      <?php foreach ($rows as $r):
        $st = strtolower((string) ($r['Status'] ?? '')); ?>
        <tr>
          <td>
            <strong><?= h((string) $r['Name']) ?></strong>
            <?php if (!empty($r['Submitter'])): ?><div class="sub">submitted by <?= h((string) $r['Submitter']) ?></div><?php endif; ?>
          </td>
          <td><?= h((string) $r['Type']) ?></td>
          <td><?= h((string) ($r['Location'] ?: $r['City'] ?: '—')) ?></td>
          <td><span class="pill <?= h($st) ?>"><?= h($st ?: 'unknown') ?></span></td>
          <td>
            <div class="inline-actions">
              <a class="btn-sm" href="provider_edit.php?id=<?= (int) $r['id'] ?>">Edit</a>
              <?php if ($st !== 'approved') { action_form((int) $r['id'], 'approve', 'Approve', 'btn-approve', $backUrl); } ?>
              <?php if ($st === 'pending')  { action_form((int) $r['id'], 'reject', 'Reject', 'btn-danger', $backUrl); } ?>
              <?php action_form((int) $r['id'], 'delete', 'Delete', 'btn-danger', $backUrl, true); ?>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>
<?php endif; /* table exists */ ?>
<?php
render_footer();
