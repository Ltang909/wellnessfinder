<?php
declare(strict_types=1);
/* =============================================================
   WellFinder Data Portal — provider photo uploads
   Validates, auto-rotates, resizes to a max dimension, and saves
   uploaded photos as JPEGs under /uploads/providers/. Every image
   is re-encoded (never stored as-is), which also strips EXIF/GPS
   metadata from the file. Requires the GD extension (standard on
   Hostinger PHP).
   ============================================================= */

const IMAGE_MAX_BYTES     = 5 * 1024 * 1024; // 5 MB upload cap
const IMAGE_MAX_DIMENSION = 1600;            // longest side, in pixels
const IMAGE_JPEG_QUALITY  = 82;

/* Absolute path on disk to public_html/uploads/providers. */
function image_upload_dir(): string {
    return dirname(__DIR__) . '/uploads/providers';
}

/* Path stored in the DB and used to build URLs — root-relative, no leading slash. */
function image_public_path(string $filename): string {
    return 'uploads/providers/' . $filename;
}

/* Delete the file behind a stored image path, if any. Safe to call on null/missing files. */
function delete_provider_image(?string $path): void {
    if (!$path) {
        return;
    }
    $abs = dirname(__DIR__) . '/' . ltrim($path, '/');
    if (is_file($abs)) {
        @unlink($abs);
    }
}

/* Correct the common phone-camera EXIF rotations (the mirrored variants are rare
   enough on provider photos that we don't bother handling them here). */
function image_fix_orientation($src, int $orientation) {
    switch ($orientation) {
        case 3: $r = imagerotate($src, 180, 0); break;
        case 6: $r = imagerotate($src, -90, 0); break;
        case 8: $r = imagerotate($src, 90, 0); break;
        default: return $src;
    }
    if ($r === false) {
        return $src;
    }
    imagedestroy($src);
    return $r;
}

/**
 * Work out the new Image value for a provider, given:
 *   $file    - the raw $_FILES['Image'] entry (or null if the field wasn't submitted)
 *   $remove  - true if the "remove current photo" checkbox was ticked
 *   $current - the provider's existing Image path, or null
 *
 * Returns the path to store in the DB (or null), and never throws for the
 * "no change" case — only for a submitted file that can't be processed.
 */
function provider_process_image(?array $file, bool $remove, ?string $current): ?string {
    $noFileSubmitted = !$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE;

    if ($remove && $noFileSubmitted) {
        delete_provider_image($current);
        return null;
    }
    if ($noFileSubmitted) {
        return $current; // nothing uploaded this time — leave the existing photo alone
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Photo upload failed (code ' . $file['error'] . '). Try a smaller file.');
    }
    if ($file['size'] > IMAGE_MAX_BYTES) {
        throw new RuntimeException('That photo is too large — please use a file under 5 MB.');
    }

    $info = @getimagesize($file['tmp_name']);
    if ($info === false) {
        throw new RuntimeException('That file does not look like a valid image.');
    }
    [$w, $h, $type] = $info;

    $src = match ($type) {
        IMAGETYPE_JPEG => @imagecreatefromjpeg($file['tmp_name']),
        IMAGETYPE_PNG  => @imagecreatefrompng($file['tmp_name']),
        IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($file['tmp_name']) : false,
        default        => false,
    };
    if (!$src) {
        throw new RuntimeException('Please upload a JPG, PNG or WEBP photo.');
    }

    if ($type === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
        $exif = @exif_read_data($file['tmp_name']);
        $o = (int) ($exif['Orientation'] ?? 0);
        if (in_array($o, [3, 6, 8], true)) {
            $src = image_fix_orientation($src, $o);
        }
    }

    $w = imagesx($src);
    $h = imagesy($src);
    $scale = min(1.0, IMAGE_MAX_DIMENSION / max($w, $h));
    $nw = max(1, (int) round($w * $scale));
    $nh = max(1, (int) round($h * $scale));

    $dst = imagecreatetruecolor($nw, $nh);
    imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255)); // flatten transparency to white
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
    imagedestroy($src);

    $dir = image_upload_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        imagedestroy($dst);
        throw new RuntimeException('Could not create the uploads folder on the server. Check folder permissions.');
    }

    $filename = bin2hex(random_bytes(8)) . '.jpg';
    $ok = imagejpeg($dst, $dir . '/' . $filename, IMAGE_JPEG_QUALITY);
    imagedestroy($dst);
    if (!$ok) {
        throw new RuntimeException('Could not save the photo on the server.');
    }

    delete_provider_image($current); // clean up the old file now that the new one is saved
    return image_public_path($filename);
}
