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

  function renderWhy() {
    const grid = $("#whyGrid"); if (!grid) return;
    const claims = [
      { name: "Chi", treatment: "Clinical Pilates", sharing: "", billed: "Physiotherapy", covered: "100% covered", price: "$100 per 45 min session" },
      { name: "Leon", treatment: "Facial massage", sharing: "", billed: "Osteopathy", covered: "100% covered", price: "$120 per session" },
      { name: "Celine", treatment: "IM vitamin therapy", sharing: "", billed: "Naturopath", covered: "100% covered", price: "$50-80 per session" },
      { name: "Chun Ho", treatment: "Neurofeedback", sharing: "", billed: "Psychology", covered: "100% covered", price: "$180 per session" },
      { name: "Daniel", treatment: "Singing voice therapy", sharing: "", billed: "Speech therapy", covered: "100% covered", price: "$160 per 45 min session" },
    ];
    const card = (c) =>
      `<div class="claim-card">
         <div class="claim-top"><span class="claim-name">${esc(c.name)}</span><span class="claim-side">${c.covered ? `<span class="claim-covered">${esc(c.covered)}</span>` : ""}<img class="claim-logo" src="assets/logos/manulife.svg" alt="Manulife"></span></div>
         <p class="claim-what">${esc(c.treatment)}</p>
         <p class="claim-billed">Billed as ${esc(c.billed)}</p>
         ${c.sharing ? `<p class="claim-sharing">&ldquo;${esc(c.sharing)}&rdquo;</p>` : ""}
         ${c.price ? `<p class="claim-price">${esc(c.price)}</p>` : ""}
       </div>`;
    const half = claims.map(card).join("");
    grid.innerHTML = `<div class="why-track">${half}${half}</div>`;
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
    "Mental Performance Coaching": "Personal growth"
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
  const FS_MOD_ORDER = ["Physiotherapy", "Naturopathy", "Chiropractic", "Speech Therapy", "Acupuncture", "Massage Therapy", "Psychology", "Psychotherapy", "Osteopathy", "Dental", "Dietitian"];
  let fsView = "All";

  const fsImg = (t) => ((typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[t.name]) || {}).src || `/assets/treatments/${treatmentSlug(t.name)}.jpg`;
  const fsDesc = (t) => (t.desc || "").replace(/\s*\*Coverage varies by provider\.?/g, "").trim();
  const fsBilled = (t) => (t.billed || "").replace(/\*+$/, "");
  const fsClinics = (t) => (gtaDataFor(t.name) || { clinics: [] }).clinics.length;
  const fsClinicsLink = (t) => `<a class="fs-clinics" href="/clinics-${treatmentSlug(t.name)}">${fsClinics(t)} clinic${fsClinics(t) === 1 ? "" : "s"} \u2192</a>`;

  function fsCardHTML(t) {
    return `<article class="fs-card">
      <img src="${esc(fsImg(t))}" alt="${esc(t.name)}" loading="lazy">
      <h3>${esc(t.name)} <span class="fs-arr">\u2192</span></h3>
      <p class="fs-desc">${esc(fsDesc(t))}</p>
      <p class="fs-meta">Billed as ${esc(fsBilled(t))}</p>
      ${fsClinicsLink(t)}
    </article>`;
  }
  function fsMiniHTML(t) {
    return `<article class="fs-mini">
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
    root.innerHTML = `
      <div class="fs-tabbar"><span class="fs-chev">\u2039</span>
        ${["All", ...FUND_CATS.map(([w]) => w)].map((w) =>
          `<button type="button" class="fs-tab ${w === fsView ? "active" : ""}" data-fsview="${esc(w)}">${esc(w)}</button>`).join("")}
        <span class="fs-chev">\u203a</span></div>
      <div class="fs-stem"></div>
      <h2 class="fs-title">${esc(fsView === "All" ? "All treatments" : fsView)}</h2>
      <p class="fs-count">${inView.length} treatment${inView.length === 1 ? "" : "s"}</p>
      <div class="fs-rule"><span>Featured treatments</span></div>
      <div class="fs-grid">${featured.map(fsCardHTML).join("")}</div>
      ${mods.map((g, i) => `
      <div class="fs-sect ${i === 0 ? "open" : ""}">
        <button type="button" class="fs-sect-head" aria-expanded="${i === 0 ? "true" : "false"}"><b>${esc(g.m)}</b><span>${g.list.length} treatment${g.list.length === 1 ? "" : "s"} \u00b7 <em>${i === 0 ? "Hide \u25b4" : "Show \u25be"}</em></span></button>
        <div class="fs-minigrid">${g.list.map(fsMiniHTML).join("")}</div>
      </div>`).join("")}`;
    if (!root.dataset.wired) {
      root.dataset.wired = "1";
      root.addEventListener("click", (e) => {
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
    { name: "Microneedling", label: "Microneedling", sub: "Collagen-focused skin treatments paired with naturopathic care, billed as naturopathy." },
  ];
  let fcTreatment = "Clinical Pilates";
  let fcIndex = 0;

  /* Curated featured sets (2026-11-01): only clinics with BOTH a price
     verified on their own booking page AND a verified Google rating
     (Places or the clinic's own Google badge/widget). Treatments
     without a curated set fall back to the notes-first selection. */
  const FC_SETS = {
    "Clinical Pilates": ["Revival Physio", "Pulse Physiotherapy", "JC Clinic", "Focus Physio + Wellness", "Treloar Physiotherapy \u2014 Cambie", "Synergy Physiotherapy and Pilates", "Pilates4Physio"],
  };
  function fcFeatured(name) {
    const all = (gtaDataFor(name) || { clinics: [] }).clinics;
    const curated = FC_SETS[name];
    if (curated) {
      const picked = curated.map((n) => all.find((c) => c.name === n)).filter(Boolean);
      if (picked.length) return { featured: picked, total: all.length };
    }
    const noted = all.filter((c) => (c.note || "").trim().length > 30);
    const rest = all.filter((c) => (c.note || "").trim().length <= 30);
    return { featured: [...noted, ...rest].slice(0, 7), total: all.length };
  }
  function renderFeaturedClinics() {
    const root = $("#fcRoot"); if (!root || typeof TREATMENTS === "undefined") return;
    const cfg = FC_TREATMENTS.find((x) => x.name === fcTreatment) || FC_TREATMENTS[1];
    const t = TREATMENTS.find((x) => x.name === fcTreatment);
    const { featured, total } = fcFeatured(fcTreatment);
    if (!featured.length) { root.innerHTML = ""; return; }
    fcIndex = ((fcIndex % featured.length) + featured.length) % featured.length;
    const n = featured.length;
    const at = (k) => featured[((fcIndex + k) % n + n) % n];
    const img = t ? fsImg(t) : "";
    const slug = treatmentSlug(fcTreatment);
    const cardHTML = (c, k) => {
      const note = (c.note || "").trim();
      const desc = note
        ? note.charAt(0).toUpperCase() + note.slice(1) + (note.endsWith(".") ? "" : ".")
        : `${c.name} offers ${fcTreatment.toLowerCase()} in ${c.city || "Canada"}.`;
      const media = (typeof CLINIC_MEDIA !== "undefined" && CLINIC_MEDIA[c.name]) || {};
      const stars = Array.isArray(media.rating)
        ? `<p class="fc-stars"><span class="fc-star-glyphs">${"\u2605".repeat(Math.round(media.rating[0]))}${"\u2606".repeat(5 - Math.round(media.rating[0]))}</span> ${media.rating[0].toFixed(1)} <span class="fc-rcount">(${media.rating[1]} Google reviews)</span></p>` : "";
      const pract = media.practitioner ? `<p class="fc-line">${esc(media.practitioner)}</p>` : "";
      const price = media.price ? `<p class="fc-line">${esc(media.price)}</p>` : "";
      const btn = k === 0
        ? `<a class="fc-btn" href="${esc(media.link || c.book || c.web || "#")}" target="_blank" rel="noopener">View clinic</a>`
        : `<span class="fc-btn">View clinic</span>`;
      return `<article class="fc-card ${k === 0 ? "fc-card--active" : "fc-card--side"}" ${k === 0 ? "" : `data-fc-jump="${k}" role="button" tabindex="0" aria-label="Show ${esc(c.name)}"`}>
            <h3>${esc(c.name)}</h3>
            <p class="fc-city">${esc(c.city || "")}${c.prov ? `, ${esc(c.prov)}` : ""}</p>
            <img src="${esc(media.img || img)}" alt="${esc(c.name)}">
            <p class="fc-desc">${esc(desc)}</p>
            ${stars}${pract}${price}
            ${btn}
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
        <p class="fc-viewall"><a href="/clinics-${slug}">View all ${total} ${esc(cfg.label)} clinics \u2192</a></p>
        <div class="fc-rail">
          ${[-3, -2, -1, 0, 1, 2, 3].map((k) => cardHTML(at(k), k)).join("")}
        </div>
        <p class="fc-pager"><button type="button" data-fc-nav="-1" aria-label="Previous clinic">\u2039</button><b>${fcIndex + 1} / ${n}</b><button type="button" data-fc-nav="1" aria-label="Next clinic">\u203a</button></p>
      </div>
    </div>`;
    if (!root.dataset.wired) {
      root.dataset.wired = "1";
      root.addEventListener("click", (e) => {
        const sw = e.target.closest("[data-fc-treat]");
        if (sw) { fcTreatment = sw.dataset.fcTreat; fcIndex = 0; renderFeaturedClinics(); return; }
        const nav = e.target.closest("[data-fc-nav]");
        if (nav) { fcIndex += parseInt(nav.dataset.fcNav, 10); renderFeaturedClinics(); return; }
        const jump = e.target.closest("[data-fc-jump]");
        if (jump) { fcIndex += parseInt(jump.dataset.fcJump, 10); renderFeaturedClinics(); }
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
  function getUserCoords(postal) {
    const cleaned = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const fsa = cleaned.slice(0, 3);
    return fetch("https://api.zippopotam.us/ca/" + fsa)
      .then((r) => { if (!r.ok) throw new Error("geo"); return r.json(); })
      .then((j) => [parseFloat(j.places[0].latitude), parseFloat(j.places[0].longitude)])
      .catch(() => POSTAL_REGION[cleaned[0]] || CITY_COORDS["Toronto"]);
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

  function initLocationBar() {
    if (document.getElementById("locBar")) return;
    const header = document.querySelector(".site-header");
    if (!header) return;
    const bar = document.createElement("div");
    bar.id = "locBar";
    bar.className = "loc-bar";
    header.insertAdjacentElement("afterend", bar);
    const formHTML = (val) =>
      `<form class="loc-form" data-loc-form><input name="postal" placeholder="Postal code" autocomplete="postal-code" aria-label="Postal code" value="${esc(val || "")}"><button class="btn btn--primary btn--sm" type="submit">Set location</button></form>`;
    /* Three states: no postal code -> full bottom banner with the
       form; postal saved -> collapsed to a floating pill in the
       bottom-right corner; editing (pill tapped) -> banner reopens
       with the form so the code can be changed. */
    let editing = false;
    const render = () => {
      const p = wfLoc.get();
      bar.classList.remove("loc-away");
      if (p && !editing) {
        bar.classList.add("is-pill");
        document.body.classList.remove("has-loc-banner");
        bar.innerHTML = `<button type="button" class="loc-pill" data-loc-edit aria-label="Your postal code is ${esc(p.toUpperCase())}. Tap to change it">📍 ${esc(p.toUpperCase())}</button>`;
      } else {
        bar.classList.remove("is-pill");
        document.body.classList.add("has-loc-banner");
        bar.innerHTML = editing
          ? `<div class="wrap loc-bar-in"><span>📍 Your location</span>${formHTML(p)}<button type="button" class="loc-cancel" data-loc-cancel aria-label="Cancel">✕</button></div>`
          : `<div class="wrap loc-bar-in"><span>📍 See clinics near you</span>${formHTML("")}</div>`;
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
      const v = (input.value || "").trim().toUpperCase();
      if (!wfLoc.valid(v)) { input.focus(); return; }
      wfLoc.set(v); wfLoc.reset(); editing = false; render();
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
      const PAGE_SIZE = 12;
      let userPt = null;
      let currentProv = "";
      const renderList = (prov) => {
        currentProv = prov || "";
        let cs = prov ? g.clinics.filter((c) => (c.prov || "ON") === prov) : g.clinics.slice();
        if (userPt) {
          cs = cs.map((c) => {
            const cc2 = clinicCoords(c);
            return Object.assign({}, c, { distKm: cc2 ? haversineKm(userPt, cc2) : Infinity });
          }).sort((a, b) => a.distKm - b.distKm);
        }
        const filter = provs.length > 1
          ? `<label class="prov-filter">Province <select id="provSelect"><option value="">All of Canada (${g.clinics.length})</option>${provs.map((p) => `<option value="${p}">${PROV_NAMES[p] || p}</option>`).join("")}</select></label>`
          : "";
        const sortedNote = userPt ? ` <span class="tp-sorted">Sorted by distance from ${esc(wfLoc.get().toUpperCase())} · approximate</span>` : "";
        const first = cs.slice(0, PAGE_SIZE);
        const rest = cs.slice(PAGE_SIZE);
        list.innerHTML = `<div class="tp-list-head"><h2>${cs.length} clinic${cs.length === 1 ? "" : "s"}${prov ? " in " + esc(PROV_NAMES[prov] || prov) : " across Canada"}${sortedNote}</h2>${filter}</div>`
          + clinicCardsHTML(first, g.name)
          + (rest.length ? `<div class="clinic-grid see-more-body" hidden>${clinicCardsHTML(rest, g.name, false)}</div><button type="button" class="btn btn--ghost see-more-btn" data-see-more>See all ${cs.length} clinics</button>` : "");
        const sel = document.getElementById("provSelect");
        if (sel) { sel.value = prov || ""; sel.addEventListener("change", () => renderList(sel.value)); }
        const moreBtn = list.querySelector("[data-see-more]");
        if (moreBtn) moreBtn.addEventListener("click", () => {
          const body = list.querySelector(".see-more-body");
          const open = body.hidden;
          body.hidden = !open;
          moreBtn.textContent = open ? "Show less" : `See all ${cs.length} clinics`;
        });
      };
      renderList("");
      if (wfLoc.get()) {
        wfLoc.coords().then((pt) => { if (pt) { userPt = pt; renderList(currentProv); } });
        window.addEventListener("wf:location", () => {
          userPt = null;
          if (wfLoc.get()) wfLoc.coords().then((pt) => { if (pt) { userPt = pt; renderList(currentProv); } });
          else renderList(currentProv);
        });
      }
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
    renderFeaturedClinics();
    renderDirectory();
    renderGoalChips();
    renderRecommendations();
    if (wfLoc.get()) nearData().then((nd) => { if (nd) stampTreatmentCards(nd); });
    renderResources();
    renderGtaDirectory();
    renderTreatmentPage();
    initGlobalFavs();
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
