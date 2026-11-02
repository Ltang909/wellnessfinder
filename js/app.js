/* ============================================================
   WellFinder — shared behaviour
   ============================================================ */
(function () {
  "use strict";

/* Durable saves: localStorage mirrored into a 1-year cookie so saves
   survive localStorage purges (notably iOS Safari). On load, any key
   missing from localStorage is restored from the cookie. Writes go
   through window.wfStoreSet / wfStoreRemove so both stores stay in
   sync. Included by site-nav.js and app.js; runs once (window guard). */
(function () {
  if (window.__wfStore) return;
  window.__wfStore = true;
  var KEYS = ["wf_favourites", "wf_postal_code", "wf_radius_km", "wf_discover_email"];
  function cGet(n) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function cSet(n, v) {
    if (String(v).length > 3800) return; // stay under the per-cookie limit
    var exp = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = n + "=" + encodeURIComponent(v) + "; expires=" + exp +
      "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
  }
  function cDel(n) {
    document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  }
  try {
    KEYS.forEach(function (k) {
      var lv = null;
      try { lv = localStorage.getItem(k); } catch (_) {}
      if (lv == null) {
        var cv = cGet(k);
        if (cv != null) { try { localStorage.setItem(k, cv); } catch (_) {} }
      } else {
        cSet(k, lv); // keep the cookie fresh
      }
    });
  } catch (_) {}
  window.wfStoreSet = function (k, v) {
    try { localStorage.setItem(k, v); } catch (_) {}
    if (KEYS.indexOf(k) > -1) cSet(k, String(v));
  };
  window.wfStoreRemove = function (k) {
    try { localStorage.removeItem(k); } catch (_) {}
    if (KEYS.indexOf(k) > -1) cDel(k);
  };
})();


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
  const setFavs = (a) => {
    const v = JSON.stringify(a);
    if (window.wfStoreSet) window.wfStoreSet(FAV_KEY, v);
    else { try { localStorage.setItem(FAV_KEY, v); } catch {} }
  };
  window.wfFavs = { get: getFavs, has: (n) => getFavs().includes(n),
    toggle(n) {
      const f = getFavs(); const i = f.indexOf(n);
      if (i > -1) f.splice(i, 1); else f.push(n);
      setFavs(f); updateFavCount(); return i === -1;
    } };
  function updateFavCount() {
    const n = getFavs().length;
    const el = $("#favCount");
    if (el) {
      el.textContent = n ? `${n} saved` : "";
      el.style.display = n ? "inline" : "none";
    }
    const uni = document.getElementById("universalSavedCount");
    if (uni) { uni.textContent = n; uni.hidden = !n; }
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
    if (row.querySelector(".insurer-track")) return; // static markup already present
    const items = INSURERS.map((i) =>
      `<span class="insurer-logo"><img src="${esc(i.logo)}" alt="${esc(i.name)}"></span>`
    ).join("");
    // duplicate the track so the scroll loops seamlessly
    row.innerHTML = `<div class="insurer-track">${items}</div>`;
  }

  /* The claims marquee: sourced Google-review quotes (REVIEW_QUOTES in
     js/data.js), duplicated for the seamless scroll loop. The insurance
     phrase in each quote gets the yellow marker highlight. */
  function renderWhy() {
    const grid = $("#whyGrid"); if (!grid || typeof REVIEW_QUOTES === "undefined") return;
    const card = (q) => {
      let text = esc(q.quote);
      const ph = esc(q.phrase || "");
      if (ph && text.includes(ph)) text = text.replace(ph, `<span class="ins-hl">${ph}</span>`);
      const stars = q.stars
        ? `<div class="review-stars" aria-label="${q.stars}-star Google review">${"★".repeat(q.stars)}</div>`
        : `<div class="review-src">Google review</div>`;
      return `<figure class="review-card">${stars}<blockquote class="review-quote">&ldquo;${text}&rdquo;</blockquote><figcaption class="review-meta"><span class="review-name">${esc(q.reviewer)}</span><span class="review-clinic">${esc(q.clinic)} · ${esc(q.city)}</span><span class="review-tags"><span class="review-tag">${esc(q.treatment)}</span><span class="review-tag review-tag--billed">Billed as ${esc(q.billed)}</span></span></figcaption></figure>`;
    };
    const half = REVIEW_QUOTES.map(card).join("");
    const secs = Math.max(30, Math.round(REVIEW_QUOTES.length * 6.5));
    grid.innerHTML = `<div class="why-track" style="animation-duration:${secs}s">${half}${half}</div>`;
  }

  /* Stat strip above the claims marquee (CLAIM_STATS in js/data.js). */
  function renderClaimExtra() {
    const statsRoot = $("#claimStats");
    if (statsRoot && typeof CLAIM_STATS !== "undefined") {
      statsRoot.innerHTML =
        `<div class="claims-stats">${CLAIM_STATS.map((s) =>
          `<div class="cstat"><span class="cstat-num">${esc(s.num)}</span><span class="cstat-label">${esc(s.label)}</span></div>`).join("")}</div>`;
    }
  }

  const HEART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.9Z"/></svg>`;

  /* Useful facts for the More details panel: typical cost range and,
     where the data knows it, how many listed clinics direct bill. */
  function treatmentFactsHTML(t) {
    const facts = [];
    const cost = (typeof TREATMENT_COSTS !== "undefined" && TREATMENT_COSTS[t.name]) || "";
    if (cost) facts.push(`<p class="tc-fact"><b>Typical cost:</b> ${esc(cost)}</p>`);
    const g = gtaDataFor(t.name);
    const clinics = g ? g.clinics : [];
    const dbYes = clinics.filter((c) => c.db === "Yes" || c.directBill === true).length;
    if (dbYes) facts.push(`<p class="tc-fact"><b>Direct billing:</b> ${dbYes} listed clinic${dbYes === 1 ? " offers" : "s offer"} it</p>`);
    return facts.join("");
  }

  /* Embedded clinic list for the More details panel: each clinic name
     links straight to the clinic, so there is no separate hunt. */
  function tcClinicsHTML(list, total, slug, near) {
    const rows = list.map(({ c, d }) => {
      const href = c.web || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.name + " " + (c.city || "")));
      const bits = [];
      if (c.city) bits.push(esc(c.city));
      if (d != null && isFinite(d) && d <= 100) bits.push("≈" + Math.max(1, Math.round(d)) + " km");
      if (c.db === "Yes" || c.directBill === true) bits.push("Direct billing");
      return `<li><a href="${esc(href)}" target="_blank" rel="noopener">${esc(c.name)}</a>${bits.length ? `<span>${bits.join(" · ")}</span>` : ""}</li>`;
    }).join("");
    return `<p class="tc-clinics-title">${near ? "Clinics near you" : "Clinics"}</p>
      <ul class="tc-clinic-list">${rows}</ul>
      <a class="tc-all" href="/clinics-${slug}">See all ${total} clinics →</a>`;
  }

  /* Card accent colour = the hero fund category the treatment belongs to
     (same highlighter shades as the rotating hero words). */

  /* Which hero fund category each treatment belongs to (Leon's mapping,
     2026-10-31); drives both the card accent colour and the fund filters. */
  const FUND_CATS = [
    ["Hobbies", "#FF9E2C"], ["Skincare", "#FF6FAE"], ["Self-care", "#9D6BFF"],
    ["Fitness", "#3FA7F5"], ["Mental wellness", "#2EC4B6"], ["Recovery", "#FF6B6B"],
    ["Personal growth", "#FFCE45"]
  ];
  const FUND_CAT = {
    "Golf Swing Assessment": "Hobbies", "Singing Voice Therapy": "Hobbies", "Bike Fitting": "Hobbies",
    "Cosmetic Acupuncture": "Skincare", "Facial Gua Sha": "Skincare", "Microneedling": "Skincare",
    "Medical Botox": "Skincare", "Facial Manual Therapy": "Skincare",
    "Head Spa": "Self-care", "IM Vitamin Therapy": "Self-care", "IV Vitamin Therapy": "Self-care",
    "Red Light Therapy": "Self-care", "Fertility Consultation": "Self-care", "Fertility Acupuncture": "Self-care",
    "Clinical Pilates": "Fitness", "Running Gait Analysis": "Fitness", "Sports Nutrition": "Fitness",
    "Pelvic Floor Physiotherapy": "Fitness",
    "Couples Therapy": "Mental wellness", "Neurofeedback": "Mental wellness", "Sleep Coaching": "Mental wellness",
    "Lymphatic Drainage": "Recovery", "Shockwave Therapy": "Recovery", "TMJ Massage": "Recovery",
    "Cryotherapy": "Recovery", "Myofunctional Therapy": "Recovery",
    "Interview Preparation": "Personal growth", "Accent Modification": "Personal growth",
    "Mental Performance Coaching": "Personal growth",
    "Performing Arts Physiotherapy": "Hobbies",
    "Psychoeducational Assessments": "Personal growth", "Stuttering Therapy": "Personal growth",
    "Vestibular Rehabilitation": "Recovery", "Pressotherapy": "Recovery"
  };
  const FUND_COLOR = {};
  FUND_CATS.forEach(([w, c]) => { FUND_COLOR[w] = c; });
  const FUND_HL = {};
  Object.keys(FUND_CAT).forEach((n) => { FUND_HL[n] = FUND_COLOR[FUND_CAT[n]]; });

  function treatmentCardHTML(t) {
    const saved = getFavs().includes(t.name);
    const hl = FUND_HL[t.name] || "#FFCE45";
    const cats = t.categories.join(",");
    const img = (typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[t.name]) || null;
    const art = img ? img.src : ((typeof TREATMENT_ART !== "undefined" && TREATMENT_ART[t.group]) || "");
    const credit = img ? `<div class="tc-credit">Photo: <a href="${esc(img.url)}" target="_blank" rel="noopener">${esc(img.credit)}</a></div>` : "";
    const g = gtaDataFor(t.name);
    const clinics = g ? g.clinics : [];
    const firstFew = clinics.slice(0, 4).map((c) => ({ c, d: null }));
    return `
      <article class="treatment-card" style="--hl:${hl}" data-cats="${esc(cats)}" data-name="${esc(t.name)}">
        ${art ? `<div class="tc-art" aria-hidden="true"><img src="${esc(art)}" alt="" loading="lazy"></div>${credit}` : ""}
        <button class="fav-btn ${saved ? "saved" : ""}" data-fav="${esc(t.name)}"
          aria-label="Save ${esc(t.name)}" aria-pressed="${saved}">${HEART}</button>
        <span class="tc-billed">Billed as ${esc(t.billed)}</span>
        <h4>${esc(t.name)}</h4>
        <p>${esc(t.desc)}</p>
        <p class="tc-near" data-near="${esc(t.name)}" hidden></p>
        <button class="tc-more" aria-expanded="false">More details →</button>
        <div class="tc-detail">${treatmentFactsHTML(t)}<div class="tc-clinics" data-tc-clinics="${esc(t.name)}">${tcClinicsHTML(firstFew, clinics.length, treatmentSlug(t.name), false)}</div></div>
      </article>`;
  }

  /* Directory: Four Seasons-style presentation (Leon's pick, 2026-11-01).
     A tab bar switches between All and the seven fund categories. Each
     view: title + count, featured cards, then modality accordions with
     treatments duplicated across every modality they bill through. */
  const FS_FEATURED_ALL = ["Microneedling", "Clinical Pilates", "Golf Swing Assessment", "Head Spa"];
  const FS_TABS = ["All", ...FUND_CATS.map(([w]) => w)];
  const FS_MOD_ORDER = ["Physiotherapy", "Naturopathy", "Chiropractic", "Speech Therapy", "Acupuncture", "Massage Therapy", "Psychology", "Psychotherapy", "Osteopathy", "Dental", "Dietitian"];
  let fsView = "All";

  const fsImg = (t) => ((typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[t.name]) || {}).src || `/assets/treatments/${treatmentSlug(t.name)}.jpg`;
  const fsDesc = (t) => (t.desc || "").replace(/\s*\*Coverage varies by provider\.?/g, "").trim();
  const fsBilled = (t) => (t.billed || "").replace(/\*+$/, "");
  const fsClinics = (t) => (gtaDataFor(t.name) || { clinics: [] }).clinics.length;
  function localClinicsFor(name) {
    const all = (gtaDataFor(name) || { clinics: [] }).clinics.filter(Boolean);
    const prov = window.wfProv ? wfProv.get() : "";
    const pt = (typeof fcUserPt !== "undefined") ? fcUserPt : null;
    if (pt) {
      const withD = all.map((c) => { const cc = clinicCoords(c); return { d: cc ? haversineKm(pt, cc) : null }; });
      const n50 = withD.filter((x) => x.d !== null && x.d <= 50).length;
      if (n50) return { n: n50, label: `near ${(wfLoc.get() || "").toUpperCase()}` };
    }
    if (prov) {
      const ip = all.filter((c) => (c.prov || "") === prov).length;
      if (ip) return { n: ip, label: `in ${provName(prov)}` };
    }
    return null;
  }
  const fsClinicsShown = (t) => {
    if (wfLoc.get() || (window.wfProv && wfProv.get())) {
      const loc = localClinicsFor(t.name);
      if (loc) return loc.n;
    }
    return fsClinics(t);
  };
  const fsClinicsLink = (t) => {
    const loc = (wfLoc.get() || (window.wfProv && wfProv.get())) ? localClinicsFor(t.name) : null;
    if (loc) return `<a class="fs-clinics" href="/clinics-${treatmentSlug(t.name)}">${loc.n} clinic${loc.n === 1 ? "" : "s"} ${esc(loc.label)} \u2192</a>`;
    return `<a class="fs-clinics" href="/clinics-${treatmentSlug(t.name)}">${fsClinics(t)} clinic${fsClinics(t) === 1 ? "" : "s"} \u2192</a>`;
  };

  function fsCardHTML(t) {
    const fsSaved = getFavs().includes(t.name);
    return `<article class="fs-card">
      <button class="fav-btn ${fsSaved ? "saved" : ""}" data-fav="${esc(t.name)}" aria-label="Save ${esc(t.name)}" aria-pressed="${fsSaved}">${HEART}</button>
      <img src="${esc(fsImg(t))}" alt="${esc(t.name)}" loading="lazy">
      <h3>${esc(t.name)} <span class="fs-arr">\u2192</span></h3>
      <p class="fs-desc">${esc(fsDesc(t))}</p>
      <p class="fs-meta">Billed as ${esc(fsBilled(t))}</p>
      ${fsClinicsLink(t)}
    </article>`;
  }
  function fsMiniHTML(t) {
    const miniSaved = getFavs().includes(t.name);
    return `<article class="fs-mini">
      <button class="fav-btn ${miniSaved ? "saved" : ""}" data-fav="${esc(t.name)}" aria-label="Save ${esc(t.name)}" aria-pressed="${miniSaved}">${HEART}</button>
      <img src="${esc(fsImg(t))}" alt="${esc(t.name)}" loading="lazy">
      <h4>${esc(t.name)} <span class="fs-arr">\u2192</span></h4>
      ${fsClinicsLink(t)}
    </article>`;
  }
  function fsViewTreatments() {
    if (fsView === "All" || typeof FUND_CAT === "undefined") return TREATMENTS;
    return TREATMENTS.filter((t) => FUND_CAT[t.name] === fsView);
  }
  function renderDirectory() {
    const root = $("#fsRoot"); if (!root || typeof TREATMENTS === "undefined") return;
    const inView = fsViewTreatments();
    const featured = fsView === "All"
      ? FS_FEATURED_ALL.map((n) => TREATMENTS.find((t) => t.name === n)).filter(Boolean)
      : [...inView].sort((a, b) => fsClinics(b) - fsClinics(a)).slice(0, 4);
    const mods = FS_MOD_ORDER
      .map((m) => ({ m, list: inView.filter((t) => (t.categories || []).includes(m)) }))
      .filter((g) => g.list.length);
    const viewClinics = inView.reduce((sum, t) => sum + fsClinicsShown(t), 0);
    const actIdx = Math.max(0, FS_TABS.indexOf(fsView));
    const rotated = FS_TABS.map((_, k) => FS_TABS[(actIdx - 4 + k + FS_TABS.length) % FS_TABS.length]);
    /* Slot flex-grows: the four slots left of centre sum to the same
       width as the three right of it, so the enlarged centre tab's
       midpoint lands exactly on the bar's centre. */
    const SLOT_GROW = [0.7, 0.8, 0.9, 1.0, 1.9, 1.2, 1.15, 1.05];
    root.innerHTML = `
      <div class="fs-tabbar"><button type="button" class="fs-chev" data-fsnav="-1" aria-label="Previous category">\u2039</button>
        ${rotated.map((w, k) =>
          `<button type="button" class="fs-tab ${w === "All" ? "tab-all" : ""} ${w === fsView ? "active" : ""} d${Math.abs(k - 4)}" style="--fg:${SLOT_GROW[k]}${w === "All" ? "" : `;--fc:${FUND_COLOR[w] || "#0F2D2B"}`}" data-fsview="${esc(w)}">${esc(w)}</button>`).join("")}
        <button type="button" class="fs-chev" data-fsnav="1" aria-label="Next category">\u203a</button></div>
      <p class="fs-count">${inView.length} treatment${inView.length === 1 ? "" : "s"} \u00b7 ${viewClinics.toLocaleString("en-CA")} clinic${viewClinics === 1 ? "" : "s"}${(wfLoc.get() || (window.wfProv && wfProv.get())) ? (wfLoc.get() ? " near you" : ` in ${esc(provName(wfProv.get()))}`) : ""}</p>
      <div class="fs-rule"><span>Featured treatments</span></div>
      <div class="fs-grid">${featured.map(fsCardHTML).join("")}</div>
      ${mods.map((g) => `
      <div class="fs-sect">
        <button type="button" class="fs-sect-head" aria-expanded="false"><b>${esc(g.m)}</b><span>${g.list.length} treatment${g.list.length === 1 ? "" : "s"} \u00b7 ${(function () { const n = g.list.reduce((sum, t) => sum + fsClinicsShown(t), 0); return `${n.toLocaleString("en-CA")} clinic${n === 1 ? "" : "s"}`; })()} \u00b7 <em>Show \u25be</em></span></button>
        <div class="fs-minigrid">${g.list.map(fsMiniHTML).join("")}</div>
      </div>`).join("")}`;
    if (!root.dataset.wired) {
      root.dataset.wired = "1";
      root.addEventListener("click", (e) => {
        const navB = e.target.closest("[data-fsnav]");
        if (navB) {
          const i = Math.max(0, FS_TABS.indexOf(fsView));
          fsView = FS_TABS[(i + parseInt(navB.dataset.fsnav, 10) + FS_TABS.length) % FS_TABS.length];
          renderDirectory(); return;
        }
        const tab = e.target.closest(".fs-tab");
        if (tab) { fsView = tab.dataset.fsview; renderDirectory(); return; }
        const head = e.target.closest(".fs-sect-head");
        if (head) {
          const sect = head.closest(".fs-sect");
          const open = sect.classList.toggle("open");
          head.setAttribute("aria-expanded", open ? "true" : "false");
          const em = head.querySelector("em");
          if (em) em.textContent = open ? "Hide \u25b4" : "Show \u25be";
        }
      });
    }
  }

  /* Public hook kept for compatibility with older in-page callers. */
  window.wfDirectory = {
    setFund(fund) {
      fsView = FUND_CATS.some(([w]) => w === fund) ? fund : "All";
      renderDirectory();
      return fsView;
    },
    setGoal() { return null; },
    clearFilters() { fsView = "All"; renderDirectory(); },
  };

  /* Featured clinics stage (Four Seasons-style carousel, 2026-11-01).
     Sits below the claims section. The switcher picks a treatment; the
     rail rotates through up to seven of its clinics (ones with notes
     first), the active clinic on the white centre card. */
  const FC_TREATMENTS = [
    { name: "Golf Swing Assessment", label: "Golf Swing", sub: "TPI movement screens from certified clinicians, billed as physiotherapy or chiropractic." },
    { name: "Clinical Pilates", label: "Clinical Pilates", sub: "One-on-one reformer care from registered physiotherapists, billed through your extended health benefits." },
    { name: "Microneedling", label: "Microneedling", sub: "Collagen-focused skin treatments paired with naturopathic care, billed as naturopathy." }
    ,{ name: "IV Vitamin Therapy", label: "IV Therapy", sub: "Naturopath-led vitamin infusions mixed after an assessment, billed as naturopathy." },
  ];
  let fcTreatment = "Clinical Pilates";
  let fcIndex = 0;
  let fcDir = 0;

  /* Curated featured sets (2026-11-01): only clinics with BOTH a price
     verified on their own booking page AND a verified Google rating
     (Places or the clinic's own Google badge/widget). Treatments
     without a curated set fall back to the notes-first selection. */
  const FC_SETS = {
    "Clinical Pilates": ["Revival Physio", "Pulse Physiotherapy", "Toronto Physiotherapy (Danforth & Chester)", "Focus Physio + Wellness", "Treloar Physiotherapy \u2014 Cambie", "Synergy Physiotherapy and Pilates", "Pilates4Physio", "Bijoy's Physio & Pilates"],
    "Microneedling": ["Qi Integrated Health", "Dr. Lauren Cottom", "Well BYND", "Health Globe Wellness Clinic", "Everwell ND", "Wellness Place"],
    "IV Vitamin Therapy": ["Timeless Health Clinic", "The Vitamin Clinic", "Essence Wellness Clinic (Marda Loop)", "TruMed", "Sage Naturopathic Clinic (Kitchener)"],
    "Golf Swing Assessment": ["MOTI Physio", "Anchor Health and Performance Clinic", "OAK Physio & Wellness", "Arbutus Physiotherapy"],
  };
  function fcFeatured(name) {
    const all = (gtaDataFor(name) || { clinics: [] }).clinics.filter(Boolean);
    const curated = FC_SETS[name];
    if (curated) {
      const picked = curated.map((n) => all.find((c) => c.name === n)).filter(Boolean);
      if (picked.length) return { featured: picked, total: all.length };
    }
    const noted = all.filter((c) => (c.note || "").trim().length > 30);
    const rest = all.filter((c) => (c.note || "").trim().length <= 30);
    return { featured: [...noted, ...rest].slice(0, 7), total: all.length };
  }
  let fcUserPt = null;
  function renderFeaturedClinics() {
    const root = $("#fcRoot"); if (!root || typeof TREATMENTS === "undefined") return;
    const cfg = FC_TREATMENTS.find((x) => x.name === fcTreatment) || FC_TREATMENTS[1];
    const t = TREATMENTS.find((x) => x.name === fcTreatment);
    const { featured, total } = fcFeatured(fcTreatment);
    if (!featured.length) { root.innerHTML = ""; return; }
    /* Geo filter: province the user picked + 25 km around their postal
       code. Fall back to the whole province, then to the full set. */
    const prov = window.wfProv ? wfProv.get() : "";
    const postal = wfLoc.get();
    const pt = fcUserPt;
    /* Pool: the curated featured set first, then every directory clinic
       for this treatment. With a location set, the bar always shows
       5-8 clinics: nearest first, widening 25 -> 50 -> 100 km, then
       province, then nearest overall. */
    /* Photos-only rule (Leon, 2026-11-01): the featured bar only shows
       clinics with a treatment/clinic photo on file (CLINIC_MEDIA img).
       No text-card top-ups from the wider directory pool. */
    const pool = featured
      .filter((c) => typeof CLINIC_MEDIA !== "undefined" && CLINIC_MEDIA[c.name] && CLINIC_MEDIA[c.name].img)
      .map((c) => ({ c, feat: true }));
    const ann = pool.map(({ c, feat }) => {
      const geo = (typeof FC_GEO !== "undefined" && FC_GEO[c.name]) || null;
      const cc = geo && geo.lat != null ? [geo.lat, geo.lng] : clinicCoords(c);
      const d = pt && cc ? haversineKm(pt, cc) : null;
      return { c, feat, geo, d, provC: (geo && geo.prov) || c.prov || "" };
    });
    const featOnly = ann.filter((a) => a.feat);
    let vis = featOnly, geoNote = "";
    if (pt) {
      const sorted = [...ann].sort((a, b) => ((a.d === null ? Infinity : a.d) - (b.d === null ? Infinity : b.d)) || ((b.feat ? 1 : 0) - (a.feat ? 1 : 0)));
      const within = (km) => sorted.filter((a) => a.d !== null && a.d <= km);
      let band = 0;
      for (const km of [25, 50, 100]) { if (within(km).length >= 5) { band = km; break; } }
      if (band) {
        vis = within(band).slice(0, 8);
        geoNote = `Within ${band} km of ${esc(postal.toUpperCase())}`;
      } else {
        let fill = within(100);
        if (fill.length < 5 && prov) fill = [...fill, ...sorted.filter((a) => a.provC === prov && !fill.includes(a))];
        if (fill.length < 5) fill = [...fill, ...sorted.filter((a) => !fill.includes(a))];
        vis = fill.slice(0, 8);
        geoNote = fill.length ? `Nearest to ${esc(postal.toUpperCase())}` : "";
      }
    } else if (prov) {
      const inProv = ann.filter((a) => a.provC === prov)
        .sort((a, b) => ((b.feat ? 1 : 0) - (a.feat ? 1 : 0)) || a.c.name.localeCompare(b.c.name));
      if (inProv.length >= 5) {
        vis = inProv.slice(0, 8);
        geoNote = `Featured in ${esc(provName(prov))}`;
      } else if (inProv.length) {
        const rest = ann.filter((a) => a.provC !== prov).sort((a, b) => (b.feat ? 1 : 0) - (a.feat ? 1 : 0));
        vis = [...inProv, ...rest].slice(0, Math.max(5, inProv.length));
        geoNote = `Featured in ${esc(provName(prov))} + top picks`;
      }
    }
    const img = t ? fsImg(t) : "";
    const slug = treatmentSlug(fcTreatment);
    fcIndex = ((fcIndex % vis.length) + vis.length) % vis.length;
    const n = vis.length;
    const at = (k) => vis[((fcIndex + k) % n + n) % n];
    const cardHTML = (annItem, k) => {
      const c = annItem.c;
      const media = (typeof CLINIC_MEDIA !== "undefined" && CLINIC_MEDIA[c.name]) || {};
      const key = (c.name + "|" + c.city).toLowerCase();
      const X = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.x[key]) || null;
      const pair = X && X.pairs ? X.pairs[fcTreatment] : null;
      const prov = c.prov || "ON";

      /* description: same composition as the unified minipage card —
         treatment + billed-as lead, then the clinic's own hook */
      const billed = (pair && pair.ba) || (gtaDataFor(fcTreatment) || {}).billed || "";
      const hook = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.lead[c.name] && CLINIC_EXTRA.lead[c.name][fcTreatment]) || "";
      let desc;
      if (hook && billed) desc = `${fcTreatment} billed as ${billed} — ${hook}`;
      else if (hook) desc = `${fcTreatment} — ${hook}`;
      else if (billed) desc = `${fcTreatment} billed as ${billed}${pair && pair.pr ? ` with ${pair.pr}` : ""} in ${c.city}.`;
      else desc = `${fcTreatment} in ${c.city}, ${prov}.`;

      /* rating: curated media first, else the verified record */
      let stars = "";
      const rt = Array.isArray(media.rating) ? media.rating : (X && X.r ? [X.r, X.n || 0] : null);
      if (rt) stars = `<p class="fc-stars"><span class="fc-star-glyphs">${"★".repeat(Math.round(rt[0]))}${"☆".repeat(5 - Math.round(rt[0]))}</span> ${Number(rt[0]).toFixed(1)} <span class="fc-rcount">(${rt[1]} Google reviews)</span></p>`;

      const pract = (pair && pair.pr) || media.practitioner;
      const practHTML = pract ? `<p class="fc-line">${esc(pract)}</p>` : "";

      /* address */
      let addr = "";
      if (X && X.a) addr = `${X.a}, ${c.city}, ${prov}${X.po ? " " + X.po : ""}`;
      else if (c.loc) addr = c.loc;
      const addrHTML = addr ? `<p class="fc-addr">${esc(addr)}</p>` : "";

      /* price + verification tier, same resolution as the unified card */
      let price = "";
      if (media.priceByTreatment && media.priceByTreatment[fcTreatment]) price = media.priceByTreatment[fcTreatment];
      else if (pair && pair.p) price = pair.p;
      else if (media.price) price = media.price;
      else if (c.price && c.price.indexOf("$") > -1) price = c.price;
      let priceHTML = "", tierHTML = "";
      if (price) {
        priceHTML = `<p class="fc-price">${esc(price)}</p>`;
        if (pair && pair.t === "booking") tierHTML = `<p class="fc-tier"><span class="fc-tier-ok">✓ Verified on booking page</span></p>`;
        else if (pair && pair.t === "website") tierHTML = `<p class="fc-tier">Price from clinic website</p>`;
        else if (pair && pair.t === "review") tierHTML = `<p class="fc-tier">Price from a recent review</p>`;
      } else {
        priceHTML = `<p class="fc-price"><span class="fc-noprice">Price on request</span></p>`;
      }

      /* direct billing: three honest states */
      const dbv = media.db || (X && X.db) || "";
      const db = dbv === "yes"
        ? `<p class="fc-db">✓ Direct billing available</p>`
        : dbv === "no"
          ? `<p class="fc-db fc-db-no">No direct billing — pay &amp; claim with receipt</p>`
          : `<p class="fc-db fc-db-unk">Direct billing not confirmed — ask the clinic</p>`;

      /* today's hours + open/closed state */
      let hoursHTML = "";
      if (X && X.h) {
        const st = ncTodayState(X.h, prov);
        const bit = st.closed ? `<span class="nc-closed-txt">Closed today</span>`
          : st.open === true ? `<span class="nc-open-dot"></span><span class="nc-open-txt">Open now</span> · <b>${esc(ncFmtHours(st.label))}</b>`
          : st.open === false ? `<span class="nc-closed-dot"></span><span class="nc-closed-txt">Closed now</span> · <b>${esc(ncFmtHours(st.label))}</b>`
          : `Today <b>${esc(ncFmtHours(st.label))}</b>`;
        hoursHTML = `<p class="fc-hours">${bit}</p>`;
      } else {
        hoursHTML = `<p class="fc-hours"><span class="fc-hours-na">Hours not listed</span></p>`;
      }

      /* actions: real links on the centre card, inert on side cards (they jump) */
      const book = media.link || c.book || (X && X.b) || (pair && pair.l) || "";
      const web = c.web || (X && X.w) || "";
      const btns = k === 0
        ? `<div class="fc-btns">${book ? `<a class="fc-btn fc-btn-book" href="${esc(book)}" target="_blank" rel="noopener">Book appointment</a>` : ""}${web ? `<a class="fc-btn fc-btn-web" href="${esc(web)}" target="_blank" rel="noopener">Website ↗</a>` : ""}</div>`
        : `<div class="fc-btns">${book ? `<span class="fc-btn fc-btn-book">Book appointment</span>` : ""}${web ? `<span class="fc-btn fc-btn-web">Website ↗</span>` : ""}</div>`;
      const photo = media.img ? `<img src="${esc(media.img)}" alt="${esc(c.name)}">` : "";
      const fcSaved = getFavs().includes(c.name);
      return `<article class="fc-card fc-d${Math.abs(k)} ${k === 0 ? "fc-card--active" : "fc-card--side"}${media.img ? "" : " fc-card--text"}" ${k === 0 ? "" : `data-fc-jump="${k}" role="button" tabindex="0" aria-label="Show ${esc(c.name)}"`}>
            <button class="fav-btn ${fcSaved ? "saved" : ""}" data-fav="${esc(c.name)}" aria-label="Save ${esc(c.name)}" aria-pressed="${fcSaved}">${HEART}</button>
            <h3>${esc(c.name)}</h3>
            <p class="fc-city">${esc(c.city || "")}${c.prov ? `, ${esc(c.prov)}` : ""}</p>
            ${annItem.d !== null && annItem.d !== undefined ? `<p class="fc-dist">📍 ${annItem.d < 1 ? "<1" : Math.round(annItem.d)} km away</p>` : ""}
            ${photo}
            <p class="fc-desc">${esc(desc)}</p>
            ${stars}${practHTML}${addrHTML}${priceHTML}${tierHTML}${db}${hoursHTML}
            ${btns}
          </article>`;
    };
    const active = at(0);
    root.innerHTML = `
    <div class="fc-stage">
      <div class="fc-bg" style="background-image:url('${esc(img)}')"></div>
      <div class="fc-shade"></div>
      <div class="fc-inner">
        <p class="fc-label">Featured Clinics</p>
        <div class="fc-switcher">${FC_TREATMENTS.map((x) =>
          `<button type="button" class="fc-switch ${x.name === fcTreatment ? "active" : ""}" data-fc-treat="${esc(x.name)}">${esc(x.label)}</button>${x !== FC_TREATMENTS[FC_TREATMENTS.length - 1] ? '<span class="fc-dot">\u2022</span>' : ""}`).join("")}</div>
        <p class="fc-sub">${esc(cfg.sub)}</p>
        <p class="fc-viewall"><a href="/featured-${slug}">View all featured clinics \u2192</a></p>
        ${geoNote ? `<p class="fc-geo">${geoNote}</p>` : ""}
        <div class="fc-rail${fcDir > 0 ? " fc--fwd" : fcDir < 0 ? " fc--back" : ""}">
          ${(() => { const w = Math.min(n % 2 === 1 ? n : n - 1, 7); const half = Math.floor(w / 2); const ks = []; for (let k = -half; k <= half; k++) ks.push(k); return ks.map((k) => cardHTML(at(k), k)).join(""); })()}
        </div>
        <p class="fc-pager"><button type="button" data-fc-nav="-1" aria-label="Previous clinic">\u2039</button><b>${fcIndex + 1} / ${n}</b><button type="button" data-fc-nav="1" aria-label="Next clinic">\u203a</button></p>
      </div>
    </div>`;
    fcDir = 0;
    if (!root.dataset.wired) {
      root.dataset.wired = "1";
      root.addEventListener("click", (e) => {
        if (e.target.closest(".fav-btn")) { setTimeout(() => renderFeaturedClinics(), 0); return; }
        const sw = e.target.closest("[data-fc-treat]");
        if (sw) { fcTreatment = sw.dataset.fcTreat; fcIndex = 0; renderFeaturedClinics(); return; }
        const nav = e.target.closest("[data-fc-nav]");
        if (nav) { fcDir = Math.sign(parseInt(nav.dataset.fcNav, 10)); fcIndex += parseInt(nav.dataset.fcNav, 10); renderFeaturedClinics(); return; }
        const jump = e.target.closest("[data-fc-jump]");
        if (jump) { fcDir = Math.sign(parseInt(jump.dataset.fcJump, 10)); fcIndex += parseInt(jump.dataset.fcJump, 10); renderFeaturedClinics(); }
      });
    }
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
      const inner = `<span class="resource-tag">${esc(r.tag || "Guide")}</span>` +
        `<span class="resource-main"><span class="resource-title">${esc(r.title)}</span>` +
        (r.desc ? `<span class="resource-desc">${esc(r.desc)}</span>` : "") + `</span>` +
        (r.url ? `<span class="resource-arrow" aria-hidden="true">→</span>` : "");
      return r.url
        ? `<li><a class="resource-row" href="${esc(r.url)}">${inner}</a></li>`
        : `<li><div class="resource-row is-static">${inner}</div></li>`;
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
      "Performing Arts Physiotherapy": { clinics: (typeof PERFORMINGARTS_CLINICS !== "undefined" ? PERFORMINGARTS_CLINICS : []).filter(inDirectory) },
      "Psychoeducational Assessments": { clinics: (typeof PSYCHASSESS_CLINICS !== "undefined" ? PSYCHASSESS_CLINICS : []).filter(inDirectory) },
      "Vestibular Rehabilitation": { clinics: (typeof VESTIBULAR_CLINICS !== "undefined" ? VESTIBULAR_CLINICS : []).filter(inDirectory) },
      "Pressotherapy": { clinics: (typeof PRESSOTHERAPY_CLINICS !== "undefined" ? PRESSOTHERAPY_CLINICS : []).filter(inDirectory) },
      "Stuttering Therapy": { clinics: (typeof STUTTER_CLINICS !== "undefined" ? STUTTER_CLINICS : []).filter(inDirectory) },
    };
    const entry = map[name] || { clinics: [] };
    const t = TREATMENTS.find((x) => x.name === name) || {};
    /* Cleaned at the source (Leon, 2026-11-01 rescan): raw arrays carry
       holes and the odd duplicate, which inflated every displayed
       count. All consumers get real, unique clinics. */
    const seenKeys = new Set();
    const cleanClinics = (entry.clinics || []).filter(Boolean).filter((c) => {
      const k = `${(c.name || "").toLowerCase()}|${(c.city || "").toLowerCase()}`;
      if (seenKeys.has(k)) return false;
      seenKeys.add(k);
      return true;
    });
    return {
      name: entry.display || name,
      billed: entry.billed || t.billed || "",
      desc: t.desc || "",
      detail: t.detail || "",
      image: (typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[name]) || null,
      clinics: cleanClinics,
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
    "Whitehorse": [60.7217, -135.0538], "Yellowknife": [62.4540, -114.3718],
    "Nanaimo": [49.1659, -123.9401], "Coquitlam": [49.2838, -122.7930],
    "Vernon": [50.2671, -119.2720], "Grande Prairie": [55.1707, -118.7884],
    "Sherbrooke": [45.4042, -71.8929], "Delta": [49.0848, -122.9067],
    "Cambridge": [43.3616, -80.3144], "St. Catharines": [43.1594, -79.2469],
    "Peterborough": [44.3091, -78.3197], "Brantford": [43.1394, -80.2644],
    "Greater Sudbury": [46.5221, -80.9534], "North Bay": [46.3091, -79.4608],
    "Ajax": [43.8509, -79.0204], "Collingwood": [44.5007, -80.2165],
    "Longueuil": [45.5312, -73.5185], "Airdrie": [51.2917, -114.0144],
    "North Vancouver": [49.3200, -123.0724], "Lethbridge": [49.6956, -112.8451],
    "St. Albert": [53.6334, -113.6284], "Saint John": [45.2733, -66.0633],
    "Medicine Hat": [50.0292, -110.7034], "Okotoks": [50.7255, -113.9749],
    "Sherwood Park": [53.5422, -113.2960], "Oshawa": [43.8971, -78.8658],
    "Abbotsford": [49.0504, -122.3045], "Kamloops": [50.6745, -120.3273],
    "Prince George": [53.9171, -122.7497], "Thunder Bay": [48.3809, -89.2477],
    "Dartmouth": [44.6652, -63.5676], "Brandon": [49.8484, -99.9501],
    "Sault Ste. Marie": [46.5219, -84.3461], "Chilliwack": [49.1577, -121.9513],
    "Fort McMurray": [56.7264, -111.3790], "Langley": [49.1044, -122.6604],
    "Woodstock": [43.1315, -80.7466], "Chatham-Kent": [42.3489, -82.1809],
    "Cobourg": [43.9595, -78.1673], "Orillia": [44.6082, -79.4197],
    "Niagara Falls": [43.0962, -79.0377], "White Rock": [49.0253, -122.8029],
    "Sydney": [46.1368, -60.1819], "Montréal": [45.5017, -73.5673],
    "Trois-Rivières": [46.3432, -72.5428], "Trois-Rivieres": [46.3432, -72.5428],
    "Kitchener-Waterloo": [43.4516, -80.4925], "New Westminster": [49.2057, -122.9110],
    "Mission": [49.1337, -122.3114]
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
  let _fsaTable = null;
  function fsaCoords(fsa) {
    if (!_fsaTable) {
      _fsaTable = fetch("/js/fsa-data.json")
        .then((r) => { if (!r.ok) throw new Error("fsa"); return r.json(); })
        .catch(() => ({}));
    }
    return _fsaTable.then((t) => t[fsa] || null);
  }
  function getUserCoords(postal) {
    const cleaned = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const fsa = cleaned.slice(0, 3);
    return fsaCoords(fsa).then((pt) => pt || POSTAL_REGION[cleaned[0]] || CITY_COORDS["Toronto"]);
  }
  function clinicCoords(c) {
    if (c && c.lat != null && c.lng != null) return [parseFloat(c.lat), parseFloat(c.lng)];
    return CITY_COORDS[c.city];
  }
  window.wfGeo = { CITY_COORDS, POSTAL_REGION, haversineKm, getUserCoords, clinicCoords };

  /* ---------- location: one postal code for the whole site ---------- */
  const POSTAL_KEY = "wf_postal_code";
  const wfLoc = {
    get() { try { return localStorage.getItem(POSTAL_KEY) || ""; } catch { return ""; } },
    set(v) {
      if (window.wfStoreSet) window.wfStoreSet(POSTAL_KEY, v);
      else { try { localStorage.setItem(POSTAL_KEY, v); } catch {} }
    },
    valid(v) { return /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(String(v || "").trim().toUpperCase()); },
    _coords: null,
    coords() {
      const p = this.get();
      if (!p) return Promise.resolve(null);
      if (!this._coords) this._coords = getUserCoords(p).catch(() => null);
      return this._coords;
    },
    reset() { this._coords = null; },
  };
  window.wfLoc = wfLoc;

  /* ---------- province: user-picked, site-wide ---------- */
  const PROV_KEY = "wf_province";
  const PROVINCES = [["ON", "Ontario"], ["QC", "Quebec"], ["BC", "British Columbia"], ["AB", "Alberta"], ["MB", "Manitoba"], ["SK", "Saskatchewan"], ["NS", "Nova Scotia"], ["NB", "New Brunswick"], ["NL", "Newfoundland and Labrador"], ["PE", "Prince Edward Island"], ["YT", "Yukon"], ["NT", "Northwest Territories"], ["NU", "Nunavut"]];
  const FSA_PROV = { A: "NL", B: "NS", C: "PE", E: "NB", G: "QC", H: "QC", J: "QC", K: "ON", L: "ON", M: "ON", N: "ON", P: "ON", R: "MB", S: "SK", T: "AB", V: "BC", X: "NT", Y: "YT" };
  const provName = (code) => (code === "CA" ? "Canada" : (PROVINCES.find((p) => p[0] === code) || [code, code])[1]);
  const wfProv = {
    get() { try { return localStorage.getItem(PROV_KEY) || ""; } catch { return ""; } },
    set(v) {
      if (window.wfStoreSet) window.wfStoreSet(PROV_KEY, v);
      else { try { localStorage.setItem(PROV_KEY, v); } catch {} }
    },
  };
  window.wfProv = wfProv;

  function initLocationBar() {
    if (document.getElementById("locBar")) return;
    const header = document.querySelector(".site-header");
    if (!header) return;
    const bar = document.createElement("div");
    bar.id = "locBar";
    bar.className = "loc-bar";
    header.insertAdjacentElement("afterend", bar);
    const formHTML = (val, prov) =>
      `<form class="loc-form" data-loc-form><select name="province" aria-label="Province"><option value="">Province</option><option value="CA"${prov === "CA" ? " selected" : ""}>Canada</option>${PROVINCES.map(([code, nm]) => `<option value="${code}"${code === prov ? " selected" : ""}>${nm}</option>`).join("")}</select><input name="postal" placeholder="Postal code" autocomplete="postal-code" aria-label="Postal code" value="${esc(val || "")}"><button class="btn btn--primary btn--sm" type="submit">Set location</button></form>`;
    /* Three states: no postal code -> full bottom banner with the
       form; postal saved -> collapsed to a floating pill in the
       bottom-right corner; editing (pill tapped) -> banner reopens
       with the form so the code can be changed. */
    let editing = false;
    const render = () => {
      const p = wfLoc.get();
      const prov = wfProv.get();
      bar.classList.remove("loc-away");
      if ((p || prov) && !editing) {
        bar.classList.add("is-pill");
        document.body.classList.remove("has-loc-banner");
        const label = prov === "CA" && !p ? "Canada" : [prov === "CA" ? "" : prov, p ? p.toUpperCase() : ""].filter(Boolean).join(" · ");
        bar.innerHTML = `<button type="button" class="loc-pill" data-loc-edit aria-label="Your location is ${esc(label)}. Tap to change it">📍 ${esc(label)}</button>`;
      } else {
        bar.classList.remove("is-pill");
        document.body.classList.add("has-loc-banner");
        bar.innerHTML = editing
          ? `<div class="wrap loc-bar-in"><span>📍 Your location</span>${formHTML(p, prov)}<button type="button" class="loc-cancel" data-loc-cancel aria-label="Cancel">✕</button></div>`
          : `<div class="wrap loc-bar-in"><span>📍 See clinics near you</span>${formHTML("", "")}</div>`;
      }
    };
    render();
    bar.addEventListener("click", (e) => {
      if (e.target.closest("[data-loc-cancel]")) { editing = false; render(); return; }
      if (!e.target.closest("[data-loc-edit]")) return;
      editing = true; render();
      const inp = bar.querySelector("input");
      if (inp) { inp.focus(); inp.select(); }
    });
    bar.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-loc-form]"); if (!form) return;
      e.preventDefault();
      const input = form.querySelector("input[name=postal]");
      const sel = form.querySelector("select[name=province]");
      const v = (input.value || "").trim().toUpperCase();
      let prov = sel ? sel.value : "";
      if (v && !wfLoc.valid(v)) { input.focus(); return; }
      if (!v && !prov) { if (sel) sel.focus(); return; }
      if (prov === "CA" && !v) {
        wfLoc.set(""); wfLoc.reset(); wfProv.set("CA");
        editing = false; render();
        window.dispatchEvent(new CustomEvent("wf:location"));
        return;
      }
      if (prov === "CA") prov = "";
      if (v) {
        wfLoc.set(v); wfLoc.reset();
        if (!prov) prov = FSA_PROV[v[0]] || "";
      }
      if (prov) wfProv.set(prov);
      editing = false; render();
      window.dispatchEvent(new CustomEvent("wf:location"));
    });
    window.addEventListener("wf:location", render);
    /* The banner slides away while the page is scrolling and comes
       back once scrolling stops. Never hide it mid-edit or while it
       has keyboard focus. */
    let scrollTimer = null;
    window.addEventListener("scroll", () => {
      if (editing || bar.contains(document.activeElement)) return;
      bar.classList.add("loc-away");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => bar.classList.remove("loc-away"), 650);
    }, { passive: true });
  }

  /* Clinics per treatment with distances from the saved postal code.
     Returns { key, pt, byTreatment: { name: [{c, d}] sorted by d } } or null. */
  let _nearCache = null;
  function nearData() {
    const p = wfLoc.get();
    if (!p || typeof TREATMENTS === "undefined") return Promise.resolve(null);
    if (_nearCache && _nearCache.key === p) return Promise.resolve(_nearCache);
    return wfLoc.coords().then((pt) => {
      if (!pt) return null;
      const byTreatment = {};
      TREATMENTS.forEach((t) => {
        const g = gtaDataFor(t.name);
        byTreatment[t.name] = (g ? g.clinics : []).map((c) => {
          const cc = clinicCoords(c);
          return { c, d: cc ? haversineKm(pt, cc) : Infinity };
        }).sort((a, b) => a.d - b.d);
      });
      _nearCache = { key: p, pt, byTreatment };
      return _nearCache;
    });
  }
  window.wfNearData = nearData;

  const NEAR_RADIUS_KM = 25;
  function nearRowHTML(t, meta) {
    const saved = getFavs().includes(t.name);
    return `<article class="near-row">
      <div class="near-main"><h4>${esc(t.name)}</h4><p class="near-meta">Billed as ${esc(t.billed)} · ${esc(meta)}</p></div>
      <button class="fav-btn fav-btn--inline ${saved ? "saved" : ""}" data-fav="${esc(t.name)}" aria-label="Save ${esc(t.name)}" aria-pressed="${saved}">${HEART}</button>
    </article>`;
  }

  function stampTreatmentCards(nd) {
    $$(".treatment-card").forEach((card) => {
      const list = (nd && nd.byTreatment[card.dataset.name]) || [];
      const slot = card.querySelector("[data-near]");
      if (slot) {
        const n = list.filter((x) => x.d <= NEAR_RADIUS_KM).length;
        slot.textContent = n ? `${n} clinic${n === 1 ? "" : "s"} within ${NEAR_RADIUS_KM} km of you` : "";
        slot.hidden = !n;
      }
      const tcWrap = card.querySelector("[data-tc-clinics]");
      if (tcWrap && list.length) {
        const near = isFinite(list[0].d) && list[0].d <= 100;
        tcWrap.innerHTML = tcClinicsHTML(list.slice(0, 4), list.length, treatmentSlug(card.dataset.name), near);
      }
    });
  }


  /* ---------- recommendations ---------- */
  function computeRecommendations(nd) {
    const favs = getFavs();
    const favTreatments = TREATMENTS.filter((t) => favs.includes(t.name));
    const favCats = new Set();
    favTreatments.forEach((t) => t.categories.forEach((c) => favCats.add(c)));
    const recs = [];
    TREATMENTS.forEach((t) => {
      if (favs.includes(t.name)) return;
      let score = 0, reason = "";
      const shared = t.categories.find((c) => favCats.has(c));
      if (shared && favTreatments.length) {
        const pair = favTreatments.find((ft) => ft.categories.includes(shared));
        score += 100;
        reason = `Pairs with ${pair.name}`;
      }
      const total = (gtaDataFor(t.name) || { clinics: [] }).clinics.length;
      if (nd) {
        const within = (nd.byTreatment[t.name] || []).filter((x) => x.d <= NEAR_RADIUS_KM).length;
        if (within) {
          score += within;
          if (!reason) reason = `${within} clinic${within === 1 ? "" : "s"} within ${NEAR_RADIUS_KM} km of you`;
        }
      }
      score += Math.min(total, 50) / 10;
      if (!reason) reason = `${total} clinics across Canada`;
      recs.push({ t, score, reason });
    });
    return recs.sort((a, b) => b.score - a.score).slice(0, 6);
  }
  window.wfRecommendations = () =>
    (wfLoc.get() ? nearData() : Promise.resolve(null)).then((nd) => computeRecommendations(nd));

  function renderRecommendations() {
    const grid = $("#recGrid"); if (!grid || typeof TREATMENTS === "undefined") return;
    window.wfRecommendations().then((recs) => {
      grid.innerHTML = recs.map((r) => nearRowHTML(r.t, r.reason)).join("");
    });
  }

  function renderGoalChips() {
    const el = $("#goalChips"); if (!el || typeof GOAL_MAP === "undefined") return;
    el.innerHTML = Object.keys(GOAL_MAP).map((g) =>
      `<button type="button" class="goal-chip" data-goal="${esc(g)}" aria-pressed="false">${esc(g)}</button>`
    ).join("");
    el.addEventListener("click", (e) => {
      const chip = e.target.closest(".goal-chip"); if (!chip) return;
      window.wfDirectory.setGoal(chip.dataset.goal);
      const dir = document.getElementById("directory");
      if (dir) dir.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }


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
    push(typeof PERFORMINGARTS_CLINICS !== "undefined" ? PERFORMINGARTS_CLINICS : [], "Performing Arts Physiotherapy");
    push(typeof PSYCHASSESS_CLINICS !== "undefined" ? PSYCHASSESS_CLINICS : [], "Psychoeducational Assessments");
    push(typeof VESTIBULAR_CLINICS !== "undefined" ? VESTIBULAR_CLINICS : [], "Vestibular Rehabilitation");
    push(typeof PRESSOTHERAPY_CLINICS !== "undefined" ? PRESSOTHERAPY_CLINICS : [], "Pressotherapy");
    push(typeof STUTTER_CLINICS !== "undefined" ? STUTTER_CLINICS : [], "Stuttering Therapy");
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
    if (!clinics.length) return `<p class="gta-empty">No clinics listed yet. <a href="/submit">Suggest a clinic</a></p>`;
    return `<ul class="gta-list">${clinics.map((c) =>
      `<li>${c.web ? `<a href="${esc(c.web)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}<span>${esc(c.city || "")}</span></li>`
    ).join("")}</ul>`;
  }

  /* Rich clinic cards for the per-treatment minipages:
     save icon, website, email (prefilled), booking link. */
  function clinicCardsHTML(clinics, serviceName, wrap) {
    if (!clinics.length) return `<p class="gta-empty">No clinics listed yet. <a href="/submit">Suggest a clinic</a></p>`;
    const cards = clinics.map((c) => {
      const saved = window.wfFavs && window.wfFavs.has(c.name);
      const mailto = clinicMailto(c, serviceName || c.treatment || "wellness");
      const meta = [serviceName || c.treatment, c.city, c.postal].filter(Boolean).map(esc).join(" · ");
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

  /* ---------- Unified clinic card (v4 design) for treatment +
     featured minipages. Data: data.js clinic objects + CLINIC_MEDIA,
     enriched by js/clinic-extra.js (verified database export) when
     present. The legacy clinicCardsHTML above stays for /saved. */
  const NC_TZ = { BC: "America/Vancouver", AB: "America/Edmonton", SK: "America/Regina", MB: "America/Winnipeg", ON: "America/Toronto", QC: "America/Toronto", NB: "America/Moncton", NS: "America/Halifax", PE: "America/Halifax", NL: "America/St_Johns", YT: "America/Whitehorse", NT: "America/Yellowknife", NU: "America/Iqaluit" };
  const NC_DAYKEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const NC_DAYLBL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  const NC_WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  function ncParseRanges(str) {
    if (!str) return null;
    const out = [];
    const parts = String(str).split(",");
    for (const part of parts) {
      const m = part.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[-–—]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
      if (!m) return null;
      const toMin = (h, mi, ap) => { let hh = parseInt(h, 10) % 12; if (/pm/i.test(ap)) hh += 12; return hh * 60 + parseInt(mi || "0", 10); };
      out.push([toMin(m[1], m[2], m[3]), toMin(m[4], m[5], m[6])]);
    }
    return out.length ? out : null;
  }

  function ncTodayState(hours, prov) {
    if (!hours) return null;
    const tz = NC_TZ[prov || "ON"] || "America/Toronto";
    let now;
    try { now = new Date(new Date().toLocaleString("en-US", { timeZone: tz })); }
    catch (e) { now = new Date(); }
    const key = NC_DAYKEYS[now.getDay()];
    const todayStr = hours[key] || null;
    const ranges = ncParseRanges(todayStr);
    let open = null;
    if (ranges) {
      const mins = now.getHours() * 60 + now.getMinutes();
      open = ranges.some((r) => mins >= r[0] && mins < r[1]);
    } else if (todayStr) { open = null; }
    return { key, label: todayStr, open, closed: !todayStr };
  }

  function ncFmtHours(str) {
    return String(str).replace(/\s*-\s*/g, " – ").replace(/(\d)(AM|PM)/gi, "$1 $2");
  }

  function ncCardHTML(c, g) {
    const T = g.name;
    const prov = c.prov || "ON";
    const key = (c.name + "|" + c.city).toLowerCase();
    const X = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.x[key]) || null;
    const pair = X && X.pairs ? X.pairs[T] : null;
    const media = (typeof CLINIC_MEDIA !== "undefined" && CLINIC_MEDIA[c.name]) || {};
    const saved = window.wfFavs && window.wfFavs.has(c.name);
    const fav = `<button class="fav-btn nc-fav ${saved ? "saved" : ""}" data-fav="${esc(c.name)}" aria-label="Save ${esc(c.name)}" aria-pressed="${saved}">${HEART}</button>`;

    /* gallery */
    const galSet = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.gal[c.name]) || null;
    const photos = galSet || (media.img ? [media.img] : []);
    let gallery;
    if (photos.length) {
      const dots = photos.length > 1 ? `<div class="nc-dots">${photos.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>` : "";
      const arrows = photos.length > 1 ? `<button type="button" class="nc-arrow prev" aria-label="Previous photo">‹</button><button type="button" class="nc-arrow next" aria-label="Next photo">›</button>` : "";
      gallery = `<div class="nc-gallery" data-gal data-idx="0"><div class="nc-track">${photos.map((p) => `<img src="${esc(p)}" alt="${esc(c.name)}" loading="lazy">`).join("")}</div>${arrows}${dots}${fav}</div>`;
    } else {
      gallery = `<div class="nc-gallery"><div class="nc-tile"><span>${esc((c.name || "W").trim().charAt(0).toUpperCase())}</span></div>${fav}</div>`;
    }

    /* rating */
    let rating = "";
    if (media.rating && media.rating[0]) rating = `<span class="nc-rating"><span class="nc-star">★</span> ${Number(media.rating[0]).toFixed(1)} <span class="nc-cnt">(${media.rating[1]})</span></span>`;
    else if (X && X.r) rating = `<span class="nc-rating"><span class="nc-star">★</span> ${Number(X.r).toFixed(1)} <span class="nc-cnt">(${X.n || 0})</span></span>`;
    else rating = `<span class="nc-rating"></span>`;

    /* address (+ distance when sorted by it) */
    let addr = "";
    if (X && X.a) addr = `${X.a}, ${c.city}, ${prov}${X.po ? " " + X.po : ""}`;
    else if (c.loc) addr = c.loc;
    else addr = `${c.city}, ${prov}`;
    if (c.distKm != null && isFinite(c.distKm)) addr += ` · ≈ ${Math.round(c.distKm)} km away`;

    /* description: treatment + billed-as lead, then the hook */
    const billed = (pair && pair.ba) || g.billed || "";
    const hook = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.lead[c.name] && CLINIC_EXTRA.lead[c.name][T]) || "";
    let desc;
    if (hook && billed) desc = `${T} billed as ${billed} — ${hook}`;
    else if (hook) desc = `${T} — ${hook}`;
    else if (billed) desc = `${T} billed as ${billed}${pair && pair.pr ? ` with ${pair.pr}` : ""} in ${c.city}.`;
    else desc = `${T} in ${c.city}, ${prov}.`;

    /* price + tier note */
    let price = "";
    if (media.priceByTreatment && media.priceByTreatment[T]) price = media.priceByTreatment[T];
    else if (pair && pair.p) price = pair.p;
    else if (media.price) price = media.price;
    else if (c.price && c.price.indexOf("$") > -1) price = c.price;
    let priceHTML, noteHTML = "";
    if (price) {
      priceHTML = `<p class="nc-price">${esc(price)}</p>`;
      if (pair && pair.t === "booking") noteHTML = `<span class="nc-verified"><i>✓</i> Verified on booking page</span>`;
      else if (pair && pair.t === "website") noteHTML = `<span class="nc-price-note">Price from clinic website</span>`;
      else if (pair && pair.t === "review") noteHTML = `<span class="nc-price-note">Price from a recent review</span>`;
    } else {
      priceHTML = `<p class="nc-price"><span class="nc-noprice">Price on request</span></p>`;
    }

    /* direct billing: featured curation wins, else the verified record */
    const dbv = media.db || (X && X.db) || "";
    const dbPill = dbv === "yes"
      ? `<span class="nc-db nc-db-yes">✓ Direct billing available</span>`
      : dbv === "no"
        ? `<span class="nc-db nc-db-no">No direct billing — pay &amp; claim with receipt</span>`
        : `<span class="nc-db nc-db-unk">Direct billing not confirmed — ask the clinic</span>`;

    /* hours: today line + expandable week */
    let todayHTML, weekHTML = "";
    if (X && X.h) {
      const st = ncTodayState(X.h, prov);
      const openBit = st.closed ? `<span class="nc-closed-txt">Closed today</span>`
        : st.open === true ? `<span class="nc-open-dot"></span><span class="nc-open-txt">Open now</span> · <b>${esc(ncFmtHours(st.label))}</b>`
        : st.open === false ? `<span class="nc-closed-dot"></span><span class="nc-closed-txt">Closed now</span> · <b>${esc(ncFmtHours(st.label))}</b>`
        : `Today <b>${esc(ncFmtHours(st.label))}</b>`;
      todayHTML = `<p class="nc-today">${openBit}<button type="button" class="nc-more" data-nc-hours>See all hours ▾</button></p>`;
      weekHTML = `<div class="nc-week" hidden>${NC_WEEK.map((d) => {
        const v = X.h[d];
        return `<div class="nc-hrow${st.key === d ? " today" : ""}"><span>${NC_DAYLBL[d]}</span><span>${v ? esc(ncFmtHours(v)) : '<span class="nc-closed">Closed</span>'}</span></div>`;
      }).join("")}</div>`;
    } else {
      todayHTML = `<p class="nc-today"><span class="nc-hours-na">Hours not listed — check the clinic’s website</span></p>`;
    }

    /* actions */
    const book = media.link || c.book || (X && X.b) || (pair && pair.l) || "";
    const web = c.web || (X && X.w) || "";
    const actions = `<div class="nc-actions">${book ? `<a class="nc-btn nc-btn-book" href="${esc(book)}" target="_blank" rel="noopener">Book appointment</a>` : ""}${web ? `<a class="nc-btn nc-btn-web" href="${esc(web)}" target="_blank" rel="noopener">Website ↗</a>` : ""}</div>`;

    return `<article class="nc-card">
      ${gallery}
      <div class="nc-main">
        <div class="nc-head"><h4 class="nc-name">${esc(c.name)}</h4>${rating}</div>
        <p class="nc-addr"><svg width="12" height="12" viewBox="0 0 24 24" fill="#6E8F7A" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span>${esc(addr)}</span></p>
        <p class="nc-desc">${esc(desc)}</p>
        ${priceHTML}
        <p class="nc-note">${noteHTML}</p>
        <div class="nc-dbrow">${dbPill}</div>
        ${todayHTML}
        ${weekHTML}
        ${actions}
      </div>
    </article>`;
  }

  function ncCardsHTML(clinics, g, wrap) {
    if (!clinics.length) return `<p class="gta-empty">No clinics listed yet. <a href="/submit">Suggest a clinic</a></p>`;
    const cards = clinics.map((c) => ncCardHTML(c, g)).join("");
    return wrap === false ? cards : `<div class="nc-grid">${cards}</div>`;
  }

  /* Gallery arrows + hours expander for the unified cards (delegated). */
  function initNcCards() {
    document.addEventListener("click", (e) => {
      const arrow = e.target.closest(".nc-arrow");
      if (arrow) {
        const gal = arrow.closest("[data-gal]");
        if (!gal) return;
        const track = gal.querySelector(".nc-track");
        const dots = [...gal.querySelectorAll(".nc-dots i")];
        const n = dots.length || track.children.length;
        let idx = parseInt(gal.dataset.idx || "0", 10);
        idx = (((idx + (arrow.classList.contains("next") ? 1 : -1)) % n) + n) % n;
        gal.dataset.idx = idx;
        track.style.transform = `translateX(${-idx * 100}%)`;
        dots.forEach((el, i) => el.classList.toggle("on", i === idx));
        return;
      }
      const more = e.target.closest("[data-nc-hours]");
      if (more) {
        const main = more.closest(".nc-main");
        const week = main && main.querySelector(".nc-week");
        if (!week) return;
        const open = week.hasAttribute("hidden");
        if (open) { week.removeAttribute("hidden"); more.textContent = "Hide hours ▴"; }
        else { week.setAttribute("hidden", ""); more.textContent = "See all hours ▾"; }
      }
    });
  }

  function renderGtaDirectory() {
    const grid = $("#gtaGrid"); if (!grid || typeof TREATMENTS === "undefined") return;
    const names = TREATMENTS.map((t) => t.name);
    grid.innerHTML = `<div class="gta-links">` + names.map((name) => {
      const g = gtaDataFor(name); if (!g) return "";
      return `<a class="gta-link" href="/clinics-${treatmentSlug(name)}">
        <span class="gta-link-name">${esc(g.name)}</span>
        <span class="gta-link-meta"><span class="gta-link-meta-text">${g.billed ? `Billed as ${esc(g.billed)} · ` : ""}${g.clinics.length} clinic${g.clinics.length === 1 ? "" : "s"}</span><span class="gta-arrow" aria-hidden="true">→</span></span>
      </a>`;
    }).join("") + `</div>`;
  }

  /* Per-treatment minipage: <body data-treatment="Clinical Pilates"> */
  function renderTreatmentPage() {
    const name = document.body && document.body.dataset ? document.body.dataset.treatment : "";
    if (!name) return;
    const g0 = gtaDataFor(name); if (!g0) return;
    /* Featured minipage (body[data-featured]): same shell and location
       scoping as the treatment page, but the list is the curated featured
       set for this treatment (photos-only, same pool as the homepage
       stage) instead of the full directory. */
    const isFeat = !!(document.body.dataset && document.body.dataset.featured);
    let g = g0;
    if (isFeat) {
      const fc = fcFeatured(name);
      const withPhoto = fc.featured.filter((c) => typeof CLINIC_MEDIA !== "undefined" && CLINIC_MEDIA[c.name] && CLINIC_MEDIA[c.name].img);
      g = Object.assign({}, g0, { clinics: withPhoto.length ? withPhoto : fc.featured });
    }
    const head = $("#tpHead"), list = $("#tpList");
    const PROV_NAMES = { ON: "Ontario", BC: "British Columbia", AB: "Alberta", SK: "Saskatchewan", MB: "Manitoba", QC: "Quebec", NB: "New Brunswick", NS: "Nova Scotia", PE: "Prince Edward Island", NL: "Newfoundland and Labrador", YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut" };
    if (head) {
      const lede = isFeat ? ((FC_TREATMENTS.find((x) => x.name === name) || {}).sub || g.desc) : g.desc;
      head.innerHTML =
        `<p class="eyebrow"><a href="/">WellFinder</a> · ${isFeat ? "Featured clinics" : "Canada directory"}</p>
         <h1>${isFeat ? `Featured ${esc(g.name)} clinics` : `${esc(g.name)} clinics across Canada`}</h1>
         ${g.billed ? `<p class="tp-billed">Billed as ${esc(g.billed)}</p>` : ""}
         ${lede ? `<p class="lede">${esc(lede)}</p>` : ""}
         ${g.image ? `<figure class="tp-fig"><img src="${esc(g.image.src)}" alt="${esc(g.name)}" loading="lazy"><figcaption>Photo: <a href="${esc(g.image.url)}" target="_blank" rel="noopener">${esc(g.image.credit)}</a></figcaption></figure>` : ""}`;
      document.title = isFeat ? `Featured ${g.name} clinics — WellFinder` : `${g.name} clinics across Canada — WellFinder`;
    }
    if (list) {
      const provs = [...new Set(g.clinics.map((c) => c.prov || "ON"))].sort();
      const provCount = (p) => g.clinics.filter((c) => (c.prov || "ON") === p).length;
      const PAGE_SIZE = 12;
      let userPt = null;
      let nearSet = null;
      let scope = "";
      let userPicked = false;
      const computeNear = () => {
        if (!userPt) { nearSet = null; return; }
        nearSet = g.clinics.filter((c) => {
          const cc = clinicCoords(c);
          return cc && haversineKm(userPt, cc) <= 50;
        });
      };
      const defaultScope = () => {
        if (wfLoc.get() && nearSet && nearSet.length) return "near";
        const pv = window.wfProv ? wfProv.get() : "";
        if (pv && provCount(pv)) return pv;
        return "";
      };
      const renderList = (sc) => {
        scope = sc || "";
        if (scope === "near" && !nearSet) scope = "";
        let cs;
        let where;
        if (scope === "near" && nearSet) { cs = nearSet.slice(); where = `near ${esc((wfLoc.get() || "").toUpperCase())}`; }
        else if (scope) { cs = g.clinics.filter((c) => (c.prov || "ON") === scope); where = `in ${esc(PROV_NAMES[scope] || scope)}`; }
        else { cs = g.clinics.slice(); where = "across Canada"; }
        if (userPt) {
          cs = cs.map((c) => {
            const cc2 = clinicCoords(c);
            return Object.assign({}, c, { distKm: cc2 ? haversineKm(userPt, cc2) : Infinity });
          }).sort((a, b) => a.distKm - b.distKm);
        }
        const nearOpt = (wfLoc.get() && nearSet && nearSet.length)
          ? `<option value="near">Near ${esc(wfLoc.get().toUpperCase())} (${nearSet.length})</option>` : "";
        const filter = (provs.length > 1 || nearOpt)
          ? `<label class="prov-filter">Show <select id="provSelect">${nearOpt}<option value="">All of Canada (${g.clinics.length})</option>${provs.map((p) => `<option value="${p}">${PROV_NAMES[p] || p} (${provCount(p)})</option>`).join("")}</select></label>`
          : "";
        const sortedNote = (userPt && scope !== "near") ? ` <span class="tp-sorted">Sorted by distance from ${esc(wfLoc.get().toUpperCase())} \u00b7 approximate</span>` : "";
        const first = cs.slice(0, PAGE_SIZE);
        const rest = cs.slice(PAGE_SIZE);
        list.innerHTML = `<div class="tp-list-head"><h2>${cs.length} clinic${cs.length === 1 ? "" : "s"} ${where}${sortedNote}</h2>${filter}</div>`
          + ncCardsHTML(first, g)
          + (rest.length ? `<div class="nc-grid see-more-body" hidden>${ncCardsHTML(rest, g, false)}</div><button type="button" class="btn btn--ghost see-more-btn" data-see-more>See all ${cs.length} clinics</button>` : "");
        const sel = document.getElementById("provSelect");
        if (sel) { sel.value = scope; sel.addEventListener("change", () => { userPicked = true; renderList(sel.value); }); }
        const moreBtn = list.querySelector("[data-see-more]");
        if (moreBtn) moreBtn.addEventListener("click", () => {
          const body = list.querySelector(".see-more-body");
          const open = body.hidden;
          body.hidden = !open;
          moreBtn.textContent = open ? "Show less" : `See all ${cs.length} clinics`;
        });
      };
      renderList(defaultScope());
      const applyGeo = () => {
        if (!wfLoc.get()) { userPt = null; nearSet = null; if (!userPicked) renderList(defaultScope()); else renderList(scope); return; }
        wfLoc.coords().then((pt) => {
          if (pt) { userPt = pt; computeNear(); if (!userPicked) renderList(defaultScope()); else renderList(scope); }
        });
      };
      applyGeo();
      window.addEventListener("wf:location", () => { userPicked = false; applyGeo(); });
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
    if (window.__wfBooted) return;
    window.__wfBooted = true;
    initNav();
    initShare();
    initNewsletter();
    updateFavCount();
    initLocationBar();
    renderInsurers();
    renderWhy();
    renderClaimExtra();
    renderFeaturedClinics();
    if (wfLoc.get()) wfLoc.coords().then((pt) => { if (pt) { fcUserPt = pt; renderFeaturedClinics(); renderDirectory(); } });
    window.addEventListener("wf:location", () => {
      fcUserPt = null;
      if (wfLoc.get()) wfLoc.coords().then((pt) => { fcUserPt = pt; renderFeaturedClinics(); renderDirectory(); });
      else { renderFeaturedClinics(); renderDirectory(); }
    });
    renderDirectory();
    renderGoalChips();
    renderRecommendations();
    if (wfLoc.get()) nearData().then((nd) => { if (nd) stampTreatmentCards(nd); });
    renderResources();
    renderGtaDirectory();
    renderTreatmentPage();
    initGlobalFavs();
    initNcCards();
    window.addEventListener("wf:location", () => {
        renderRecommendations();
      if (typeof TREATMENTS !== "undefined") {
        nearData().then((nd) => { if (nd) stampTreatmentCards(nd); });
      }
    });
    // Tagline word rotator (homepage): cycles the guideline word list,
    // each word in its own colour, rolling up into place.
    var fundWord = document.getElementById("fundWord");
    if (fundWord && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var FUND_WORDS = [
        ["hobbies", "#191919", "#FF9E2C"],
        ["skincare", "#191919", "#FF6FAE"],
        ["self-care", "#191919", "#9D6BFF"],
        ["fitness", "#191919", "#3FA7F5"],
        ["mental wellness", "#191919", "#2EC4B6"],
        ["recovery", "#191919", "#FF6B6B"],
        ["personal growth", "#191919", "#FFCE45"]
      ];
      function fundHighlight(i) {
        return "linear-gradient(180deg, transparent 8%, " + FUND_WORDS[i][2] + " 8%, " + FUND_WORDS[i][2] + " 92%, transparent 92%)";
      }
      fundWord.style.backgroundImage = fundHighlight(0);
      var fundIdx = 0;
      setInterval(function () {
        fundIdx = (fundIdx + 1) % FUND_WORDS.length;
        fundWord.classList.remove("roll");
        void fundWord.offsetWidth; // restart the roll animation
        fundWord.textContent = FUND_WORDS[fundIdx][0];
        fundWord.style.color = FUND_WORDS[fundIdx][1];
        fundWord.style.backgroundImage = fundHighlight(fundIdx);
        fundWord.classList.add("roll");
      }, 2200);
    }
    // set year in footers
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  });
})();
