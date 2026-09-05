<?php
/* =============================================================
   WellFinder Data Portal — shared library
   Connection, authentication, safety helpers, page chrome.
   ============================================================= */

declare(strict_types=1);

/* ---- load config ---- */
$CONFIG = require __DIR__ . '/config.php';

/* ---- sessions (hardened cookie) ---- */
if (session_status() === PHP_SESSION_NONE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'secure'   => $secure,
        'samesite' => 'Lax',
    ]);
    session_start();
}

/* ---- tiny helpers ---- */
function h(?string $s): string {
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function cfg(string $key, $default = null) {
    global $CONFIG;
    return $CONFIG[$key] ?? $default;
}
function redirect(string $url): void {
    header('Location: ' . $url);
    exit;
}

/* ---- CSRF ---- */
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}
function csrf_field(): string {
    return '<input type="hidden" name="csrf" value="' . h(csrf_token()) . '">';
}
function csrf_check(): void {
    $t = $_POST['csrf'] ?? '';
    if (!is_string($t) || !hash_equals(csrf_token(), $t)) {
        http_response_code(400);
        exit('Invalid or expired request token. Please go back and try again.');
    }
}

/* Count providers awaiting moderation (0 if the table isn't present). */
function pending_count(): int {
    try {
        return (int) db()->query("SELECT COUNT(*) FROM `providers` WHERE `Status` = 'pending'")->fetchColumn();
    } catch (Throwable $e) {
        return 0;
    }
}

/* ---- authentication ---- */
function is_logged_in(): bool {
    return !empty($_SESSION['portal_auth']);
}
function require_login(): void {
    if (!is_logged_in()) {
        redirect('login.php');
    }
}
function check_password(string $input): bool {
    $expected = (string) cfg('portal_password', '');
    // constant-time comparison
    return $expected !== '' && hash_equals($expected, $input);
}

/* ---- database ---- */
function current_db(): string {
    $dbs = cfg('databases', []);
    $req = $_GET['db'] ?? ($_SESSION['db'] ?? null);
    if ($req !== null && in_array($req, $dbs, true)) {
        $_SESSION['db'] = $req;
        return $req;
    }
    return $dbs[0] ?? '';
}

function db(): PDO {
    static $pdo = null;
    static $connectedDb = null;
    $name = current_db();
    if ($pdo !== null && $connectedDb === $name) {
        return $pdo;
    }
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        cfg('db_host', 'localhost'),
        $name
    );
    try {
        $pdo = new PDO($dsn, cfg('db_user', ''), cfg('db_pass', ''), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo '<div style="font-family:sans-serif;max-width:640px;margin:60px auto;padding:24px;border:1px solid #d98c86;border-radius:12px">'
           . '<h2 style="margin-top:0">Could not connect to the database</h2>'
           . '<p>Check the credentials in <code>config.php</code>. Hostinger shows them under '
           . 'hPanel → Databases Management.</p>'
           . '<p style="color:#8a8a8a">Technical detail: ' . h($e->getMessage()) . '</p>'
           . '</div>';
        exit;
    }
    $connectedDb = $name;
    return $pdo;
}

/* ---- schema introspection (whitelisting) ---- */
function list_tables(): array {
    $rows = db()->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
    return array_map(fn($r) => $r[0], $rows);
}
function valid_table(string $t): bool {
    return in_array($t, list_tables(), true);
}
function table_columns(string $table): array {
    // $table must already be validated by the caller
    $stmt = db()->query('SHOW COLUMNS FROM ' . backtick($table));
    return $stmt->fetchAll(PDO::FETCH_ASSOC); // Field, Type, Null, Key, Default, Extra
}
function column_names(string $table): array {
    return array_map(fn($c) => $c['Field'], table_columns($table));
}
function table_count(string $table): int {
    $stmt = db()->query('SELECT COUNT(*) FROM ' . backtick($table));
    return (int) $stmt->fetchColumn();
}

/* Quote an identifier safely (validate first, then escape backticks). */
function backtick(string $ident): string {
    return '`' . str_replace('`', '``', $ident) . '`';
}

/* Build a WHERE clause that searches every column with LIKE.
   Values are bound as positional params (never concatenated). */
function search_where(string $table, string $q, array &$params): string {
    if ($q === '') {
        return '';
    }
    $parts = [];
    foreach (column_names($table) as $c) {
        $parts[] = backtick($c) . ' LIKE ?';
        $params[] = '%' . $q . '%';
    }
    return $parts ? (' WHERE (' . implode(' OR ', $parts) . ')') : '';
}

/* Build a safe ORDER BY. $sort is validated against real columns;
   anything else is ignored so no user string reaches the SQL. */
function order_by(string $table, ?string $sort, string $dir): string {
    if ($sort === null || $sort === '' || !in_array($sort, column_names($table), true)) {
        return '';
    }
    $dir = strtoupper($dir) === 'DESC' ? 'DESC' : 'ASC';
    return ' ORDER BY ' . backtick($sort) . ' ' . $dir;
}

/* ---- page chrome ---- */
function render_header(string $pageTitle = ''): void {
    $title = cfg('title', 'Data Portal');
    $dbs   = cfg('databases', []);
    $cur   = current_db();
    $full  = $pageTitle ? ($pageTitle . ' · ' . $title) : $title;
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= h($full) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/portal.css">
</head>
<body>
<header class="topbar">
  <div class="topbar-left">
    <a class="brand" href="index.php">
      <span class="brand-mark">◐</span> <?= h($title) ?>
    </a>
    <?php if (is_logged_in()):
      $hereNav = basename($_SERVER['PHP_SELF'] ?? '');
      $pending = pending_count();
      $navItems = [
        'index.php'        => 'Tables',
        'providers.php'    => 'Providers',
        'provider_new.php' => 'Add provider',
        'submissions.php'  => 'Submissions',
      ];
    ?>
    <nav class="admin-nav">
      <?php foreach ($navItems as $file => $label): ?>
        <a href="<?= h($file) ?>" class="<?= $hereNav === $file ? 'active' : '' ?>">
          <?= h($label) ?><?php if ($file === 'submissions.php' && $pending > 0): ?><span class="badge"><?= $pending ?></span><?php endif; ?>
        </a>
      <?php endforeach; ?>
    </nav>
    <?php endif; ?>
  </div>
  <?php if (is_logged_in()): ?>
  <div class="topbar-right">
    <?php if (count($dbs) > 1): ?>
      <form method="get" action="index.php" class="db-switch">
        <label for="dbsel">Database</label>
        <select id="dbsel" name="db" onchange="this.form.submit()">
          <?php foreach ($dbs as $d): ?>
            <option value="<?= h($d) ?>" <?= $d === $cur ? 'selected' : '' ?>><?= h($d) ?></option>
          <?php endforeach; ?>
        </select>
      </form>
    <?php else: ?>
      <span class="db-name"><?= h($cur) ?></span>
    <?php endif; ?>
    <a class="btn-ghost" href="logout.php">Log out</a>
  </div>
  <?php endif; ?>
</header>
<main class="wrap">
    <?php
}

function render_footer(): void {
    ?>
</main>
<footer class="portal-foot">
  <p>WellFinder admin · browse tables, manage providers, and moderate submissions.</p>
</footer>
<script src="assets/portal.js"></script>
</body>
</html>
    <?php
}
