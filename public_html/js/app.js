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
    row.innerHTML = INSURERS.map((n) => `<span class="insurer-pill">${esc(n)}</span>`).join("");
  }

  const WHY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  function renderWhy() {
    const grid = $("#whyGrid"); if (!grid) return;
    const items = [
      "Discover treatments covered by extended health benefits",
      "Compare clinics in one place",
      "Learn what each treatment actually does",
      "Save your favourite treatments",
      "Read your benefits summary in plain language",
      "Find providers near you",
    ];
    grid.innerHTML = items.map((t) =>
      `<div class="why-item"><span class="why-ic">${WHY_ICON}</span><p>${esc(t)}</p></div>`
    ).join("");
  }

  const HEART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.9Z"/></svg>`;

  function treatmentCardHTML(t) {
    const saved = getFavs().includes(t.name);
    const cats = t.categories.join(",");
    const findBtn = t.link
      ? `<a class="btn btn--primary btn--sm" href="${t.link}">Find clinics →</a>`
      : "";
    return `
      <article class="treatment-card" data-cats="${esc(cats)}" data-name="${esc(t.name)}">
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
      const sel = tab.dataset.tab;
      $$(".dir-group", wrap).forEach((group) => {
        let visible = 0;
        $$(".treatment-card", group).forEach((card) => {
          const cats = card.dataset.cats.split(",");
          const show = sel === "All" || cats.includes(sel);
          card.classList.toggle("hidden", !show);
          if (show) visible++;
        });
        group.classList.toggle("hidden", visible === 0);
      });
    });
  }

  function renderCategories() {
    const grid = $("#catGrid"); if (!grid || typeof GOAL_CATEGORIES === "undefined") return;
    grid.innerHTML = GOAL_CATEGORIES.map((c) =>
      `<a class="cat-item" href="#directory"><span class="cat-emoji" aria-hidden="true">${c.emoji}</span><span>${esc(c.label)}</span></a>`
    ).join("");
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
    grid.innerHTML = RESOURCES.map((r) =>
      `<article class="resource-card">
         <span class="res-tag">${esc(r.tag)}</span>
         <h4>${esc(r.title)}</h4>
         <p>${esc(r.desc)}</p>
       </article>`
    ).join("");
  }

  /* ============================================================
     INSURANCE ANALYZER
     ============================================================ */
  const SAMPLE_TEXT =
    "Paramedical Practitioners: Physiotherapist $500 per calendar year. " +
    "Registered Massage Therapist $500. Chiropractor $400. Naturopath $300. " +
    "Acupuncturist $300. Psychologist / Social Worker $1,000 combined. " +
    "Speech Language Pathologist $500. Osteopath $400. Coverage at 100% of reasonable and customary charges.";

  function analyze(text) {
    const lower = text.toLowerCase();
    const found = [];
    COVERAGE_MAP.forEach((entry) => {
      const re = new RegExp(entry.keywords.join("|"), "i");
      if (re.test(lower)) {
        // try to find a nearby dollar amount / percent for this keyword
        let amount = "";
        const kwMatch = lower.match(new RegExp("(" + entry.keywords.join("|") + ")[^\\n.$%]{0,60}?(\\$[\\d,]+|\\d{1,3}\\s?%)", "i"));
        if (kwMatch) amount = kwMatch[2].replace(/\s/g, "");
        found.push({ ...entry, amount });
      }
    });
    return found;
  }

  function renderAnalysis(found) {
    const out = $("#analyzerResult"); if (!out) return;
    if (!found.length) {
      out.innerHTML = `<p class="analyzer-empty">No paramedical categories detected. Paste the "paramedical" or "extended health services" section of your booklet — the part that lists practitioners and their annual maximums.</p>`;
      return;
    }
    const unlocked = new Set();
    found.forEach((f) => f.unlocks.forEach((u) => unlocked.add(u)));
    const summary = unlocked.size
      ? `Based on what you pasted, you may be able to explore <strong>${unlocked.size}</strong> WellFinder treatment${unlocked.size > 1 ? "s" : ""} across ${found.length} covered categor${found.length > 1 ? "ies" : "y"}.`
      : `Detected ${found.length} covered categor${found.length > 1 ? "ies" : "y"}. These are commonly-used benefits — browse the directory for treatments billed under them.`;

    const items = found.map((f) => {
      const amt = f.amount ? `<span class="cov-amt">${esc(f.amount)}</span>` : "";
      const tags = f.unlocks.length
        ? `<div class="cov-unlocks">${f.unlocks.map((u) => `<span class="cov-tag">${esc(u)}</span>`).join("")}</div>`
        : "";
      return `<div class="coverage-item">
                <h4>${esc(f.label)} ${amt}</h4>
                <p>${esc(f.note)}</p>${tags}
              </div>`;
    }).join("");

    out.innerHTML = `<p class="cov-summary">${summary}</p>${items}`;
  }

  function initAnalyzer() {
    const btn = $("#analyzeBtn"); if (!btn) return;
    const ta = $("#benefitsInput");
    btn.addEventListener("click", () => renderAnalysis(analyze(ta.value || "")));
    const sample = $("#sampleBtn");
    if (sample) sample.addEventListener("click", () => {
      ta.value = SAMPLE_TEXT;
      renderAnalysis(analyze(SAMPLE_TEXT));
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
    renderCategories();
    renderExploring();
    renderResources();
    initAnalyzer();
    // set year in footers
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  });
})();
