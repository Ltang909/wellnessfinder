# WellFinder Data Portal

A small, login-protected web app for **browsing** your Hostinger MySQL data — list
tables, search / sort / paginate rows, and export any view to CSV. It's read-only by
design: a friendly window onto your data, while edits still happen in phpMyAdmin.

It's already configured for your `u718027464_WFproviders` database. You only need to
set a login password and upload it.

## Important: this is PHP, not a static site

Unlike the WellFinder website, this portal runs **server-side PHP**, so it must live on
your Hostinger hosting (which runs PHP + MySQL). **GitHub Pages can't run it.** Upload it
with hPanel's File Manager or FTP.

## Setup (about 5 minutes)

1. **Choose a login password.** Open `config.php` and replace
   `CHANGE_ME_choose_a_strong_password` with a strong, unique password. This is the only
   thing guarding the portal, so make it good.
2. **Upload the folder** to your hosting. In hPanel → File Manager, put it inside your web
   root, e.g. `public_html/portal/`. (Uploading the zip and extracting it in place is
   easiest.)
3. **Visit it** at `https://your-domain.com/portal/` and log in.

That's it. The portal auto-discovers every table in the database — no per-table setup.

## Using it

- **Tables dashboard** — every table with its row and column counts; filter box up top.
- **Table view** — click a table to browse it: search across all columns, click any column
  header to sort, page through results, and change page size (25 / 50 / 100).
- **Export CSV** — downloads the current view (respecting your search/sort) as a CSV that
  opens cleanly in Excel or Google Sheets.
- **Long cells** — click a truncated cell to expand it.
- **Multiple databases** — add more names to the `databases` array in `config.php` and a
  switcher appears in the top bar (the DB user must have access to them).

## Security notes

- **Rotate the database password.** It was shared in chat, so change it in hPanel
  (Databases → your database → change password) and update `db_pass` in `config.php`.
- **Use HTTPS.** Make sure you open the portal via `https://` so the login password isn't
  sent in the clear. Hostinger provides free SSL in hPanel.
- **Keep `config.php` private.** The included `.htaccess` blocks it from being fetched over
  the web, and `.gitignore` keeps it out of Git. If you ever push this portal to a public
  repo, commit `config.sample.php` — never `config.php`.
- **Consider a read-only DB user.** For extra safety you can create a MySQL user with only
  `SELECT` permission and use that in the config; the portal never writes anyway.

## Troubleshooting

- **"Could not connect to the database"** — double-check `db_user` / `db_pass` in
  `config.php`. If they're right, your DB host may not be `localhost`; check hPanel →
  Databases for the exact hostname and set `db_host` to that.
- **Password looks wrong but is right** — passwords with a `$` are fine here because the
  config stores them in single quotes (no PHP interpolation).

## Files

```
config.php          Your settings (credentials + login password)  ← git-ignored
config.sample.php   Placeholder template safe to commit
lib.php             Connection, auth, safety helpers, page layout
login.php / logout.php
index.php           Tables dashboard
table.php           Table browser (search / sort / paginate)
export.php          CSV export
assets/portal.css   Styles (matches WellFinder)
assets/portal.js    Small interactions
.htaccess           Blocks config/lib from web access, disables listings
```

## A natural next step

Your `providers` table lines up closely with the WellFinder clinic directories
(Type, Name, Website, Billed, Location, Price, EmailContact, Modalities). Once you're happy
with the data here, the same PHP + MySQL setup can power the live directory pages — serving
clinics straight from this table instead of the hard-coded `data.js`, so updates in the
database show up on the site automatically. Happy to build that when you're ready.

---

Read-only by design. Coverage and clinic details should always be confirmed with the
provider before booking.
