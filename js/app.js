/* ============================================================
   WellFinder — shared behaviour
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  window.mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  /* ---------- favourites (localStorage) ---------- */
  const FAV_KEY = "wf_favourites";
  const getFavs = () => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch { return []; }
  };
  const setFavs = (a) => { try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch {} };
  window.wfFavs = { get: getFavs, has: (n) => getFavs().includes(n),
    toggle(n) {
      const f = getFavs(); const i = f.indexOf(n);
      if (i > -1) f.splice(i, 1); else f.push(n);
      setFavs(f); updateFavCount(); return i === -1;
    } };
  function updateFavCount() {
    const el = $("#favCount"); if (!el) return;
    const n = getFavs().length;
    el.textContent = n ? `${n} saved` : "";
    el.style.display = n ? "inline" : "none";
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    const toggle = $(".nav-toggle");
    const menu = $("#mobileMenu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- share ---------- */
  function initShare() {
    $$("[data-share]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = window.location.href;
        const title = document.title;
        if (navigator.share) {
          try { await navigator.share({ title, url }); return; } catch {}
        }
        try {
          await navigator.clipboard.writeText(url);
          const old = btn.textContent;
          btn.textContent = "Link copied ✓";
          setTimeout(() => (btn.textContent = old), 1800);
        } catch {
          prompt("Copy this link:", url);
        }
      });
    });
  }

  /* ---------- newsletter ---------- */
  function initNewsletter() {
    const form = $("#newsletterForm"); if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", form);
      const msg = $(".form-msg", form);
      const val = (input.value || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
        msg.textContent = "Enter a valid email to subscribe.";
        msg.style.color = "var(--honey-deep)";
        return;
      }
      msg.textContent = "You're on the list — thanks for subscribing!";
      msg.style.color = "var(--forest)";
      input.value = "";
    });
  }

  /* ============================================================
     HOME PAGE RENDERING
     ============================================================ */
  function renderInsurers() {
    const row = $("#insurersRow"); if (!row || typeof INSURERS === "undefined") return;
    const items = INSURERS.map((i) =>
      `<span class="insurer-logo"><img src="${esc(i.logo)}" alt="${esc(i.name)}"></span>`
    ).join("");
    // duplicate the track so the scroll loops seamlessly
    row.innerHTML = `<div class="insurer-track">${items}${items}</div>`;
  }

  function renderWhy() {
    const grid = $("#whyGrid"); if (!grid) return;
    const claims = [
      { name: "Chi", treatment: "Clinical Pilates", billed: "Physiotherapy", covered: "100% covered", price: "$100 per 45 min session" },
      { name: "Leon", treatment: "Facial massage", billed: "Osteopathy", covered: "100% covered", price: "$120 per session" },
      { name: "Celine", treatment: "IM vitamin therapy", billed: "Naturopath", covered: "100% covered", price: "$50-80 per session" },
      { name: "Chun Ho", treatment: "Neurofeedback", billed: "Psychology", covered: "100% covered", price: "$180 per session" },
      { name: "Daniel", treatment: "Singing voice therapy", billed: "Speech therapy", covered: "100% covered", price: "$160 per 45 min session" },
    ];
    const card = (c) =>
      `<div class="claim-card">
         <div class="claim-top"><span class="claim-name">${esc(c.name)}</span>${c.covered ? `<span class="claim-covered">${esc(c.covered)}</span>` : ""}</div>
         <p class="claim-what">${esc(c.treatment)}</p>
         <p class="claim-billed">Billed as ${esc(c.billed)}</p>
         ${c.price ? `<p class="claim-price">${esc(c.price)}</p>` : ""}
         <p class="claim-insurer"><img src="assets/logos/manulife.svg" alt="Manulife logo"><span>Claimed through Manulife</span></p>
       </div>`;
    const half = claims.map(card).join("");
    grid.innerHTML = `<div class="why-track">${half}${half}</div>`;
  }

  const HEART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.9Z"/></svg>`;

  function treatmentCardHTML(t) {
    const saved = getFavs().includes(t.name);
    const cats = t.categories.join(",");
    const img = (typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[t.name]) || null;
    const art = img ? img.src : ((typeof TREATMENT_ART !== "undefined" && TREATMENT_ART[t.group]) || "");
    const credit = img ? `<div class="tc-credit">Photo: <a href="${esc(img.url)}" target="_blank" rel="noopener">${esc(img.credit)}</a></div>` : "";
    const findBtn = `<a class="btn btn--primary btn--sm" href="/clinics-${treatmentSlug(t.name)}">Find clinics →</a>`;
    return `
      <article class="treatment-card" data-cats="${esc(cats)}" data-name="${esc(t.name)}">
        ${art ? `<div class="tc-art" aria-hidden="true"><img src="${esc(art)}" alt="" loading="lazy"></div>${credit}` : ""}
        <button class="fav-btn ${saved ? "saved" : ""}" data-fav="${esc(t.name)}"
          aria-label="Save ${esc(t.name)}" aria-pressed="${saved}">${HEART}</button>
        <span class="tc-billed">Billed as ${esc(t.billed)}</span>
        <h4>${esc(t.name)}</h4>
        <p>${esc(t.desc)}</p>
        <button class="tc-more" aria-expanded="false">More details →</button>
        <div class="tc-detail"><p>${esc(t.detail)}</p></div>
        <div class="tc-foot">${findBtn}</div>
      </article>`;
  }

  /* Directory filter state: billing tab + goal pill combine. */
  const dirState = { tab: "All", goal: null };

  function applyDirectoryFilter() {
    const wrap = $("#directoryGroups"); if (!wrap || typeof TREATMENTS === "undefined") return;
    const goalCats = (dirState.goal && typeof GOAL_MAP !== "undefined") ? GOAL_MAP[dirState.goal] : null;
    let visible = 0;
    $$(".dir-group", wrap).forEach((group) => {
      let gVisible = 0;
      $$(".treatment-card", group).forEach((card) => {
        const cats = card.dataset.cats.split(",");
        const tabOk = dirState.tab === "All" || cats.includes(dirState.tab);
        const goalOk = !goalCats || cats.some((c) => goalCats.includes(c));
        const show = tabOk && goalOk;
        card.classList.toggle("hidden", !show);
        if (show) { visible++; gVisible++; }
      });
      group.classList.toggle("hidden", gVisible === 0);
    });
    const total = TREATMENTS.length;
    const bits = [];
    if (dirState.tab !== "All") bits.push(dirState.tab);
    if (dirState.goal) bits.push(dirState.goal);
    const dc = $("#dirCount");
    if (dc) dc.textContent = bits.length
      ? `Showing ${visible} of ${total} · ${bits.join(" + ")}`
      : `${total} treatments logged`;
  }

  /* Public hook used by the "Popular categories" goal pills. */
  window.wfDirectory = {
    setGoal(goal) {
      dirState.goal = (dirState.goal === goal) ? null : goal;
      $$(".cat-item").forEach((p) => p.classList.toggle("active", p.dataset.goal === dirState.goal));
      applyDirectoryFilter();
      return dirState.goal;
    },
    clearFilters() {
      dirState.tab = "All"; dirState.goal = null;
      const tabsEl = $("#filterTabs");
      if (tabsEl) $$(".filter-tab", tabsEl).forEach((t, i) => t.classList.toggle("active", i === 0));
      $$(".cat-item").forEach((p) => p.classList.remove("active"));
      applyDirectoryFilter();
    },
  };

  function renderDirectory() {
    const wrap = $("#directoryGroups"); if (!wrap || typeof TREATMENTS === "undefined") return;
    // tabs
    const tabsEl = $("#filterTabs");
    tabsEl.innerHTML = TREATMENT_TABS.map((t, i) =>
      `<button class="filter-tab ${i === 0 ? "active" : ""}" data-tab="${esc(t)}">${esc(t)}</button>`
    ).join("");
    // groups
    wrap.innerHTML = TREATMENT_GROUPS.map((g) => {
      const cards = TREATMENTS.filter((t) => t.group === g).map(treatmentCardHTML).join("");
      return `<div class="dir-group" data-group="${esc(g)}">
                <h3>${esc(g)}</h3>
                <div class="card-grid">${cards}</div>
              </div>`;
    }).join("");
    $("#dirCount").textContent = `${TREATMENTS.length} treatments logged`;

    // interactions
    wrap.addEventListener("click", (e) => {
      const more = e.target.closest(".tc-more");
      if (more) {
        const detail = more.nextElementSibling;
        const open = detail.classList.toggle("open");
        more.setAttribute("aria-expanded", open ? "true" : "false");
        more.textContent = open ? "Less details ↑" : "More details →";
      }
    });

    // tab filtering
    tabsEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".filter-tab"); if (!tab) return;
      $$(".filter-tab", tabsEl).forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      dirState.tab = tab.dataset.tab;
      applyDirectoryFilter();
    });
    applyDirectoryFilter();
  }

  function renderCategories() {
    const grid = $("#catGrid"); if (!grid || typeof GOAL_CATEGORIES === "undefined") return;
    grid.innerHTML = GOAL_CATEGORIES.map((c) =>
      `<button type="button" class="cat-item" data-goal="${esc(c.label)}" aria-pressed="false"><span class="cat-emoji" aria-hidden="true">${c.emoji}</span><span>${esc(c.label)}</span></button>`
    ).join("");
    grid.addEventListener("click", (e) => {
      const pill = e.target.closest(".cat-item"); if (!pill) return;
      const active = window.wfDirectory.setGoal(pill.dataset.goal);
      $$(".cat-item", grid).forEach((p) =>
        p.setAttribute("aria-pressed", p.dataset.goal === active ? "true" : "false"));
      const dir = document.getElementById("directory");
      if (dir) dir.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderExploring() {
    const grid = $("#exploreGrid"); if (!grid || typeof EXPLORING === "undefined") return;
    grid.innerHTML = EXPLORING.map((x) =>
      `<article class="explore-card">
         <span class="ex-tag">${esc(x.tag)}</span>
         <h4>${esc(x.name)}</h4>
         <p>${esc(x.desc)}</p>
         <span class="ex-status">Checking coverage</span>
       </article>`
    ).join("");
  }

  function renderResources() {
    const grid = $("#resourceGrid"); if (!grid || typeof RESOURCES === "undefined") return;
    grid.outerHTML = `<ul class="resource-list">` + RESOURCES.map((r) => {
      const title = r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : esc(r.title);
      return `<li>${title}</li>`;
    }).join("") + `</ul>`;
  }

  /* Shared: GTA clinic sources per treatment. Used by the homepage
     GTA directory and by the per-treatment minipages. */
  function gtaDataFor(name) {
    if (typeof TREATMENTS === "undefined") return null;
    const inDirectory = () => true; // directory is Canada-wide; every entry is Canadian
    const pilates = (typeof PILATES_CLINICS !== "undefined" ? PILATES_CLINICS : []).filter(inDirectory);
    const golf = (typeof GOLF_CLINICS !== "undefined" ? GOLF_CLINICS : []);
    const naturo = (typeof NATURO_CLINICS !== "undefined" ? NATURO_CLINICS : []).filter(inDirectory);
    const byTag = (tag) => naturo.filter((c) => c.tags && c.tags.includes(tag));
    const map = {
      "Clinical Pilates": { clinics: pilates },
      "Golf Swing Assessment": { clinics: golf },
      "Cosmetic Acupuncture": { clinics: byTag("cosmetic-acupuncture") },
      "Microneedling": { clinics: byTag("microneedling") },
      "IM Vitamin Therapy": { clinics: byTag("vitamin-injections") },
      "IV Vitamin Therapy": { clinics: byTag("iv-therapy") },
      "Facial Manual Therapy": { clinics: (typeof FACIAL_CLINICS !== "undefined" ? FACIAL_CLINICS : []).filter(inDirectory) },
      "Interview Preparation": { clinics: (typeof INTERVIEW_CLINICS !== "undefined" ? INTERVIEW_CLINICS : []).filter(inDirectory) },
      "Singing Voice Therapy": { clinics: (typeof VOICE_CLINICS !== "undefined" ? VOICE_CLINICS : []).filter(inDirectory) },
      "Neurofeedback": { clinics: (typeof NEUROFEEDBACK_CLINICS !== "undefined" ? NEUROFEEDBACK_CLINICS : []).filter(inDirectory) },
      "Red Light Therapy": { clinics: (typeof REDLIGHT_CLINICS !== "undefined" ? REDLIGHT_CLINICS : []).filter(inDirectory) },
      "Cryotherapy": { clinics: (typeof CRYO_CLINICS !== "undefined" ? CRYO_CLINICS : []).filter(inDirectory) },
      "Shockwave Therapy": { clinics: (typeof SHOCKWAVE_CLINICS !== "undefined" ? SHOCKWAVE_CLINICS : []).filter(inDirectory) },
      "Head Spa": { clinics: (typeof HEADSPA_CLINICS !== "undefined" ? HEADSPA_CLINICS : []).filter(inDirectory) },
      "TMJ Massage": { clinics: (typeof TMJMASSAGE_CLINICS !== "undefined" ? TMJMASSAGE_CLINICS : []).filter(inDirectory) },
      "Lymphatic Drainage": { clinics: (typeof LYMPH_CLINICS !== "undefined" ? LYMPH_CLINICS : []).filter(inDirectory) },
      "Pelvic Floor Physiotherapy": { clinics: (typeof PELVIC_CLINICS !== "undefined" ? PELVIC_CLINICS : []).filter(inDirectory) },
      "Bike Fitting": { clinics: (typeof BIKEFIT_CLINICS !== "undefined" ? BIKEFIT_CLINICS : []).filter(inDirectory) },
      "Running Gait Analysis": { clinics: (typeof GAIT_CLINICS !== "undefined" ? GAIT_CLINICS : []).filter(inDirectory) },
      "Sleep Coaching": { clinics: (typeof SLEEP_CLINICS !== "undefined" ? SLEEP_CLINICS : []).filter(inDirectory) },
      "Couples Therapy": { clinics: (typeof COUPLES_CLINICS !== "undefined" ? COUPLES_CLINICS : []).filter(inDirectory) },
      "Mental Performance Coaching": { clinics: (typeof MENTALPERF_CLINICS !== "undefined" ? MENTALPERF_CLINICS : []).filter(inDirectory) },
      "Accent Modification": { clinics: (typeof ACCENT_CLINICS !== "undefined" ? ACCENT_CLINICS : []).filter(inDirectory) },
      "Myofunctional Therapy": { clinics: (typeof MYOFUNC_CLINICS !== "undefined" ? MYOFUNC_CLINICS : []).filter(inDirectory) },
      "Facial Gua Sha": { clinics: (typeof GUASHA_CLINICS !== "undefined" ? GUASHA_CLINICS : []).filter(inDirectory) },
      "Medical Botox": { clinics: (typeof BOTOX_CLINICS !== "undefined" ? BOTOX_CLINICS : []).filter(inDirectory) },
      "Sports Nutrition": { clinics: (typeof NUTRITION_CLINICS !== "undefined" ? NUTRITION_CLINICS : []).filter(inDirectory) },
      "Fertility Acupuncture": { clinics: (typeof FERTACU_CLINICS !== "undefined" ? FERTACU_CLINICS : []) },
      "Fertility Consultation": { clinics: (typeof FERTNAT_CLINICS !== "undefined" ? FERTNAT_CLINICS : []) },
    };
    const entry = map[name] || { clinics: [] };
    const t = TREATMENTS.find((x) => x.name === name) || {};
    return {
      name: entry.display || name,
      billed: entry.billed || t.billed || "",
      desc: t.desc || "",
      detail: t.detail || "",
      image: (typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[name]) || null,
      clinics: entry.clinics,
    };
  }

  function treatmentSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* ---------- geo: approximate distance for "near you" ---------- */
  const CITY_COORDS = {
    "Toronto": [43.6532, -79.3832], "North York": [43.7615, -79.4111],
    "Scarborough": [43.7731, -79.2578], "Etobicoke": [43.6205, -79.5132],
    "East York": [43.6905, -79.3279], "Mississauga": [43.5890, -79.6441],
    "Brampton": [43.7315, -79.7624], "Vaughan": [43.8563, -79.5085],
    "Markham": [43.8561, -79.3370], "Richmond Hill": [43.8828, -79.4403],
    "Newmarket": [44.0592, -79.4608], "Aurora": [44.0069, -79.4504],
    "Oakville": [43.4675, -79.6877], "Burlington": [43.3255, -79.7990],
    "Milton": [43.5183, -79.8774], "Thornhill": [43.8125, -79.4168],
    "Woodbridge": [43.7897, -79.5544], "Maple": [43.8563, -79.5085],
    "Stouffville": [43.9700, -79.2470], "Whitby": [43.8975, -78.9429],
    "Pickering": [43.8354, -79.0898], "Ancaster": [43.2175, -79.9791],
    "Kitchener": [43.4516, -80.4925],
    "Waterloo": [43.4643, -80.5204], "Guelph": [43.5448, -80.2482],
    "Hamilton": [43.2557, -79.8711], "London": [42.9849, -81.2453],
    "Windsor": [42.3149, -83.0364], "Kingston": [44.2312, -76.4860],
    "Barrie": [44.3894, -79.6903], "Ottawa": [45.4215, -75.6972],
    "Gatineau": [45.4765, -75.7013],
    "Vancouver": [49.2827, -123.1207], "Victoria": [48.4284, -123.3656],
    "Kelowna": [49.8880, -119.4960], "Surrey": [49.1913, -122.8490],
    "Burnaby": [49.2488, -122.9805], "Richmond": [49.1666, -123.1336],
    "Calgary": [51.0447, -114.0719], "Edmonton": [53.5461, -113.4938],
    "Red Deer": [52.2681, -113.8112],
    "Saskatoon": [52.1579, -106.6702], "Regina": [50.4452, -104.6189],
    "Winnipeg": [49.8951, -97.1384],
    "Montreal": [45.5017, -73.5673], "Quebec City": [46.8139, -71.2080],
    "Laval": [45.6066, -73.7124],
    "Halifax": [44.6488, -63.5752], "Moncton": [46.0878, -64.7782],
    "Fredericton": [45.9636, -66.6431], "Charlottetown": [46.2382, -63.1311],
    "St. John's": [47.5615, -52.7126],
    "Whitehorse": [60.7217, -135.0538], "Yellowknife": [62.4540, -114.3718]
  };
  const POSTAL_REGION = {
    A: [47.5615, -52.7126], B: [44.6488, -63.5752], C: [46.2382, -63.1311],
    E: [45.9636, -66.6431], G: [46.8139, -71.2080], H: [45.5017, -73.5673],
    J: [45.4765, -75.7013], K: [45.4215, -75.6972], L: [43.85, -79.52],
    M: [43.6532, -79.3832], N: [42.9849, -81.2453], P: [46.4917, -80.9930],
    R: [49.8951, -97.1384], S: [52.1579, -106.6702], T: [51.0447, -114.0719],
    V: [49.2827, -123.1207], X: [62.4540, -114.3718], Y: [60.7217, -135.0538]
  };
  function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function getUserCoords(postal) {
    const fsa = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    return fetch("https://api.zippopotam.us/ca/" + fsa)
      .then((r) => { if (!r.ok) throw new Error("geo"); return r.json(); })
      .then((j) => [parseFloat(j.places[0].latitude), parseFloat(j.places[0].longitude)])
      .catch(() => POSTAL_REGION[fsa[0]] || CITY_COORDS["Toronto"]);
  }
  window.wfGeo = { CITY_COORDS, POSTAL_REGION, haversineKm, getUserCoords };

  /* Every clinic in the database, tagged with its treatment. */
  function allClinicsWithTreatment() {
    const out = [];
    const push = (list, treatment, tag) => {
      (list || []).forEach((c) => {
        if (tag && (!c.tags || c.tags.indexOf(tag) < 0)) return;
        out.push({ clinic: c, treatment });
      });
    };
    push(typeof PILATES_CLINICS !== "undefined" ? PILATES_CLINICS : [], "Clinical Pilates");
    push(typeof GOLF_CLINICS !== "undefined" ? GOLF_CLINICS : [], "Golf Swing Assessment");
    const nat = (typeof NATURO_CLINICS !== "undefined" ? NATURO_CLINICS : []).filter((c) => c.prov === "ON");
    push(nat, "Cosmetic Acupuncture", "cosmetic-acupuncture");
    push(nat, "Microneedling", "microneedling");
    push(nat, "IV Vitamin Therapy", "iv-therapy");
    push(nat, "IM Vitamin Therapy", "vitamin-injections");
    push(typeof FACIAL_CLINICS !== "undefined" ? FACIAL_CLINICS : [], "Facial Manual Therapy");
    push(typeof INTERVIEW_CLINICS !== "undefined" ? INTERVIEW_CLINICS : [], "Interview Preparation");
    push(typeof VOICE_CLINICS !== "undefined" ? VOICE_CLINICS : [], "Singing Voice Therapy");
    push(typeof NEUROFEEDBACK_CLINICS !== "undefined" ? NEUROFEEDBACK_CLINICS : [], "Neurofeedback");
    push(typeof REDLIGHT_CLINICS !== "undefined" ? REDLIGHT_CLINICS : [], "Red Light Therapy");
    push(typeof CRYO_CLINICS !== "undefined" ? CRYO_CLINICS : [], "Cryotherapy");
    push(typeof SHOCKWAVE_CLINICS !== "undefined" ? SHOCKWAVE_CLINICS : [], "Shockwave Therapy");
    push(typeof HEADSPA_CLINICS !== "undefined" ? HEADSPA_CLINICS : [], "Head Spa");
    push(typeof TMJMASSAGE_CLINICS !== "undefined" ? TMJMASSAGE_CLINICS : [], "TMJ Massage");
    push(typeof LYMPH_CLINICS !== "undefined" ? LYMPH_CLINICS : [], "Lymphatic Drainage");
    push(typeof PELVIC_CLINICS !== "undefined" ? PELVIC_CLINICS : [], "Pelvic Floor Physiotherapy");
    push(typeof BIKEFIT_CLINICS !== "undefined" ? BIKEFIT_CLINICS : [], "Bike Fitting");
    push(typeof GAIT_CLINICS !== "undefined" ? GAIT_CLINICS : [], "Running Gait Analysis");
    push(typeof SLEEP_CLINICS !== "undefined" ? SLEEP_CLINICS : [], "Sleep Coaching");
    push(typeof COUPLES_CLINICS !== "undefined" ? COUPLES_CLINICS : [], "Couples Therapy");
    push(typeof MENTALPERF_CLINICS !== "undefined" ? MENTALPERF_CLINICS : [], "Mental Performance Coaching");
    push(typeof ACCENT_CLINICS !== "undefined" ? ACCENT_CLINICS : [], "Accent Modification");
    push(typeof MYOFUNC_CLINICS !== "undefined" ? MYOFUNC_CLINICS : [], "Myofunctional Therapy");
    push(typeof GUASHA_CLINICS !== "undefined" ? GUASHA_CLINICS : [], "Facial Gua Sha");
    push(typeof BOTOX_CLINICS !== "undefined" ? BOTOX_CLINICS : [], "Medical Botox");
    push(typeof NUTRITION_CLINICS !== "undefined" ? NUTRITION_CLINICS : [], "Sports Nutrition");
    push(typeof FERTACU_CLINICS !== "undefined" ? FERTACU_CLINICS : [], "Fertility Acupuncture");
    push(typeof FERTNAT_CLINICS !== "undefined" ? FERTNAT_CLINICS : [], "Fertility Consultation");
    return out;
  }
  window.wfAllClinics = allClinicsWithTreatment;

  /* Keywords: other treatments a clinic offers (computed across all datasets). */
  let _alsoCache = null;
  function alsoOffersMap() {
    if (_alsoCache) return _alsoCache;
    const m = {};
    window.wfAllClinics().forEach((x) => {
      const k = x.clinic.name;
      m[k] = m[k] || {};
      m[k][x.treatment] = true;
    });
    _alsoCache = m;
    return m;
  }
  function clinicAlsoOffers(name, exclude) {
    const m = alsoOffersMap()[name] || {};
    return Object.keys(m).filter((t) => t !== exclude);
  }
  function ensureClinicModal() {
    if (document.getElementById("clinicModal")) return;
    const d = document.createElement("dialog");
    d.className = "clinic-modal";
    d.id = "clinicModal";
    d.innerHTML = `<button class="modal-close" data-close aria-label="Close">×</button><div id="clinicModalBody"></div>`;
    document.body.appendChild(d);
    d.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]") || e.target === d) d.close();
    });
  }
  function clinicMailto(c, serviceName) {
    if (!c.email) return "";
    return `mailto:${esc(c.email)}?subject=${encodeURIComponent(`Question about ${serviceName} (found via WellFinder)`)}&body=${encodeURIComponent(`Hi,\n\nI found your clinic via wellfinder.ca for ${serviceName}. I hope to get more information regarding price, claim process and schedule.\n\nThank you!`)}`;
  }
  function openClinicModal(name) {
    const found = window.wfAllClinics().find((x) => x.clinic.name === name);
    if (!found) return;
    const c = found.clinic;
    ensureClinicModal();
    const mailto = clinicMailto(c, found.treatment);
    const rows = [
      c.about ? `<p class="cm-about">${esc(c.about)}</p>` : "",
      c.loc ? `<p><strong>Address</strong><br>${esc(c.loc)}</p>` : "",
      c.price && c.price.indexOf("$") > -1 ? `<p><strong>Price</strong><br>${esc(c.price)}</p>` : "",
      c.billed ? `<p><strong>Billed as</strong><br>${esc(c.billed)}</p>` : "",
      c.modalities ? `<p><strong>Services</strong><br>${esc(c.modalities)}</p>` : "",
      c.note ? `<p><strong>Note</strong><br>${esc(c.note)}</p>` : "",
    ].filter(Boolean).join("");
    const host = c.web ? c.web.replace(/^https?:\/\//, "").split("/")[0] : "";
    document.getElementById("clinicModalBody").innerHTML =
      `<p class="eyebrow">${esc(found.treatment)}</p><h3>${esc(c.name)}</h3>${rows}
       <div class="clinic-actions">
         ${c.web ? `<a class="btn btn--ghost btn--sm" href="${esc(c.web)}" target="_blank" rel="noopener">Website ↗</a>` : ""}
         ${mailto ? `<a class="btn btn--ghost btn--sm" href="${mailto}" aria-label="Email ${esc(c.name)}">✉</a>` : ""}
         ${c.book ? `<a class="btn btn--primary btn--sm" href="${esc(c.book)}" target="_blank" rel="noopener">Book online ↗</a>` : ""}
       </div>
       ${host ? `<p class="cm-src">Info compiled from the clinic's public website: <a href="${esc(c.web)}" target="_blank" rel="noopener">${esc(host)}</a></p>` : ""}`;
    document.getElementById("clinicModal").showModal();
  }

  function clinicListHTML(clinics) {
    if (!clinics.length) return `<p class="gta-empty">No GTA listings yet. <a href="/submit">Suggest a clinic</a></p>`;
    return `<ul class="gta-list">${clinics.map((c) =>
      `<li>${c.web ? `<a href="${esc(c.web)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}<span>${esc(c.city || "")}</span></li>`
    ).join("")}</ul>`;
  }

  /* Rich clinic cards for the per-treatment minipages:
     save icon, website, email (prefilled), booking link. */
  function clinicCardsHTML(clinics, serviceName, wrap) {
    if (!clinics.length) return `<p class="gta-empty">No GTA listings yet. <a href="/submit">Suggest a clinic</a></p>`;
    const cards = clinics.map((c) => {
      const saved = window.wfFavs && window.wfFavs.has(c.name);
      const mailto = clinicMailto(c, serviceName || c.treatment || "wellness");
      const meta = [serviceName || c.treatment, c.city].filter(Boolean).map(esc).join(" · ");
      const dist = c.distKm != null && isFinite(c.distKm) ? `<p class="clinic-dist">≈ ${Math.round(c.distKm)} km away</p>` : "";
      const addr = c.loc ? `<p class="clinic-addr">📍 ${esc(c.loc)}</p>` : "";
      const price = c.price && c.price.indexOf("$") > -1 ? `<p class="clinic-price">${esc(c.price)}</p>` : "";
      const also = clinicAlsoOffers(c.name, serviceName || c.treatment).slice(0, 4);
      const alsoHtml = also.length ? `<p class="clinic-also">${also.map((t) => `<span>${esc(t)}</span>`).join("")}</p>` : "";
      return `<article class="clinic-card">
        <button class="fav-btn ${saved ? "saved" : ""}" data-fav="${esc(c.name)}"
          aria-label="Save ${esc(c.name)}" aria-pressed="${saved}">${HEART}</button>
        <h4>${c.web ? `<a href="${esc(c.web)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}</h4>
        ${meta ? `<p class="clinic-meta">${meta}</p>` : ""}
        ${dist}${addr}${price}${alsoHtml}
        <div class="clinic-actions">
          ${c.web ? `<a class="btn btn--ghost btn--sm" href="${esc(c.web)}" target="_blank" rel="noopener">Website ↗</a>` : ""}
          ${mailto ? `<a class="btn btn--ghost btn--sm" href="${mailto}" aria-label="Email ${esc(c.name)}">✉</a>` : ""}
          ${c.book ? `<a class="btn btn--primary btn--sm" href="${esc(c.book)}" target="_blank" rel="noopener">Book ↗</a>` : ""}
          <button class="btn btn--ghost btn--sm" data-clinic-info="${esc(c.name)}">Info</button>
        </div>
      </article>`;
    }).join("");
    return wrap === false ? cards : `<div class="clinic-grid">${cards}</div>`;
  }
  window.wfClinicCardsHTML = clinicCardsHTML;

  function renderGtaDirectory() {
    const grid = $("#gtaGrid"); if (!grid || typeof TREATMENTS === "undefined") return;
    const names = TREATMENTS.map((t) => t.name);
    grid.innerHTML = `<div class="gta-links">` + names.map((name) => {
      const g = gtaDataFor(name); if (!g) return "";
      return `<a class="gta-link" href="/clinics-${treatmentSlug(name)}">
        <span class="gta-link-name">${esc(g.name)}</span>
        <span class="gta-link-meta">${g.billed ? `Billed as ${esc(g.billed)} · ` : ""}${g.clinics.length} clinic${g.clinics.length === 1 ? "" : "s"} <span aria-hidden="true">→</span></span>
      </a>`;
    }).join("") + `</div>`;
  }

  /* Per-treatment minipage: <body data-treatment="Clinical Pilates"> */
  function renderTreatmentPage() {
    const name = document.body && document.body.dataset ? document.body.dataset.treatment : "";
    if (!name) return;
    const g = gtaDataFor(name); if (!g) return;
    const head = $("#tpHead"), list = $("#tpList");
    const PROV_NAMES = { ON: "Ontario", BC: "British Columbia", AB: "Alberta", SK: "Saskatchewan", MB: "Manitoba", QC: "Quebec", NB: "New Brunswick", NS: "Nova Scotia", PE: "Prince Edward Island", NL: "Newfoundland and Labrador", YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut" };
    if (head) {
      head.innerHTML =
        `<p class="eyebrow"><a href="/">WellFinder</a> · Canada directory</p>
         <h1>${esc(g.name)} clinics across Canada</h1>
         ${g.billed ? `<p class="tp-billed">Billed as ${esc(g.billed)}</p>` : ""}
         ${g.desc ? `<p class="lede">${esc(g.desc)}</p>` : ""}
         ${g.image ? `<figure class="tp-fig"><img src="${esc(g.image.src)}" alt="${esc(g.name)}" loading="lazy"><figcaption>Photo: <a href="${esc(g.image.url)}" target="_blank" rel="noopener">${esc(g.image.credit)}</a></figcaption></figure>` : ""}`;
      document.title = `${g.name} clinics across Canada — WellFinder`;
    }
    if (list) {
      const provs = [...new Set(g.clinics.map((c) => c.prov || "ON"))].sort();
      const renderList = (prov) => {
        const cs = prov ? g.clinics.filter((c) => (c.prov || "ON") === prov) : g.clinics;
        const filter = provs.length > 1
          ? `<label class="prov-filter">Province <select id="provSelect"><option value="">All of Canada (${g.clinics.length})</option>${provs.map((p) => `<option value="${p}">${PROV_NAMES[p] || p}</option>`).join("")}</select></label>`
          : "";
        list.innerHTML = `<div class="tp-list-head"><h2>${cs.length} clinic${cs.length === 1 ? "" : "s"}${prov ? " in " + esc(PROV_NAMES[prov] || prov) : " across Canada"}</h2>${filter}</div>` + clinicCardsHTML(cs, g.name);
        const sel = document.getElementById("provSelect");
        if (sel) { sel.value = prov || ""; sel.addEventListener("change", () => renderList(sel.value)); }
      };
      renderList("");
    }
  }

  /* Save buttons + clinic info buttons work on every page. */
  function initGlobalFavs() {
    document.addEventListener("click", (e) => {
      const fav = e.target.closest(".fav-btn");
      if (fav) {
        const on = window.wfFavs.toggle(fav.dataset.fav);
        fav.classList.toggle("saved", on);
        fav.setAttribute("aria-pressed", on ? "true" : "false");
        return;
      }
      const info = e.target.closest("[data-clinic-info]");
      if (info) openClinicModal(info.getAttribute("data-clinic-info"));
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initShare();
    initNewsletter();
    updateFavCount();
    renderInsurers();
    renderWhy();
    renderDirectory();
    renderResources();
    renderGtaDirectory();
    renderTreatmentPage();
    initGlobalFavs();
    // set year in footers
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  });
})();
