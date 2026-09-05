<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

try {
    $type = normalize_type($_GET['type'] ?? null);
    if ($type === null) {
        json_error('Unknown or missing "type". Use pilates, naturopath or golf.');
    }
    $q = trim((string) ($_GET['q'] ?? ''));

    $sql = 'SELECT * FROM `providers` WHERE `Status` = ? AND `Type` = ?';
    $params = ['approved', $type];

    if ($q !== '') {
        $like = '%' . $q . '%';
        $sql .= ' AND (`Name` LIKE ? OR `City` LIKE ? OR `Location` LIKE ? OR `Modalities` LIKE ? OR `Billed` LIKE ? OR `Tags` LIKE ?)';
        array_push($params, $like, $like, $like, $like, $like, $like);
    }
    $sql .= ' ORDER BY `Name` ASC';

    $stmt = api_db()->prepare($sql);
    $stmt->execute($params);

    $items = [];
    while ($row = $stmt->fetch()) {
        $items[] = map_provider($type, $row);
    }

    json_out(['ok' => true, 'type' => $type, 'count' => count($items), 'items' => $items]);
} catch (Throwable $e) {
    json_error('Server error loading providers.', 500);
}
