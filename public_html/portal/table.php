<?php
require __DIR__ . '/lib.php';
require_login();

$cur   = current_db();
$table = (string) ($_GET['table'] ?? '');

if ($table === '' || !valid_table($table)) {
    render_header('Not found');
    echo '<div class="notice error">That table doesn\'t exist in <strong>' . h($cur) . '</strong>. '
       . '<a href="index.php">Back to tables</a>.</div>';
    render_footer();
    exit;
}

$columns = column_names($table);

/* ---- request params ---- */
$q    = trim((string) ($_GET['q'] ?? ''));
$sort = (string) ($_GET['sort'] ?? '');
$dir  = strtoupper((string) ($_GET['dir'] ?? 'ASC')) === 'DESC' ? 'DESC' : 'ASC';

$allowedPer = [25, 50, 100];
$per = (int) ($_GET['per'] ?? cfg('per_page', 50));
if (!in_array($per, $allowedPer, true)) {
    $per = (int) cfg('per_page', 50);
}
$page = max(1, (int) ($_GET['page'] ?? 1));

/* ---- build query ---- */
$params = [];
$where  = search_where($table, $q, $params);
$order  = order_by($table, $sort, $dir);

$total  = (int) (function () use ($table, $where, $params) {
    $st = db()->prepare('SELECT COUNT(*) FROM ' . backtick($table) . $where);
    $st->execute($params);
    return $st->fetchColumn();
})();

$pages  = max(1, (int) ceil($total / $per));
$page   = min($page, $pages);
$offset = ($page - 1) * $per;

$sql = 'SELECT * FROM ' . backtick($table) . $where . $order
     . ' LIMIT ' . (int) $per . ' OFFSET ' . (int) $offset;
$st  = db()->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

/* helper to build a URL preserving current state */
function link_with(array $overrides): string {
    global $cur, $table, $q, $sort, $dir, $per, $page;
    $base = ['db' => $cur, 'table' => $table, 'q' => $q, 'sort' => $sort, 'dir' => $dir, 'per' => $per, 'page' => $page];
    $merged = array_merge($base, $overrides);
    $merged = array_filter($merged, fn($v) => $v !== '' && $v !== null);
    return 'table.php?' . http_build_query($merged);
}

render_header($table);
?>
<p class="crumb"><a href="index.php">Tables</a> <span>/</span> <?= h($table) ?></p>

<div class="page-head">
  <div>
    <p class="eyebrow">Table</p>
    <h1><?= h($table) ?></h1>
  </div>
  <div class="head-actions">
    <?php
      $exportUrl = 'export.php?' . http_build_query(array_filter([
        'db' => $cur, 'table' => $table, 'q' => $q, 'sort' => $sort, 'dir' => $dir,
      ], fn($v) => $v !== '' && $v !== null));
    ?>
    <a class="btn-ghost" href="<?= h($exportUrl) ?>">Export CSV</a>
  </div>
</div>

<form method="get" action="table.php" class="search-bar">
  <input type="hidden" name="db" value="<?= h($cur) ?>">
  <input type="hidden" name="table" value="<?= h($table) ?>">
  <input type="hidden" name="per" value="<?= (int) $per ?>">
  <input type="search" name="q" value="<?= h($q) ?>" placeholder="Search all columns…" aria-label="Search">
  <button type="submit" class="btn-primary">Search</button>
  <?php if ($q !== ''): ?><a class="clear" href="<?= h(link_with(['q' => null, 'page' => 1])) ?>">Clear</a><?php endif; ?>
</form>

<div class="result-meta">
  <span><strong><?= number_format($total) ?></strong> <?= $q !== '' ? 'matching ' : '' ?>row<?= $total === 1 ? '' : 's' ?></span>
  <span class="per-page">
    Show
    <?php foreach ($allowedPer as $opt): ?>
      <a class="<?= $opt === $per ? 'active' : '' ?>" href="<?= h(link_with(['per' => $opt, 'page' => 1])) ?>"><?= $opt ?></a>
    <?php endforeach; ?>
  </span>
</div>

<?php if (!$rows): ?>
  <div class="notice">No rows to show<?= $q !== '' ? ' for that search' : '' ?>.</div>
<?php else: ?>
<div class="table-scroll">
  <table class="data-table">
    <thead>
      <tr>
        <?php foreach ($columns as $c):
          $isSorted = ($sort === $c);
          $nextDir  = ($isSorted && $dir === 'ASC') ? 'DESC' : 'ASC';
          $arrow    = $isSorted ? ($dir === 'ASC' ? ' ▲' : ' ▼') : '';
        ?>
          <th>
            <a href="<?= h(link_with(['sort' => $c, 'dir' => $nextDir, 'page' => 1])) ?>"
               class="<?= $isSorted ? 'sorted' : '' ?>"><?= h($c) ?><?= $arrow ?></a>
          </th>
        <?php endforeach; ?>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($rows as $row): ?>
        <tr>
          <?php foreach ($columns as $c):
            $val = $row[$c] ?? null;
          ?>
            <td>
              <?php if ($val === null): ?>
                <span class="null">NULL</span>
              <?php else:
                $str = (string) $val;
                if (mb_strlen($str) > 140): ?>
                  <span class="cell clamp"><?= h($str) ?></span>
                <?php else: ?>
                  <span class="cell"><?= h($str) ?></span>
                <?php endif;
              endif; ?>
            </td>
          <?php endforeach; ?>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php if ($pages > 1): ?>
<nav class="pager">
  <a class="<?= $page <= 1 ? 'disabled' : '' ?>" href="<?= h(link_with(['page' => max(1, $page - 1)])) ?>">← Prev</a>
  <span>Page <?= $page ?> of <?= $pages ?></span>
  <a class="<?= $page >= $pages ? 'disabled' : '' ?>" href="<?= h(link_with(['page' => min($pages, $page + 1)])) ?>">Next →</a>
</nav>
<?php endif; ?>
<?php endif; ?>

<?php
render_footer();
