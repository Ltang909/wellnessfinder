<?php
require __DIR__ . '/lib.php';
require_login();

$cur   = current_db();
$table = (string) ($_GET['table'] ?? '');

if ($table === '' || !valid_table($table)) {
    http_response_code(404);
    echo 'Table not found.';
    exit;
}

$q    = trim((string) ($_GET['q'] ?? ''));
$sort = (string) ($_GET['sort'] ?? '');
$dir  = (string) ($_GET['dir'] ?? 'ASC');
$cap  = (int) cfg('csv_cap', 10000);

$columns = column_names($table);

$params = [];
$where  = search_where($table, $q, $params);
$order  = order_by($table, $sort, $dir);

$sql = 'SELECT * FROM ' . backtick($table) . $where . $order . ' LIMIT ' . (int) $cap;
$stmt = db()->prepare($sql);
$stmt->execute($params);

$filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $table) . '_' . date('Ymd_His') . '.csv';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$out = fopen('php://output', 'w');
fprintf($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads accents correctly
fputcsv($out, $columns);
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $line = [];
    foreach ($columns as $c) {
        $line[] = $row[$c] ?? '';
    }
    fputcsv($out, $line);
}
fclose($out);
exit;
