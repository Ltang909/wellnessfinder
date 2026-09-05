# WellFinder — dynamic system deploy guide

This turns WellFinder into a live, database-backed directory:

- The **site** reads providers from a JSON API instead of hard-coded data.
- Visitors can **search** providers and **submit** new ones.
- The **portal** lets you add providers and approve/reject submissions, which
  publish to the site instantly.

Everything runs on your Hostinger hosting (PHP + MySQL). It will **not** work on
GitHub Pages, because Pages can't run PHP.

```
public_html/                 ← upload the CONTENTS of this folder to Hostinger
├── index.html, pilates.html, naturopath.html, golf.html, about.html
├── submit.html              ← public "suggest a provider" form
│                              (served at clean URLs — see below — via .htaccess)
├── css/  js/  assets/
├── api/                     ← providers.php (read) + submit.php (write)
└── portal/                  ← admin (add providers, moderate submissions)
database/
└── wellfinder_providers.sql ← the table + all 139 existing providers
```

## Step 1 — Import the database (once)

1. Open **phpMyAdmin** for `u718027464_WFproviders` (hPanel → Databases).
2. Go to the **Import** tab and import `database/wellfinder_providers.sql`.

This creates the unified `providers` table and backfills it with the 139
providers currently on the site (41 Pilates, 61 Naturopath, 37 Golf), all marked
`approved`.

> ⚠️ The script **drops and recreates** the `providers` table. If your current
> `providers` table already holds data you want to keep, rename it first in
> phpMyAdmin (Operations → rename to `providers_old`), then import.

## Step 2 — Upload the files

Upload everything **inside** `public_html/` to your Hostinger `public_html/`
(hPanel → File Manager, or FTP). You should end up with `pilates.html`,
`/api/`, and `/portal/` all under `public_html/`.

Credentials are already filled in for your database in two files:
`api/config.php` and `portal/config.php`.

## Step 3 — Set the portal password

Open `portal/config.php` and replace `CHANGE_ME_choose_a_strong_password` with a
strong password. That's your admin login at `https://your-domain.com/portal/`.

## Step 4 — Check it

- Visit `https://your-domain.com/pilates` — the list now loads from the
  database, and the **Search providers** box filters as you type.
- Visit `https://your-domain.com/submit`, submit a test clinic.
- Log into `/portal/`, open **Submissions** — your test appears. **Approve** it,
  then reload the directory page to see it live. (Use the portal to delete the
  test afterward.)

## Clean URLs (no `.html`)

`public_html/.htaccess` strips `.html` from every public page:
`pilates.html` is now reachable (and linked internally) as `/pilates`, and
`index.html` as `/`. Requesting the old `.html` address still works — it
301-redirects to the clean one, so old bookmarks and any search-engine links
keep working. This only affects the six public pages
(`index`/`pilates`/`naturopath`/`golf`/`about`/`submit`); `/api/` and
`/portal/` are untouched and keep their own `.php` URLs and `.htaccess` rules.

## How the workflow fits together

- **You add a provider:** Portal → *Add provider* → it saves as `approved` and
  shows on the site immediately.
- **A visitor suggests one:** `submit.html` → saved as `pending` (hidden from the
  site) → appears in Portal → *Submissions* → **Approve** publishes it, **Reject**
  keeps the record but hides it, **Delete** removes it.
- **Editing:** any provider can be edited in the portal; *Edit* on a submission
  lets you tidy details before approving.

## Security checklist

- **Rotate the database password.** It was shared in chat — change it in hPanel
  and update `db_pass` in **both** `api/config.php` and `portal/config.php`.
- **Set a strong portal password** (Step 3).
- **Use HTTPS** (free SSL in hPanel) so logins and submissions are encrypted.
- Config files are protected from direct web access by `.htaccess` and excluded
  from Git by `.gitignore`. Don't commit `api/config.php` or `portal/config.php`
  to a public repo.
- The public submit form has a honeypot and server-side validation. If you ever
  get spam, the portal's Reject/Delete handles it, and you can add a captcha later.

## Notes

- The site still includes `js/data.js`. Its clinic arrays are now only a
  fallback for opening the pages without the API (e.g. locally); the live site
  uses the database. Filter chips and region lists still come from there.
- To add a brand-new directory type later, add rows with a new `Type` and extend
  the front-end — the schema already supports it.
