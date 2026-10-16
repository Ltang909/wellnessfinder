/* ============================================================
   WellFinder Discover — swipe through TREATMENTS, then an
   email + postal code gate that leads to the wellness page.
   ============================================================ */
(function () {
  "use strict";

  if (typeof TREATMENTS === "undefined") return;

  var stage = document.getElementById("discoverStage");
  var cardWrap = document.getElementById("cardWrap");
  var progress = document.getElementById("cardProgress");
  var savedProgress = document.getElementById("savedProgress");
  var progressBar = document.getElementById("progressBar");
  var toast = document.getElementById("swipeToast");
  var actions = document.getElementById("discoverActions");
  var skipBtn = document.getElementById("skipBtn");
  var saveBtn = document.getElementById("saveBtn");
  var clinicBtn = document.getElementById("clinicBtn");
  var savedNavCount = document.getElementById("savedNavCount");
  if (!stage || !cardWrap) return;

  var EMAIL_KEY = "wf_discover_email";
  var POSTAL_KEY = "wf_postal_code";

  var deck = TREATMENTS.slice();
  var index = 0;
  var currentCard = null;
  var locked = false;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function slug(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function imgFor(t) {
    if (typeof TREATMENT_IMAGES !== "undefined" && TREATMENT_IMAGES[t.name]) return TREATMENT_IMAGES[t.name].src;
    if (typeof TREATMENT_ART !== "undefined" && TREATMENT_ART[t.group]) return TREATMENT_ART[t.group];
    return "";
  }
  function favs() {
    try { return window.wfFavs ? window.wfFavs.get() : []; } catch (_) { return []; }
  }
  function treatmentNames() {
    return deck.map(function (t) { return t.name; });
  }
  function savedCount() {
    var names = treatmentNames();
    return favs().filter(function (n) { return names.indexOf(n) > -1; }).length;
  }
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove("on"); }, 1400);
  }
  function updateMeta() {
    var total = deck.length;
    if (progress) progress.textContent = Math.min(index + 1, total) + " of " + total;
    if (savedProgress) savedProgress.textContent = savedCount() + " saved";
    if (progressBar) progressBar.style.width = Math.round((index / total) * 100) + "%";
    if (savedNavCount) savedNavCount.textContent = favs().length;
  }

  /* ---------- card ---------- */
  function cardHTML(t) {
    var img = imgFor(t);
    var s = slug(t.name);
    return '<article class="discover-card entering" tabindex="0" aria-label="' + esc(t.name) + '. Press right arrow to save, left arrow to pass.">'
      + '<span class="choice-stamp choice-stamp--save">Save</span>'
      + '<span class="choice-stamp choice-stamp--skip">Pass</span>'
      + (img ? '<div class="card-photo"><img src="' + esc(img) + '" alt="" loading="' + (index === 0 ? "eager" : "lazy") + '">'
        + '<span class="card-kicker">Billed as ' + esc(t.billed) + "</span></div>" : "")
      + '<div class="card-content"><h2>' + esc(t.name) + "</h2>"
      + '<p class="card-description">' + esc(t.desc) + "</p>"
      + '<div class="benefit-check"><div><small>Coverage</small><strong>' + esc(t.billed) + " benefit</strong></div>"
      + '<a href="/clinics-' + s + '">Find clinics</a></div>'
      + "</div></article>";
  }

  function renderCard() {
    updateMeta();
    if (index >= deck.length) { renderGate(); return; }
    var t = deck[index];
    if (clinicBtn) clinicBtn.href = "/clinics-" + slug(t.name);
    cardWrap.innerHTML = cardHTML(t);
    currentCard = cardWrap.querySelector(".discover-card");
    attachSwipe(currentCard);
    currentCard.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") dismiss("right");
      else if (e.key === "ArrowLeft") dismiss("left");
    });
    locked = false;
  }

  /* ---------- swipe ---------- */
  function attachSwipe(el) {
    var pid = null, startX = 0, startY = 0, dx = 0;
    var stampSave = el.querySelector(".choice-stamp--save");
    var stampSkip = el.querySelector(".choice-stamp--skip");
    el.addEventListener("pointerdown", function (e) {
      if (locked) return;
      pid = e.pointerId; startX = e.clientX; startY = e.clientY; dx = 0;
      try { el.setPointerCapture(pid); } catch (_) {}
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (e.pointerId !== pid || locked) return;
      var dy = e.clientY - startY;
      dx = e.clientX - startX;
      if (Math.abs(dy) > Math.abs(dx) + 12) return; // let vertical scroll win
      el.style.transform = "translateX(" + dx + "px) rotate(" + dx / 22 + "deg)";
      var o = Math.min(1, Math.abs(dx) / 90);
      if (stampSave) stampSave.style.opacity = dx > 0 ? o : 0;
      if (stampSkip) stampSkip.style.opacity = dx < 0 ? o : 0;
    });
    function end(e) {
      if (e.pointerId !== pid || locked) return;
      pid = null;
      el.classList.remove("dragging");
      if (dx > 110) return flyOut("right");
      if (dx < -110) return flyOut("left");
      el.style.transform = "";
      if (stampSave) stampSave.style.opacity = 0;
      if (stampSkip) stampSkip.style.opacity = 0;
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  function flyOut(dir) {
    if (!currentCard || locked) return;
    locked = true;
    var el = currentCard;
    el.style.transition = "transform .28s ease, opacity .28s ease";
    el.style.transform = "translateX(" + (dir === "right" ? 480 : -480) + "px) rotate(" + (dir === "right" ? 18 : -18) + "deg)";
    el.style.opacity = "0";
    setTimeout(function () { dismiss(dir); }, 260);
  }

  function dismiss(dir) {
    if (index >= deck.length) return;
    var t = deck[index];
    if (dir === "right") {
      if (window.wfFavs && !window.wfFavs.has(t.name)) window.wfFavs.toggle(t.name);
      showToast("Saved " + t.name);
    } else {
      showToast("Passed");
    }
    index++;
    renderCard();
  }

  /* ---------- gate: email + postal code -> wellness page ---------- */
  function renderGate() {
    if (actions) actions.hidden = true;
    updateMeta();
    var n = savedCount();
    cardWrap.innerHTML = '<section class="discover-complete"><div>'
      + '<div class="complete-mark">✓</div>'
      + "<h2>Your treatment shortlist is ready.</h2>"
      + "<p>You saved <strong>" + n + "</strong> treatment" + (n === 1 ? "" : "s") + ".</p>"
      + '<form id="gateForm" class="gate-form" novalidate>'
      + '<label for="gateEmail">Email address</label>'
      + '<input id="gateEmail" type="email" autocomplete="email" placeholder="you@example.com">'
      + '<label for="gatePostal">Postal code</label>'
      + '<input id="gatePostal" autocomplete="postal-code" placeholder="M4B 1B3">'
      + '<p class="gate-error" id="gateError" hidden></p>'
      + '<button class="btn btn--primary" type="submit">See my wellness page →</button>'
      + "<small>We use your postal code to suggest nearby clinics. No spam, unsubscribe anytime.</small>"
      + "</form></div></section>";
    var form = document.getElementById("gateForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("gateEmail").value.trim();
      var postal = document.getElementById("gatePostal").value.trim().toUpperCase();
      var err = document.getElementById("gateError");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        err.textContent = "Enter a valid email address.";
        err.hidden = false;
        return;
      }
      if (!/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(postal)) {
        err.textContent = "Enter a valid postal code, like M4B 1B3.";
        err.hidden = false;
        return;
      }
      try {
        localStorage.setItem(EMAIL_KEY, email);
        localStorage.setItem(POSTAL_KEY, postal);
      } catch (_) {}
      window.location.href = "/saved";
    });
    currentCard = null;
  }

  /* ---------- buttons ---------- */
  if (skipBtn) skipBtn.addEventListener("click", function () { flyOut("left"); });
  if (saveBtn) saveBtn.addEventListener("click", function () { flyOut("right"); });

  renderCard();
})();
