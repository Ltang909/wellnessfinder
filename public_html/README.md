# WellFinder

A curated directory of wellness treatments that Canadian extended-health benefits often
cover — physiotherapy, naturopathy, acupuncture, clinical Pilates, TPI golf assessments and
more — plus clinic listings and a plain-language benefits reader.

This is a **plain static site**: hand-written HTML, CSS and vanilla JavaScript. No build step,
no framework, no dependencies. It rebuilds the functionality of the original Lovable project
so it can be hosted anywhere (GitHub Pages, Netlify, Cloudflare Pages, any static host).

## File structure

```
wellfinder/
├── index.html          Home: hero, benefits reader, treatment directory, categories, resources
├── pilates.html        Pilates clinics directory (41 clinics)
├── naturopath.html     Naturopathic aesthetics clinics directory (61 clinics)
├── golf.html           TPI golf assessment directory (37 clinics)
├── about.html          The story behind WellFinder
├── css/
│   └── styles.css      All styles (one shared stylesheet)
├── js/
│   ├── data.js         All content: treatments + every clinic listing (edit here to update data)
│   ├── app.js          Shared behaviour: nav, favourites, benefits reader, home rendering
│   └── clinics.js      Filtering + rendering engine for the three clinic directories
├── assets/
│   ├── wellfinder-mark.svg   Logo
│   └── favicon.svg
└── README.md
```

## Run it locally

Because the pages load `.js` files, open them through a tiny local server rather than
double-clicking the file (some browsers block `file://` script loading):

```bash
cd wellfinder
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repository and upload the **contents** of this folder (so `index.html`
   sits at the repo root).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick your
   `main` branch and the `/ (root)` folder, then **Save**.
4. Your site goes live at `https://<username>.github.io/<repo>/` within a minute or two.

To use a custom domain, add it under Settings → Pages → Custom domain.

## Editing the content

All content lives in **`js/data.js`** — you don't need to touch the HTML to update listings:

- **Treatments** shown on the home page: the `TREATMENTS` array.
- **Clinics**: `PILATES_CLINICS`, `NATURO_CLINICS`, `GOLF_CLINICS`. Copy an existing entry,
  change the fields, and the directory count, filters and city dropdowns update automatically.
- **Insurance reader** keywords and the treatments each benefit "unlocks": the `COVERAGE_MAP`
  array.
- Newsletter signup and the benefits reader run entirely in the browser — there's no backend,
  so no data leaves the visitor's device.

## What changed from the original, and a few recommendations

- The **benefits reader** was rebuilt as a transparent client-side keyword parser. It detects
  paramedical categories, pulls out dollar amounts/percentages, and maps them to treatments.
  It's an estimate only. If you later want smarter parsing, this is the natural place to add a
  small hosted API.
- **Favourites** ("save your favourite treatments") now persist in the browser via
  `localStorage`, and the saved count shows in the header. This works on any static host.
- Clinic links open in a new tab; email addresses are `mailto:` links; locations link to a
  Google Maps search.
- Recommendations if you keep building: add real article pages for the Resources section
  (currently placeholders), consider a shared header/footer include if you add more pages, and
  add each clinic's exact street address to `data.js` so the map links land more precisely.

## Disclaimer

Wellness coverage varies by insurer, plan and provider. Listings are gathered from public
sources and personal notes — not guarantees of coverage. Always confirm with the clinic and
your insurer before booking.
