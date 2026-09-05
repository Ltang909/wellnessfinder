<?php
declare(strict_types=1);
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Use POST to submit a provider.', 405);
}

/* Accept either form-encoded or JSON bodies. */
$body = $_POST;
if (empty($body)) {
    $raw = file_get_contents('php://input');
    $decoded = json_decode((string) $raw, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}

$get = fn($k) => isset($body[$k]) ? trim((string) $body[$k]) : '';

/* Honeypot: real users never fill this hidden field. */
if ($get('company') !== '') {
    json_out(['ok' => true]); // silently accept, drop
}

$type = normalize_type($get('type'));
$name = $get('name');

if ($type === null) {
    json_error('Please choose a valid category (Pilates, Naturopath or Golf).');
}
if ($name === '') {
    json_error('A provider name is required.');
}
if (mb_strlen($name) > 250) {
    json_error('That name is too long.');
}

/* Optional email sanity check (submitter or provider contact). */
$email = $get('email');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('That email address doesn\'t look valid.');
}

$cut = fn(string $v, int $n) => mb_substr($v, 0, $n);

$fields = [
    'Type'          => $type,
    'Name'          => $cut($name, 250),
    'Website'       => $cut($get('website'), 250),
    'Billed'        => $cut($get('billed'), 250),
    'Location'      => $cut($get('location'), 300),
    'City'          => $cut($get('city'), 120),
    'Province'      => $cut($get('province'), 10),
    'Region'        => $cut($get('region'), 60),
    'Price'         => $cut($get('price'), 120),
    'DirectBilling' => $cut($get('directBilling'), 120),
    'Modalities'    => $cut($get('modalities'), 300),
    'Tags'          => $cut($get('tags'), 300),
    'TPI'           => $cut($get('tpi'), 120),
    'Discipline'    => $cut($get('discipline'), 120),
    'Note'          => $cut($get('note'), 500),
    'BookingUrl'    => $cut($get('bookingUrl'), 250),
    'EmailContact'  => $cut($email, 250),
    'Status'        => 'pending',
    'Submitter'     => $cut($get('submitter'), 250),
];

try {
    $cols = array_keys($fields);
    $place = implode(',', array_fill(0, count($cols), '?'));
    $sql = 'INSERT INTO `providers` (`' . implode('`,`', $cols) . '`) VALUES (' . $place . ')';
    $stmt = api_db()->prepare($sql);
    $stmt->execute(array_values($fields));
    json_out(['ok' => true, 'message' => 'Thanks! Your submission is in review.']);
} catch (Throwable $e) {
    json_error('Sorry, something went wrong saving your submission.', 500);
}
