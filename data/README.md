# WellFinder clinic database (JSON export)

The site's verified clinic data. Master copy lives in Notion
("WellFinder Clinics" + "WellFinder Clinic Treatments"); these files
are the export the website reads. Both are updated together, batch by
batch, as the enrichment scan verifies clinics.

- `clinics.json` — one record per clinic: address, phone, website,
  booking page, opening hours per day, Google rating + review count
  (only from Google Places or the clinic's own Google badge/widget),
  verification status and date.
- `clinic-treatments.json` — one record per clinic x treatment:
  billed-as pathway, practitioner, price verified on the clinic's own
  booking page, price source, and the treatment deep link that
  "View clinic" opens.

Rules: never publish a price, rating or hour that is not sourced in
the record; unverifiable fields stay null with the reason in `gaps`.
Only records with status "verified" ship to production displays;
"draft" records are scanned and awaiting a human spot-check.
