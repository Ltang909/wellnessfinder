<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';

const PROVIDER_TYPES    = ['Pilates', 'Naturopath', 'Golf'];
const PROVIDER_STATUSES = ['approved', 'pending', 'rejected'];

/* column => max length */
const PROVIDER_FIELD_LENS = [
    'Name' => 250, 'Website' => 250, 'Billed' => 250, 'Location' => 300,
    'City' => 120, 'Province' => 10, 'Region' => 60, 'Price' => 120,
    'DirectBilling' => 120, 'Modalities' => 300, 'Tags' => 300, 'TPI' => 120,
    'Discipline' => 120, 'Note' => 500, 'BookingUrl' => 250, 'EmailContact' => 250,
    'Submitter' => 250,
];

/* Pull provider values out of a request array, trimmed and length-capped.
   Empty strings become NULL. Type/Status validated against whitelists. */
function provider_collect(array $src): array {
    $out = [];
    foreach (PROVIDER_FIELD_LENS as $k => $max) {
        $v = isset($src[$k]) ? trim((string) $src[$k]) : '';
        $out[$k] = ($v === '') ? null : mb_substr($v, 0, $max);
    }
    $type = $src['Type'] ?? '';
    $out['Type'] = in_array($type, PROVIDER_TYPES, true) ? $type : 'Pilates';
    $status = $src['Status'] ?? 'approved';
    $out['Status'] = in_array($status, PROVIDER_STATUSES, true) ? $status : 'approved';
    return $out;
}

function provider_validate(array $d): array {
    $errs = [];
    if (empty($d['Name'])) {
        $errs[] = 'A provider name is required.';
    }
    if (!in_array($d['Type'], PROVIDER_TYPES, true)) {
        $errs[] = 'Please choose a valid type.';
    }
    if (!empty($d['EmailContact']) && !filter_var($d['EmailContact'], FILTER_VALIDATE_EMAIL)) {
        $errs[] = 'The email contact address is not valid.';
    }
    return $errs;
}

function provider_insert(array $d): void {
    $cols = array_keys($d);
    $ph   = implode(',', array_fill(0, count($cols), '?'));
    $sql  = 'INSERT INTO `providers` (`' . implode('`,`', $cols) . '`) VALUES (' . $ph . ')';
    db()->prepare($sql)->execute(array_values($d));
}

function provider_update(int $id, array $d): void {
    $set    = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($d)));
    $params = array_values($d);
    $params[] = $id;
    db()->prepare('UPDATE `providers` SET ' . $set . ' WHERE `id` = ?')->execute($params);
}

function provider_get(int $id): ?array {
    $st = db()->prepare('SELECT * FROM `providers` WHERE `id` = ?');
    $st->execute([$id]);
    $r = $st->fetch();
    return $r ?: null;
}
