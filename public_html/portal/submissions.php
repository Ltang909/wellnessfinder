<?php
require __DIR__ . '/provider_store.php';
require_login();

$tableMissing = false;
$rows = [];
try {
    $st = db()->query("SELECT * FROM `providers` WHERE `Status` = 'pending' ORDER BY `CreatedAt` DESC, `id` DESC");
    $rows = $st->fetchAll();
} catch (Throwable $e) {
    $tableMissing = true;
}

$backUrl = 'submissions.php';

function sub_action($id, $action, $label, $cls, $back, $confirm = false): void {
    $c = $confirm ? " onsubmit=\"return confirm('Delete this submission permanently?')\"" : '';
    echo '<form method="post" action="provider_action.php" class="inline-actions"' . $c . '>';
    echo csrf_field();
    echo '<input type="hidden" name="id" value="' . (int) $id . '">';
    echo '<input type="hidden" name="action" value="' . h($action) . '">';
    echo '<input type="hidden" name="back" value="' . h($back) . '">';
    echo '<button class="btn-sm ' . h($cls) . '" type="submit">' . h($label) . '</button>';
    echo '</form>';
}

render_header('Submissions');
?>
<div class="page-head">
  <div><p class="eyebrow">Moderation</p><h1>Pending submissions</h1></div>
</div>

<?php if ($tableMissing): ?>
  <div class="notice error">The <code>providers</code> table isn't in this database yet. Import
  <code>database/wellfinder_providers.sql</code> first.</div>
<?php elseif (!$rows): ?>
  <div class="notice">Nothing waiting for review. New submissions from the website will appear here.</div>
<?php else: ?>
  <div class="result-meta"><span><strong><?= count($rows) ?></strong> awaiting review</span></div>
  <div class="table-scroll">
    <table class="data-table admin-table">
      <thead><tr><th>Name</th><th>Type</th><th>Details</th><th>Contact</th><th>Actions</th></tr></thead>
      <tbody>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td>
              <strong><?= h((string) $r['Name']) ?></strong>
              <?php if (!empty($r['Website'])): ?><div class="sub"><a href="<?= h((string) $r['Website']) ?>" target="_blank" rel="noopener">website ↗</a></div><?php endif; ?>
            </td>
            <td><?= h((string) $r['Type']) ?></td>
            <td>
              <div><?= h((string) ($r['Location'] ?: $r['City'] ?: '—')) ?></div>
              <?php $bits = array_filter([$r['Billed'] ?? '', $r['Modalities'] ?? '', $r['Price'] ?? '']);
                    if ($bits): ?><div class="sub"><?= h(implode(' · ', $bits)) ?></div><?php endif; ?>
              <?php if (!empty($r['Note'])): ?><div class="sub">“<?= h((string) $r['Note']) ?>”</div><?php endif; ?>
            </td>
            <td>
              <?php if (!empty($r['Submitter'])): ?><div class="sub"><?= h((string) $r['Submitter']) ?></div><?php endif; ?>
              <?php if (!empty($r['EmailContact'])): ?><div class="sub"><?= h((string) $r['EmailContact']) ?></div><?php endif; ?>
              <?php if (empty($r['Submitter']) && empty($r['EmailContact'])): ?><span class="sub">—</span><?php endif; ?>
            </td>
            <td>
              <div class="inline-actions">
                <?php sub_action((int) $r['id'], 'approve', 'Approve', 'btn-approve', $backUrl); ?>
                <a class="btn-sm" href="provider_edit.php?id=<?= (int) $r['id'] ?>">Edit</a>
                <?php sub_action((int) $r['id'], 'reject', 'Reject', 'btn-danger', $backUrl); ?>
                <?php sub_action((int) $r['id'], 'delete', 'Delete', 'btn-danger', $backUrl, true); ?>
              </div>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <p class="hint" style="margin-top:14px">Approve publishes to the live site immediately. Reject keeps the record but hides it. Edit lets you tidy details before approving.</p>
<?php endif; ?>
<?php
render_footer();
