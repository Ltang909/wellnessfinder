/* ============================================================
   WellFinder wellness page (/saved) — saved treatments,
   saved clinics, and postal-code based clinic suggestions.
   Uses the unified wf_favourites store.
   ============================================================ */
(function () {
  "use strict";

  if (typeof TREATMENTS === "undefined") return;

  var FAV_KEY = "wf_favourites";
  var POSTAL_KEY = "wf_postal_code";
  var EMAIL_KEY = "wf_discover_email";

  var treatWrap = document.getElementById("savedTreatments");
  var clinicWrap = document.getElementById("savedClinics");
  if (!treatWrap || !clinicWrap) return;

  var count = document.getElementById("savedCount");
  var empty = document.getElementById("savedEmpty");
  var clear = document.getElementById("clearSaved");
  var postalForm = document.getElementById("postalForm");
  var postalInput = document.getElementById("postalInput");
  var postalError = document.getElementById("postalError");

  function storeSet(k, v) {
    if (window.wfStoreSet) window.wfStoreSet(k, v);
    else { try { localStorage.setItem(k, v); } catch (_) {} }
  }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function slug(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function favs() {
    try { return window.wfFavs ? window.wfFavs.get() : []; } catch (_) { return []; }
  }
  function treatmentByName(name) {
    for (var i = 0; i < TREATMENTS.length; i++) {
      if (TREATMENTS[i].name === name) return TREATMENTS[i];
    }
    return null;
  }
  function imgFor(t) {
    if (typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[t.name]) return TREATMENT_IMAGES[t.name].src;
    if (typeof TREATMENT_ART !== "undefined" && TREATMENT_ART[t.group]) return TREATMENT_ART[t.group];
    return "";
  }

  /* Every clinic in the database, tagged with its treatment (shared). */
  function allClinics() {
    return window.wfAllClinics ? window.wfAllClinics() : [];
  }

  function findClinic(name) {
    var all = allClinics();
    for (var i = 0; i < all.length; i++) {
      if (all[i].clinic.name === name) return all[i];
    }
    return null;
  }

  /* ---------- postal code ---------- */
  function postalZone(postal) {
    var fsa = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!/^[A-Z]\d[A-Z]$/.test(fsa)) return null;
    return fsa[0];
  }

  /* ---------- render ---------- */
  function treatmentCard(t) {
    var img = imgFor(t);
    var s = slug(t.name);
    return '<article class="saved-tx">'
      + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : "")
      + '<div class="saved-tx-body"><h3>' + esc(t.name) + "</h3>"
      + "<p>Billed as " + esc(t.billed) + "</p></div>"
      + '<a class="saved-tx-link" href="/clinics-' + s + '">Find clinics</a>'
      + '<button type="button" class="saved-tx-x" data-unsave="' + esc(t.name) + '" aria-label="Remove ' + esc(t.name) + '">×</button>'
      + "</article>";
  }

  function clinicCard(item) {
    var c = item.clinic;
    return '<article class="saved-card">'
      + '<div class="saved-card-body"><p class="eyebrow">' + esc(item.treatment) + "</p><h2>" + esc(c.name) + "</h2>"
      + "<p>" + esc(c.city || "") + "</p>"
      + (c.note ? '<div class="saved-coverage">' + esc(c.note) + "</div>" : "")
      + '<div class="saved-card-actions">'
      + (c.web ? '<a href="' + esc(c.web) + '" target="_blank" rel="noopener">Website</a>' : "")
      + '<button type="button" data-unsave="' + esc(c.name) + '">Remove</button></div>'
      + "</div></article>";
  }

  /* ---------- recommended: all clinics for saved treatments ---------- */
  var RADIUS_KEY = "wf_radius_km";

  function savedTreatmentNames() {
    return favs().filter(function (n) { return !!treatmentByName(n); });
  }

  function clinicsForTreatments(names) {
    var seen = {};
    var out = [];
    allClinics().forEach(function (item) {
      if (names.indexOf(item.treatment) < 0) return;
      if (seen[item.clinic.name]) return;
      seen[item.clinic.name] = true;
      var copy = {};
      for (var k in item.clinic) copy[k] = item.clinic[k];
      copy.treatment = item.treatment;
      out.push(copy);
    });
    return out;
  }

  function renderForYou() {
    var grid = document.getElementById("forYouGrid");
    var sub = document.getElementById("forYouSub");
    var radiusWrap = document.getElementById("radiusWrap");
    var radiusInput = document.getElementById("radiusInput");
    var radiusLabel = document.getElementById("radiusLabel");
    if (!grid) return;
    var names = savedTreatmentNames();
    if (!names.length) {
      if (sub) sub.textContent = "Save some treatments to get clinic recommendations.";
      if (radiusWrap) radiusWrap.hidden = true;
      grid.innerHTML = '<p class="saved-none"><a href="/#directory">Browse treatments</a> to get started.</p>';
      return;
    }
    var postal = "";
    try { postal = localStorage.getItem(POSTAL_KEY) || ""; } catch (_) {}
    if (postalInput && !postalInput.value) postalInput.value = postal;
    var radiusKm = 25;
    try { radiusKm = parseInt(localStorage.getItem(RADIUS_KEY) || "25", 10) || 25; } catch (_) {}
    if (radiusInput) radiusInput.value = radiusKm;
    if (radiusLabel) radiusLabel.textContent = "Within " + radiusKm + " km";

    var list = clinicsForTreatments(names);
    var cards = window.wfClinicCardsHTML ? function (l) { return window.wfClinicCardsHTML(l, "", false); } : null;
    if (!window.wfGeo || !postalZone(postal) || !cards) {
      if (sub) sub.textContent = list.length + " clinics for your saved treatments. Add your postal code to sort by distance.";
      if (radiusWrap) radiusWrap.hidden = true;
      grid.innerHTML = cards ? cards(list) : "";
      return;
    }
    if (radiusWrap) radiusWrap.hidden = false;
    if (sub) sub.textContent = "Finding clinics near " + postal.toUpperCase() + "…";
    grid.innerHTML = '<p class="saved-none">Loading nearby clinics…</p>';
    window.wfGeo.getUserCoords(postal).then(function (userPt) {
      var withDist = list.map(function (c) {
        var coords = window.wfGeo.clinicCoords(c);
        c.distKm = coords ? window.wfGeo.haversineKm(userPt, coords) : Infinity;
        return c;
      }).filter(function (c) { return c.distKm <= radiusKm; });
      withDist.sort(function (a, b) { return a.distKm - b.distKm; });
      if (sub) sub.textContent = withDist.length + " clinics within " + radiusKm + " km of " + postal.toUpperCase() + " (distances are approximate).";
      if (!withDist.length) {
        grid.innerHTML = '<p class="saved-none">No clinics within ' + radiusKm + ' km. Try a wider radius.</p>';
        return;
      }
      grid.innerHTML = cards(withDist);
    });
  }

  function render() {
    var names = favs();
    var treatments = [];
    var clinics = [];
    names.forEach(function (n) {
      var t = treatmentByName(n);
      if (t) treatments.push(t);
      else {
        var found = findClinic(n);
        if (found) clinics.push(found);
      }
    });
    if (count) count.textContent = names.length;
    if (clear) clear.hidden = !names.length;
    var total = treatments.length + clinics.length;
    if (empty) empty.hidden = total > 0;
    treatWrap.innerHTML = treatments.length
      ? treatments.map(treatmentCard).join("")
      : '<p class="saved-none">No saved treatments yet. <a href="/#directory">Browse treatments</a></p>';
    clinicWrap.innerHTML = clinics.length
      ? clinics.map(clinicCard).join("")
      : '<p class="saved-none">No saved clinics yet. <a href="/#gta">Browse clinics across Canada</a></p>';
    renderForYou();
  }

  document.addEventListener("click", function (e) {
    var f = e.target.closest("#savedRecGrid .fav-btn");
    if (f) { setTimeout(function () { render(); renderRecs(); }, 0); return; }
    var b = e.target.closest("[data-unsave]");
    if (!b) return;
    if (window.wfFavs) {
      var n = b.getAttribute("data-unsave");
      if (window.wfFavs.has(n)) window.wfFavs.toggle(n);
    }
    render();
  });
  if (clear) clear.addEventListener("click", function () {
    storeSet(FAV_KEY, "[]");
    render();
  });

  if (postalForm) postalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = postalInput.value.trim().toUpperCase();
    if (!/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(val)) {
      postalError.textContent = "Enter a valid postal code, like M4B 1B3.";
      postalError.hidden = false;
      return;
    }
    postalError.hidden = true;
    storeSet(POSTAL_KEY, val);
    renderForYou();
  });

  /* radius slider */
  var radiusInputEl = document.getElementById("radiusInput");
  if (radiusInputEl) radiusInputEl.addEventListener("change", function () {
    storeSet(RADIUS_KEY, radiusInputEl.value);
    renderForYou();
  });

  /* keep the email form working */
  var form = document.getElementById("savedEmailForm");
  var input = document.getElementById("savedEmail");
  var status = document.getElementById("savedEmailStatus");
  if (form && input) {
    try { input.value = localStorage.getItem(EMAIL_KEY) || ""; } catch (_) {}
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input.checkValidity()) { input.reportValidity(); return; }
      storeSet(EMAIL_KEY, input.value.trim());
      if (status) { status.textContent = "Email saved."; status.style.color = "#315f52"; }
    });
  }

  function renderRecs() {
    var grid = document.getElementById("savedRecGrid");
    if (!grid || !window.wfRecommendations) return;
    window.wfRecommendations().then(function (recs) {
      var HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.9Z"/></svg>';
      grid.innerHTML = recs.map(function (r) {
        var s = slug(r.t.name);
        var saved = favs().indexOf(r.t.name) > -1;
        return '<article class="near-row"><div class="near-main"><h4>' + esc(r.t.name) + '</h4>'
          + '<p class="near-meta">Billed as ' + esc(r.t.billed) + " · " + esc(r.reason) + "</p></div>"
          + '<button type="button" class="fav-btn fav-btn--inline' + (saved ? " saved" : "") + '" data-fav="' + esc(r.t.name) + '" aria-label="Save ' + esc(r.t.name) + '" aria-pressed="' + saved + '">' + HEART + "</button>"
          + '</article>';
      }).join("");
    });
  }

  render();
  renderRecs();
  window.addEventListener("wf:location", renderRecs);
})();
