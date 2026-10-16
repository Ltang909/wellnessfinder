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
      { name: "Celine", treatment: "Glutathione injection", billed: "Naturopath", covered: "", price: "" },
      { name: "Chun Ho", treatment: "Neurofeedback", billed: "Psychology", covered: "100% covered", price: "$180 per session" },
      { name: "Daniel", treatment: "Singing voice therapy", billed: "Speech therapy", covered: "100% covered", price: "$160 per 45 min session" },
    ];
    grid.innerHTML = claims.map((c) =>
      `<div class="claim-card">
         <div class="claim-top"><span class="claim-name">${esc(c.name)}</span>${c.covered ? `<span class="claim-covered">${esc(c.covered)}</span>` : ""}</div>
         <p class="claim-what">${esc(c.treatment)}</p>
         <p class="claim-billed">Billed as ${esc(c.billed)}</p>
         ${c.price ? `<p class="claim-price">${esc(c.price)}</p>` : ""}
       </div>`
    ).join("");
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
        return;
      }
      const fav = e.target.closest(".fav-btn");
      if (fav) {
        const on = window.wfFavs.toggle(fav.dataset.fav);
        fav.classList.toggle("saved", on);
        fav.setAttribute("aria-pressed", on ? "true" : "false");
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
    grid.innerHTML = RESOURCES.map((r) => {
      const inner = `<span class="res-tag">${esc(r.tag)}</span>
         <h4>${esc(r.title)}</h4>
         <p>${esc(r.desc)}</p>` + (r.url ? `<span class="res-more">Read the guide →</span>` : "");
      const body = r.url ? `<a class="resource-link" href="${esc(r.url)}">${inner}</a>` : inner;
      return `<article class="resource-card">${body}</article>`;
    }).join("");
  }

  /* Shared: GTA clinic sources per treatment. Used by the homepage
     GTA directory and by the per-treatment minipages. */
  function gtaDataFor(name) {
    if (typeof TREATMENTS === "undefined") return null;
    const inOntario = (c) => c.prov === "ON";
    const pilates = (typeof PILATES_CLINICS !== "undefined" ? PILATES_CLINICS : []).filter(inOntario);
    const golf = (typeof GOLF_CLINICS !== "undefined" ? GOLF_CLINICS : []);
    const naturo = (typeof NATURO_CLINICS !== "undefined" ? NATURO_CLINICS : []).filter(inOntario);
    const byTag = (tag) => naturo.filter((c) => c.tags && c.tags.includes(tag));
    const seen = new Set();
    const gluta = [];
    ["iv-therapy", "vitamin-injections"].forEach((tag) =>
      byTag(tag).forEach((c) => { if (!seen.has(c.name)) { seen.add(c.name); gluta.push(c); } })
    );
    const map = {
      "Clinical Pilates": { clinics: pilates },
      "Golf Swing Assessment": { clinics: golf },
      "Cosmetic Acupuncture": { clinics: byTag("cosmetic-acupuncture") },
      "Microneedling": { clinics: byTag("microneedling") },
      "Glutathione Injections": { display: "Glutathione Therapy (IV and IM)", billed: "Naturopathy", clinics: gluta },
      "IV Vitamin Therapy": { clinics: byTag("iv-therapy") },
      "Vitamin B Injections": { clinics: byTag("vitamin-injections") },
      "Facial Manual Therapy": { clinics: (typeof FACIAL_CLINICS !== "undefined" ? FACIAL_CLINICS : []).filter(inOntario) },
      "Interview Preparation": { clinics: (typeof INTERVIEW_CLINICS !== "undefined" ? INTERVIEW_CLINICS : []).filter(inOntario) },
      "Singing Voice Therapy": { clinics: (typeof VOICE_CLINICS !== "undefined" ? VOICE_CLINICS : []).filter(inOntario) },
      "Neurofeedback": { clinics: (typeof NEUROFEEDBACK_CLINICS !== "undefined" ? NEUROFEEDBACK_CLINICS : []).filter(inOntario) },
    };
    const entry = map[name];
    if (!entry) return null;
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

  function clinicListHTML(clinics) {
    if (!clinics.length) return `<p class="gta-empty">No GTA listings yet. <a href="/submit">Suggest a clinic</a></p>`;
    return `<ul class="gta-list">${clinics.map((c) =>
      `<li>${c.web ? `<a href="${esc(c.web)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}<span>${esc(c.city || "")}</span></li>`
    ).join("")}</ul>`;
  }

  function renderGtaDirectory() {
    const grid = $("#gtaGrid"); if (!grid || typeof TREATMENTS === "undefined") return;
    const names = [
      "Clinical Pilates", "Golf Swing Assessment", "Cosmetic Acupuncture",
      "Microneedling", "Glutathione Injections", "IV Vitamin Therapy",
      "Vitamin B Injections", "Facial Manual Therapy", "Interview Preparation",
      "Singing Voice Therapy", "Neurofeedback",
    ];
    grid.innerHTML = names.map((name) => {
      const g = gtaDataFor(name); if (!g) return "";
      const head = `<div class="gta-head"><h4>${esc(g.name)}</h4><span class="gta-meta">${g.billed ? `Billed as ${esc(g.billed)} · ` : ""}${g.clinics.length} clinic${g.clinics.length === 1 ? "" : "s"}</span></div>`;
      return `<div class="gta-block">${head}${clinicListHTML(g.clinics)}</div>`;
    }).join("");
  }

  /* Per-treatment minipage: <body data-treatment="Clinical Pilates"> */
  function renderTreatmentPage() {
    const name = document.body && document.body.dataset ? document.body.dataset.treatment : "";
    if (!name) return;
    const g = gtaDataFor(name); if (!g) return;
    const head = $("#tpHead"), list = $("#tpList");
    if (head) {
      head.innerHTML =
        `<p class="eyebrow"><a href="/">WellFinder</a> · GTA directory</p>
         <h1>${esc(g.name)} clinics in the GTA</h1>
         ${g.billed ? `<p class="tp-billed">Billed as ${esc(g.billed)}</p>` : ""}
         ${g.desc ? `<p class="lede">${esc(g.desc)}</p>` : ""}
         ${g.image ? `<figure class="tp-fig"><img src="${esc(g.image.src)}" alt="${esc(g.name)}" loading="lazy"><figcaption>Photo: <a href="${esc(g.image.url)}" target="_blank" rel="noopener">${esc(g.image.credit)}</a></figcaption></figure>` : ""}`;
      document.title = `${g.name} clinics in the GTA — WellFinder`;
    }
    if (list) {
      list.innerHTML = `<h2>${g.clinics.length} clinic${g.clinics.length === 1 ? "" : "s"}</h2>` + clinicListHTML(g.clinics);
    }
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
    // set year in footers
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  });
})();
