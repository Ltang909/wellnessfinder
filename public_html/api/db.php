<?php
declare(strict_types=1);

/* Shared helpers for the WellFinder JSON API. */

$API_CONFIG = require __DIR__ . '/config.php';

function api_cfg(string $k, $default = null) {
    global $API_CONFIG;
    return $API_CONFIG[$k] ?? $default;
}

function api_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        api_cfg('db_host', 'localhost'),
        api_cfg('db_name', '')
    );
    $pdo = new PDO($dsn, api_cfg('db_user', ''), api_cfg('db_pass', ''), [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $code = 400): void {
    json_out(['ok' => false, 'error' => $message], $code);
}

/* Canonicalise a directory type from user input to the stored value. */
function normalize_type(?string $t): ?string {
    if ($t === null) return null;
    $map = ['pilates' => 'Pilates', 'naturopath' => 'Naturopath', 'golf' => 'Golf'];
    return $map[strtolower(trim($t))] ?? null;
}

/* Shape a DB row into the object the site's front-end expects. */
function map_provider(string $type, array $r): array {
    $db = $r['DirectBilling'] ?? '';
    $directBill = (bool) preg_match('/^yes/i', (string) $db);
    switch ($type) {
        case 'Pilates':
            return [
                'name' => $r['Name'], 'city' => $r['City'], 'loc' => $r['Location'],
                'prov' => $r['Province'], 'directBill' => $directBill,
                'modalities' => $r['Modalities'] ?? '', 'billed' => $r['Billed'] ?? '',
                'price' => $r['Price'] ?? '', 'db' => $db,
                'web' => $r['Website'] ?? '', 'email' => $r['EmailContact'] ?: null,
            ];
        case 'Naturopath':
            $tags = trim((string) ($r['Tags'] ?? ''));
            return [
                'name' => $r['Name'], 'city' => $r['City'], 'loc' => $r['Location'],
                'prov' => $r['Province'], 'db' => $db,
                'modalities' => $r['Modalities'] ?? '', 'billed' => $r['Billed'] ?? '',
                'price' => $r['Price'] ?? '', 'web' => $r['Website'] ?: null,
                'email' => $r['EmailContact'] ?: null,
                'tags' => $tags === '' ? [] : array_values(array_filter(array_map('trim', explode(',', $tags)))),
            ];
        case 'Golf':
        default:
            return [
                'name' => $r['Name'], 'disc' => $r['Discipline'] ?: ($r['Billed'] ?? ''),
                'tpi' => $r['TPI'] ?: null, 'loc' => $r['Location'], 'city' => $r['City'],
                'region' => $r['Region'], 'note' => $r['Note'] ?: null, 'db' => $db,
                'price' => $r['Price'] ?? '', 'web' => $r['Website'] ?: null,
                'email' => $r['EmailContact'] ?: null, 'book' => $r['BookingUrl'] ?: null,
            ];
    }
}
