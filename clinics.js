/* ============================================================
   WellFinder — clinic directory engine
   Powers pilates.html, naturopath.html and golf.html
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const mapsUrl = window.mapsUrl || ((q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q));

  const PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  function badgeClass(db) {
    const v = (db || "").toLowerCase();
    if (v.startsWith("yes")) return "ok";
    if (v === "no") return "no";
    return "confirm";
  }
  function badgeText(db) {
    if (!db) return "Confirm w/ clinic";
    if (/^yes/i.test(db)) return db.length > 4 ? db : "Direct billing";
    if (/^no$/i.test(db)) return "No direct billing";
    return db;
  }

  function clinicCardHTML(f) {
    const meta = f.meta.map((m) =>
      `<div><div class="m-label">${esc(m.label)}</div><div class="m-val">${esc(m.val)}</div></div>`
    ).join("");
    const links = f.links.map((l) => {
      const isMail = /^mailto:/i.test(l.href);
      const attrs = isMail ? "" : `target="_blank" rel="noopener"`;
      return `<a href="${esc(l.href)}" ${attrs} class="${l.cls || ""}">${esc(l.label)}</a>`;
    }).join("");
    const tags = (f.tags && f.tags.length)
      ? `<div class="cc-tags">${f.tags.map((t) => `<span class="cc-tag">${esc(t)}</span>`).join("")}</div>` : "";
    const note = f.note ? `<div class="cc-note">${esc(f.note)}</div>` : "";
    return `
      <article class="clinic-card" data-search="${esc(f.search || "")}">
        <div class="cc-top">
          <h3>${esc(f.name)}</h3>
          <span class="cc-badge ${f.badge.cls}">${esc(f.badge.text)}</span>
        </div>
        <a class="cc-loc" href="${esc(mapsUrl(f.mapsQ))}" target="_blank" rel="noopener">${PIN}<span>${esc(f.loc)}</span></a>
        ${note}${tags}
        <div class="cc-meta">${meta}</div>
        <div class="cc-links">${links}</div>
      </article>`;
  }

  function buildLinks(c) {
    const links = [];
    if (c.web) links.push({ label: "Website ↗", href: c.web });
    if (c.email) links.push({ label: c.email, href: "mailto:" + c.email });
    if (c.book) links.push({ label: "Book ↗", href: c.book, cls: "book" });
    return links;
  }

  /* dynamic city dropdown limited to current province/region */
  function fillCities(select, list, keyFn, placeholder) {
    const cities = Array.from(new Set(list.map(keyFn))).sort((a, b) => a.localeCompare(b));
    const cur = select.value;
    select.innerHTML = `<option value="">${placeholder}</option>` +
      cities.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    if (cities.includes(cur)) select.value = cur;
  }

  function setCount(n, total, noun) {
    const bar = $("#resultBar"); if (!bar) return;
    $("#resultCount", bar).textContent = n;
    $("#resultTotal", bar).textContent = `${total} total in database`;
    $("#resultNoun", bar).textContent = noun;
  }

  function renderList(container, cards, emptyMsg) {
    if (!cards.length) {
      container.innerHTML = `<div class="empty-state"><h3>No clinics match those filters</h3><p>${esc(emptyMsg)}</p></div>`;
      return;
    }
    container.innerHTML = cards.join("");
  }

  /* ============================================================
     PILATES
     ============================================================ */
  function initPilates() {
    const list = $("#clinicList"); if (!list || typeof PILATES_CLINICS === "undefined") return;
    const state = { prov: "", city: "", chips: new Set() };
    const total = PILATES_CLINICS.length;

    // province segmented
    $$("#provSeg button").forEach((b) => b.addEventListener("click", () => {
      $$("#provSeg button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active"); state.prov = b.dataset.val;
      state.city = "";
      fillCities(citySel, provFiltered(), (c) => c.city, "All cities");
      apply();
    }));

    // chips
    const chipRow = $("#chipRow");
    chipRow.innerHTML = PILATES_CHIPS.map((c) => `<button class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
    chipRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip"); if (!chip) return;
      const v = chip.dataset.chip;
      if (state.chips.has(v)) { state.chips.delete(v); chip.classList.remove("active"); }
      else { state.chips.add(v); chip.classList.add("active"); }
      apply();
    });

    const citySel = $("#citySelect");
    citySel.addEventListener("change", () => { state.city = citySel.value; apply(); });
    fillCities(citySel, PILATES_CLINICS, (c) => c.city, "All cities");

    $("#resetBtn").addEventListener("click", () => {
      state.prov = ""; state.city = ""; state.chips.clear();
      $$("#provSeg button").forEach((x, i) => x.classList.toggle("active", i === 0));
      $$(".chip", chipRow).forEach((x) => x.classList.remove("active"));
      fillCities(citySel, PILATES_CLINICS, (c) => c.city, "All cities");
      citySel.value = "";
      apply();
    });

    function provFiltered() {
      return PILATES_CLINICS.filter((c) => !state.prov || c.prov === state.prov);
    }
    function chipMatch(c) {
      for (const chip of state.chips) {
        if (chip === "Reformer" && !/reformer/i.test(c.modalities)) return false;
        if (chip === "Mat" && !/\bmat\b/i.test(c.modalities)) return false;
        if (chip === "Direct billing" && !(c.directBill || /^yes/i.test(c.db))) return false;
        if (chip === "Physiotherapy" && !/physio/i.test(c.billed)) return false;
        if (chip === "Chiropractor" && !/chiro/i.test(c.billed)) return false;
      }
      return true;
    }
    function apply() {
      const filtered = PILATES_CLINICS.filter((c) =>
        (!state.prov || c.prov === state.prov) &&
        (!state.city || c.city === state.city) &&
        chipMatch(c));
      const cards = filtered.map((c) => clinicCardHTML({
        name: c.name,
        badge: { cls: badgeClass(c.db), text: c.directBill ? "Direct bill" : badgeText(c.db) },
        loc: c.loc, mapsQ: c.name + " " + c.loc,
        meta: [
          { label: "Modalities", val: c.modalities },
          { label: "Billed as", val: c.billed },
          { label: "Price / 60 min", val: c.price },
          { label: "Direct billing", val: c.db },
        ],
        links: buildLinks(c),
      }));
      renderList(list, cards, "Try removing a filter or switching province.");
      setCount(filtered.length, total, "clinics");
    }
    apply();
  }

  /* ============================================================
     NATUROPATH
     ============================================================ */
  function initNaturo() {
    const list = $("#clinicList"); if (!list || typeof NATURO_CLINICS === "undefined") return;
    const state = { prov: "", city: "", tags: new Set() };
    const total = NATURO_CLINICS.length;

    $$("#provSeg button").forEach((b) => b.addEventListener("click", () => {
      $$("#provSeg button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active"); state.prov = b.dataset.val; state.city = "";
      fillCities(citySel, NATURO_CLINICS.filter((c) => !state.prov || c.prov === state.prov), (c) => c.city, "All cities");
      apply();
    }));

    const chipRow = $("#chipRow");
    chipRow.innerHTML = `<button class="chip active" data-chip="all">All</button>` +
      NATURO_CHIPS.map((c) => `<button class="chip" data-chip="${esc(c.id)}">${esc(c.label)}</button>`).join("");
    chipRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip"); if (!chip) return;
      const v = chip.dataset.chip;
      if (v === "all") {
        state.tags.clear();
        $$(".chip", chipRow).forEach((x) => x.classList.toggle("active", x.dataset.chip === "all"));
      } else {
        if (state.tags.has(v)) state.tags.delete(v); else state.tags.add(v);
        chip.classList.toggle("active", state.tags.has(v));
        $(".chip[data-chip='all']", chipRow).classList.toggle("active", state.tags.size === 0);
      }
      apply();
    });

    const citySel = $("#citySelect");
    citySel.addEventListener("change", () => { state.city = citySel.value; apply(); });
    fillCities(citySel, NATURO_CLINICS, (c) => c.city, "All cities");

    $("#resetBtn").addEventListener("click", () => {
      state.prov = ""; state.city = ""; state.tags.clear();
      $$("#provSeg button").forEach((x, i) => x.classList.toggle("active", i === 0));
      $$(".chip", chipRow).forEach((x) => x.classList.toggle("active", x.dataset.chip === "all"));
      fillCities(citySel, NATURO_CLINICS, (c) => c.city, "All cities"); citySel.value = "";
      apply();
    });

    function apply() {
      const filtered = NATURO_CLINICS.filter((c) =>
        (!state.prov || c.prov === state.prov) &&
        (!state.city || c.city === state.city) &&
        (state.tags.size === 0 || [...state.tags].some((t) => c.tags.includes(t))));
      const cards = filtered.map((c) => clinicCardHTML({
        name: c.name,
        badge: { cls: badgeClass(c.db), text: badgeText(c.db) },
        loc: c.loc, mapsQ: c.name + " " + c.loc,
        meta: [
          { label: "Modalities", val: c.modalities },
          { label: "Billed as", val: c.billed },
          { label: "Per visit price", val: c.price },
        ],
        links: buildLinks(c),
      }));
      renderList(list, cards, "Try selecting All modalities or a different city.");
      setCount(filtered.length, total, "clinics");
    }
    apply();
  }

  /* ============================================================
     GOLF
     ============================================================ */
  function initGolf() {
    const list = $("#clinicList"); if (!list || typeof GOLF_CLINICS === "undefined") return;
    const state = { region: "", city: "", tpiOnly: false };
    const total = GOLF_CLINICS.length;

    const regionSel = $("#regionSelect");
    regionSel.innerHTML = `<option value="">All regions</option>` +
      GOLF_REGIONS.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join("");
    regionSel.addEventListener("change", () => {
      state.region = regionSel.value; state.city = "";
      fillCities(citySel, GOLF_CLINICS.filter((c) => !state.region || c.region === state.region), (c) => c.city, "All cities");
      apply();
    });

    const citySel = $("#citySelect");
    citySel.addEventListener("change", () => { state.city = citySel.value; apply(); });
    fillCities(citySel, GOLF_CLINICS, (c) => c.city, "All cities");

    const tpiToggle = $("#tpiToggle");
    tpiToggle.addEventListener("change", () => { state.tpiOnly = tpiToggle.checked; apply(); });

    $("#resetBtn").addEventListener("click", () => {
      state.region = ""; state.city = ""; state.tpiOnly = false;
      regionSel.value = ""; tpiToggle.checked = false;
      fillCities(citySel, GOLF_CLINICS, (c) => c.city, "All cities"); citySel.value = "";
      apply();
    });

    function apply() {
      const filtered = GOLF_CLINICS.filter((c) =>
        (!state.region || c.region === state.region) &&
        (!state.city || c.city === state.city) &&
        (!state.tpiOnly || c.tpi));
      const cards = filtered.map((c) => clinicCardHTML({
        name: c.name,
        badge: { cls: badgeClass(c.db), text: badgeText(c.db) },
        loc: c.loc, mapsQ: c.name + " " + c.loc,
        note: c.note,
        tags: [c.disc, c.tpi].filter(Boolean),
        meta: [
          { label: "Discipline", val: c.disc },
          { label: "TPI certification", val: c.tpi || "Confirm with clinic" },
          { label: "Direct billing", val: c.db },
          { label: "Price", val: c.price },
        ],
        links: buildLinks(c),
      }));
      renderList(list, cards, "Try clearing the TPI filter or choosing a different region.");
      setCount(filtered.length, total, "clinics");
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "pilates") initPilates();
    else if (page === "naturopath") initNaturo();
    else if (page === "golf") initGolf();
  });
})();
