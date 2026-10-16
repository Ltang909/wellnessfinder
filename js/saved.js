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
  var nearbyGrid = document.getElementById("nearbyGrid");
  var nearbySub = document.getElementById("nearbySub");

  var TORONTO_CITIES = ["Toronto", "North York", "Scarborough", "Etobicoke", "East York"];

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

  /* Every clinic in the database, tagged with its treatment. */
  function allClinics() {
    var out = [];
    function push(list, treatment, tag) {
      (list || []).forEach(function (c) {
        if (c.prov && c.prov !== "ON") return;
        if (tag && (!c.tags || c.tags.indexOf(tag) < 0)) return;
        out.push({ clinic: c, treatment: treatment });
      });
    }
    push(typeof PILATES_CLINICS !== "undefined" ? PILATES_CLINICS : [], "Clinical Pilates");
    push(typeof GOLF_CLINICS !== "undefined" ? GOLF_CLINICS : [], "Golf Swing Assessment");
    var nat = (typeof NATURO_CLINICS !== "undefined" ? NATURO_CLINICS : []).filter(function (c) { return c.prov === "ON"; });
    push(nat, "Cosmetic Acupuncture", "cosmetic-acupuncture");
    push(nat, "Microneedling", "microneedling");
    push(nat, "IV Vitamin Therapy", "iv-therapy");
    push(nat, "IM Vitamin Therapy", "vitamin-injections");
    push(typeof FACIAL_CLINICS !== "undefined" ? FACIAL_CLINICS : [], "Facial Manual Therapy");
    push(typeof INTERVIEW_CLINICS !== "undefined" ? INTERVIEW_CLINICS : [], "Interview Preparation");
    push(typeof VOICE_CLINICS !== "undefined" ? VOICE_CLINICS : [], "Singing Voice Therapy");
    push(typeof NEUROFEEDBACK_CLINICS !== "undefined" ? NEUROFEEDBACK_CLINICS : [], "Neurofeedback");
    return out;
  }
  var CLINIC_INDEX = allClinics();

  function findClinic(name) {
    for (var i = 0; i < CLINIC_INDEX.length; i++) {
      if (CLINIC_INDEX[i].clinic.name === name) return CLINIC_INDEX[i];
    }
    return null;
  }

  /* ---------- postal code ---------- */
  function postalZone(postal) {
    var fsa = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!/^[A-Z]\d[A-Z]$/.test(fsa)) return null;
    if (fsa[0] === "M") return "toronto";
    if (fsa[0] === "L") return "gta";
    return "other";
  }
  function cityZone(city) {
    return TORONTO_CITIES.indexOf(city) > -1 ? "toronto" : "gta";
  }

  function suggestClinics(zone, savedTreatments, limit) {
    var seen = {};
    var ranked = [];
    CLINIC_INDEX.forEach(function (item) {
      if (seen[item.clinic.name]) return;
      seen[item.clinic.name] = true;
      var score = 0;
      if (savedTreatments.indexOf(item.treatment) > -1) score += 2;
      if (zone && zone !== "other" && cityZone(item.clinic.city) === zone) score += 1;
      ranked.push({ item: item, score: score });
    });
    ranked.sort(function (a, b) { return b.score - a.score; });
    return ranked.slice(0, limit || 12).map(function (r) { return r.item; });
  }

  /* ---------- render ---------- */
  function treatmentCard(t) {
    var img = imgFor(t);
    var s = slug(t.name);
    return '<article class="saved-card">'
      + (img ? '<div class="saved-card-photo"><img src="' + esc(img) + '" alt="" loading="lazy"></div>' : "")
      + '<div class="saved-card-body"><p class="eyebrow">Treatment</p><h2>' + esc(t.name) + "</h2>"
      + "<p>" + esc(t.desc) + "</p>"
      + '<div class="saved-coverage">Billed as ' + esc(t.billed) + "</div>"
      + '<div class="saved-card-actions"><a href="/clinics-' + s + '">Find clinics</a>'
      + '<button type="button" data-unsave="' + esc(t.name) + '">Remove</button></div>'
      + "</div></article>";
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

  function renderNearby() {
    if (!nearbyGrid) return;
    var postal = "";
    try { postal = localStorage.getItem(POSTAL_KEY) || ""; } catch (_) {}
    if (postalInput && !postalInput.value) postalInput.value = postal;
    var zone = postalZone(postal);
    var savedTreatments = favs().filter(function (n) { return !!treatmentByName(n); });
    if (!zone) {
      if (nearbySub) nearbySub.textContent = "Enter your postal code above and we will rank clinics closest to you.";
      nearbyGrid.innerHTML = "";
      return;
    }
    var zoneLabel = zone === "toronto" ? "Toronto" : "the GTA";
    if (nearbySub) nearbySub.textContent = "Showing clinics near " + postal.toUpperCase() + " (" + zoneLabel + ").";
    var picks = suggestClinics(zone, savedTreatments, 12);
    nearbyGrid.innerHTML = picks.map(function (item) {
      var c = item.clinic;
      return '<article class="clinic-card"><h4>'
        + (c.web ? '<a href="' + esc(c.web) + '" target="_blank" rel="noopener">' + esc(c.name) + "</a>" : esc(c.name))
        + "</h4>"
        + '<p class="clinic-meta">' + esc(item.treatment) + (c.city ? " · " + esc(c.city) : "") + "</p>"
        + '<div class="clinic-actions">'
        + (c.web ? '<a class="btn btn--ghost btn--sm" href="' + esc(c.web) + '" target="_blank" rel="noopener">Website ↗</a>' : "")
        + (c.book ? '<a class="btn btn--primary btn--sm" href="' + esc(c.book) + '" target="_blank" rel="noopener">Book ↗</a>' : "")
        + "</div></article>";
    }).join("");
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
    var total = treatments.length + clinics.length;
    if (empty) empty.hidden = total > 0;
    treatWrap.innerHTML = treatments.length
      ? treatments.map(treatmentCard).join("")
      : '<p class="saved-none">No saved treatments yet. <a href="/discover">Discover treatments</a></p>';
    clinicWrap.innerHTML = clinics.length
      ? clinics.map(clinicCard).join("")
      : '<p class="saved-none">No saved clinics yet. <a href="/#gta">Browse the GTA directory</a></p>';
    renderNearby();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-unsave]");
    if (!b) return;
    if (window.wfFavs) {
      var n = b.getAttribute("data-unsave");
      if (window.wfFavs.has(n)) window.wfFavs.toggle(n);
    }
    render();
  });
  if (clear) clear.addEventListener("click", function () {
    try { localStorage.setItem(FAV_KEY, "[]"); } catch (_) {}
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
    try { localStorage.setItem(POSTAL_KEY, val); } catch (_) {}
    renderNearby();
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
      try { localStorage.setItem(EMAIL_KEY, input.value.trim()); } catch (_) {}
      if (status) { status.textContent = "Email saved."; status.style.color = "#315f52"; }
    });
  }

  render();
})();
