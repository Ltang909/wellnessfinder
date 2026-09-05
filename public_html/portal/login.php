<?php
require __DIR__ . '/lib.php';

if (is_logged_in()) {
    redirect('index.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pw = (string) ($_POST['password'] ?? '');
    if (check_password($pw)) {
        session_regenerate_id(true);
        $_SESSION['portal_auth'] = true;
        redirect('index.php');
    }
    usleep(600000); // slow down brute force a little
    $error = 'Incorrect password. Please try again.';
}

render_header('Sign in');
?>
<div class="login">
  <h1>Welcome back</h1>
  <p class="sub">Enter the portal password to review your WellFinder data.</p>
  <?php if ($error): ?><p class="login-error"><?= h($error) ?></p><?php endif; ?>
  <form method="post" action="login.php" autocomplete="off">
    <label for="password">Password</label>
    <input type="password" id="password" name="password" required autofocus>
    <button type="submit" class="btn-primary">Sign in</button>
  </form>
</div>
<?php
render_footer();
