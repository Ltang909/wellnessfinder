/* ============================================================
   WellFinder wellness page (/saved) — saved treatments,
   saved clinics, postal-code based clinic suggestions, and
   the My WellFinder benefits wallet: a browser-parsed
   insurance booklet (localStorage wf_booklet), wallet cards,
   and a year-end use-it timeline. Uses the unified
   wf_favourites store + wf_saved_meta management store.
   ============================================================ */
(function () {
  "use strict";

  if (typeof TREATMENTS === "undefined") return;

  var FAV_KEY = "wf_favourites";
  var POSTAL_KEY = "wf_postal_code";
  var EMAIL_KEY = "wf_discover_email";
  var BOOKLET_KEY = "wf_booklet";

  var treatWrap = document.getElementById("savedTreatments");
  var clinicWrap = document.getElementById("savedClinics");
  if (!treatWrap || !clinicWrap) return;

  var count = document.getElementById("savedCount");
  var empty = document.getElementById("savedEmpty");
  var clear = document.getElementById("clearSaved");

  function $(id) { return document.getElementById(id); }
  function storeSet(k, v) {
    if (window.wfStoreSet) window.wfStoreSet(k, v);
    else { try { localStorage.setItem(k, v); } catch (_) {} }
  }
  function storeRemove(k) {
    if (window.wfStoreRemove) window.wfStoreRemove(k);
    else { try { localStorage.removeItem(k); } catch (_) {} }
  }

  /* ---------- per-clinic management meta (status + private note) ---------- */
  var META_KEY = "wf_saved_meta";
  function metaAll() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (_) { return {}; }
  }
  function metaFor(name) { return metaAll()[name] || {}; }
  function setMeta(name, patch) {
    var m = metaAll();
    var cur = m[name] || {};
    for (var k in patch) cur[k] = patch[k];
    m[name] = cur;
    storeSet(META_KEY, JSON.stringify(m));
  }
  var STATUSES = ["Shortlisted", "Contacted", "Booked", "Done"];

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
  function money(n) { return "$" + Math.round(n).toLocaleString("en-CA"); }
  function firstAmount(str) {
    var m = String(str || "").match(/\$\s?([\d,]+(?:\.\d{1,2})?)/);
    return m ? parseFloat(m[1].replace(/,/g, "")) : null;
  }
  /* Session price for estimates: prefer the follow-up amount when a
     price string lists initial + follow-up, else the first amount. */
  function sessionPrice(str) {
    var s = String(str || "");
    var amounts = [];
    var re = /\$\s?([\d,]+(?:\.\d{1,2})?)/g, m;
    while ((m = re.exec(s))) amounts.push(parseFloat(m[1].replace(/,/g, "")));
    if (!amounts.length) return null;
    if (amounts.length > 1 && /follow/i.test(s)) return amounts[amounts.length - 1];
    return amounts[0];
  }

  /* ---------- booklet categories ---------- */
  var MW_CATS = [
    { name: "Physiotherapy", color: "#0B6E99", aliases: ["physiotherapy", "physiotherapist"] },
    { name: "Chiropractic", color: "#D9730D", aliases: ["chiropractic", "chiropractor"] },
    { name: "Naturopathy", color: "#0F7B6C", aliases: ["naturopathy", "naturopathic", "naturopath"] },
    { name: "Psychology", color: "#E03E3E", aliases: ["psychology", "psychologist", "psychological services"] },
    { name: "Psychotherapy", color: "#B03A5B", aliases: ["psychotherapy", "psychotherapist"] },
    { name: "Massage Therapy", color: "#64473A", aliases: ["massage therapy", "massage therapist", "massage"] },
    { name: "Acupuncture", color: "#AD1A72", aliases: ["acupuncture", "acupuncturist"] },
    { name: "Osteopathy", color: "#6940A5", aliases: ["osteopathy", "osteopath"] },
    { name: "Dietitian", color: "#5B7F1E", aliases: ["dietitian", "dietician", "registered dietitian"] },
    { name: "Speech Therapy", color: "#DFAB01", aliases: ["speech therapy", "speech-language", "speech language"] },
    { name: "Dental", color: "#3FA7F5", aliases: ["dental"] }
  ];
  function catMeta(name) {
    for (var i = 0; i < MW_CATS.length; i++) if (MW_CATS[i].name === name) return MW_CATS[i];
    return { name: name, color: "#6E8F7A", aliases: [] };
  }
  /* Map a treatment to the booklet category it bills under, from the
     directory's own billed-as data (e.g. "Physio / Chiro"). */
  function treatmentCategory(t) {
    if (!t) return null;
    var hay = (t.billed || "") + " | " + (t.categories || []).join(" | ");
    var tests = [
      [/physiotherapy|physio\b/i, "Physiotherapy"],
      [/chiropractic|chiro\b/i, "Chiropractic"],
      [/naturopath/i, "Naturopathy"],
      [/psychology|psychologist/i, "Psychology"],
      [/psychotherap|counsell/i, "Psychotherapy"],
      [/massage/i, "Massage Therapy"],
      [/acupuncture/i, "Acupuncture"],
      [/osteopath/i, "Osteopathy"],
      [/dietitian|dietician|nutrition/i, "Dietitian"],
      [/speech/i, "Speech Therapy"],
      [/dental/i, "Dental"]
    ];
    for (var i = 0; i < tests.length; i++) if (tests[i][0].test(hay)) return tests[i][1];
    return null;
  }

  /* ---------- booklet store ---------- */
  function booklet() {
    try {
      var b = JSON.parse(localStorage.getItem(BOOKLET_KEY) || "null");
      if (!b || typeof b !== "object" || !b.categories) return null;
      return b;
    } catch (_) { return null; }
  }
  function saveBooklet(b) { storeSet(BOOKLET_KEY, JSON.stringify(b)); }
  function catLeft(b, cat) {
    if (!b || !b.categories[cat]) return 0;
    return Math.max(0, (b.categories[cat].max || 0) - (b.categories[cat].used || 0));
  }
  function bookletTotals(b) {
    var max = 0, left = 0;
    Object.keys(b.categories).forEach(function (k) {
      max += b.categories[k].max || 0;
      left += catLeft(b, k);
    });
    return { max: max, left: left };
  }
  function resetDate(b) {
    if (!b || !b.resetsISO) return null;
    var p = String(b.resetsISO).split("-");
    var d = new Date(parseInt(p[0], 10), (parseInt(p[1], 10) || 1) - 1, parseInt(p[2], 10) || 1);
    return isNaN(d) ? null : d;
  }
  function daysToReset(b) {
    var r = resetDate(b); if (!r) return null;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((r - now) / 864e5));
  }
  function fmtDate(d) {
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  }
  function nextJan1ISO() {
    var now = new Date();
    var d = new Date(now.getFullYear(), 0, 1);
    if (d <= now) d = new Date(now.getFullYear() + 1, 0, 1);
    return d.getFullYear() + "-01-01";
  }

  /* ---------- verified-data lookups (clinic-extra / slots) ---------- */
  function extraFor(c) {
    if (typeof CLINIC_EXTRA === "undefined" || !CLINIC_EXTRA.x) return null;
    return CLINIC_EXTRA.x[(c.name + "|" + (c.city || "")).toLowerCase()] || null;
  }
  function mediaFor(c) {
    return (typeof CLINIC_MEDIA !== "undefined" && CLINIC_MEDIA[c.name]) || {};
  }
  function dbFor(vm) { return vm.media.db || (vm.X && vm.X.db) || ""; }
  function ratingFor(vm) {
    if (vm.media.rating && vm.media.rating[0]) return [vm.media.rating[0], vm.media.rating[1] || 0];
    if (vm.X && vm.X.r) return [vm.X.r, vm.X.n || 0];
    return null;
  }
  function pairFor(vm, T) { return vm.X && vm.X.pairs ? vm.X.pairs[T] : null; }
  function priceStrFor(vm, T) {
    var pair = pairFor(vm, T);
    if (vm.media.priceByTreatment && vm.media.priceByTreatment[T]) return vm.media.priceByTreatment[T];
    if (pair && pair.p) return pair.p;
    if (vm.media.price) return vm.media.price;
    if (vm.clinic.price && vm.clinic.price.indexOf("$") > -1) return vm.clinic.price;
    return "";
  }
  function bookUrlFor(vm, T) {
    var pair = pairFor(vm, T);
    return vm.media.link || vm.clinic.book || (vm.X && vm.X.b) || (pair && pair.l) || "";
  }
  function slotFor(vm, T) {
    if (typeof CLINIC_SLOTS === "undefined") return null;
    var byClinic = CLINIC_SLOTS[vm.key];
    return byClinic ? byClinic[T] || null : null;
  }
  function firstSlot(vm, T) {
    var slot = slotFor(vm, T);
    if (!slot) return null;
    var kinds = slot.a ? ["a"] : ["i", "f"];
    for (var i = 0; i < kinds.length; i++) {
      var s = slot[kinds[i]];
      if (s && s.list && s.list.length) return s.list[0];
      if (s && s.d) return s;
    }
    return null;
  }

  /* ---------- hours (same parse as the directory cards) ---------- */
  var MW_TZ = { BC: "America/Vancouver", AB: "America/Edmonton", SK: "America/Regina", MB: "America/Winnipeg", ON: "America/Toronto", QC: "America/Toronto", NB: "America/Moncton", NS: "America/Halifax", PE: "America/Halifax", NL: "America/St_Johns", YT: "America/Whitehorse", NT: "America/Yellowknife", NU: "America/Iqaluit" };
  var MW_DAYKEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var MW_WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  var MW_DAYLBL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  function parseRanges(str) {
    if (!str) return null;
    var out = [];
    var parts = String(str).split(",");
    for (var i = 0; i < parts.length; i++) {
      var m = parts[i].match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[-–—]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
      if (!m) return null;
      var toMin = function (h, mi, ap) { var hh = parseInt(h, 10) % 12; if (/pm/i.test(ap)) hh += 12; return hh * 60 + parseInt(mi || "0", 10); };
      out.push([toMin(m[1], m[2], m[3]), toMin(m[4], m[5], m[6])]);
    }
    return out.length ? out : null;
  }
  function todayState(hours, prov) {
    if (!hours) return null;
    var tz = MW_TZ[prov || "ON"] || "America/Toronto";
    var now;
    try { now = new Date(new Date().toLocaleString("en-US", { timeZone: tz })); }
    catch (e) { now = new Date(); }
    var key = MW_DAYKEYS[now.getDay()];
    var todayStr = hours[key] || null;
    var ranges = parseRanges(todayStr);
    var open = null;
    if (ranges) {
      var mins = now.getHours() * 60 + now.getMinutes();
      open = ranges.some(function (r) { return mins >= r[0] && mins < r[1]; });
    }
    return { key: key, label: todayStr, open: open, closed: !todayStr };
  }
  function fmtHours(str) {
    return String(str).replace(/\s*-\s*/g, " – ").replace(/(\d)(AM|PM)/gi, "$1 $2");
  }

  /* ---------- location ---------- */
  function postalZone(postal) {
    var fsa = String(postal || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!/^[A-Z]\d[A-Z]$/.test(fsa)) return null;
    return fsa[0];
  }
  var FSA_PROV = { A: "NL", B: "NS", C: "PE", E: "NB", G: "QC", H: "QC", J: "QC", K: "ON", L: "ON", M: "ON", N: "ON", P: "ON", R: "MB", S: "SK", T: "AB", V: "BC", X: "NT", Y: "YT" };
  var PROV_NAMES = { ON: "Ontario", QC: "Quebec", BC: "British Columbia", AB: "Alberta", MB: "Manitoba", SK: "Saskatchewan", NS: "Nova Scotia", NB: "New Brunswick", NL: "Newfoundland and Labrador", PE: "Prince Edward Island", YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut", CA: "Canada" };
  var userPt = null, userPtKey = "";
  function loadCoords() {
    var p = window.wfLoc ? wfLoc.get() : "";
    if (!p) { userPt = null; userPtKey = ""; return Promise.resolve(null); }
    if (userPt && userPtKey === p) return Promise.resolve(userPt);
    return wfLoc.coords().then(function (pt) {
      userPt = pt; userPtKey = p;
      clinicVMs.forEach(function (vm) {
        vm.distKm = pt && vm.coords ? window.wfGeo.haversineKm(pt, vm.coords) : Infinity;
      });
      return pt;
    }).catch(function () { return null; });
  }

  /* ============================================================
     Saved clinic view models
     ============================================================ */
  var clinicVMs = [];
  var filters = { db: false, open: false, tx: "", dist: 50, sort: "closest" };

  function buildVMs() {
    var byName = {};
    allClinics().forEach(function (item) {
      (byName[item.clinic.name] = byName[item.clinic.name] || []).push(item);
    });
    clinicVMs = [];
    favs().forEach(function (name) {
      if (treatmentByName(name)) return;
      var entries = byName[name];
      if (!entries) return;
      var c = entries[0].clinic;
      var txs = [];
      entries.forEach(function (e) { if (txs.indexOf(e.treatment) < 0) txs.push(e.treatment); });
      var vm = {
        name: name, clinic: c, treatments: txs,
        key: (c.name + "|" + (c.city || "")).toLowerCase(),
        X: null, media: {}, coords: null, distKm: Infinity,
        hasSlots: false
      };
      vm.X = extraFor(c);
      vm.media = mediaFor(c);
      vm.dbv = dbFor(vm);
      vm.rating = ratingFor(vm);
      if (window.wfGeo) {
        vm.coords = window.wfGeo.clinicCoords(c) ||
          (vm.media.lat != null ? [parseFloat(vm.media.lat), parseFloat(vm.media.lng)] : null);
      }
      vm.treatments.forEach(function (T) { if (slotFor(vm, T)) vm.hasSlots = true; });
      if (userPt && vm.coords && window.wfGeo) vm.distKm = window.wfGeo.haversineKm(userPt, vm.coords);
      clinicVMs.push(vm);
    });
  }
  function covLeftFor(vm) {
    var b = booklet(); if (!b) return 0;
    var best = 0;
    vm.treatments.forEach(function (tn) {
      var cat = treatmentCategory(treatmentByName(tn));
      if (cat) best = Math.max(best, catLeft(b, cat));
    });
    return best;
  }
  function visibleVMs() {
    var list = clinicVMs.slice();
    if (filters.db) list = list.filter(function (vm) { return vm.dbv === "yes"; });
    if (filters.open) list = list.filter(function (vm) {
      var st = vm.X && vm.X.h ? todayState(vm.X.h, vm.clinic.prov) : null;
      return !!(st && st.open === true);
    });
    if (filters.tx) list = list.filter(function (vm) { return vm.treatments.indexOf(filters.tx) > -1; });
    if (userPt) list = list.filter(function (vm) { return vm.distKm <= filters.dist; });
    var bySlots = function (a, b) { return (b.hasSlots ? 1 : 0) - (a.hasSlots ? 1 : 0); };
    if (filters.sort === "rated") {
      list.sort(function (a, b) { return bySlots(a, b) || ((b.rating ? b.rating[0] : 0) - (a.rating ? a.rating[0] : 0)) || (a.distKm - b.distKm); });
    } else if (filters.sort === "coverage") {
      list.sort(function (a, b) { return bySlots(a, b) || (covLeftFor(b) - covLeftFor(a)) || (a.distKm - b.distKm); });
    } else {
      list.sort(function (a, b) { return bySlots(a, b) || (a.distKm - b.distKm); });
    }
    return list;
  }

  /* ============================================================
     Wallet hero + booklet upload/parse
     ============================================================ */
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/pdf,.pdf,.txt,text/plain,image/png,image/jpeg,image/webp";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);
  var parseStatusMsg = "";
  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files.length) handleIntakeFiles(fileInput.files);
    fileInput.value = "";
  });
  function pickPdf() { fileInput.click(); }

  /* ---------- intake routing: PDF / text file / screenshot (OCR) ---------- */
  function isPdfFile(f) { return (f.type || "") === "application/pdf" || /\.pdf$/i.test(f.name || ""); }
  function isTxtFile(f) { return (f.type || "") === "text/plain" || /\.txt$/i.test(f.name || ""); }
  function isImageFile(f) { return /^image\/(png|jpe?g|webp)$/i.test(f.type || "") || /\.(png|jpe?g|webp)$/i.test(f.name || ""); }
  function handleIntakeFiles(list) {
    var files = Array.prototype.slice.call(list || []);
    if (!files.length) return;
    if (files.length > 1 && files.every(isImageFile)) { parseImages(files.slice(0, 3)); return; }
    routeIntakeFile(files[0]);
  }
  function routeIntakeFile(f) {
    if (!f) return;
    if (isPdfFile(f)) { parsePdf(f); return; }
    if (isTxtFile(f)) { parseTextFile(f); return; }
    if (isImageFile(f)) { parseImages([f]); return; }
    parseStatusMsg = "That file type can't be read — try a PDF, a PNG/JPG screenshot, or paste the text.";
    renderHero();
  }
  /* Every source lands in the same extract + confirm pipeline. */
  function ingestText(text, sourceLabel) {
    parseStatusMsg = "";
    if (!text || text.replace(/\s/g, "").length < 40) {
      parseStatusMsg = "We couldn't pull any plan details out of that — try pasting the text or entering your plan manually.";
      renderHero();
      return;
    }
    var parsed = extractPlan(text);
    parsed.sourceLabel = sourceLabel;
    if (!Object.keys(parsed.categories).length) {
      parsed.note = "Couldn't read that clearly — check the amounts or enter them here.";
    }
    renderConfirm(parsed);
  }
  function parseTextFile(file) {
    parseStatusMsg = "Reading your text file on this device…";
    renderHero();
    file.text().then(function (text) {
      ingestText(text, "your text");
    }).catch(function () {
      parseStatusMsg = "We couldn't read that text file — try pasting the text instead.";
      renderHero();
    });
  }

  /* ---------- screenshot OCR (Tesseract.js, vendored, fully on-device) ---------- */
  var ocrWorker = null, ocrLibPromise = null, ocrState = { i: 0, n: 1, lastPct: -999 };
  function loadOcrLib() {
    if (window.Tesseract) return Promise.resolve();
    if (!ocrLibPromise) {
      ocrLibPromise = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = "js/vendor/ocr/tesseract.min.js?v=1";
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error("ocr lib failed to load")); };
        document.head.appendChild(s);
      });
    }
    return ocrLibPromise;
  }
  function ocrStatus(m) {
    var msg = null;
    if (m.status === "recognizing text") {
      var pct = Math.round((m.progress || 0) * 100);
      if (pct === ocrState.lastPct) return;
      ocrState.lastPct = pct;
      msg = "Reading " + (ocrState.n > 1 ? "screenshot " + (ocrState.i + 1) + " of " + ocrState.n : "your screenshot") + " on this device… " + pct + "%";
    } else if (/loading|initiali[sz]ing|compiling/i.test(m.status || "")) {
      if (ocrState.lastPct === -2) return;
      ocrState.lastPct = -2;
      msg = "Preparing the screenshot reader on this device…";
    }
    if (msg === null) return;
    parseStatusMsg = msg;
    renderHero();
  }
  function getOcrWorker() {
    if (ocrWorker) return Promise.resolve(ocrWorker);
    return loadOcrLib().then(function () {
      return Tesseract.createWorker("eng", 1, {
        workerPath: "js/vendor/ocr/worker.min.js",
        corePath: "js/vendor/ocr",
        langPath: "js/vendor/ocr",
        cacheMethod: "none",
        logger: ocrStatus
      });
    }).then(function (w) { ocrWorker = w; return w; });
  }
  function parseImages(files) {
    files = files.slice(0, 3);
    ocrState = { i: 0, n: files.length, lastPct: -999 };
    parseStatusMsg = "Reading your screenshot" + (files.length > 1 ? "s" : "") + " on this device…";
    renderHero();
    getOcrWorker().then(function (worker) {
      var texts = [];
      var chain = Promise.resolve();
      files.forEach(function (f, idx) {
        chain = chain.then(function () {
          ocrState.i = idx; ocrState.lastPct = -999;
          return worker.recognize(f).then(function (r) { texts.push((r.data && r.data.text) || ""); });
        });
      });
      return chain.then(function () { return texts.join("\n"); });
    }).then(function (text) {
      ingestText(text, "your screenshot");
    }).catch(function () {
      parseStatusMsg = "We couldn't read that screenshot — try a clearer image, a PDF, or paste the text.";
      renderHero();
    });
  }

  function renderHero() {
    var host = $("mwHero");
    if (!host) return;
    var b = booklet();
    if (!b) {
      host.innerHTML =
        '<div class="mw-hero"><div class="mw-hero-flex"><div class="mw-hero-main">'
        + '<p class="mw-eyebrow">My WellFinder</p>'
        + "<h2>Your benefits, in one wallet.</h2>"
        + '<p class="mw-lede">Upload your insurance booklet and we will pull out your plan\'s yearly maximums, show what you have left in each category, and line up the treatments worth using before your plan resets.</p>'
        + '<div class="mw-drop" id="mwDrop" role="button" tabindex="0" aria-label="Upload your benefits booklet — PDF, screenshot, or text file"><strong>📄 Drop your benefits booklet here — PDF, screenshot, or text file</strong><span>We read it on this device and pull out your insurer, categories and yearly maximums for you to confirm. Booklet spans pages? Choose up to 3 screenshots.</span></div>'
        + '<div class="mw-intake-btns"><button type="button" class="mw-manual" id="mwManualBtn">Enter my plan manually instead</button><button type="button" class="mw-manual mw-manual-alt" id="mwPasteBtn">Paste plan text instead</button></div>'
        + '<div class="mw-paste" id="mwPasteWrap" hidden><label for="mwPasteText">Paste your plan details</label><textarea id="mwPasteText" rows="6" placeholder="Paste from your insurer\'s app or website — plan text copied from an insurer portal works too. Categories with their yearly maximums read best."></textarea><button type="button" class="mw-manual" id="mwPasteGo">Read this text</button></div>'
        + (parseStatusMsg ? '<p class="mw-parse-status">' + esc(parseStatusMsg) + "</p>" : "")
        + '<p class="mw-privacy">🔒 Your files never leave this device — everything is read right here in your browser, and your plan is stored only on this device.</p>'
        + '</div>'
        + '<div class="mw-pet"><div class="mw-petdisc"><img src="assets/petpet/peek.png" alt="Pet Pet"></div><p>Pet Pet keeps<br>an eye on the deadline.</p></div>'
        + "</div></div>";
      var drop = $("mwDrop");
      if (drop) {
        drop.addEventListener("click", pickPdf);
        drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickPdf(); } });
        ["dragover", "dragenter"].forEach(function (ev) {
          drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("dragover"); });
        });
        ["dragleave", "drop"].forEach(function (ev) {
          drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("dragover"); });
        });
        drop.addEventListener("drop", function (e) {
          var fs = e.dataTransfer && e.dataTransfer.files;
          if (fs && fs.length) handleIntakeFiles(fs);
        });
      }
      var mb = $("mwManualBtn");
      if (mb) mb.addEventListener("click", function () {
        renderConfirm({ insurer: "", planName: "", resetsISO: nextJan1ISO(), categories: {} });
      });
      var pb = $("mwPasteBtn");
      if (pb) pb.addEventListener("click", function () {
        var wrap = $("mwPasteWrap");
        if (!wrap) return;
        wrap.hidden = !wrap.hidden;
        if (!wrap.hidden) { var t = $("mwPasteText"); if (t) t.focus(); }
      });
      var pg = $("mwPasteGo");
      if (pg) pg.addEventListener("click", function () {
        var t = $("mwPasteText");
        ingestText(t ? t.value : "", "your text");
      });
      return;
    }
    var totals = bookletTotals(b);
    var days = daysToReset(b);
    var r = resetDate(b);
    var pct = totals.max > 0 ? Math.round((totals.left / totals.max) * 100) : 0;
    var covYear = r ? (r.getMonth() === 0 && r.getDate() === 1 ? r.getFullYear() - 1 : r.getFullYear()) : new Date().getFullYear();
    host.innerHTML =
      '<div class="mw-hero"><div class="mw-hero-flex"><div class="mw-hero-main">'
      + '<p class="mw-eyebrow">Your benefits wallet · ' + esc(b.insurer || "Your plan") + (b.planName ? " " + esc(b.planName) : "") + "</p>"
      + '<div><span class="mw-hero-amt">' + money(totals.left) + '</span> <span class="mw-hero-sub">left of <b>' + money(totals.max) + "</b> in " + covYear + " coverage</span>"
      + (days != null && r ? '<span class="mw-dayschip">' + days + " days left · resets " + fmtDate(r) + "</span>" : "")
      + "</div>"
      + '<div class="mw-hero-bar"><i style="width:' + pct + '%"></i></div>'
      + '<p class="mw-hero-note">' + pct + "% of your coverage is still unused" + (r && days != null && days <= 120 ? " — and unused amounts don't roll over." : ".") + "</p>"
      + '<div class="mw-hero-links"><button type="button" id="mwNewerBtn">Upload a newer PDF</button><button type="button" id="mwEditBtn">Edit amounts</button><button type="button" id="mwRemoveBtn">Remove booklet</button></div>'
      + (parseStatusMsg ? '<p class="mw-parse-status">' + esc(parseStatusMsg) + "</p>" : "")
      + '</div>'
      + '<div class="mw-pet"><div class="mw-petdisc"><img src="assets/petpet/peek.png" alt="Pet Pet"></div><p>Pet Pet is watching<br>the ' + (r ? r.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "reset") + " deadline.</p></div>"
      + "</div></div>";
    $("mwNewerBtn").addEventListener("click", pickPdf);
    $("mwEditBtn").addEventListener("click", function () {
      var bb = booklet();
      var parsed = { insurer: bb.insurer || "", planName: bb.planName || "", resetsISO: bb.resetsISO || nextJan1ISO(), categories: {} };
      Object.keys(bb.categories).forEach(function (k) {
        parsed.categories[k] = { max: bb.categories[k].max || "", used: bb.categories[k].used || 0, found: false };
      });
      renderConfirm(parsed);
    });
    $("mwRemoveBtn").addEventListener("click", function () {
      if (window.confirm("Remove your booklet and plan balances from this device?")) {
        storeRemove(BOOKLET_KEY);
        parseStatusMsg = "";
        renderWallet();
      }
    });
  }

  /* ---------- location bar ---------- */
  var locEditing = false;
  function renderLocBar() {
    var host = $("mwLocBar");
    if (!host) return;
    var p = window.wfLoc ? wfLoc.get() : "";
    var prov = window.wfProv ? wfProv.get() : "";
    if (p && !prov) prov = FSA_PROV[String(p).toUpperCase()[0]] || "";
    var b = booklet();
    var bookHtml = b
      ? '<span class="mw-bookstat">📄 <b>Booklet on file:</b> ' + esc(b.insurer || "Plan") + (b.uploadedISO ? " · uploaded " + esc(String(b.uploadedISO).slice(0, 10)) : "") + '</span> <button type="button" class="mw-linklike" id="mwLocNewer">Upload a newer PDF</button>'
      : '<span class="mw-bookstat">No booklet yet — balances appear once you add one.</span>';
    var locHtml;
    if (locEditing) {
      var opts = ['<option value="">Province</option>', '<option value="CA"' + (prov === "CA" ? " selected" : "") + ">Canada</option>"]
        .concat(Object.keys(PROV_NAMES).filter(function (k) { return k !== "CA"; }).map(function (k) {
          return '<option value="' + k + '"' + (k === prov ? " selected" : "") + ">" + PROV_NAMES[k] + "</option>";
        })).join("");
      locHtml = '<form class="mw-locform" id="mwLocForm"><span aria-hidden="true">📍</span>'
        + '<input id="mwLocPostal" placeholder="Postal code" autocomplete="postal-code" value="' + esc(p || "") + '" aria-label="Postal code">'
        + '<select id="mwLocProv" class="mw-sel" aria-label="Province">' + opts + "</select>"
        + '<button class="btn btn--primary btn--sm" type="submit">Set location</button>'
        + '<button type="button" class="mw-linklike" id="mwLocCancel">Cancel</button></form>';
    } else if (p) {
      var fsa = String(p).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
      locHtml = '<span aria-hidden="true">📍</span><span>Showing clinics near</span><span class="mw-postalchip">' + esc(fsa) + (prov && prov !== "CA" ? " · " + esc(PROV_NAMES[prov] || prov) : "") + '</span><button type="button" class="mw-linklike" id="mwLocChange">Change</button>';
    } else {
      locHtml = '<span aria-hidden="true">📍</span><span>See clinics near you</span><button type="button" class="mw-linklike" id="mwLocChange">Set your location</button>';
    }
    host.innerHTML = '<div class="mw-locbar">' + locHtml + '<span class="spacer"></span>' + bookHtml + "</div>";
    var ch = $("mwLocChange");
    if (ch) ch.addEventListener("click", function () { locEditing = true; renderLocBar(); var i = $("mwLocPostal"); if (i) { i.focus(); i.select(); } });
    var ca = $("mwLocCancel");
    if (ca) ca.addEventListener("click", function () { locEditing = false; renderLocBar(); });
    var form = $("mwLocForm");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = ($("mwLocPostal").value || "").trim().toUpperCase();
      var pv = $("mwLocProv").value;
      if (v && !(window.wfLoc && wfLoc.valid(v))) { $("mwLocPostal").focus(); return; }
      if (!v && !pv) { $("mwLocProv").focus(); return; }
      if (v) { wfLoc.set(v); wfLoc.reset(); if (!pv || pv === "CA") pv = FSA_PROV[v[0]] || ""; }
      if (pv) wfProv.set(pv);
      locEditing = false;
      window.dispatchEvent(new CustomEvent("wf:location"));
    });
    var nw = $("mwLocNewer");
    if (nw) nw.addEventListener("click", pickPdf);
  }

  /* ---------- wallet cards ---------- */
  function renderWalletCards() {
    var host = $("mwWalletCards");
    if (!host) return;
    var b = booklet();
    if (!b) { host.innerHTML = ""; return; }
    var savedTx = favs().map(treatmentByName).filter(Boolean);
    var order = MW_CATS.map(function (c) { return c.name; });
    Object.keys(b.categories).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });
    var cards = order.filter(function (name) { return b.categories[name]; }).map(function (name) {
      var meta = catMeta(name);
      var cc = b.categories[name];
      var left = Math.max(0, (cc.max || 0) - (cc.used || 0));
      var pctLeft = cc.max > 0 ? Math.round((left / cc.max) * 100) : 0;
      var tag = "";
      if (left <= 0) tag = '<span class="mw-tag mw-tag-used">Used up</span>';
      else if (left >= (cc.max || 0)) tag = '<span class="mw-tag mw-tag-full">Untouched</span>';
      else if (pctLeft <= 25) tag = '<span class="mw-tag mw-tag-low">Running low</span>';
      var pins = savedTx.filter(function (t) { return treatmentCategory(t) === name; });
      var pinHtml = pins.length
        ? pins.map(function (t) { return '<span class="mw-txtag"><span class="mw-dot" style="background:' + meta.color + '"></span>' + esc(t.name) + " ♥</span>"; }).join("")
        : (left <= 0
          ? '<p class="none">Back ' + (resetDate(b) ? fmtDate(resetDate(b)) : "next plan year") + "</p>"
          : '<p class="none">No saved treatments yet</p>');
      return '<div class="mw-wcard' + (left <= 0 ? " usedup" : "") + '">'
        + '<p class="mw-wcard-head"><span class="mw-dot" style="background:' + meta.color + '"></span>' + esc(name) + "</p>"
        + '<div class="mw-wamt">' + money(left) + "</div>"
        + '<p class="mw-wsub">left of ' + money(cc.max || 0) + " max</p>"
        + '<div class="mw-covbar"><i class="' + (pctLeft <= 25 && left > 0 ? "low" : "") + '" style="width:' + pctLeft + '%"></i></div>'
        + tag
        + '<div class="mw-pinrow"><p>Saved here</p>' + pinHtml + "</div>"
        + "</div>";
    }).join("");
    host.innerHTML = (cards ? '<div class="mw-wallet-grid">' + cards + "</div>" : "")
      + '<p class="mw-qual">Balances come from the benefits booklet (PDF) you uploaded, stored only on this device. Amounts may be covered by your plan — confirm with ' + esc(b.insurer || "your insurer") + " before booking.</p>";
  }

  /* ---------- year-end timeline ---------- */
  function pickStep(cat, left, usedTx) {
    var b = booklet();
    var r = resetDate(b);
    var days = daysToReset(b);
    var candidates = TREATMENTS.filter(function (t) {
      return treatmentCategory(t) === cat && usedTx.indexOf(t.name) < 0;
    });
    candidates.sort(function (a, c) {
      var sa = favs().indexOf(a.name) > -1 ? 0 : 1;
      var sc = favs().indexOf(c.name) > -1 ? 0 : 1;
      return sa - sc;
    });
    var all = allClinics();
    for (var ci = 0; ci < candidates.length; ci++) {
      var T = candidates[ci];
      var entries = all.filter(function (item) { return item.treatment === T.name; });
      var vms = entries.map(function (item) {
        var c = item.clinic;
        var vm = { name: c.name, clinic: c, key: (c.name + "|" + (c.city || "")).toLowerCase(), X: extraFor(c), media: mediaFor(c), distKm: Infinity };
        vm.dbv = dbFor(vm); vm.rating = ratingFor(vm);
        if (window.wfGeo && userPt) {
          var coords = window.wfGeo.clinicCoords(c) || (vm.media.lat != null ? [parseFloat(vm.media.lat), parseFloat(vm.media.lng)] : null);
          if (coords) vm.distKm = window.wfGeo.haversineKm(userPt, coords);
        }
        vm.priceStr = priceStrFor(vm, T.name);
        vm.price = sessionPrice(vm.priceStr);
        return vm;
      }).filter(function (vm) { return vm.price && vm.price > 0; });
      vms.sort(function (a, c) {
        var sa = favs().indexOf(a.name) > -1 ? 0 : 1;
        var sc = favs().indexOf(c.name) > -1 ? 0 : 1;
        return sa - sc || (a.distKm - c.distKm) || ((c.rating ? c.rating[0] : 0) - (a.rating ? a.rating[0] : 0));
      });
      if (!vms.length) continue;
      var pick = vms[0];
      var cadence = Math.max(1, Math.min(12, Math.floor((days || 30) / 7)));
      var sessions = Math.min(Math.floor(left / pick.price), cadence);
      if (sessions < 1) continue;
      usedTx.push(T.name);
      return {
        cat: cat, left: left, treatment: T, clinicName: pick.name,
        price: pick.price, priceStr: pick.priceStr, sessions: sessions,
        total: sessions * pick.price,
        bookUrl: bookUrlFor(pick, T.name),
        slot: firstSlot(pick, T.name)
      };
    }
    return null;
  }
  function renderTimeline() {
    var host = $("mwTimeline");
    if (!host) return;
    var b = booklet();
    if (!b) { host.innerHTML = ""; return; }
    var days = daysToReset(b);
    var r = resetDate(b);
    var cats = Object.keys(b.categories).map(function (k) { return { name: k, left: catLeft(b, k) }; })
      .filter(function (c) { return c.left > 0; })
      .sort(function (a, c) { return c.left - a.left; });
    var usedTx = [];
    var steps = [];
    for (var i = 0; i < cats.length && steps.length < 3; i++) {
      var s = pickStep(cats[i].name, cats[i].left, usedTx);
      if (s) steps.push(s);
    }
    /* Categories with a balance too small for one session still get a
       gentle nudge step, like the mock's psychology card. */
    if (steps.length < 3) {
      for (var j = 0; j < cats.length && steps.length < 3; j++) {
        var cn = cats[j].name;
        if (steps.some(function (s) { return s.cat === cn; })) continue;
        var txs = TREATMENTS.filter(function (t) { return treatmentCategory(t) === cn; });
        if (!txs.length) continue;
        steps.push({ cat: cn, left: cats[j].left, generic: true, treatment: txs[0] });
      }
    }
    if (!steps.length) { host.innerHTML = ""; return; }
    var yearEnd = days != null && days <= 120;
    var total = steps.reduce(function (sum, s) { return sum + (s.total || 0); }, 0);
    var labels;
    if (yearEnd && r) {
      var mid = new Date(Date.now() + 10 * 864e5);
      var by = new Date(r.getTime() - 16 * 864e5);
      labels = ["This week",
        "Mid " + mid.toLocaleDateString("en-CA", { month: "short" }) + " – " + r.toLocaleDateString("en-CA", { month: "short" }),
        "By " + by.toLocaleDateString("en-CA", { month: "short", day: "numeric" })];
    } else {
      labels = ["Start here", "Next", "Then"];
    }
    var track = "";
    if (yearEnd && r) {
      var m0 = new Date().toLocaleDateString("en-CA", { month: "short" }).toUpperCase();
      var m1 = new Date(Date.now() + 30 * 864e5).toLocaleDateString("en-CA", { month: "short" }).toUpperCase();
      track = '<div class="mw-tl-track"><div class="line"></div>'
        + '<span class="pt" style="left:0"></span><span class="pt mid" style="left:38%"></span><span class="pt mid" style="left:72%"></span><span class="pt end" style="right:0"></span></div>'
        + '<div class="mw-tl-labels"><span>Early ' + m0 + '</span><span>Mid ' + m1 + '</span><span>' + r.toLocaleDateString("en-CA", { month: "short" }).toUpperCase() + '</span><span>' + r.toLocaleDateString("en-CA", { month: "short", day: "numeric" }).toUpperCase() + " · Reset</span></div>";
    }
    var cards = steps.map(function (s, idx) {
      var head = '<span class="step">Step ' + (idx + 1) + " · " + esc(labels[idx] || labels[labels.length - 1]) + "</span>";
      if (s.generic) {
        return '<div class="mw-step">' + head
          + "<h3>One " + esc(s.treatment.name.toLowerCase()) + " session</h3>"
          + "<p>Your " + esc(s.cat.toLowerCase()) + " balance is <b>running low at " + money(s.left) + "</b> — room for about <b>one more session</b> before it resets. Confirm coverage with " + esc(b.insurer || "your insurer") + " first.</p>"
          + '<div class="go"><a class="mw-bookbtn" href="/clinics-' + slug(s.treatment.name) + '">Find ' + esc(s.treatment.name) + " clinics</a></div></div>";
      }
      var chip = s.slot
        ? '<a class="nc-slot-chip" href="' + esc(s.bookUrl || "#") + '" target="_blank" rel="noopener"><b>' + esc(s.slot.d) + "</b> · " + esc(s.slot.t) + "</a>"
        : "";
      return '<div class="mw-step">' + head
        + "<h3>" + esc(s.treatment.name) + " · " + money(s.left) + " left</h3>"
        + "<p><b>" + esc(s.clinicName) + "</b> — " + esc(s.treatment.name) + " at <b>" + money(s.price) + "</b> a session"
        + (chip ? ", next opening " + esc(s.slot.d) + " · " + esc(s.slot.t) : "")
        + ". About <b>" + s.sessions + " session" + (s.sessions === 1 ? "" : "s") + "</b> ≈ <b>" + money(s.total) + "</b> of your " + esc(s.cat.toLowerCase()) + " balance may be covered.</p>"
        + '<div class="go">' + chip
        + (s.bookUrl ? '<a class="mw-bookbtn" href="' + esc(s.bookUrl) + '" target="_blank" rel="noopener">Book at ' + esc(s.clinicName.split(" (")[0]) + "</a>" : "")
        + "</div></div>";
    }).join("");
    host.innerHTML =
      '<div class="mw-timeline"><div class="mw-tl-head">'
      + '<p class="mw-eyebrow" style="color:#55705F;margin:0">' + (yearEnd ? "Use it before " + (r ? r.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "your reset") : "Your plan") + "</p>"
      + "<h2>" + (yearEnd ? "Your year-end plan" : "Your plan ahead") + "</h2>"
      + '<span class="mw-tl-sub" style="color:#5C6B5E;font-size:.9rem">' + steps.length + " moves, ranked by what expires unused.</span>"
      + (total > 0 ? '<span class="mw-tl-total">Plan total ≈ ' + money(total) + " in visits that may be covered</span>" : "")
      + "</div>" + track
      + '<div class="mw-tl-grid">' + cards + "</div>"
      + '<p class="mw-qual">Estimates from your uploaded booklet. A visit may be covered in full, in part, or not at all — confirm with ' + esc(b.insurer || "your insurer") + " and the clinic before each booking.</p>"
      + "</div>";
  }
  function renderWallet() {
    renderHero();
    renderLocBar();
    renderWalletCards();
    renderTimeline();
  }

  /* ============================================================
     Booklet PDF parsing (entirely in the browser)
     ============================================================ */
  var INSURERS = ["Medavie Blue Cross", "Alberta Blue Cross", "Pacific Blue Cross", "Manulife", "Sun Life", "Canada Life", "Desjardins", "GreenShield", "Green Shield", "Blue Cross", "Empire Life", "RBC Insurance", "Equitable Life", "Beneva", "SSQ", "iA Financial", "Industrial Alliance", "ClaimSecure", "Cowan"];
  function extractPlan(text) {
    var out = { insurer: "", planName: "", resetsISO: nextJan1ISO(), categories: {} };
    for (var i = 0; i < INSURERS.length; i++) {
      if (new RegExp(INSURERS[i].replace(/[ ]/g, "\\s+"), "i").test(text)) { out.insurer = INSURERS[i].replace("Green Shield", "GreenShield"); break; }
    }
    var pm = text.match(/extended health[^.\n]{0,40}/i);
    if (pm) out.planName = pm[0].replace(/\s+/g, " ").trim().replace(/^(.)/, function (c) { return c.toUpperCase(); });
    else if (/group benefits/i.test(text)) out.planName = "Group Plan";
    MW_CATS.forEach(function (cat) {
      var best = null;
      cat.aliases.forEach(function (alias) {
        var re = new RegExp(alias.replace(/[ ]/g, "\\s+"), "gi");
        var m;
        while ((m = re.exec(text))) {
          var win = text.slice(m.index, m.index + 220);
          var are = /\$\s?([0-9][0-9,]*(?:\.[0-9]{2})?)/g, am;
          while ((am = are.exec(win))) {
            var val = parseFloat(am[1].replace(/,/g, ""));
            if (val < 50 || val > 20000) continue;
            var after = win.slice(am.index, am.index + 60);
            var strong = /per (benefit )?year|annual|maximum|max\b/i.test(after) ? 1 : 0;
            /* Booklets list categories sequentially, so the FIRST
               annual-context amount after the category name is its
               max; fall back to the largest plain amount seen. */
            if (strong && !best) best = { val: val, strong: 1 };
            else if (!strong && !best) best = { val: val, strong: 0 };
            else if (!strong && best && !best.strong && val > best.val) best = { val: val, strong: 0 };
          }
        }
      });
      if (best) out.categories[cat.name] = { max: best.val, used: 0, found: true };
    });
    return out;
  }
  function pageText(tc) {
    var lines = [];
    var cur = [], lastY = null;
    (tc.items || []).forEach(function (it) {
      var y = it.transform ? Math.round(it.transform[5]) : 0;
      if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(cur.join(" ")); cur = []; }
      cur.push(it.str);
      lastY = y;
    });
    if (cur.length) lines.push(cur.join(" "));
    return lines.join("\n");
  }
  function parsePdf(file) {
    if (typeof pdfjsLib === "undefined") {
      parseStatusMsg = "The PDF reader didn't load — try entering your plan manually.";
      renderHero();
      return;
    }
    try { pdfjsLib.GlobalWorkerOptions.workerSrc = "js/vendor/pdf.worker.min.js"; } catch (_) {}
    parseStatusMsg = "Reading your booklet on this device…";
    renderHero();
    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var texts = [];
      var chain = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) {
        (function (n) {
          chain = chain.then(function () {
            return pdf.getPage(n).then(function (pg) { return pg.getTextContent(); })
              .then(function (tc) { texts.push(pageText(tc)); });
          });
        })(i);
      }
      return chain.then(function () { return texts.join("\n"); });
    }).then(function (text) {
      parseStatusMsg = "";
      if (!text || text.replace(/\s/g, "").length < 40) {
        parseStatusMsg = "That PDF looks like scanned images — we couldn't read its text. Try a screenshot of the page instead, or enter your plan manually.";
        renderHero();
        return;
      }
      renderConfirm(extractPlan(text));
    }).catch(function () {
      parseStatusMsg = "We couldn't read that PDF — try entering your plan manually.";
      renderHero();
    });
  }

  /* ---------- confirm / edit table ---------- */
  function renderConfirm(parsed) {
    var host = $("mwConfirm");
    if (!host) return;
    var rows = MW_CATS.map(function (cat) {
      var found = parsed.categories[cat.name];
      return "<tr><td class='catcell'><span class='mw-dot' style='background:" + cat.color + "'></span> " + esc(cat.name)
        + (found && found.found ? '<span class="found">found in ' + esc(parsed.sourceLabel || "PDF") + "</span>" : "") + "</td>"
        + '<td><input type="number" min="0" step="1" inputmode="numeric" data-mw-max="' + esc(cat.name) + '" value="' + (found ? found.max : "") + '" placeholder="0" aria-label="' + esc(cat.name) + ' yearly maximum"></td>'
        + '<td><input type="number" min="0" step="1" inputmode="numeric" data-mw-used="' + esc(cat.name) + '" value="' + (found && found.used ? found.used : 0) + '" aria-label="' + esc(cat.name) + ' already used"></td></tr>';
    }).join("");
    host.innerHTML =
      '<div class="mw-confirm"><h2>Confirm your plan</h2>'
      + '<p class="sub">We read these amounts from your booklet on this device — booklets vary, so check each line and fix anything before saving. "Already used" is what you have claimed so far this plan year; what\'s left is what My WellFinder plans around.</p>'
      + (parsed.note ? '<p class="mw-confirm-note">' + esc(parsed.note) + "</p>" : "")
      + '<div class="mw-cgrid">'
      + '<label>Insurer<input id="mwFInsurer" type="text" value="' + esc(parsed.insurer || "") + '" placeholder="e.g. Manulife"></label>'
      + '<label>Plan name<input id="mwFPlan" type="text" value="' + esc(parsed.planName || "") + '" placeholder="e.g. Extended Health"></label>'
      + '<label>Plan resets on<input id="mwFReset" type="date" value="' + esc(parsed.resetsISO || nextJan1ISO()) + '"></label>'
      + "</div>"
      + '<table class="mw-ctable"><thead><tr><th>Category</th><th>Yearly max ($)</th><th>Already used ($)</th></tr></thead><tbody>' + rows + "</tbody></table>"
      + '<div class="mw-confirm-actions"><button type="button" class="mw-savebtn" id="mwSaveBooklet">Save my booklet</button><button type="button" class="mw-cancelbtn" id="mwCancelConfirm">Cancel</button></div>'
      + "</div>";
    host.hidden = false;
    host.scrollIntoView({ behavior: "smooth", block: "start" });
    $("mwCancelConfirm").addEventListener("click", function () { host.hidden = true; host.innerHTML = ""; });
    $("mwSaveBooklet").addEventListener("click", function () {
      var cats = {};
      MW_CATS.forEach(function (cat) {
        var mx = parseFloat((host.querySelector('[data-mw-max="' + cat.name + '"]') || {}).value) || 0;
        var us = parseFloat((host.querySelector('[data-mw-used="' + cat.name + '"]') || {}).value) || 0;
        if (mx > 0) cats[cat.name] = { max: Math.round(mx), used: Math.min(Math.round(us), Math.round(mx)) };
      });
      var b = {
        insurer: ($("mwFInsurer").value || "").trim(),
        planName: ($("mwFPlan").value || "").trim(),
        resetsISO: ($("mwFReset").value || nextJan1ISO()),
        uploadedISO: new Date().toISOString(),
        categories: cats
      };
      saveBooklet(b);
      host.hidden = true; host.innerHTML = "";
      parseStatusMsg = "";
      renderWallet();
      renderTreatments();
      renderTimeline();
    });
  }

  /* ============================================================
     Saved treatments
     ============================================================ */
  function treatmentCard(t) {
    var b = booklet();
    var cat = treatmentCategory(t);
    var cov = "";
    if (b && cat && b.categories[cat]) {
      var cc = b.categories[cat];
      var left = Math.max(0, (cc.max || 0) - (cc.used || 0));
      var pct = cc.max > 0 ? Math.round((left / cc.max) * 100) : 0;
      cov = '<div class="saved-tx-cov"><span>' + money(left) + " of " + money(cc.max) + " left · " + esc(cat) + '</span><div class="mw-covbar"><i class="' + (pct <= 25 && left > 0 ? "low" : "") + '" style="width:' + pct + '%"></i></div></div>';
    }
    var photo = imgFor(t);
    var photoHtml = photo
      ? '<div class="saved-media saved-photo treatment-photo" style="background-image:url(\'' + photo + '\')" role="img" aria-label="' + esc(t.name) + '"></div>'
      : '<div class="saved-media saved-emoji" aria-hidden="true">' + (t.emoji || "•") + "</div>";
    return '<article class="saved-card">'
      + photoHtml
      + '<div class="saved-heart"><button class="fav-btn active" type="button" data-fav="' + esc(t.name) + '" aria-label="Remove ' + esc(t.name) + ' from saved"><span class="heart" aria-hidden="true">♥</span></button></div>'
      + '<div class="saved-body">'
      + '<div class="saved-type">Saved treatment</div>'
      + "<h3>" + esc(t.name) + "</h3>"
      + '<p class="saved-line"><strong>' + esc(t.group || "") + "</strong> · billed as " + esc(t.billed || "") + "</p>"
      + cov
      + '<p class="saved-line mw-tx-near" data-near-for="' + esc(t.name) + '"></p>'
      + '<a class="card-link" href="/clinics-' + slug(t.name) + '">See clinics offering ' + esc(t.name) + " →</a>"
      + "</div></article>";
  }
  function updateNearCounts() {
    document.querySelectorAll("[data-near-for]").forEach(function (p) {
      var name = p.getAttribute("data-near-for");
      if (!userPt) { p.textContent = ""; return; }
      var n = 0;
      allClinics().forEach(function (item) {
        if (item.treatment !== name) return;
        if (window.wfGeo) {
          var coords = window.wfGeo.clinicCoords(item.clinic);
          if (coords && window.wfGeo.haversineKm(userPt, coords) <= filters.dist) n++;
        }
      });
      p.textContent = n + " clinic" + (n === 1 ? "" : "s") + " offering it within " + filters.dist + " km of you";
    });
  }
  function renderTreatments() {
    var f = favs();
    var txs = f.map(treatmentByName).filter(Boolean);
    treatWrap.innerHTML = txs.length
      ? txs.map(treatmentCard).join("")
      : '<div class="saved-empty-card"><span class="big" aria-hidden="true">♥</span><h3>No saved treatments yet</h3><p>Tap the heart ♥ on any treatment to pin it here. Saved treatments get matched to your booklet balance.</p><a class="btn btn--primary" href="/">Browse treatments</a></div>';
    updateNearCounts();
    return txs.length;
  }

  /* ============================================================
     Saved clinics (directory card language + manager controls)
     ============================================================ */
  function slotTitle(s, kind, T) {
    var base = String(s.svc || T);
    base = base.replace(/\s*-\s*\d+\s*min$/i, "")
      .replace(/\s*\|\s*.*$/, "")
      .replace(/\s*\(\d+\s*min\)/gi, "")
      .replace(/^(Initial|Follow[- ]?Up)\s+/i, "")
      .replace(/^(New|Existing)\s+/i, "")
      .replace(/\s+(In Person|Virtual)$/i, "")
      .replace(/\s+/g, " ").trim();
    var kindLbl = kind === "i" ? "initial" : kind === "f" ? "follow-up" : "";
    if (T && base.toLowerCase() === T.toLowerCase()) return kindLbl ? base + " (" + kindLbl + ")" : base;
    return base || T;
  }
  /* Chronological key for a slot chip ("Tue Nov 10" + "5:00 PM"), so
     slot lines can be ranked by their earliest opening. */
  var MW_MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  function chipTimeKey(ch) {
    var dm = String(ch.d || "").match(/([A-Za-z]{3})[a-z]*\s+(\d{1,2})/);
    if (!dm) return Infinity;
    var mon = MW_MONTHS[dm[1].toLowerCase()];
    if (mon == null) return Infinity;
    var now = new Date();
    var dt = new Date(now.getFullYear(), mon, parseInt(dm[2], 10));
    if (dt.getTime() < now.getTime() - 30 * 864e5) dt.setFullYear(dt.getFullYear() + 1);
    var tm = String(ch.t || "").match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (tm) {
      var hh = parseInt(tm[1], 10) % 12;
      if (/pm/i.test(tm[3])) hh += 12;
      dt.setHours(hh, parseInt(tm[2] || "0", 10), 0, 0);
    }
    return dt.getTime();
  }
  function clinicSlotsHTML(vm) {
    /* One line per (treatment, kind); chips deduped, earliest first,
       hard-capped at 3 per line. */
    function linesFor(treatments) {
      var lines = [];
      treatments.forEach(function (T) {
        var slot = slotFor(vm, T);
        if (!slot) return;
        var kinds = slot.a ? ["a"] : ["i", "f"].filter(function (k) { return slot[k]; });
        kinds.forEach(function (kind) {
          var s = slot[kind];
          var raw = (s.list && s.list.length) ? s.list : (s.d ? [{ d: s.d, t: s.t, w: s.w }] : []);
          var seen = {}, chips = [];
          raw.forEach(function (ch) {
            var kk = ch.d + "|" + ch.t;
            if (seen[kk]) return;
            seen[kk] = 1;
            chips.push(ch);
          });
          chips = chips.slice(0, 3);
          if (chips.length) lines.push({ T: T, kind: kind, s: s, chips: chips });
        });
      });
      return lines;
    }
    /* Saved cards show openings only for the treatments the user has
       saved that this clinic offers (max 2 lines). If none of those
       have openings, fall back to the single earliest line the clinic
       has across all its treatments. */
    var favList = favs();
    var savedTx = vm.treatments.filter(function (T) {
      return favList.indexOf(T) > -1 && !!treatmentByName(T);
    });
    var lines = linesFor(savedTx);
    if (!lines.length) {
      var all = linesFor(vm.treatments);
      if (all.length) {
        all.sort(function (a, b) { return chipTimeKey(a.chips[0]) - chipTimeKey(b.chips[0]); });
        lines = all.slice(0, 1);
      }
    }
    lines = lines.slice(0, 2);
    if (!lines.length) return "";
    var parts = lines.map(function (ln) {
      var book = bookUrlFor(vm, ln.T);
      var chipHtml = ln.chips.map(function (ch) {
        var inner = "<b>" + esc(ch.d) + "</b> · " + esc(ch.t);
        return book
          ? '<a class="nc-slot-chip" href="' + esc(book) + '" target="_blank" rel="noopener" aria-label="Book ' + esc(ln.T) + " " + esc(ch.d) + " at " + esc(ch.t) + '">' + inner + "</a>"
          : '<span class="nc-slot-chip">' + inner + "</span>";
      }).join("");
      return '<div class="nc-slot"><p class="nc-slot-t"><span class="nc-slot-title">' + esc(slotTitle(ln.s, ln.kind, ln.T)) + "</span>"
        + (ln.s.price ? '<span class="nc-slot-price">' + esc(ln.s.price) + "</span>" : "")
        + '</p><p class="nc-slot-c">' + chipHtml + "</p></div>";
    });
    return '<div class="nc-slots"><p class="nc-slots-head"><span class="nc-slots-label">Live openings</span><span class="nc-slots-note">real bookings — tap one to grab it</span></p>' + parts.join("") + "</div>";
  }
  function clinicCard(vm) {
    var c = vm.clinic;
    var T0 = vm.treatments[0];
    var t0 = treatmentByName(T0);
    var gal = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.gal && CLINIC_EXTRA.gal[c.name]) || (vm.media.img ? [vm.media.img] : []);
    var gallery = gal.length
      ? '<div class="nc-gallery"><div class="nc-track"><img src="' + esc(gal[0]) + '" alt="' + esc(c.name) + '" loading="lazy"></div></div>'
      : '<div class="nc-tile" aria-hidden="true">' + esc((c.name || "?").charAt(0)) + "</div>";
    var rate = vm.rating
      ? '<span class="nc-rate">' + (vm.rating[0] % 1 ? vm.rating[0].toFixed(1) : vm.rating[0]) + " ★ · " + vm.rating[1].toLocaleString() + "</span>"
      : "";
    var zone = postalZone(typeof localStorage !== "undefined" ? (function () { try { return localStorage.getItem(POSTAL_KEY); } catch (_) { return null; } })() : "");
    var addr = vm.media.address || (vm.X && vm.X.a) || (c.city ? c.city + ", " + (PROV_NAMES[c.prov] || c.prov || "") : "");
    var dbSegVal = vm.dbv === "yes" || vm.media.db === "yes" ? "yes" : (vm.dbv === "no" ? "no" : "");
    var dbSeg = dbSegVal === "yes"
      ? '<span class="nc-dbseg"><span class="nc-stardb">★</span> Confirmed direct billing</span>'
      : (zone === "L" || zone === "M" ? '<span class="nc-dbseg">Direct billing — ask at booking</span>' : "");
    var st = vm.X && vm.X.h ? todayState(vm.X.h, c.prov) : null;
    var hSeg = "";
    if (st) {
      var todayTxt;
      if (st.closed) { var nk = cycleNextOpenKey(vm.X.h, st.key); todayTxt = "Closed today · " + MW_DAYLBL[nk] + " " + fmtHours(vm.X.h[nk]); }
      else if (st.open === true) todayTxt = "Open now till " + closingOf(st.label);
      else if (st.open === false) todayTxt = "Closed now · today " + fmtHours(st.label);
      else todayTxt = "Today " + fmtHours(st.label || "");
      var weekRows = MW_WEEK.map(function (dk) {
        return '<div class="nc-week-row' + (dk === st.key ? " is-today" : "") + '"><span>' + MW_DAYLBL[dk] + "</span><span>" + (vm.X.h[dk] ? fmtHours(vm.X.h[dk]) : "Closed") + "</span></div>";
      }).join("");
      hSeg = '<span class="nc-todaywrap"><span class="nc-hseg">' + esc(todayTxt) + '</span><button type="button" class="nc-hourbtn" data-nc-hours aria-expanded="false" aria-label="See all hours">▾</button><div class="nc-week" hidden>' + weekRows + "</div></span>";
    }
    var billed = (t0 && t0.billed) || (pairFor(vm, T0) && pairFor(vm, T0).ba) || "";
    var leadTxt = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.lead && CLINIC_EXTRA.lead[c.name] && CLINIC_EXTRA.lead[c.name][T0]) || "";
    var desc = leadTxt
      ? '<p class="nc-desc">' + esc(leadTxt) + "</p>"
      : '<p class="nc-desc">' + esc(vm.treatments.map(function (tn) { return tn; }).join(" · ")) + " in " + esc(c.city || "") + (billed ? " — billed as " + esc(billed) + "." : ".") + "</p>";
    var priceStr = priceStrFor(vm, T0);
    var priceHtml = priceStr
      ? '<p class="nc-price-line">💲 ' + esc(priceStr) + " · " + esc(T0) + "</p>"
      : "";
    var book = bookUrlFor(vm, T0);
    var web = vm.clinic.link || (vm.X && vm.X.w) || "";
    var email = (typeof CLINIC_SLOTS !== "undefined" && CLINIC_SLOTS[vm.key] && CLINIC_SLOTS[vm.key]._em) || vm.clinic.email || "";
    var actions = "";
    if (book) actions += '<a class="nc-abtn nc-abtn-book" href="' + esc(book) + '" target="_blank" rel="noopener">📅 Book</a>';
    if (web) actions += '<a class="nc-abtn" href="' + esc(web) + '" target="_blank" rel="noopener">Website</a>';
    if (email) actions += '<a class="nc-abtn" href="mailto:' + esc(email) + '">Email</a>';
    var meta = metaFor(vm.name);
    var statusOpts = ['<option value="">Set status…</option>'].concat(STATUSES.map(function (s) {
      return '<option value="' + s + '"' + (meta.status === s ? " selected" : "") + ">" + s + "</option>";
    })).join("");
    var manage = '<div class="mw-manage"><span class="mw-manage-lbl">📌 Manage</span>'
      + '<select class="mw-manage-sel" data-status-for="' + esc(vm.name) + '" aria-label="Status for ' + esc(vm.name) + '">' + statusOpts + "</select>"
      + '<button type="button" class="mw-notebtn" data-note-toggle="' + esc(vm.name) + '">' + (meta.note ? "✎ Note (1)" : "＋ Note") + "</button>"
      + '<button type="button" class="mw-remove" data-unsave="' + esc(vm.name) + '">♥ Remove</button>'
      + '<textarea class="mw-note" data-note-for="' + esc(vm.name) + '" rows="2" placeholder="Private note — only visible on this device" aria-label="Private note for ' + esc(vm.name) + '"' + (meta.note ? "" : " hidden") + ">" + esc(meta.note || "") + "</textarea></div>";
    return '<article class="nc-card">' + gallery
      + '<div class="nc-main">'
      + '<div class="nc-head"><h4 class="nc-name">' + esc(c.name) + "</h4>" + rate + "</div>"
      + '<div class="nc-metaline">' + [addr ? "<span>" + esc(addr) + "</span>" : "", hSeg || "", dbSeg || "", (isFinite(vm.distKm) && userPt ? '<span class="nc-chipdist">' + (vm.distKm < 1 ? vm.distKm.toFixed(1) : Math.round(vm.distKm)) + " km away</span>" : "")].filter(Boolean).join('<span class="nc-sep" aria-hidden="true"> · </span>') + "</div>"
      + desc + priceHtml
      + (actions ? '<div class="nc-actions">' + actions + "</div>" : "")
      + clinicSlotsHTML(vm)
      + manage
      + "</div></article>";
  }
  function cycleNextOpenKey(hours, todayKey) {
    var idx = MW_WEEK.indexOf(todayKey);
    for (var i = 1; i <= 7; i++) { var k = MW_WEEK[(idx + i) % 7]; if (hours[k]) return k; }
    return todayKey;
  }
  function closingOf(label) {
    var ranges = parseRanges(label);
    if (!ranges) return "";
    var last = String(label).split(",").pop().trim();
    var m = last.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*$/i);
    return m ? m[1].replace(/\s+/g, " ") : "";
  }
  function renderFilters() {
    var host = $("mwFilters");
    if (!host) return;
    if (!clinicVMs.length) { host.innerHTML = ""; return; }
    var offered = {};
    clinicVMs.forEach(function (vm) { vm.treatments.forEach(function (t) { offered[t] = true; }); });
    var savedTx = favs().filter(function (n) { return treatmentByName(n) && offered[n]; });
    var chips = ['<button type="button" class="mw-fchip' + (filters.tx === "" ? " active" : "") + '" data-mw-ftx="">All treatments</button>']
      .concat(savedTx.map(function (t) {
        return '<button type="button" class="mw-fchip' + (filters.tx === t ? " active" : "") + '" data-mw-ftx="' + esc(t) + '">' + esc(t) + "</button>";
      })).join("");
    host.innerHTML =
      '<button type="button" class="mw-toggle' + (filters.db ? " on" : "") + '" data-mw-toggle="db" aria-pressed="' + filters.db + '"><span class="mw-knob"></span>Direct billing only</button>'
      + '<button type="button" class="mw-toggle' + (filters.open ? " on" : "") + '" data-mw-toggle="open" aria-pressed="' + filters.open + '"><span class="mw-knob"></span>Open now</button>'
      + chips
      + '<label class="mw-fsel-lbl">Within <select class="mw-sel" id="mwDistSel" aria-label="Distance">'
      + [10, 25, 50, 100].map(function (d) { return '<option value="' + d + '"' + (filters.dist === d ? " selected" : "") + ">" + d + " km</option>"; }).join("")
      + '</select></label>'
      + '<label class="mw-fsel-lbl">Sort <select class="mw-sel" id="mwSortSel" aria-label="Sort">'
      + '<option value="closest"' + (filters.sort === "closest" ? " selected" : "") + ">Closest</option>"
      + '<option value="rated"' + (filters.sort === "rated" ? " selected" : "") + ">Highest rated</option>"
      + '<option value="coverage"' + (filters.sort === "coverage" ? " selected" : "") + ">Most coverage left</option>"
      + "</select></label>";
    var ds = $("mwDistSel");
    if (ds) ds.addEventListener("change", function () { filters.dist = parseInt(ds.value, 10) || 50; renderClinics(); updateNearCounts(); });
    var ss = $("mwSortSel");
    if (ss) ss.addEventListener("change", function () { filters.sort = ss.value; renderClinics(); });
  }
  function renderClinics() {
    buildVMs();
    renderFilters();
    var list = visibleVMs();
    var cnt = $("mwClinicCount");
    if (cnt) {
      cnt.textContent = clinicVMs.length
        ? list.length + " of " + clinicVMs.length + " saved clinic" + (clinicVMs.length === 1 ? "" : "s") + " shown"
          + (userPt ? " · near " + (window.wfLoc ? wfLoc.get() : "") : "")
        : "";
    }
    if (!clinicVMs.length) {
      clinicWrap.innerHTML = '<div class="saved-empty-card"><span class="big" aria-hidden="true">📍</span><h3>No saved clinics yet</h3><p>Tap the heart ♥ on any clinic and it lands here — status, notes, live openings and all.</p><a class="btn btn--primary" href="/treatments">Browse clinics</a></div>';
      return;
    }
    clinicWrap.innerHTML = list.length
      ? list.map(clinicCard).join("")
      : '<div class="saved-empty-card"><h3>No saved clinics match those filters</h3><p>Try widening the distance or clearing a filter.</p></div>';
  }

  /* ============================================================
     Suggested nearby
     ============================================================ */
  function renderRecs() {
    var grid = document.getElementById("savedRecGrid");
    if (!grid) return;
    var f = favs();
    var b = booklet();
    if (b) {
      var perBilled = {};
      TREATMENTS.forEach(function (t) {
        if (f.indexOf(t.name) > -1) return;
        var cat = treatmentCategory(t);
        if (!cat) return;
        var left = catLeft(b, cat);
        if (left <= 0) return;
        (perBilled[t.name] = perBilled[t.name] || { t: t, cat: cat, left: left });
      });
      var picks = Object.keys(perBilled).map(function (k) { return perBilled[k]; })
        .sort(function (x, y) { return y.left - x.left; }).slice(0, 4);
      if (picks.length) {
        grid.innerHTML = picks.map(function (p) {
          return '<div class="near-row"><div class="near-info"><h3>' + esc(p.t.name)
            + ' <span class="near-badge">Bills as ' + esc(p.t.billed || p.cat) + '</span></h3><p class="near-reason">You have ' + money(p.left) + " left in your " + esc(p.cat) + " balance — " + esc(p.t.name) + " may be covered under it.</p></div>"
            + '<div class="near-actions"><a class="near-link" href="/clinics-' + slug(p.t.name) + '">Find clinics ›</a><button class="fav-btn" type="button" data-fav="' + esc(p.t.name) + '" data-fav-kind="treatment" aria-label="Save ' + esc(p.t.name) + '"><span class="heart" aria-hidden="true">♡</span></button></div></div>';
        }).join("");
        renderSuggClinics();
        return;
      }
    }
    grid.innerHTML = '<p class="near-empty">Save a treatment or add your booklet and we\'ll suggest nearby options that fit your coverage.</p>';
    renderSuggClinics();
  }
  function renderSuggClinics() {
    var host = $("mwSuggClinics");
    if (!host) return;
    var f = favs();
    var savedClinics = {};
    clinicVMs.forEach(function (vm) { savedClinics[vm.name] = true; });
    var pool = [];
    var byName = {};
    allClinics().forEach(function (item) { (byName[item.clinic.name] = byName[item.clinic.name] || []).push(item); });
    var interesting = [];
    TREATMENTS.forEach(function (t) {
      if (f.indexOf(t.name) > -1) interesting.push(t.name);
    });
    var b = booklet();
    if (b) {
      TREATMENTS.forEach(function (t) {
        var cat = treatmentCategory(t);
        if (cat && catLeft(b, cat) > 0 && interesting.indexOf(t.name) < 0) interesting.push(t.name);
      });
    }
    Object.keys(byName).forEach(function (name) {
      if (savedClinics[name] || f.indexOf(name) > -1) return;
      var entries = byName[name];
      var txs = entries.map(function (e) { return e.treatment; }).filter(function (t) { return interesting.indexOf(t) > -1; });
      if (!txs.length) return;
      var c = entries[0].clinic;
      var vm = { name: name, clinic: c, key: (c.name + "|" + (c.city || "")).toLowerCase(), X: extraFor(c), media: mediaFor(c), distKm: Infinity };
      vm.rating = ratingFor(vm);
      var photo = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.gal && CLINIC_EXTRA.gal[name] && CLINIC_EXTRA.gal[name][0]) || vm.media.img || "";
      if (!photo) return;
      if (window.wfGeo && userPt) {
        var coords = window.wfGeo.clinicCoords(c) || (vm.media.lat != null ? [parseFloat(vm.media.lat), parseFloat(vm.media.lng)] : null);
        if (coords) vm.distKm = window.wfGeo.haversineKm(userPt, coords);
      }
      var ps = priceStrFor(vm, txs[0]);
      pool.push({ vm: vm, tx: txs[0], photo: photo, price: ps });
    });
    pool.sort(function (a, c) {
      return (a.vm.distKm - c.vm.distKm) || ((c.vm.rating ? c.vm.rating[0] : 0) - (a.vm.rating ? a.vm.rating[0] : 0));
    });
    pool = pool.slice(0, 3);
    host.innerHTML = pool.length ? pool.map(function (p) {
      var vm = p.vm;
      var place = vm.clinic.city + (vm.clinic.prov ? ", " + vm.clinic.prov : "") + (isFinite(vm.distKm) && userPt ? " · " + (vm.distKm < 1 ? vm.distKm.toFixed(1) : Math.round(vm.distKm)) + " km" : "");
      return '<div class="mw-sugg-card"><div class="ph" style="background-image:url(\'' + esc(p.photo) + '\')" role="img" aria-label="' + esc(vm.name) + '"></div>'
        + '<div class="b"><h4>' + esc(vm.name) + '</h4><p class="addr">' + esc(place) + (vm.rating ? ' · <span class="nc-rate" style="font-size:.8rem">' + vm.rating[0] + " ★ (" + vm.rating[1] + ")</span>" : "") + '</p>'
        + '<p class="tx">' + esc(p.tx) + (p.price ? ' · <b>' + esc(p.price.split(/[·|]/)[0].trim()) + "</b>" : "") + '</p>'
        + '<button type="button" class="mw-savebtn2" data-mw-save="' + esc(vm.name) + '">♥ Save clinic</button></div></div>';
    }).join("") : "";
  }

  /* ============================================================
     Master render + handlers
     ============================================================ */
  function render() {
    buildVMs();
    var nTx = renderTreatments();
    renderClinics();
    var total = nTx + clinicVMs.length;
    if (count) count.textContent = String(total);
    if (empty) empty.hidden = total !== 0;
    if (clear) clear.disabled = total === 0;
    return total;
  }

  document.addEventListener("click", function (e) {
    var noteBtn = e.target.closest ? e.target.closest("[data-note-toggle]") : null;
    if (noteBtn) {
      var name2 = noteBtn.getAttribute("data-note-toggle");
      var safe = window.CSS && CSS.escape ? CSS.escape(name2) : name2.replace(/"/g, '\\"');
      var ta = document.querySelector('[data-note-for="' + safe + '"]');
      if (ta) { ta.hidden = !ta.hidden; if (!ta.hidden) ta.focus(); }
      return;
    }
    var tg = e.target.closest ? e.target.closest("[data-mw-toggle]") : null;
    if (tg) {
      var which = tg.getAttribute("data-mw-toggle");
      filters[which] = !filters[which];
      renderFilters();
      renderClinics();
      return;
    }
    var fc = e.target.closest ? e.target.closest("[data-mw-ftx]") : null;
    if (fc) {
      filters.tx = fc.getAttribute("data-mw-ftx") || "";
      renderFilters();
      renderClinics();
      return;
    }
    var sv = e.target.closest ? e.target.closest("[data-mw-save]") : null;
    if (sv) {
      var sname = sv.getAttribute("data-mw-save");
      if (window.wfFavs) wfFavs.toggle(sname);
      render(); renderRecs(); renderSuggClinics();
      return;
    }
    var btn = e.target.closest ? e.target.closest("[data-unsave]") : null;
    if (btn) {
      var name = btn.getAttribute("data-unsave");
      if (window.wfFavs) wfFavs.toggle(name);
      render(); renderRecs(); renderSuggClinics(); renderWalletCards(); renderTimeline();
      return;
    }
    var cp = e.target.closest ? e.target.closest("[data-copy-msg]") : null;
    if (cp) {
      var text = cp.getAttribute("data-copy-msg") || "";
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      cp.textContent = "Copied ✓";
      setTimeout(function () { cp.textContent = "Copy message"; }, 1800);
    }
  });
  document.addEventListener("change", function (e) {
    var sel = e.target.closest ? e.target.closest("[data-status-for]") : null;
    if (sel) { setMeta(sel.getAttribute("data-status-for"), { status: sel.value }); return; }
    var ta = e.target.closest ? e.target.closest("[data-note-for]") : null;
    if (ta) setMeta(ta.getAttribute("data-note-for"), { note: ta.value.trim() });
  });

  var recGrid = document.getElementById("savedRecGrid");
  if (recGrid) {
    recGrid.addEventListener("click", function (e) {
      var b = e.target.closest(".fav-btn");
      if (!b) return;
      var name = b.getAttribute("data-fav");
      if (name && window.wfFavs) {
        wfFavs.toggle(name);
        b.classList.toggle("active");
        var heart = b.querySelector(".heart");
        if (heart) heart.textContent = b.classList.contains("active") ? "♥" : "♡";
        render(); renderRecs(); renderWalletCards(); renderTimeline();
      }
    });
  }

  if (clear) {
    clear.addEventListener("click", function () {
      storeSet(FAV_KEY, "[]");
      render(); renderRecs(); renderSuggClinics(); renderWalletCards(); renderTimeline();
    });
  }

  var emailForm = document.getElementById("savedEmailForm");
  var emailInput = document.getElementById("savedEmailInput");
  var emailMsg = document.getElementById("savedEmailMsg");
  if (emailForm && emailInput) {
    try {
      var existing = localStorage.getItem(EMAIL_KEY);
      if (existing) emailInput.value = existing;
    } catch (_) {}
    emailForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = emailInput.value.trim();
      if (!v || v.indexOf("@") < 0) { if (emailMsg) { emailMsg.textContent = "Please enter a valid email."; emailMsg.classList.add("saved-email-msg--err"); } return; }
      storeSet(EMAIL_KEY, v);
      if (emailMsg) { emailMsg.textContent = "You're in — discovering clinics near you."; emailMsg.classList.remove("saved-email-msg--err"); }
    });
    emailInput.addEventListener("input", function () { if (emailMsg) emailMsg.textContent = ""; });
  }

  /* ---------- boot + location refresh ---------- */
  function refreshAsync() {
    render();
    renderWallet();
    renderRecs();
    loadCoords().then(function () {
      renderClinics();
      updateNearCounts();
      renderTimeline();
      renderSuggClinics();
    });
  }
  refreshAsync();
  window.addEventListener("wf:location", function () {
    userPt = null; userPtKey = "";
    locEditing = false;
    renderLocBar();
    refreshAsync();
  });
})();
