<?php
require __DIR__ . '/lib.php';
require_login();

$cur = current_db();
$tables = [];
$loadError = '';
try {
    foreach (list_tables() as $t) {
        $tables[] = [
            'name'    => $t,
            'rows'    => table_count($t),
            'columns' => count(column_names($t)),
        ];
    }
} catch (Throwable $e) {
    $loadError = $e->getMessage();
}

render_header('Tables');
?>
<div class="page-head">
  <div>
    <p class="eyebrow">Browsing</p>
    <h1><?= h($cur) ?></h1>
  </div>
  <div class="head-stat">
    <span class="stat-num"><?= count($tables) ?></span>
    <span class="stat-label">table<?= count($tables) === 1 ? '' : 's' ?></span>
  </div>
</div>

<?php if ($loadError): ?>
  <div class="notice error">Couldn't read the tables in this database: <?= h($loadError) ?></div>
<?php elseif (!$tables): ?>
  <div class="notice">This database has no tables yet.</div>
<?php else: ?>
  <input type="search" id="tableFilter" class="filter-input" placeholder="Filter tables…" aria-label="Filter tables">
  <div class="table-grid" id="tableGrid">
    <?php foreach ($tables as $t): ?>
      <a class="table-card" data-name="<?= h(strtolower($t['name'])) ?>"
         href="table.php?db=<?= h(rawurlencode($cur)) ?>&amp;table=<?= h(rawurlencode($t['name'])) ?>">
        <h3><?= h($t['name']) ?></h3>
        <div class="tc-stats">
          <span><strong><?= number_format($t['rows']) ?></strong> row<?= $t['rows'] === 1 ? '' : 's' ?></span>
          <span><strong><?= $t['columns'] ?></strong> column<?= $t['columns'] === 1 ? '' : 's' ?></span>
        </div>
        <span class="tc-open">Open →</span>
      </a>
    <?php endforeach; ?>
  </div>
  <p class="empty-hint" id="noMatch" hidden>No tables match that filter.</p>
<?php endif; ?>
<?php
render_footer();
