<?php
/* Renders the provider form fields. Expects $p = associative array of
   current values (may be partial/empty). */
if (!isset($p) || !is_array($p)) { $p = []; }
$pv  = fn(string $k) => h((string) ($p[$k] ?? ''));
$sel = fn(string $a, ?string $b) => $a === (string) $b ? 'selected' : '';
$types    = ['Pilates', 'Naturopath', 'Golf'];
$statuses = ['approved', 'pending', 'rejected'];
?>
<div class="row">
  <div class="field">
    <label for="Type">Type *</label>
    <select id="Type" name="Type" required>
      <?php foreach ($types as $t): ?><option <?= $sel($t, $p['Type'] ?? '') ?>><?= h($t) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field">
    <label for="Status">Status</label>
    <select id="Status" name="Status">
      <?php foreach ($statuses as $s): ?><option <?= $sel($s, $p['Status'] ?? 'approved') ?>><?= h($s) ?></option><?php endforeach; ?>
    </select>
  </div>
</div>

<div class="field"><label for="Name">Name *</label><input id="Name" name="Name" required maxlength="250" value="<?= $pv('Name') ?>"></div>

<div class="row">
  <div class="field"><label for="City">City</label><input id="City" name="City" maxlength="120" value="<?= $pv('City') ?>"></div>
  <div class="field"><label for="Province">Province</label><input id="Province" name="Province" maxlength="10" placeholder="ON / BC / AB" value="<?= $pv('Province') ?>"></div>
</div>

<div class="field"><label for="Location">Location</label><input id="Location" name="Location" maxlength="300" value="<?= $pv('Location') ?>"></div>

<div class="row">
  <div class="field"><label for="Website">Website</label><input id="Website" name="Website" maxlength="250" value="<?= $pv('Website') ?>"></div>
  <div class="field"><label for="Billed">Billed as</label><input id="Billed" name="Billed" maxlength="250" placeholder="Physiotherapy, Chiropractic…" value="<?= $pv('Billed') ?>"></div>
</div>

<div class="row">
  <div class="field"><label for="Modalities">Modalities</label><input id="Modalities" name="Modalities" maxlength="300" value="<?= $pv('Modalities') ?>"></div>
  <div class="field"><label for="Price">Price</label><input id="Price" name="Price" maxlength="120" value="<?= $pv('Price') ?>"></div>
</div>

<div class="row">
  <div class="field"><label for="DirectBilling">Direct billing</label><input id="DirectBilling" name="DirectBilling" maxlength="120" placeholder="Yes / No / Confirm w/ clinic" value="<?= $pv('DirectBilling') ?>"></div>
  <div class="field"><label for="Tags">Tags <span style="text-transform:none;font-weight:400">(naturopath)</span></label><input id="Tags" name="Tags" maxlength="300" placeholder="microneedling, iv-therapy…" value="<?= $pv('Tags') ?>"><p class="hint">Comma-separated modality tags used by the site filters.</p></div>
</div>

<div class="row">
  <div class="field"><label for="Discipline">Discipline <span style="text-transform:none;font-weight:400">(golf)</span></label><input id="Discipline" name="Discipline" maxlength="120" placeholder="Physio / Chiro" value="<?= $pv('Discipline') ?>"></div>
  <div class="field"><label for="TPI">TPI level <span style="text-transform:none;font-weight:400">(golf)</span></label><input id="TPI" name="TPI" maxlength="120" placeholder="e.g. TPI Level 2" value="<?= $pv('TPI') ?>"></div>
</div>

<div class="row">
  <div class="field"><label for="Region">Region <span style="text-transform:none;font-weight:400">(golf)</span></label><input id="Region" name="Region" maxlength="60" placeholder="York, Peel, Toronto…" value="<?= $pv('Region') ?>"></div>
  <div class="field"><label for="BookingUrl">Booking URL <span style="text-transform:none;font-weight:400">(golf)</span></label><input id="BookingUrl" name="BookingUrl" maxlength="250" value="<?= $pv('BookingUrl') ?>"></div>
</div>

<div class="field"><label for="EmailContact">Email contact</label><input id="EmailContact" name="EmailContact" maxlength="250" value="<?= $pv('EmailContact') ?>"></div>

<div class="field"><label for="Note">Note</label><textarea id="Note" name="Note" rows="2" maxlength="500"><?= $pv('Note') ?></textarea></div>

<?php if (!empty($p['Submitter'])): ?>
<div class="field">
  <label>Submitted by</label>
  <input value="<?= $pv('Submitter') ?>" disabled>
  <input type="hidden" name="Submitter" value="<?= $pv('Submitter') ?>">
</div>
<?php endif; ?>
