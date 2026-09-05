<?php
/* =============================================================
   CSV Import Tool for WellFinder Providers
   Allows bulk import of clinic data from CSV file
   ============================================================= */

declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/provider_store.php';

require_login();

$pageTitle = 'Import CSV';
$message = '';
$error = '';
$imported = 0;
$errors = [];

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    
    // Check if file was uploaded
    if (empty($_FILES['csvfile']) || $_FILES['csvfile']['error'] !== UPLOAD_ERR_OK) {
        $error = 'Please select a valid CSV file.';
    } else {
        $csvFile = $_FILES['csvfile']['tmp_name'];
        
        try {
            $imported = 0;
            $errors = [];
            $line = 0;
            
            // Open and read CSV file
            if (($handle = fopen($csvFile, 'r')) !== false) {
                // Skip header row
                $header = fgetcsv($handle);
                
                if (!$header) {
                    throw new Exception('CSV file appears to be empty.');
                }
                
                // Map header to column indices
                $headerMap = array_flip($header);
                
                // Process each row
                while (($row = fgetcsv($handle)) !== false) {
                    $line++;
                    
                    // Skip empty rows
                    if (empty(array_filter($row))) {
                        continue;
                    }
                    
                    // Map CSV row to associative array using header
                    $data = [];
                    foreach ($headerMap as $colName => $index) {
                        if (isset($row[$index])) {
                            $data[$colName] = $row[$index];
                        }
                    }
                    
                    // Collect and validate provider data
                    $provider = provider_collect($data);
                    $validationErrors = provider_validate($provider);
                    
                    if (!empty($validationErrors)) {
                        $errors[] = "Line " . ($line + 1) . ": " . implode(' | ', $validationErrors);
                        continue;
                    }
                    
                    try {
                        provider_insert($provider);
                        $imported++;
                    } catch (Throwable $e) {
                        $errors[] = "Line " . ($line + 1) . ": Database error - " . $e->getMessage();
                    }
                }
                
                fclose($handle);
                
                if ($imported > 0) {
                    $message = "Successfully imported $imported provider(s).";
                    if (!empty($errors)) {
                        $message .= " " . count($errors) . " row(s) had errors (see below).";
                    }
                }
            } else {
                throw new Exception('Could not open CSV file.');
            }
            
        } catch (Throwable $e) {
            $error = 'Error processing CSV: ' . $e->getMessage();
        }
    }
}
?>

<?php render_header($pageTitle); ?>

<div style="margin-bottom: 32px;">
    <h1><?= h($pageTitle) ?></h1>
    
    <?php if ($error): ?>
        <div style="background:#fee;border:1px solid #c88;padding:12px;border-radius:6px;margin-bottom:20px;">
            <strong>Error:</strong> <?= h($error) ?>
        </div>
    <?php endif; ?>
    
    <?php if ($message): ?>
        <div style="background:#efe;border:1px solid #8c8;padding:12px;border-radius:6px;margin-bottom:20px;">
            <strong>Success:</strong> <?= h($message) ?>
        </div>
    <?php endif; ?>
    
    <?php if (!empty($errors)): ?>
        <div style="background:#fdf5e6;border:1px solid #daa;padding:12px;border-radius:6px;margin-bottom:20px;">
            <strong>Import Errors (<?= count($errors) ?> rows):</strong>
            <ul style="margin:8px 0 0 20px;padding:0;">
                <?php foreach ($errors as $err): ?>
                    <li style="margin:4px 0;font-size:13px;"><?= h($err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
    
    <div style="background:#f5f5f5;padding:20px;border-radius:6px;margin-bottom:24px;">
        <h3 style="margin-top:0;margin-bottom:12px;">CSV Format</h3>
        <p style="margin:0 0 12px 0;font-size:14px;">Upload a CSV file with the following columns:</p>
        <div style="background:white;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;">
Name, Type, Status, City, Province, Website, Phone, Location, Billed, Modalities, DirectBilling, Price, Tags, Discipline, TPI, Region, BookingUrl, EmailContact, Note
        </div>
        
        <h4 style="margin:16px 0 8px 0;">Field Requirements:</h4>
        <ul style="margin:0;padding:0 0 0 20px;font-size:14px;">
            <li><strong>Name</strong> (required): Provider/clinic name</li>
            <li><strong>Type</strong> (required): One of: Pilates, Naturopath, Golf</li>
            <li><strong>Status</strong> (optional): One of: approved, pending, rejected. Defaults to "approved"</li>
            <li><strong>City</strong> (optional): City name</li>
            <li><strong>Province</strong> (optional): Province code (ON, BC, AB, etc.)</li>
            <li><strong>Website</strong> (optional): Full URL starting with http:// or https://</li>
            <li><strong>Phone</strong> (optional): Phone number</li>
            <li><strong>Location</strong> (optional): Specific address or location details</li>
            <li><strong>Billed</strong> (optional): How service is billed (Physiotherapy, Chiropractic, Naturopathy, etc.)</li>
            <li><strong>Modalities</strong> (optional): Services offered</li>
            <li><strong>DirectBilling</strong> (optional): Yes/No/Contact clinic</li>
            <li><strong>Price</strong> (optional): Price range or description</li>
            <li><strong>Tags</strong> (optional): Comma-separated tags (golf-tpi, clinical-pilates, microneedling, etc.)</li>
            <li><strong>Discipline</strong> (optional, golf only): Physiotherapy/Chiropractic</li>
            <li><strong>TPI</strong> (optional, golf only): TPI certification level</li>
            <li><strong>Region</strong> (optional, golf only): Geographic region</li>
            <li><strong>BookingUrl</strong> (optional, golf only): URL to booking page</li>
            <li><strong>EmailContact</strong> (optional): Contact email (must be valid format)</li>
            <li><strong>Note</strong> (optional): Additional notes about provider</li>
        </ul>
    </div>
    
    <form method="post" enctype="multipart/form-data" style="background:white;padding:20px;border:1px solid #ddd;border-radius:6px;">
        <?= csrf_field() ?>
        
        <div class="field">
            <label for="csvfile">Select CSV File</label>
            <input type="file" id="csvfile" name="csvfile" accept=".csv" required>
            <p class="hint">Maximum file size: 10MB. File must be in CSV format (comma-separated values).</p>
        </div>
        
        <div style="display:flex;gap:12px;margin-top:20px;">
            <button type="submit" class="btn" style="background:#2c5f8d;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:600;">Import CSV</button>
            <a href="providers.php" class="btn" style="background:#e0e0e0;color:#333;text-decoration:none;display:inline-block;padding:10px 20px;border-radius:4px;cursor:pointer;">Back to Providers</a>
        </div>
    </form>
    
    <div style="margin-top:32px;padding:16px;background:#f9f9f9;border-radius:6px;border-left:4px solid #2c5f8d;">
        <h4 style="margin-top:0;">Tips for successful import:</h4>
        <ul style="margin:8px 0;padding:0 0 0 20px;font-size:14px;">
            <li>Ensure the CSV header row matches the field names exactly</li>
            <li>Empty cells are fine - leave them blank</li>
            <li>Type, Status, and EmailContact (if included) will be validated</li>
            <li>Invalid rows will be reported with line numbers</li>
            <li>Providers will be added with the Status you specify (defaults to "approved")</li>
            <li>All field values are trimmed and length-limited per database schema</li>
        </ul>
    </div>
</div>

<?php render_footer(); ?>
