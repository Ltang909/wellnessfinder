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
    { name: "Psychology", color: "#E03E3E", aliases: ["psychology", "psychologist", "psychological services", "mental health"] },
    { name: "Psychotherapy", color: "#B03A5B", aliases: ["psychotherapy", "psychotherapist"] },
    { name: "Massage Therapy", color: "#64473A", aliases: ["massage therapy", "massage therapist", "massage"] },
    { name: "Acupuncture", color: "#AD1A72", aliases: ["acupuncture", "acupuncturist"] },
    { name: "Osteopathy", color: "#6940A5", aliases: ["osteopathy", "osteopath"] },
    { name: "Dietitian", color: "#5B7F1E", aliases: ["dietitian", "dietician", "registered dietitian"] },
    { name: "Speech Therapy", color: "#DFAB01", aliases: ["speech therapy", "speech-language", "speech language", "speech therapist", "speech-language pathologist"] },
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
  /* ---------- shared pools (groupCaps) + claimable math ---------- */
  function groupOfCat(b, cat) {
    if (!b || !b.groupCaps) return null;
    for (var i = 0; i < b.groupCaps.length; i++) {
      if ((b.groupCaps[i].members || []).indexOf(cat) > -1) return b.groupCaps[i];
    }
    return null;
  }
  function poolUsed(b, g) {
    return (g.members || []).reduce(function (s, m) {
      return s + ((b.categories[m] || {}).used || 0);
    }, 0);
  }
  function poolLeft(b, g) { return Math.max(0, (g.max || 0) - poolUsed(b, g)); }
  /* What a category can actually still pay: its own remaining cap,
     limited by what's left in its shared pool when it has one. */
  function claimable(b, cat) {
    if (!b || !b.categories[cat]) return 0;
    var g = groupOfCat(b, cat);
    return g ? Math.min(catLeft(b, cat), poolLeft(b, g)) : catLeft(b, cat);
  }
  function poolShortLabel(g) {
    return String(g.label || "Shared pool").replace(/\s+services combined$/i, " pool").replace(/\s+combined$/i, " pool").replace(/^Mental health/i, "Mental-health");
  }
  /* Distinct totals: standalone categories count (max − used); each
     shared pool counts ONCE. Matches wfWalletLeft() in app.js. */
  function bookletTotals(b) {
    var pooled = {}, max = 0, left = 0;
    (b.groupCaps || []).forEach(function (g) {
      (g.members || []).forEach(function (m) { pooled[m] = 1; });
      max += g.max || 0;
      left += poolLeft(b, g);
    });
    Object.keys(b.categories).forEach(function (k) {
      if (pooled[k]) return;
      max += b.categories[k].max || 0;
      left += catLeft(b, k);
    });
    return { max: max, left: left };
  }

  /* ---------- archive (wf_archived) ---------- */
  var ARCH_KEY = "wf_archived";
  function archived() {
    try { return JSON.parse(localStorage.getItem(ARCH_KEY)) || []; } catch (_) { return []; }
  }
  function setArchived(a) { storeSet(ARCH_KEY, JSON.stringify(a)); }
  function isArchived(n) { return archived().indexOf(n) > -1; }
  function activeFavs() {
    var a = archived();
    return favs().filter(function (n) { return a.indexOf(n) < 0; });
  }
  function archiveItem(n) {
    var a = archived();
    if (a.indexOf(n) < 0) { a.push(n); setArchived(a); }
  }
  function unarchiveItem(n) {
    var a = archived();
    var i = a.indexOf(n);
    if (i > -1) { a.splice(i, 1); setArchived(a); }
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
    activeFavs().forEach(function (name) {
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
      if (cat) best = Math.max(best, claimable(b, cat));
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
    var picked = fileInput.files ? Array.prototype.slice.call(fileInput.files) : [];
    fileInput.value = "";
    if (!picked.length) return;
    /* While the hero Composer is on screen (no booklet yet, confirm
       closed), a pick STAGES the files as pills in the bar — Send
       runs the parse. In the wallet state a pick parses immediately,
       as "Upload a newer PDF" always has. */
    if (composerActive()) { stageBarFiles(picked); return; }
    handleIntakeFiles(picked);
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
    applyPendingInstr();
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

  /* ============================================================
     Composer bar (Direction A): one bar for drop / attach / paste /
     type / dictate. State lives in barState so hero re-renders
     (parse progress, status messages) never lose it.
     ============================================================ */
  var barState = { files: [], text: "" };
  var pendingInstr = "";
  var MIC_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>';
  var TIER_LABELS = ["Essential", "Core", "Enhanced", "Basic", "Standard", "Premium", "Comprehensive"];

  function composerActive() {
    var c = $("mwConfirm");
    return !!$("mwBar") && (!c || c.hidden);
  }
  function stageBarFiles(files) {
    var arr = Array.prototype.slice.call(files || []);
    if (!arr.length) return;
    if (arr.every(isImageFile)) barState.files = arr.slice(0, 3);
    else barState.files = [arr[0]];
    renderHero();
  }
  /* Light-weight intent preview for the bar's "We heard" chips.
     Display only — the confirm step's applyInstructions is the
     authority that actually changes fields. */
  function detectHeard(raw) {
    var out = {};
    if (!raw || !raw.trim()) return out;
    var text = " " + raw.toLowerCase().replace(/[’]/g, "'") + " ";
    var i;
    for (i = 0; i < TIER_LABELS.length; i++) {
      if (new RegExp("\\b" + TIER_LABELS[i].toLowerCase() + "\\b").test(text)) { out.tier = TIER_LABELS[i] + " plan"; break; }
    }
    if (/\bfamily\b|\bspouse\b|\bwife\b|\bhusband\b|\bkids\b|\bchildren\b|\bpartner\b/.test(text)) out.coverage = "Family coverage";
    else if (/\bsingle\b|just me|only me/.test(text)) out.coverage = "Single coverage";
    text.split(/[,;]|\band\b/).forEach(function (cl) {
      var am = cl.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
      if (!am) return;
      var amt = parseFloat(am[1].replace(/,/g, ""));
      if (/hsa|hcsa|spending account/.test(cl) && /used|claimed|spent/.test(cl)) { out.hcsaUsed = "HCSA used " + money(amt); return; }
      if (!/used|claimed|spent|left/.test(cl)) return;
      var cat = instrCatMatch(cl);
      if (!cat) return;
      if (/\bleft\b/.test(cl)) out["left:" + cat] = cat + " " + money(amt) + " left";
      else out["used:" + cat] = cat + " used " + money(amt);
    });
    var rm = text.match(/(reset|renew|plan year|starts?|begins?)[^.]{0,24}?\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})?\b/);
    if (rm) {
      var months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
      var mon = months[rm[2].slice(0, 4)] != null ? months[rm[2].slice(0, 4)] : months[rm[2].slice(0, 3)];
      if (mon != null) {
        var day = rm[3] ? parseInt(rm[3], 10) : 1;
        var nowD = new Date(); nowD.setHours(0, 0, 0, 0);
        var dd = new Date(nowD.getFullYear(), mon, day);
        if (dd <= nowD) dd = new Date(nowD.getFullYear() + 1, mon, day);
        out.reset = "Resets " + fmtDate(dd);
      }
    }
    for (i = 0; i < INSURERS.length; i++) {
      if (text.indexOf(INSURERS[i].toLowerCase()) > -1) { out.insurer = INSURERS[i].replace("Green Shield", "GreenShield"); break; }
    }
    return out;
  }
  function heardChipsHTML() {
    var heard = detectHeard(barState.text);
    var keys = Object.keys(heard);
    if (!keys.length) return "";
    return '<span class="mw-comp-chips-lbl">We heard</span>' + keys.map(function (k) {
      return '<span class="mw-heard-chip">' + esc(heard[k]) + "</span>";
    }).join("");
  }
  function refreshBarChips() {
    var host = $("mwBarChips");
    if (!host) return;
    host.innerHTML = heardChipsHTML();
    host.hidden = !host.innerHTML;
  }
  function composerHTML() {
    var files = barState.files.map(function (f, i) {
      var nm = f.name || "Screenshot";
      return '<span class="mw-comp-file">📄 ' + esc(nm) + '<button type="button" data-barx="' + i + '" aria-label="Remove ' + esc(nm) + '">×</button></span>';
    }).join("");
    var chips = heardChipsHTML();
    return '<div class="mw-composer" id="mwBar">'
      + '<div class="mw-comp-files" id="mwBarFiles"' + (barState.files.length ? "" : " hidden") + ">" + files + "</div>"
      + '<textarea class="mw-comp-text" id="mwBarText" rows="2" placeholder="Drop your booklet here, paste a screenshot (Ctrl+V), or tell us about your plan…" aria-label="Tell us about your plan, or drop your booklet here">' + esc(barState.text) + "</textarea>"
      + '<p class="mw-comp-hint">You can also <b>paste a screenshot</b> (Ctrl+V) or drop a PDF, screenshot or text file anywhere on this bar.</p>'
      + '<div class="mw-comp-chips" id="mwBarChips"' + (chips ? "" : " hidden") + ">" + chips + "</div>"
      + '<div class="mw-comp-row"><button type="button" class="mw-comp-attach" id="mwBarAttach" aria-label="Attach your booklet — PDF, screenshot, or text file">+</button><span class="spacer"></span>'
      + '<button type="button" class="mw-comp-mic" id="mwBarMic" aria-label="Dictate with your voice">' + MIC_SVG + "</button>"
      + '<button type="button" class="mw-comp-send" id="mwBarSend"><span aria-hidden="true">↑</span> Read my booklet</button></div>'
      + "</div>";
  }
  function wireMic(btn, field, barEl, onText) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { btn.hidden = true; return; }
    var rec = null;
    btn.addEventListener("click", function () {
      if (rec) { try { rec.stop(); } catch (_) {} return; }
      try {
        rec = new SR();
        rec.lang = "en-CA";
        rec.interimResults = false;
        rec.continuous = false;
        if (barEl) barEl.classList.add("listening");
        rec.onresult = function (ev) {
          var txt = "";
          for (var i = ev.resultIndex; i < ev.results.length; i++) txt += ev.results[i][0].transcript;
          txt = txt.trim();
          if (txt) {
            field.value = (field.value ? field.value.replace(/\s+$/, "") + " " : "") + txt;
            if (onText) onText(field.value);
          }
        };
        var done = function () { rec = null; if (barEl) barEl.classList.remove("listening"); };
        rec.onend = done;
        rec.onerror = done;
        rec.start();
      } catch (_) { rec = null; if (barEl) barEl.classList.remove("listening"); }
    });
  }
  function barSend() {
    var text = (barState.text || "").trim();
    if (barState.files.length) {
      pendingInstr = text;
      var fs = barState.files;
      barState.files = [];
      handleIntakeFiles(fs);
      return;
    }
    if (text) {
      barState.text = "";
      /* A long paste is plan text, not an instruction — read it the
         way the old paste box did. Short text is instructions for a
         manual confirm. */
      if (text.length > 240) { ingestText(text, "your text"); return; }
      renderConfirm({ insurer: "", planName: "", resetsISO: nextJan1ISO(), categories: {} });
      applyInstructions(text);
      return;
    }
    parseStatusMsg = "Drop your booklet on the bar, paste a screenshot (Ctrl+V), or just type what you know — then hit Read my booklet.";
    renderHero();
  }
  function applyPendingInstr() {
    if (!pendingInstr) return;
    var t = pendingInstr;
    pendingInstr = "";
    var i = $("mwInstr");
    if (i) { i.value = t; applyInstructions(t); }
  }
  function wireComposer() {
    var bar = $("mwBar");
    if (!bar) return;
    var ta = $("mwBarText");
    if (ta) ta.addEventListener("input", function () { barState.text = ta.value; refreshBarChips(); });
    var att = $("mwBarAttach");
    if (att) att.addEventListener("click", pickPdf);
    var send = $("mwBarSend");
    if (send) send.addEventListener("click", barSend);
    var mic = $("mwBarMic");
    if (mic && ta) wireMic(mic, ta, bar, function (v) { barState.text = v; refreshBarChips(); });
    bar.querySelectorAll("[data-barx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        barState.files.splice(parseInt(btn.getAttribute("data-barx"), 10), 1);
        renderHero();
      });
    });
    ["dragover", "dragenter"].forEach(function (ev) {
      bar.addEventListener(ev, function (e) { e.preventDefault(); bar.classList.add("dragover"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      bar.addEventListener(ev, function (e) { e.preventDefault(); bar.classList.remove("dragover"); });
    });
    bar.addEventListener("drop", function (e) {
      var fs = e.dataTransfer && e.dataTransfer.files;
      if (fs && fs.length) { pendingInstr = (barState.text || "").trim(); handleIntakeFiles(fs); }
    });
  }
  /* Clipboard screenshots: pasting an image while the bar (or the
     confirm bar) has focus — or with nothing else focused — stages
     it as an attached pill first, then reads it. Pastes aimed at
     other fields, and plain-text pastes, are left alone. */
  document.addEventListener("paste", function (e) {
    var t = e.target;
    var inBar = !!(t && t.closest && t.closest(".mw-composer"));
    var inField = !!(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable));
    if (!inBar && inField) return;
    var items = (e.clipboardData && e.clipboardData.items) || [];
    var imgs = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf("image/") === 0) {
        var f = items[i].getAsFile();
        if (f) imgs.push(f);
      }
    }
    if (!imgs.length) return;
    e.preventDefault();
    if (composerActive()) {
      pendingInstr = (barState.text || "").trim();
      stageBarFiles(imgs);
      var fs = barState.files;
      barState.files = [];
      setTimeout(function () { handleIntakeFiles(fs); }, 60);
    } else {
      var ci = $("mwInstr");
      var cf = $("mwConfirm");
      pendingInstr = ci && cf && !cf.hidden ? ci.value : "";
      handleIntakeFiles(imgs);
    }
  });

  function renderHero() {
    var host = $("mwHero");
    if (!host) return;
    var b = booklet();
    if (!b) {
      host.innerHTML =
        '<div class="mw-hero"><div class="mw-hero-flex"><div class="mw-hero-main">'
        + '<p class="mw-eyebrow">Your benefits wallet</p>'
        + "<h2>Tell us about your plan.</h2>"
        + '<p class="mw-lede">Drop your booklet, paste a screenshot, or just type what you know. We read it here on this device and turn it into your wallet.</p>'
        + composerHTML()
        + (parseStatusMsg ? '<p class="mw-parse-status">' + esc(parseStatusMsg) + "</p>" : "")
        + '<div class="mw-hero-foot"><p class="mw-privacy">🔒 Read on this device only — your booklet and notes are never uploaded or stored on our servers.</p>'
        + '<button type="button" class="mw-manual-link" id="mwManualBtn">Enter your plan by hand</button></div>'
        + '</div>'
        + '<div class="mw-pet"><div class="mw-petdisc"><img src="assets/petpet/peek.png" alt="Pet Pet"></div><p>Pet Pet keeps<br>an eye on the deadline.</p></div>'
        + "</div></div>";
      wireComposer();
      var mb = $("mwManualBtn");
      if (mb) mb.addEventListener("click", function () {
        renderConfirm({ insurer: "", planName: "", resetsISO: nextJan1ISO(), categories: {} });
      });
      return;
    }
    var totals = bookletTotals(b);
    var days = daysToReset(b);
    var r = resetDate(b);
    var pct = totals.max > 0 ? Math.round((totals.left / totals.max) * 100) : 0;
    var covYear = r ? (r.getMonth() === 0 && r.getDate() === 1 ? r.getFullYear() - 1 : r.getFullYear()) : new Date().getFullYear();
    var pooled = !!(b.groupCaps && b.groupCaps.length);
    host.innerHTML =
      '<div class="mw-hero"><div class="mw-hero-flex"><div class="mw-hero-main">'
      + '<p class="mw-eyebrow">Your benefits wallet · ' + esc(b.insurer || "Your plan") + (b.planName ? " " + esc(b.planName) : "") + "</p>"
      + '<div><span class="mw-hero-amt">' + money(totals.left) + '</span> <span class="mw-hero-sub">'
      + (pooled ? "distinct coverage left in " + covYear + "</span>" : 'left of <b>' + money(totals.max) + "</b> in " + covYear + " coverage</span>")
      + (days != null && r ? '<span class="mw-dayschip">' + days + " days left · resets " + fmtDate(r) + "</span>" : "")
      + "</div>"
      + '<div class="mw-hero-bar"><i style="width:' + pct + '%"></i></div>'
      + '<p class="mw-hero-note">' + pct + "% of your coverage is still unused" + (r && days != null && days <= 120 ? " — and unused amounts don't roll over." : ".")
      + (pooled ? " Counted honestly: shared pools are counted once, so this is the real total your plan can still pay." : "") + "</p>"
      + (b.hcsa && b.hcsa.max > 0 ? '<p class="mw-hero-hcsa">🏦 Health Spending Account: <b>' + money(Math.max(0, b.hcsa.max - (b.hcsa.used || 0))) + '</b> available — separate from the categories above, for any eligible expense.</p>' : "")
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
        parsed.categories[k] = { max: bb.categories[k].max || "", used: bb.categories[k].used || 0, pct: bb.categories[k].pct != null ? bb.categories[k].pct : null, found: false };
      });
      if (bb.hcsa && bb.hcsa.max > 0) {
        parsed.hcsa = { single: bb.hcsa.max, family: bb.hcsa.max };
        parsed.hcsaUsed = bb.hcsa.used || 0;
      }
      parsed.coverage = bb.coverage || "Single";
      parsed._stored = { tier: bb.tier || null, coverage: bb.coverage || null, groupCaps: bb.groupCaps || null };
      renderConfirm(parsed);
    });
    $("mwRemoveBtn").addEventListener("click", function () {
      if (window.confirm("Remove your booklet and plan balances from this device?")) {
        storeRemove(BOOKLET_KEY);
        parseStatusMsg = "";
        renderWallet();
        if (window.wfRenderWalletChip) window.wfRenderWalletChip();
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
  function wcardTag(left, max) {
    if (left <= 0) return '<span class="mw-tag mw-tag-used">Used up</span>';
    if (left >= (max || 0)) return '<span class="mw-tag mw-tag-full">Untouched</span>';
    if (max > 0 && Math.round((left / max) * 100) <= 25) return '<span class="mw-tag mw-tag-low">Running low</span>';
    return "";
  }
  function pinChips(b, savedTx, catName, color) {
    return savedTx.filter(function (t) { return treatmentCategory(t) === catName; })
      .map(function (t) { return '<span class="mw-txtag"><span class="mw-dot" style="background:' + color + '"></span>' + esc(t.name) + " ♥</span>"; }).join("");
  }
  function standaloneCardHTML(b, name, savedTx) {
    var meta = catMeta(name);
    var cc = b.categories[name];
    var left = catLeft(b, name);
    var pctLeft = cc.max > 0 ? Math.round((left / cc.max) * 100) : 0;
    var pins = pinChips(b, savedTx, name, meta.color);
    var pinHtml = pins
      ? pins
      : (left <= 0
        ? '<p class="none">Back ' + (resetDate(b) ? fmtDate(resetDate(b)) : "next plan year") + "</p>"
        : '<p class="none">No saved treatments yet</p>');
    return '<div class="mw-wcard' + (left <= 0 ? " usedup" : "") + '">'
      + '<p class="mw-wcard-head"><span class="mw-dot" style="background:' + meta.color + '"></span>' + esc(name)
      + '<span class="mw-badge mw-badge-own">Own budget</span></p>'
      + '<div class="mw-wamt">' + money(left) + "</div>"
      + '<p class="mw-wsub">' + (cc.pct != null ? cc.pct + "% covered · up to " + money(cc.max || 0) + "/yr" : "left of " + money(cc.max || 0) + " max") + "</p>"
      + '<div class="mw-covbar"><i class="' + (pctLeft <= 25 && left > 0 ? "low" : "") + '" style="width:' + pctLeft + '%"></i></div>'
      + wcardTag(left, cc.max)
      + '<div class="mw-pinrow"><p>Saved here</p>' + pinHtml + "</div>"
      + "</div>";
  }
  function poolCardHTML(b, g, savedTx) {
    var members = g.members || [];
    var used = poolUsed(b, g);
    var left = poolLeft(b, g);
    var pctLeft = g.max > 0 ? Math.round((left / g.max) * 100) : 0;
    var pct = g.pct != null ? g.pct : null;
    if (pct == null) {
      for (var i = 0; i < members.length; i++) {
        var mc0 = b.categories[members[i]];
        if (mc0 && mc0.pct != null) { pct = mc0.pct; break; }
      }
    }
    var firstMeta = catMeta(members[0] || g.label);
    var subCaps = members.map(function (m) { return b.categories[m]; })
      .filter(function (cc) { return cc && !cc.sharedPool && (cc.max || 0) > 0; })
      .map(function (cc) { return cc.max; });
    var uniformSub = subCaps.length && subCaps.every(function (v) { return v === subCaps[0]; }) ? subCaps[0] : null;
    var usedParts = members.filter(function (m) { return ((b.categories[m] || {}).used || 0) > 0; })
      .map(function (m) { return esc(m) + " " + money((b.categories[m] || {}).used || 0); });
    var rows = members.map(function (m) {
      var meta = catMeta(m);
      var cc = b.categories[m] || {};
      var mUsed = cc.used || 0;
      var ownCap = (!cc.sharedPool && (cc.max || 0) > 0) ? cc.max : null;
      var ownLeft = ownCap != null ? Math.max(0, ownCap - mUsed) : null;
      var eff = claimable(b, m);
      var sub = ownCap != null
        ? money(ownLeft) + " of its " + money(ownCap) + " cap left"
        : "no per-service limit — draws on the pool";
      var pins = pinChips(b, savedTx, m, meta.color);
      return '<div class="mw-mrow"><span class="mw-dot" style="background:' + meta.color + '"></span>'
        + '<span class="mw-mmain"><span class="mw-mname">' + esc(m) + '</span>'
        + '<span class="mw-msub">' + (mUsed > 0 ? money(mUsed) + " used · " : "") + sub + "</span></span>"
        + '<span class="mw-meff">' + money(eff) + "<small>claimable</small></span></div>"
        + (pins ? '<div class="mw-mpins">' + pins + "</div>" : "");
    }).join("");
    var anyPins = members.some(function (m) {
      return savedTx.some(function (t) { return treatmentCategory(t) === m; });
    });
    return '<div class="mw-wcard mw-poolcard' + (left <= 0 ? " usedup" : "") + '">'
      + '<p class="mw-wcard-head"><span class="mw-dot" style="background:' + firstMeta.color + '"></span>' + esc(g.label)
      + '<span class="mw-badge mw-badge-pool">Shared pool</span></p>'
      + '<div class="mw-wamt">' + money(left) + "</div>"
      + '<p class="mw-wsub">left of ' + money(g.max || 0) + " combined per year" + (pct != null ? " · " + pct + "% covered" : "") + "</p>"
      + '<div class="mw-covbar"><i class="' + (pctLeft <= 25 && left > 0 ? "low" : "") + '" style="width:' + pctLeft + '%"></i></div>'
      + wcardTag(left, g.max)
      + '<p class="mw-poolused">' + (used > 0
          ? money(used) + " used so far" + (usedParts.length ? " — " + usedParts.join(" · ") : "")
          : "Nothing used yet") + "</p>"
      + (subCaps.length ? '<p class="mw-wshare">' + (uniformSub != null
          ? "Each service also capped at " + money(uniformSub) + " on its own"
          : "Each service also has its own yearly cap — see its row") + "</p>" : "")
      + (anyPins ? '<div class="mw-pinrow"><p>Saved here — these draw on this pool</p></div>' : "")
      + '<div class="mw-mrows">' + rows + "</div>"
      + '<p class="mw-poolrule">However you split it, the plan pays at most ' + money(g.max || 0) + " across all " + members.length + " services"
      + (uniformSub != null ? " — and at most " + money(uniformSub) + " for any one" : "") + ".</p>"
      + "</div>";
  }
  function renderWalletCards() {
    var host = $("mwWalletCards");
    if (!host) return;
    var b = booklet();
    if (!b) { host.innerHTML = ""; return; }
    var savedTx = activeFavs().map(treatmentByName).filter(Boolean);
    var groups = b.groupCaps || [];
    var memberOf = {};
    groups.forEach(function (g) {
      (g.members || []).forEach(function (m) { if (!memberOf[m]) memberOf[m] = g; });
    });
    var order = MW_CATS.map(function (c) { return c.name; });
    Object.keys(b.categories).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });
    groups.forEach(function (g) {
      (g.members || []).forEach(function (m) { if (order.indexOf(m) < 0) order.push(m); });
    });
    var renderedGroups = {};
    var cards = "";
    var breakdown = [];
    order.forEach(function (name) {
      var g = memberOf[name];
      if (g) {
        if (renderedGroups[g.label]) return;
        renderedGroups[g.label] = 1;
        cards += poolCardHTML(b, g, savedTx);
        breakdown.push({ label: poolShortLabel(g), left: poolLeft(b, g) });
      } else if (b.categories[name]) {
        cards += standaloneCardHTML(b, name, savedTx);
        breakdown.push({ label: name, left: catLeft(b, name) });
      }
    });
    groups.forEach(function (g) {
      if (renderedGroups[g.label]) return;
      renderedGroups[g.label] = 1;
      cards += poolCardHTML(b, g, savedTx);
      breakdown.push({ label: poolShortLabel(g), left: poolLeft(b, g) });
    });
    var hcsaCard = "";
    if (b.hcsa && b.hcsa.max > 0) {
      var hLeft = Math.max(0, b.hcsa.max - (b.hcsa.used || 0));
      var hPct = Math.round((hLeft / b.hcsa.max) * 100);
      hcsaCard = '<div class="mw-wcard mw-hcsa-card' + (hLeft <= 0 ? " usedup" : "") + '">'
        + '<p class="mw-wcard-head"><span class="mw-dot" style="background:#C77F1A"></span>Health Spending Account</p>'
        + '<div class="mw-wamt">' + money(hLeft) + "</div>"
        + '<p class="mw-wsub">of ' + money(b.hcsa.max) + " HCSA</p>"
        + '<div class="mw-covbar"><i class="' + (hPct <= 25 && hLeft > 0 ? "low" : "") + '" style="width:' + hPct + '%"></i></div>'
        + wcardTag(hLeft, b.hcsa.max)
        + '<div class="mw-pinrow"><p>Flexible money</p><p class="none">Use for any eligible expense — including the part your plan doesn\'t pay.</p></div>'
        + "</div>";
    }
    var totals = bookletTotals(b);
    var strip = "";
    if (groups.length && breakdown.length) {
      strip = '<div class="mw-breakdown"><p><b>How the ' + money(totals.left) + " adds up:</b> "
        + breakdown.map(function (p) { return esc(p.label) + " " + money(p.left); }).join(" + ")
        + " = " + money(totals.left) + " distinct coverage left</p></div>";
    }
    host.innerHTML = ((cards || hcsaCard) ? '<div class="mw-wallet-grid">' + cards + hcsaCard + "</div>" : "")
      + strip
      + '<p class="mw-qual">Balances come from the benefits booklet (PDF) you uploaded, stored only on this device. Amounts may be covered by your plan — confirm with ' + esc(b.insurer || "your insurer") + " before booking.</p>";
  }

  /* ---------- year-end timeline ---------- */
  function pickStep(cat, left, usedTx, tl) {
    var b = booklet();
    var r = resetDate(b);
    var days = daysToReset(b);
    var candidates = TREATMENTS.filter(function (t) {
      return treatmentCategory(t) === cat && usedTx.indexOf(t.name) < 0;
    });
    candidates.sort(function (a, c) {
      var sa = activeFavs().indexOf(a.name) > -1 ? 0 : 1;
      var sc = activeFavs().indexOf(c.name) > -1 ? 0 : 1;
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
        var sa = activeFavs().indexOf(a.name) > -1 ? 0 : 1;
        var sc = activeFavs().indexOf(c.name) > -1 ? 0 : 1;
        return sa - sc || (a.distKm - c.distKm) || ((c.rating ? c.rating[0] : 0) - (a.rating ? a.rating[0] : 0));
      });
      if (!vms.length) continue;
      var pick = vms[0];
      var cadence = Math.max(1, Math.min(12, Math.floor((days || 30) / 7)));
      /* Wallet v2 math: the plan pays pct% of each visit until the
         category max runs out; what's left of the bill falls to the
         HCSA, then to the user. pct unknown (v1 booklets) = the old
         full-price behaviour. */
      var ccfg = (b.categories || {})[cat] || {};
      var pct = ccfg.pct != null ? ccfg.pct : null;
      var perPlan = pick.price * (pct != null ? pct / 100 : 1);
      var sessions = Math.min(Math.floor(left / perPlan), cadence);
      if (sessions < 1) continue;
      usedTx.push(T.name);
      var visitTotal = sessions * pick.price;
      var planPays = Math.min(visitTotal * (pct != null ? pct / 100 : 1), left);
      if (tl && tl.groupOf[cat]) {
        var gl = tl.groupOf[cat];
        planPays = Math.min(planPays, tl.groupLeft[gl]);
        tl.groupLeft[gl] -= planPays;
      }
      var hcsaPays = 0;
      if (tl && tl.hcsaLeft > 0) {
        hcsaPays = Math.min(visitTotal - planPays, tl.hcsaLeft);
        tl.hcsaLeft -= hcsaPays;
      }
      return {
        cat: cat, left: left, treatment: T, clinicName: pick.name,
        price: pick.price, priceStr: pick.priceStr, sessions: sessions,
        total: visitTotal, planPays: planPays, hcsaPays: hcsaPays,
        oop: visitTotal - planPays - hcsaPays, pct: pct,
        split: pct != null || !!(b.hcsa && b.hcsa.max > 0),
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
    var cats = Object.keys(b.categories).map(function (k) { return { name: k, left: claimable(b, k) }; })
      .filter(function (c) { return c.left > 0; })
      .sort(function (a, c) { return c.left - a.left; });
    var tl = { hcsaLeft: b.hcsa ? Math.max(0, b.hcsa.max - (b.hcsa.used || 0)) : 0, groupLeft: {}, groupOf: {} };
    (b.groupCaps || []).forEach(function (g) {
      var usedSum = 0;
      (g.members || []).forEach(function (mn) {
        usedSum += (b.categories[mn] || {}).used || 0;
        if (!tl.groupOf[mn]) tl.groupOf[mn] = g.label;
      });
      tl.groupLeft[g.label] = Math.max(0, (g.max || 0) - usedSum);
    });
    var usedTx = [];
    var steps = [];
    for (var i = 0; i < cats.length && steps.length < 3; i++) {
      var s = pickStep(cats[i].name, cats[i].left, usedTx, tl);
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
    var totalPlan = steps.reduce(function (sum, s) { return sum + (s.planPays != null ? s.planPays : (s.total || 0)); }, 0);
    var totalHcsa = steps.reduce(function (sum, s) { return sum + (s.hcsaPays || 0); }, 0);
    var anySplit = steps.some(function (s) { return s.split; });
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
      var splitTxt = s.split
        ? ". About <b>" + s.sessions + " session" + (s.sessions === 1 ? "" : "s") + "</b> ≈ <b>" + money(s.total) + "</b> in visits. Plan may pay ≈ <b>" + money(s.planPays) + "</b>"
          + (s.hcsaPays > 0 ? " · HCSA could cover ≈ <b>" + money(s.hcsaPays) + "</b>" : "")
          + " · ≈ <b>" + money(s.oop) + "</b> out of pocket.</p>"
        : ". About <b>" + s.sessions + " session" + (s.sessions === 1 ? "" : "s") + "</b> ≈ <b>" + money(s.total) + "</b> of your " + esc(s.cat.toLowerCase()) + " balance may be covered.</p>";
      return '<div class="mw-step">' + head
        + "<h3>" + esc(s.treatment.name) + " · " + money(s.left) + " left</h3>"
        + "<p><b>" + esc(s.clinicName) + "</b> — " + esc(s.treatment.name) + " at <b>" + money(s.price) + "</b> a session"
        + (chip ? ", next opening " + esc(s.slot.d) + " · " + esc(s.slot.t) : "")
        + splitTxt
        + '<div class="go">' + chip
        + (s.bookUrl ? '<a class="mw-bookbtn" href="' + esc(s.bookUrl) + '" target="_blank" rel="noopener">Book at ' + esc(s.clinicName.split(" (")[0]) + "</a>" : "")
        + "</div></div>";
    }).join("");
    host.innerHTML =
      '<div class="mw-timeline"><div class="mw-tl-head">'
      + '<p class="mw-eyebrow" style="color:#55705F;margin:0">' + (yearEnd ? "Use it before " + (r ? r.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "your reset") : "Your plan") + "</p>"
      + "<h2>" + (yearEnd ? "Your year-end plan" : "Your plan ahead") + "</h2>"
      + '<span class="mw-tl-sub" style="color:#5C6B5E;font-size:.9rem">' + steps.length + " moves, ranked by what expires unused.</span>"
      + (anySplit && totalPlan > 0 ? '<span class="mw-tl-total">Plan may pay ≈ ' + money(totalPlan) + (totalHcsa > 0 ? " · HCSA could cover ≈ " + money(totalHcsa) : "") + "</span>"
        : (total > 0 ? '<span class="mw-tl-total">Plan total ≈ ' + money(total) + " in visits that may be covered</span>" : ""))
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
  /* Coverage % nearest before a $ amount (booklets state "80%
     coverage up to $500 ..." — the % precedes its amount). */
  function pctBefore(text, idx, span) {
    var seg = text.slice(Math.max(0, idx - (span || 200)), idx);
    var re = /(\d{1,3})\s?%/g, m, best = null;
    while ((m = re.exec(seg))) {
      var v = parseInt(m[1], 10);
      if (v >= 10 && v <= 100) best = v;
    }
    if (best != null) return best;
    var after = text.slice(idx, idx + 45);
    var am = after.match(/(\d{1,3})\s?%/);
    if (am) { var v2 = parseInt(am[1], 10); if (v2 >= 10 && v2 <= 100) return v2; }
    return null;
  }
  function isHcsaContext(text, idx) {
    return /spending account|\bhcsa\b/i.test(text.slice(Math.max(0, idx - 90), idx + 90));
  }
  /* Health Spending Account amounts in prose: "$249.96 (Single
     Coverage) or $350.04 (Family Coverage)" pairs, or a lone amount
     next to a spending-account mention. */
  function hcsaPairIn(text) {
    var m = text.match(/\$\s?([\d,]+(?:\.\d{2})?)\s*\(Single Coverage\)\s*or\s*\$\s?([\d,]+(?:\.\d{2})?)\s*\(Family Coverage\)/i);
    if (m) return { single: parseFloat(m[1].replace(/,/g, "")), family: parseFloat(m[2].replace(/,/g, "")) };
    return null;
  }
  function hcsaLooseIn(text) {
    var re = /health (?:care )?spending account|\bHCSA\b/gi, m;
    while ((m = re.exec(text))) {
      var win = text.slice(m.index, m.index + 160);
      var am = win.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
      if (am) { var v = parseFloat(am[1].replace(/,/g, "")); if (v >= 10 && v <= 20000) return { single: v, family: v }; }
      var before = text.slice(Math.max(0, m.index - 80), m.index);
      var bm = before.match(/\$\s?([\d,]+(?:\.\d{2})?)(?!.*\$)/);
      if (bm) { var v2 = parseFloat(bm[1].replace(/,/g, "")); if (v2 >= 10 && v2 <= 20000) return { single: v2, family: v2 }; }
    }
    return null;
  }
  /* Attribute prose HCSA mentions to plan tiers: the nearest tier
     keyword mentioned before the amount (intro pages walk through
     the options one by one). */
  function proseTierHcsa(text, tierNames) {
    var out = {};
    if (!tierNames || !tierNames.length) return out;
    var marks = [];
    tierNames.forEach(function (name) {
      var keys = [name.toLowerCase(), name.toLowerCase().split(" ")[0]];
      keys.forEach(function (k) {
        if (k.length < 3) return;
        var re = new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi"), m;
        while ((m = re.exec(text))) marks.push({ idx: m.index, tier: name });
      });
    });
    marks.sort(function (a, b) { return a.idx - b.idx; });
    function tierBefore(idx) {
      var t = null;
      for (var i = 0; i < marks.length; i++) { if (marks[i].idx <= idx) t = marks[i].tier; else break; }
      return t;
    }
    var pairRe = /\$\s?([\d,]+(?:\.\d{2})?)\s*\(Single Coverage\)\s*or\s*\$\s?([\d,]+(?:\.\d{2})?)\s*\(Family Coverage\)/gi, m;
    while ((m = pairRe.exec(text))) {
      var t = tierBefore(m.index);
      if (t && !out[t]) out[t] = { single: parseFloat(m[1].replace(/,/g, "")), family: parseFloat(m[2].replace(/,/g, "")) };
    }
    var looseRe = /receive\s+\$\s?([\d,]+(?:\.\d{2})?)[^.]{0,70}?spending account/gi;
    while ((m = looseRe.exec(text))) {
      var t2 = tierBefore(m.index);
      if (t2 && !out[t2]) { var v = parseFloat(m[1].replace(/,/g, "")); out[t2] = { single: v, family: v }; }
    }
    return out;
  }
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
            /* Spending-account money is its own bucket — it must
               never land in a category. */
            if (isHcsaContext(text, m.index + am.index)) continue;
            var after = win.slice(am.index, am.index + 60);
            var strong = /per (benefit )?year|annual|maximum|max\b/i.test(after) ? 1 : 0;
            /* Booklets list categories sequentially, so the FIRST
               annual-context amount after the category name is its
               max; fall back to the largest plain amount seen. */
            if (strong && !best) best = { val: val, strong: 1, idx: m.index + am.index };
            else if (!strong && !best) best = { val: val, strong: 0, idx: m.index + am.index };
            else if (!strong && best && !best.strong && val > best.val) best = { val: val, strong: 0, idx: m.index + am.index };
          }
        }
      });
      if (best) out.categories[cat.name] = { max: best.val, used: 0, found: true, pct: pctBefore(text, best.idx) };
    });
    var hc = hcsaPairIn(text) || hcsaLooseIn(text);
    if (hc) out.hcsa = hc;
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
  /* ============================================================
     Column-aware parsing for multi-option booklets: pdf.js items
     carry x/y, so a tier header row (Essential / Core / Enhanced
     Plan …) defines columns; every later fragment is bucketed
     into its tier's column text, and table rows are segmented so
     spending-account amounts land in the HCSA bucket, never in a
     category. Pages without a header inherit the open layout.
     ============================================================ */
  var TIER_WORDS = ["essential", "core", "enhanced", "basic", "standard", "premium", "comprehensive", "bronze", "silver", "gold", "platinum", "value", "select", "plus", "classic"];
  function buildPageLines(tc) {
    var its = [];
    (tc.items || []).forEach(function (it) {
      if (!it.str) return;
      var tr = it.transform || [1, 0, 0, 1, 0, 0];
      its.push({ s: it.str, x: tr[4], y: tr[5], w: it.width || 0 });
    });
    its.sort(function (a, b) { return (b.y - a.y) || (a.x - b.x); });
    var raw = [];
    its.forEach(function (it) {
      if (raw.length && Math.abs(raw[raw.length - 1].y - it.y) <= 3) raw[raw.length - 1].items.push(it);
      else raw.push({ y: it.y, items: [it] });
    });
    return raw.map(function (ln) {
      ln.items.sort(function (a, b) { return a.x - b.x; });
      var segs = [], pendWs = false;
      ln.items.forEach(function (it) {
        if (!it.s.trim()) { pendWs = true; return; }
        if (!segs.length) { segs.push({ t: it.s, x0: it.x, x1: it.x + it.w }); pendWs = false; return; }
        var last = segs[segs.length - 1];
        var gap = it.x - last.x1;
        if (pendWs && gap <= 12) { last.t += " " + it.s; last.x1 = it.x + it.w; }
        else if (!pendWs && gap <= 4) { last.t += it.s; last.x1 = it.x + it.w; }
        else segs.push({ t: it.s, x0: it.x, x1: it.x + it.w });
        pendWs = false;
      });
      segs.forEach(function (s) { s.cx = (s.x0 + s.x1) / 2; });
      return { y: ln.y, segs: segs };
    });
  }
  function tierNameOf(segText) {
    var t = String(segText || "").trim();
    if (!t || t.length > 34) return null;
    var low = t.toLowerCase();
    if (TIER_WORDS.indexOf(low) > -1) return t;
    if (/\b(plan|option)$/.test(low) && /^[A-Z][A-Za-z&' -]+$/.test(t)) {
      var words = low.replace(/\s+(plan|option)$/, "").split(/\s+/);
      if (words.some(function (w) { return TIER_WORDS.indexOf(w) > -1; }) || words.length <= 2) return t;
    }
    return null;
  }
  function detectTierLayout(lines) {
    for (var li = 0; li < lines.length; li++) {
      var found = [], seen = {};
      lines[li].segs.forEach(function (s) {
        var nm = tierNameOf(s.t);
        if (nm && !seen[nm]) { seen[nm] = 1; found.push({ name: nm, cx: s.cx }); }
      });
      if (found.length < 2) continue;
      found.sort(function (a, b) { return a.cx - b.cx; });
      /* Single/Family sub-columns from the coverage row just below
         the header: they pin down where each tier's column starts
         and where Single splits from Family. */
      var singles = {}, families = {};
      for (var j = li + 1; j < Math.min(lines.length, li + 7); j++) {
        lines[j].segs.forEach(function (s) {
          var tt = s.t.trim().toLowerCase();
          if (tt !== "single" && tt !== "family") return;
          var bi = 0, bd = Infinity;
          found.forEach(function (t, i) { var d = Math.abs(t.cx - s.cx); if (d < bd) { bd = d; bi = i; } });
          (tt === "single" ? singles : families)[bi] = s.cx;
        });
      }
      var bounds = found.map(function (t, i) {
        t.split = null;
        if (singles[i] != null && families[i] != null) {
          t.split = (singles[i] + families[i]) / 2;
          return singles[i] - (families[i] - singles[i]) / 2;
        }
        if (i === 0) return t.cx - (found[1].cx - t.cx) / 2;
        return (found[i - 1].cx + t.cx) / 2;
      });
      return { tiers: found, bounds: bounds, headerLine: li };
    }
    return null;
  }
  function tierIndexAt(layout, x) {
    var ti = -1;
    layout.bounds.forEach(function (b, i) { if (x >= b) ti = i; });
    return ti;
  }
  /* Segment a table page into rows. Label cells are vertically
     centred, so a wrapped label can sit above or below its row's
     content lines: pending label fragments join whichever content
     line is nearer in y. Rows are only used to route HCSA money. */
  function buildRows(lines, layout, startIdx, state) {
    var rows = state.rows || [], cur = state.cur || null, pending = state.pending || [], lastY = state.lastY || null;
    for (var li = startIdx; li < lines.length; li++) {
      var ln = lines[li];
      var lab = [], con = [];
      ln.segs.forEach(function (s) { (tierIndexAt(layout, s.cx) < 0 ? lab : con).push(s); });
      var labTxt = lab.map(function (s) { return s.t; }).join(" ").trim();
      if (!con.length) { if (labTxt) pending.push({ y: ln.y, t: labTxt }); continue; }
      var newLabels = [];
      pending.forEach(function (p) {
        if (cur && lastY != null && (lastY - p.y) <= (p.y - ln.y)) cur.label = (cur.label + " " + p.t).trim();
        else newLabels.push(p.t);
      });
      pending = [];
      if (labTxt) newLabels.push(labTxt);
      if (!cur) cur = { label: newLabels.join(" "), segs: con.slice() };
      else if (newLabels.length && cur.segs.length) { rows.push(cur); cur = { label: newLabels.join(" "), segs: con.slice() }; }
      else if (newLabels.length) { cur.label = (cur.label + " " + newLabels.join(" ")).trim(); cur.segs = cur.segs.concat(con); }
      else cur.segs = cur.segs.concat(con);
      lastY = ln.y;
    }
    if (cur) { rows.push(cur); cur = null; }
    return { rows: rows, cur: cur, pending: pending, lastY: lastY };
  }
  function hcsaFromRows(rows, layout) {
    var out = {};
    rows.forEach(function (r) {
      if (!/spending|hcsa/i.test(r.label)) return;
      r.segs.forEach(function (s) {
        var re = /\$/g, m;
        while ((m = re.exec(s.t))) {
          var dx = s.x0 + (s.t.length ? (m.index / s.t.length) * (s.x1 - s.x0) : 0);
          var vm = s.t.slice(m.index).match(/^\$\s?([\d,]+(?:\.\d{2})?)/);
          if (!vm) continue;
          var val = parseFloat(vm[1].replace(/,/g, ""));
          if (!(val > 0)) continue;
          var ti = tierIndexAt(layout, dx);
          if (ti < 0) ti = tierIndexAt(layout, s.cx);
          if (ti < 0) return;
          var tier = layout.tiers[ti];
          var cov = tier.split != null ? (dx < tier.split ? "single" : "family") : "single";
          var rec = out[tier.name] = out[tier.name] || {};
          if (rec[cov] == null) rec[cov] = val;
        }
      });
    });
    return out;
  }
  function catsInList(listText) {
    var low = " " + String(listText || "").toLowerCase() + " ";
    var out = [];
    MW_CATS.forEach(function (cat) {
      var hit = cat.aliases.some(function (a) { return low.indexOf(a) > -1; });
      if (hit && out.indexOf(cat.name) < 0) out.push(cat.name);
    });
    return out;
  }
  function includingAfter(text, idx, maxLen) {
    var m = text.slice(idx, idx + 420).match(/including:?/i);
    if (!m) return "";
    var chunk = text.slice(idx + m.index + m[0].length, idx + m.index + m[0].length + (maxLen || 240));
    var cut = chunk.search(/\$\s?\d|\d+\s?%/);
    if (cut > -1) chunk = chunk.slice(0, cut);
    return chunk;
  }
  /* Targeted extractors over ONE tier's column text (normalized to
     single spaces). Fills only categories not already set, so
     earlier pages win and later pages complete them. */
  function extractFromColumnText(rawText, plan) {
    var t = String(rawText || "").replace(/\s+/g, " ");
    var cats = plan.categories, groups = plan.groupCaps;
    function hasGroup(label) { return groups.some(function (g) { return g.label === label; }); }
    var m = t.match(/maximum of \$\s?([\d,]+(?:\.\d{2})?)\s+per\s+specialty/i);
    if (m) {
      var per = parseFloat(m[1].replace(/,/g, ""));
      var pct = pctBefore(t, t.indexOf(m[0]));
      var members = catsInList(includingAfter(t, t.indexOf(m[0]) + m[0].length)).filter(function (c) { return c !== "Dental"; });
      members.forEach(function (c) { if (!cats[c]) cats[c] = { max: per, used: 0, found: true, pct: pct }; });
      var cm = t.match(/(?:overall|total)[^.]{0,60}?maximum of \$\s?([\d,]+(?:\.\d{2})?)/i)
        || t.match(/maximum of \$\s?([\d,]+(?:\.\d{2})?)\s+for all combined/i);
      if (cm && members.length && !hasGroup("Paramedical services combined")) {
        groups.push({ label: "Paramedical services combined", max: parseFloat(cm[1].replace(/,/g, "")), members: members });
      }
    }
    var pm = t.search(/physiotherapy/i);
    if (pm > -1 && !cats.Physiotherapy) {
      var block = t.slice(Math.max(0, pm - 60), pm + 360);
      var mm = block.match(/maximum of \$\s?([\d,]+(?:\.\d{2})?)/i);
      if (mm) cats.Physiotherapy = { max: parseFloat(mm[1].replace(/,/g, "")), used: 0, found: true, pct: pctBefore(block, block.indexOf(mm[0])) };
    }
    var hm = t.search(/mental health/i);
    if (hm > -1) {
      var hblock = t.slice(Math.max(0, hm - 380), hm + 480);
      var hm2 = hblock.match(/expense maximum of \$\s?([\d,]+(?:\.\d{2})?)/i);
      if (hm2) {
        var val = parseFloat(hm2[1].replace(/,/g, ""));
        var pcm = hblock.match(/(\d{1,3})\s?%\s*coverage/i);
        var hpct = pcm ? parseInt(pcm[1], 10) : pctBefore(hblock, hblock.indexOf(hm2[0]));
        var hlist = catsInList(includingAfter(t, hm));
        var hasPsy = hlist.indexOf("Psychology") > -1, hasTher = hlist.indexOf("Psychotherapy") > -1;
        if (hasPsy && !cats.Psychology) cats.Psychology = { max: val, used: 0, found: true, pct: hpct, sharedPool: hasTher };
        if (hasTher && !cats.Psychotherapy) cats.Psychotherapy = { max: val, used: 0, found: true, pct: hpct, sharedPool: true };
        var gm = hblock.match(/overall calendar year maximum of \$\s?([\d,]+(?:\.\d{2})?)/i);
        if (gm && hasPsy && hasTher && !hasGroup("Mental health services combined")) {
          groups.push({ label: "Mental health services combined", max: parseFloat(gm[1].replace(/,/g, "")), members: ["Psychology", "Psychotherapy"] });
        }
      }
    }
  }
  function dentalFromColumnText(rawText, plan) {
    if (plan.categories.Dental) return;
    var t = String(rawText || "").replace(/\s+/g, " ");
    var re = /\$\s?([\d,]+(?:\.\d{2})?)/g, m;
    while ((m = re.exec(t))) {
      var val = parseFloat(m[1].replace(/,/g, ""));
      if (val < 100 || val > 20000) continue;
      var pm = t.match(/(\d{1,3})\s?%/);
      plan.categories.Dental = { max: val, used: 0, found: true, pct: pm ? parseInt(pm[1], 10) : null };
      return;
    }
  }
  /* Whole-PDF structured parse. Returns a tiered parse result, or
     null when no plan-option table exists (flat fallback). */
  function parsePdfStructured(pdf) {
    var texts = [], pages = [];
    var chain = Promise.resolve();
    for (var i = 1; i <= pdf.numPages; i++) {
      (function (n) {
        chain = chain.then(function () {
          return pdf.getPage(n).then(function (pg) { return pg.getTextContent(); })
            .then(function (tc) { texts.push(pageText(tc)); pages.push(buildPageLines(tc)); });
        });
      })(i);
    }
    return chain.then(function () {
      var flatAll = texts.join("\n");
      var sessions = [], cur = null, layout = null;
      pages.forEach(function (lines) {
        var lay = detectTierLayout(lines);
        var flat = lines.map(function (ln) { return ln.segs.map(function (s) { return s.t; }).join(" "); }).join("\n");
        if (lay) {
          layout = lay;
          cur = { layout: lay, colSegs: {}, flat: "", rowstate: {} };
          lay.tiers.forEach(function (t) { cur.colSegs[t.name] = []; });
          sessions.push(cur);
          cur.rowstate = buildRows(lines, lay, lay.headerLine + 1, cur.rowstate);
        } else if (layout) {
          cur.rowstate = buildRows(lines, layout, 0, cur.rowstate);
        } else {
          return;
        }
        cur.flat += "\n" + flat;
        lines.forEach(function (ln) {
          ln.segs.forEach(function (s) {
            var ti = tierIndexAt(layout, s.cx);
            if (ti >= 0) cur.colSegs[layout.tiers[ti].name].push(s.t);
          });
        });
      });
      if (!sessions.length) return null;
      var plans = {}, order = [];
      sessions.forEach(function (sess) {
        var hcsa = hcsaFromRows(sess.rowstate.rows, sess.layout);
        var isDental = /annual maximum/i.test(sess.flat);
        sess.layout.tiers.forEach(function (t) {
          if (!plans[t.name]) { plans[t.name] = { categories: {}, groupCaps: [], hcsa: {} }; order.push(t.name); }
          var plan = plans[t.name];
          var colText = sess.colSegs[t.name].join(" ");
          extractFromColumnText(colText, plan);
          if (isDental) dentalFromColumnText(colText, plan);
          Object.keys(hcsa[t.name] || {}).forEach(function (cov) {
            if (plan.hcsa[cov] == null) plan.hcsa[cov] = hcsa[t.name][cov];
          });
        });
      });
      /* Prose HCSA (intro pages) fills whatever the table missed. */
      var prose = proseTierHcsa(flatAll, order);
      order.forEach(function (name) {
        if (!prose[name]) return;
        ["single", "family"].forEach(function (cov) {
          if (plans[name].hcsa[cov] == null && prose[name][cov] != null) plans[name].hcsa[cov] = prose[name][cov];
        });
      });
      var any = order.some(function (name) {
        return Object.keys(plans[name].categories).length || Object.keys(plans[name].hcsa).length;
      });
      if (!any) return null;
      var def = order.filter(function (n) { return /core/i.test(n); })[0] || order[Math.floor(order.length / 2)] || order[0];
      return {
        insurer: extractPlan(flatAll).insurer || "", planName: "", resetsISO: nextJan1ISO(),
        sourceLabel: "PDF",
        tiers: { names: order, defaultTier: def, plans: plans }
      };
    });
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
      return parsePdfStructured(pdf).then(function (tiered) {
        if (tiered) return { tiered: tiered };
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
        return chain.then(function () { return { flat: texts.join("\n") }; });
      });
    }).then(function (res) {
      parseStatusMsg = "";
      if (res.tiered) { renderConfirm(res.tiered); applyPendingInstr(); return; }
      var text = res.flat || "";
      if (!text || text.replace(/\s/g, "").length < 40) {
        parseStatusMsg = "That PDF looks like scanned images — we couldn't read its text. Try a screenshot of the page instead, or enter your plan manually.";
        renderHero();
        return;
      }
      renderConfirm(extractPlan(text));
      applyPendingInstr();
    }).catch(function () {
      parseStatusMsg = "We couldn't read that PDF — try entering your plan manually.";
      renderHero();
    });
  }

  /* ---------- confirm / edit table ---------- */
  var confirmCtx = null;
  function confirmPlanData() {
    var p = confirmCtx.parsed;
    if (p.tiers) return p.tiers.plans[confirmCtx.tier] || { categories: {}, groupCaps: [], hcsa: {} };
    return {
      categories: p.categories || {},
      groupCaps: p.groupCaps || (p._stored && p._stored.groupCaps) || [],
      hcsa: p.hcsa || null
    };
  }
  function harvestUsed() {
    var host = $("mwConfirm");
    if (!host || !confirmCtx) return;
    MW_CATS.forEach(function (cat) {
      var el = host.querySelector('[data-mw-used="' + cat.name + '"]');
      if (el) confirmCtx.used[cat.name] = el.value;
    });
    var hu = host.querySelector("[data-mw-hcsa-used]");
    if (hu) confirmCtx.hcsaUsed = hu.value;
  }
  function catRowsHTML(data) {
    var parsed = confirmCtx.parsed;
    var groups = data.groupCaps || [];
    var memberOf = {};
    groups.forEach(function (g) {
      (g.members || []).forEach(function (m) { if (!memberOf[m]) memberOf[m] = g; });
    });
    function usedVal(name) {
      var u = confirmCtx.used[name];
      if (u != null && u !== "") return u;
      var f = data.categories[name];
      return f && f.used ? f.used : 0;
    }
    function foundTag(found) {
      return found && found.found ? '<span class="found">found in ' + esc(parsed.sourceLabel || "PDF") + "</span>" : "";
    }
    function maxCell(cat, found) {
      return '<td><input type="number" min="0" step="1" inputmode="numeric" data-mw-max="' + esc(cat.name) + '" value="' + (found ? found.max : "") + '" placeholder="0" aria-label="' + esc(cat.name) + ' yearly maximum"></td>';
    }
    function pctCell(cat, found) {
      return '<td><input type="number" min="0" max="100" step="1" inputmode="numeric" data-mw-pct="' + esc(cat.name) + '" value="' + (found && found.pct != null ? found.pct : "") + '" placeholder="—" aria-label="' + esc(cat.name) + ' coverage percent"></td>';
    }
    function usedCell(cat) {
      return '<td><input type="number" min="0" step="1" inputmode="numeric" data-mw-used="' + esc(cat.name) + '" value="' + usedVal(cat.name) + '" aria-label="' + esc(cat.name) + ' already used"></td>';
    }
    function standaloneRow(cat) {
      var found = data.categories[cat.name];
      return "<tr><td class='catcell'><span class='mw-dot' style='background:" + cat.color + "'></span> " + esc(cat.name)
        + foundTag(found) + "</td>" + maxCell(cat, found) + pctCell(cat, found) + usedCell(cat) + "</tr>";
    }
    function memberRow(cat, g) {
      var found = data.categories[cat.name];
      var pure = !!((found && found.sharedPool) || !found || !(found.max > 0));
      return '<tr class="mw-mrow-tr"><td class="catcell mw-mcell"><span class="mw-dot" style="background:' + cat.color + '"></span> ' + esc(cat.name)
        + foundTag(found) + "</td>"
        + (pure
          ? '<td><span class="mw-share-note">shares the pool — no separate limit</span></td><td></td>'
          : maxCell(cat, found) + pctCell(cat, found))
        + usedCell(cat) + "</tr>";
    }
    function bandRow(g) {
      var pct = g.pct != null ? g.pct : null;
      if (pct == null) {
        for (var i = 0; i < (g.members || []).length; i++) {
          var mf = data.categories[g.members[i]];
          if (mf && mf.pct != null) { pct = mf.pct; break; }
        }
      }
      var usedSum = (g.members || []).reduce(function (s, m) { return s + (parseFloat(usedVal(m)) || 0); }, 0);
      var anyFound = (g.members || []).some(function (m) { var f = data.categories[m]; return f && f.found; });
      return '<tr class="mw-bandrow"><td class="catcell">' + esc(g.label) + '<span class="mw-badge mw-badge-pool">Shared pool</span></td>'
        + '<td><input type="number" min="0" step="1" inputmode="numeric" data-mw-group-max="' + esc(g.label) + '" value="' + (g.max != null ? g.max : "") + '" placeholder="0" aria-label="' + esc(g.label) + ' combined maximum">'
        + '<span class="found">combined max' + (anyFound ? " · found in " + esc(parsed.sourceLabel || "PDF") : "") + "</span></td>"
        + '<td><input type="number" min="0" max="100" step="1" inputmode="numeric" data-mw-group-pct="' + esc(g.label) + '" value="' + (pct != null ? pct : "") + '" placeholder="—" aria-label="' + esc(g.label) + ' coverage percent"></td>'
        + '<td><span class="mw-bandused" data-mw-band-used="' + esc(g.label) + '">' + money(usedSum) + '</span> <span class="mw-bandsum">(sum of services)</span></td></tr>';
    }
    var renderedGroups = {};
    var rows = "";
    MW_CATS.forEach(function (cat) {
      var g = memberOf[cat.name];
      if (g) {
        if (!renderedGroups[g.label]) {
          renderedGroups[g.label] = 1;
          rows += bandRow(g);
          (g.members || []).forEach(function (m) { rows += memberRow(catMeta(m), g); });
        }
      } else {
        rows += standaloneRow(cat);
      }
    });
    groups.forEach(function (g) {
      if (renderedGroups[g.label]) return;
      renderedGroups[g.label] = 1;
      rows += bandRow(g);
      (g.members || []).forEach(function (m) { rows += memberRow(catMeta(m), g); });
    });
    if (confirmCtx.showHcsa) {
      var hmax = "";
      if (data.hcsa) {
        var covKey = confirmCtx.coverage === "Family" ? "family" : "single";
        hmax = data.hcsa[covKey] != null ? data.hcsa[covKey] : (data.hcsa.single != null ? data.hcsa.single : "");
      }
      rows += '<tr class="hcsa-row"><td class="catcell"><span class="mw-dot" style="background:#C77F1A"></span> Health Spending Account (HCSA)'
        + '<span class="found">for any eligible expense</span></td>'
        + '<td><input type="number" min="0" step="0.01" inputmode="decimal" data-mw-hcsa-max value="' + hmax + '" placeholder="0" aria-label="Health Spending Account yearly amount"></td>'
        + "<td></td>"
        + '<td><input type="number" min="0" step="0.01" inputmode="decimal" data-mw-hcsa-used value="' + (confirmCtx.hcsaUsed || 0) + '" aria-label="Health Spending Account already used"></td></tr>';
    }
    return rows;
  }
  function groupNoteHTML(data) {
    if (!data.groupCaps || !data.groupCaps.length) return "";
    return '<p class="mw-groupnote">A <b>combined maximum</b> is one yearly cap shared across several services — however you split it, the plan pays at most that much across all of them together.</p>';
  }
  function refillConfirm() {
    var host = $("mwConfirm");
    if (!host || !confirmCtx) return;
    harvestUsed();
    var data = confirmPlanData();
    var tb = $("mwCatRows");
    if (tb) tb.innerHTML = catRowsHTML(data);
    var gn = $("mwGroupNote");
    if (gn) gn.innerHTML = groupNoteHTML(data);
  }
  /* ----- plain-language instructions (rule-based, on-device) ----- */
  var INSTR_EXTRA = { Physiotherapy: ["physio"], Chiropractic: ["chiro"] };
  function instrCatMatch(clause) {
    var best = null, bestLen = 0;
    MW_CATS.forEach(function (cat) {
      var aliases = cat.aliases.concat([cat.name.toLowerCase()], INSTR_EXTRA[cat.name] || []);
      aliases.forEach(function (a) {
        if (a.length > bestLen && new RegExp("\\b" + a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(clause)) {
          best = cat.name; bestLen = a.length;
        }
      });
    });
    return best;
  }
  function renderInstrChips() {
    var host = $("mwInstrChips");
    if (!host || !confirmCtx) return;
    var labels = Object.keys(confirmCtx.applied).map(function (k) { return confirmCtx.applied[k]; });
    host.innerHTML = labels.length
      ? '<span class="mw-ichips-lbl">Applied:</span>' + labels.map(function (l) { return '<span class="mw-ichip">' + esc(l) + "</span>"; }).join("")
      : "";
    host.hidden = !labels.length;
  }
  function applyInstructions(raw) {
    var host = $("mwConfirm");
    var note = $("mwInstrNote");
    if (!host || !confirmCtx || !raw || !raw.trim()) return;
    var text = " " + raw.toLowerCase().replace(/[’]/g, "'") + " ";
    var appliedNow = 0;
    function chip(key, label) { confirmCtx.applied[key] = label; appliedNow++; }
    /* 1 · plan tier */
    if (confirmCtx.parsed.tiers) {
      var tierHit = null;
      confirmCtx.parsed.tiers.names.forEach(function (name) {
        var keys = [name.toLowerCase(), name.toLowerCase().split(" ")[0]];
        keys.forEach(function (k) {
          if (!tierHit && k.length >= 3 && new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(text)) tierHit = name;
        });
      });
      if (tierHit && tierHit !== confirmCtx.tier) {
        confirmCtx.tier = tierHit;
        var sel = $("mwFTier"); if (sel) sel.value = tierHit;
        var planInput = $("mwFPlan"); if (planInput) planInput.value = tierHit;
        refillConfirm();
        chip("tier", tierHit);
      } else if (tierHit) chip("tier", tierHit);
    } else {
      /* No tiered parse (manual entry / flat booklet): a named plan
         option still lands — as the plan name. */
      for (var ti = 0; ti < TIER_LABELS.length; ti++) {
        if (new RegExp("\\b" + TIER_LABELS[ti].toLowerCase() + "\\b").test(text)) {
          var pfi = $("mwFPlan");
          if (pfi) pfi.value = TIER_LABELS[ti] + " Plan";
          chip("tier", TIER_LABELS[ti] + " plan");
          break;
        }
      }
    }
    /* 2 · coverage (Single / Family) — matters when it changes the
       HCSA amount: tiered parse, or a flat parse with a $ pair. */
    var pd = confirmPlanData();
    var covMatters = !!confirmCtx.parsed.tiers || (pd.hcsa && pd.hcsa.single != null && pd.hcsa.family != null && pd.hcsa.single !== pd.hcsa.family);
    var famAt = text.search(/\bfamily\b|\bspouse\b|\bwife\b|\bhusband\b|\bkids\b|\bchildren\b|\bdependents?\b|\bpartner\b/);
    var sglAt = text.search(/\bsingle\b|just me|only me/);
    if (covMatters && (famAt > -1 || sglAt > -1)) {
      var cov = (famAt > -1 && (sglAt < 0 || famAt > sglAt)) ? "Family" : "Single";
      if (cov !== confirmCtx.coverage || confirmCtx.applied.coverage !== cov + " coverage") {
        confirmCtx.coverage = cov;
        var csel = $("mwFCoverage"); if (csel) csel.value = cov;
        refillConfirm();
      }
      chip("coverage", cov + " coverage");
    }
    /* 3 · used amounts, clause by clause */
    var clauses = text.split(/[,;]|\band\b/);
    clauses.forEach(function (cl) {
      var am = cl.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
      if (!am) return;
      var amt = parseFloat(am[1].replace(/,/g, ""));
      if (/hsa|hcsa|spending account/.test(cl) && /used|claimed|spent/.test(cl)) {
        var hu = host.querySelector("[data-mw-hcsa-used]");
        if (hu) { hu.value = amt; confirmCtx.hcsaUsed = String(amt); chip("hcsaUsed", "HCSA used " + money(amt)); }
        return;
      }
      if (!/used|claimed|spent|left/.test(cl)) return;
      var cat = instrCatMatch(cl);
      if (!cat) return;
      var usedEl = host.querySelector('[data-mw-used="' + cat + '"]');
      var maxEl = host.querySelector('[data-mw-max="' + cat + '"]');
      if (!usedEl) return;
      if (/\bleft\b/.test(cl) && maxEl && parseFloat(maxEl.value)) {
        var leftUsed = Math.max(0, Math.round(parseFloat(maxEl.value) - amt));
        usedEl.value = leftUsed; confirmCtx.used[cat] = String(leftUsed);
        chip("used:" + cat, cat + " " + money(amt) + " left");
      } else if (/used|claimed|spent/.test(cl)) {
        usedEl.value = amt; confirmCtx.used[cat] = String(amt);
        chip("used:" + cat, cat + " used " + money(amt));
      }
    });
    /* 4 · reset date */
    var rm = text.match(/(reset|renew|plan year|starts?|begins?)[^.]{0,24}?\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})?\b/);
    if (rm) {
      var months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
      var mon = months[rm[2].slice(0, 4)] != null ? months[rm[2].slice(0, 4)] : months[rm[2].slice(0, 3)];
      var day = rm[3] ? parseInt(rm[3], 10) : 1;
      var now = new Date(); now.setHours(0, 0, 0, 0);
      var d = new Date(now.getFullYear(), mon, day);
      if (d <= now) d = new Date(now.getFullYear() + 1, mon, day);
      var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      var ri = $("mwFReset"); if (ri) ri.value = iso;
      chip("reset", "Resets " + fmtDate(d));
    }
    /* 5 · insurer */
    for (var ii = 0; ii < INSURERS.length; ii++) {
      var nm = INSURERS[ii];
      if (text.indexOf(" " + nm.toLowerCase().replace(/\s+/g, " ") + " ") > -1 || text.indexOf(nm.toLowerCase()) > -1) {
        var fi = $("mwFInsurer");
        if (fi) fi.value = nm.replace("Green Shield", "GreenShield");
        chip("insurer", nm.replace("Green Shield", "GreenShield"));
        break;
      }
    }
    renderInstrChips();
    if (note) {
      if (appliedNow) { note.hidden = true; note.textContent = ""; }
      else { note.hidden = false; note.textContent = "Didn't catch anything to apply there — everything below is editable by hand."; }
    }
    var input = $("mwInstr");
    if (input) input.value = "";
  }
  function renderConfirm(parsed) {
    var host = $("mwConfirm");
    if (!host) return;
    var usedSeed = {}, huSeed = 0;
    Object.keys(parsed.categories || {}).forEach(function (k) {
      var u = (parsed.categories[k] || {}).used;
      if (u) usedSeed[k] = String(u);
    });
    if (parsed.hcsaUsed) huSeed = parsed.hcsaUsed;
    var isManual = !parsed.tiers && !parsed.sourceLabel && !Object.keys(parsed.categories || {}).length && !parsed.hcsa;
    confirmCtx = {
      parsed: parsed,
      tier: parsed.tiers ? (parsed.tiers.defaultTier || parsed.tiers.names[0]) : null,
      coverage: parsed.coverage || "Single",
      used: usedSeed, hcsaUsed: huSeed,
      applied: {},
      showHcsa: !!(parsed.tiers || parsed.hcsa || isManual)
    };
    var tierBar = "";
    if (parsed.tiers) {
      tierBar = '<div class="mw-tierbar">'
        + '<label>Plan option<select id="mwFTier">' + parsed.tiers.names.map(function (n) {
          return '<option value="' + esc(n) + '"' + (n === confirmCtx.tier ? " selected" : "") + ">" + esc(n) + "</option>";
        }).join("") + "</select></label>"
        + '<label>Coverage<select id="mwFCoverage"><option value="Single"' + (confirmCtx.coverage === "Single" ? " selected" : "") + '>Single</option><option value="Family"' + (confirmCtx.coverage === "Family" ? " selected" : "") + ">Family</option></select></label>"
        + "</div>";
    }
    host.innerHTML =
      '<div class="mw-confirm"><h2>Confirm your plan</h2>'
      + '<p class="sub">We read these amounts from your booklet on this device — booklets vary, so check each line and fix anything before saving. "Already used" is what you have claimed so far this plan year; what\'s left is what My WellFinder plans around.</p>'
      + '<div class="mw-composer mw-composer--compact" id="mwInstrBar"><button type="button" class="mw-comp-attach" id="mwInstrAttach" aria-label="Attach a booklet file instead">+</button><input id="mwInstr" type="text" autocomplete="off" placeholder="Anything we should know? Try: I\'m on the Core plan, single coverage · I\'ve used $200 of physio · My plan resets March 1" aria-label="Tell us about your plan in your own words"><button type="button" class="mw-comp-mic" id="mwInstrMic" aria-label="Dictate with your voice">' + MIC_SVG + '</button><button type="button" class="mw-comp-send-disc" id="mwInstrApply" aria-label="Apply instructions">↑</button></div>'
      + '<div class="mw-ichips" id="mwInstrChips" hidden></div>'
      + '<p class="mw-instr-note" id="mwInstrNote" hidden></p>'
      + (parsed.note ? '<p class="mw-confirm-note">' + esc(parsed.note) + "</p>" : "")
      + tierBar
      + '<div class="mw-cgrid">'
      + '<label>Insurer<input id="mwFInsurer" type="text" value="' + esc(parsed.insurer || "") + '" placeholder="e.g. Manulife"></label>'
      + '<label>Plan name<input id="mwFPlan" type="text" value="' + esc(parsed.tiers ? confirmCtx.tier : (parsed.planName || "")) + '" placeholder="e.g. Extended Health"></label>'
      + '<label>Plan resets on<input id="mwFReset" type="date" value="' + esc(parsed.resetsISO || nextJan1ISO()) + '"></label>'
      + "</div>"
      + '<table class="mw-ctable"><thead><tr><th>Category</th><th>Yearly max ($)</th><th>Covered %</th><th>Already used ($)</th></tr></thead><tbody id="mwCatRows"></tbody></table>'
      + '<div id="mwGroupNote"></div>'
      + '<div class="mw-confirm-actions"><button type="button" class="mw-savebtn" id="mwSaveBooklet">Save my booklet</button><button type="button" class="mw-cancelbtn" id="mwCancelConfirm">Cancel</button></div>'
      + "</div>";
    host.hidden = false;
    host.scrollIntoView({ behavior: "smooth", block: "start" });
    refillConfirm();
    var tierSel = $("mwFTier");
    if (tierSel) tierSel.addEventListener("change", function () {
      confirmCtx.tier = tierSel.value;
      var pi = $("mwFPlan"); if (pi) pi.value = tierSel.value;
      refillConfirm();
    });
    var covSel = $("mwFCoverage");
    if (covSel) covSel.addEventListener("change", function () { confirmCtx.coverage = covSel.value; refillConfirm(); });
    /* Pool band "used" cells are auto-sums of their member rows. */
    host.addEventListener("input", function (e) {
      var t = e.target;
      if (!t || !t.getAttribute || !t.getAttribute("data-mw-used")) return;
      (confirmPlanData().groupCaps || []).forEach(function (g) {
        var cell = host.querySelector('[data-mw-band-used="' + g.label.replace(/"/g, '\\"') + '"]');
        if (!cell) return;
        var sum = 0;
        (g.members || []).forEach(function (m) {
          var el = host.querySelector('[data-mw-used="' + m + '"]');
          if (el) sum += parseFloat(el.value) || 0;
        });
        cell.textContent = money(sum);
      });
    });
    var applyBtn = $("mwInstrApply");
    if (applyBtn) applyBtn.addEventListener("click", function () { var i = $("mwInstr"); applyInstructions(i ? i.value : ""); });
    var instrInput = $("mwInstr");
    if (instrInput) instrInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); applyInstructions(instrInput.value); } });
    var instrAttach = $("mwInstrAttach");
    if (instrAttach) instrAttach.addEventListener("click", pickPdf);
    var instrMic = $("mwInstrMic");
    if (instrMic && instrInput) wireMic(instrMic, instrInput, $("mwInstrBar"), null);
    $("mwCancelConfirm").addEventListener("click", function () { host.hidden = true; host.innerHTML = ""; });
    $("mwSaveBooklet").addEventListener("click", function () {
      var plan = confirmPlanData();
      var groupPct = {}, memberGroup = {};
      (plan.groupCaps || []).forEach(function (g) {
        var gpEl = host.querySelector('[data-mw-group-pct="' + g.label.replace(/"/g, '\\"') + '"]');
        var gp = gpEl ? parseFloat(gpEl.value) : NaN;
        if (gp > 0 && gp <= 100) groupPct[g.label] = Math.round(gp);
        else if (g.pct != null) groupPct[g.label] = g.pct;
        (g.members || []).forEach(function (m) { memberGroup[m] = g.label; });
      });
      var cats = {};
      MW_CATS.forEach(function (cat) {
        var mx = parseFloat((host.querySelector('[data-mw-max="' + cat.name + '"]') || {}).value) || 0;
        var us = parseFloat((host.querySelector('[data-mw-used="' + cat.name + '"]') || {}).value) || 0;
        var pc = parseFloat((host.querySelector('[data-mw-pct="' + cat.name + '"]') || {}).value);
        var src = plan.categories[cat.name];
        /* Pure-pool members have no max input of their own: they are
           stored with the pool max + sharedPool flag (parser shape),
           and wfWalletLeft/claimable count them via the pool only. */
        if (!(mx > 0) && src && src.sharedPool) {
          var gOf = (plan.groupCaps || []).filter(function (g) { return (g.members || []).indexOf(cat.name) > -1; })[0];
          var pmax = gOf ? (parseFloat((host.querySelector('[data-mw-group-max="' + gOf.label.replace(/"/g, '\\"') + '"]') || {}).value) || gOf.max || 0) : (src.max || 0);
          if (pmax > 0) {
            var pentry = { max: Math.round(pmax * 100) / 100, used: Math.min(Math.round(us * 100) / 100, Math.round(pmax * 100) / 100), sharedPool: true };
            var ppc = (pc > 0 && pc <= 100) ? pc : (memberGroup[cat.name] ? groupPct[memberGroup[cat.name]] : null);
            if (ppc != null) pentry.pct = Math.round(ppc);
            else if (src.pct != null) pentry.pct = src.pct;
            cats[cat.name] = pentry;
          }
          return;
        }
        if (mx > 0) {
          var entry = { max: Math.round(mx * 100) / 100, used: Math.min(Math.round(us * 100) / 100, Math.round(mx * 100) / 100) };
          if (pc > 0 && pc <= 100) entry.pct = Math.round(pc);
          else if (memberGroup[cat.name] && groupPct[memberGroup[cat.name]] != null) entry.pct = groupPct[memberGroup[cat.name]];
          if (src && src.sharedPool) entry.sharedPool = true;
          cats[cat.name] = entry;
        }
      });
      var b = {
        insurer: ($("mwFInsurer").value || "").trim(),
        planName: ($("mwFPlan").value || "").trim(),
        resetsISO: ($("mwFReset").value || nextJan1ISO()),
        uploadedISO: new Date().toISOString(),
        categories: cats
      };
      if (plan.groupCaps && plan.groupCaps.length) {
        b.groupCaps = plan.groupCaps.map(function (g) {
          var gmEl = host.querySelector('[data-mw-group-max="' + g.label.replace(/"/g, '\\"') + '"]');
          var gm = gmEl ? parseFloat(gmEl.value) : NaN;
          var out = { label: g.label, max: gm > 0 ? Math.round(gm * 100) / 100 : (g.max || 0), members: (g.members || []).slice() };
          if (groupPct[g.label] != null) out.pct = groupPct[g.label];
          return out;
        });
      }
      if (parsed.tiers) {
        b.tier = confirmCtx.tier;
        b.coverage = confirmCtx.coverage;
        if (!b.groupCaps) b.groupCaps = [];
      } else if (parsed._stored) {
        if (parsed._stored.tier) b.tier = parsed._stored.tier;
        if (parsed._stored.coverage) b.coverage = parsed._stored.coverage;
        if (!b.groupCaps && parsed._stored.groupCaps) b.groupCaps = parsed._stored.groupCaps;
      }
      if (confirmCtx.showHcsa) {
        var hm = parseFloat((host.querySelector("[data-mw-hcsa-max]") || {}).value) || 0;
        var hu = parseFloat((host.querySelector("[data-mw-hcsa-used]") || {}).value) || 0;
        if (hm > 0) b.hcsa = { max: Math.round(hm * 100) / 100, used: Math.min(Math.round(hu * 100) / 100, Math.round(hm * 100) / 100) };
      }
      saveBooklet(b);
      host.hidden = true; host.innerHTML = "";
      parseStatusMsg = "";
      renderWallet();
      renderTreatments();
      renderTimeline();
      if (window.wfRenderWalletChip) window.wfRenderWalletChip();
    });
  }

  /* ============================================================
     Saved treatments — one-line carousel (replaces the old grid,
     whose card CSS clipped card text)
     ============================================================ */
  function txCardHTML(t) {
    var b = booklet();
    var cat = treatmentCategory(t);
    var photo = imgFor(t);
    var media = photo
      ? '<img src="' + esc(photo) + '" alt="" loading="lazy">'
      : '<span class="tx-nophoto" style="background:' + catMeta(cat || "").color + '" aria-hidden="true">' + esc((t.name || "?").charAt(0)) + "</span>";
    var meta = "";
    if (b && cat && b.categories[cat]) {
      meta = money(claimable(b, cat)) + " claimable · " + esc(cat);
    }
    return '<article class="tx-card">'
      + '<a class="tx-cardlink" href="/clinics-' + slug(t.name) + '" aria-label="See clinics offering ' + esc(t.name) + '">'
      + '<span class="tx-media">' + media + "</span>"
      + '<span class="tx-body"><span class="tx-name">' + esc(t.name) + "</span>"
      + '<span class="tx-mod">' + esc(t.group || "") + " · billed as " + esc(t.billed || "") + "</span>"
      + '<span class="tx-meta"' + (meta ? "" : ' data-near-for="' + esc(t.name) + '"') + ">" + esc(meta) + "</span>"
      + "</span></a>"
      + '<span class="tx-actions">'
      + '<button type="button" class="tx-act" data-archive-tx="' + esc(t.name) + '" aria-label="Archive ' + esc(t.name) + '" title="Archive">🗄</button>'
      + '<button type="button" class="tx-act" data-remove-tx="' + esc(t.name) + '" aria-label="Remove ' + esc(t.name) + ' from saved" title="Remove">✕</button>'
      + "</span></article>";
  }
  function wireTxCarousel() {
    var track = $("txTrack");
    if (!track) return;
    var prev = document.querySelector("[data-tx-scroll='-1']");
    var next = document.querySelector("[data-tx-scroll='1']");
    function upd() {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    function go(dir) {
      track.scrollBy({ left: dir * Math.max(240, track.clientWidth * 0.8), behavior: "smooth" });
      setTimeout(upd, 350);
    }
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", upd, { passive: true });
    upd();
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
    var txs = activeFavs().map(treatmentByName).filter(Boolean);
    if (!txs.length) {
      treatWrap.innerHTML = '<div class="saved-empty-card"><span class="big" aria-hidden="true">♥</span><h3>No saved treatments yet</h3><p>Tap the heart ♥ on any treatment to pin it here. Saved treatments get matched to your booklet balance.</p><a class="btn btn--primary" href="/">Browse treatments</a></div>';
      return 0;
    }
    treatWrap.innerHTML = '<div class="tx-carousel">'
      + '<button type="button" class="tx-arrow" data-tx-scroll="-1" aria-label="Scroll saved treatments back">‹</button>'
      + '<div class="tx-track" id="txTrack">' + txs.map(txCardHTML).join("") + "</div>"
      + '<button type="button" class="tx-arrow" data-tx-scroll="1" aria-label="Scroll saved treatments forward">›</button>'
      + "</div>";
    wireTxCarousel();
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
    var favList = activeFavs();
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
      + '<button type="button" class="mw-archivebtn" data-archive-clinic="' + esc(vm.name) + '">Archive</button>'
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
    var savedTx = activeFavs().filter(function (n) { return treatmentByName(n) && offered[n]; });
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
    var f = activeFavs();
    var b = booklet();
    if (b) {
      var perBilled = {};
      TREATMENTS.forEach(function (t) {
        if (f.indexOf(t.name) > -1 || isArchived(t.name)) return;
        var cat = treatmentCategory(t);
        if (!cat) return;
        var left = claimable(b, cat);
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
    grid.innerHTML = "";
    renderSuggClinics();
  }
  function renderSuggClinics() {
    var host = $("mwSuggClinics");
    if (!host) return;
    var f = activeFavs();
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
        if (cat && claimable(b, cat) > 0 && interesting.indexOf(t.name) < 0) interesting.push(t.name);
      });
    }
    Object.keys(byName).forEach(function (name) {
      if (savedClinics[name] || f.indexOf(name) > -1 || isArchived(name)) return;
      var entries = byName[name];
      var txs = entries.map(function (e) { return e.treatment; }).filter(function (t) { return interesting.indexOf(t) > -1; });
      if (!txs.length) return;
      var c = entries[0].clinic;
      var vm = { name: name, clinic: c, key: (c.name + "|" + (c.city || "")).toLowerCase(), X: extraFor(c), media: mediaFor(c), distKm: Infinity };
      vm.rating = ratingFor(vm);
      var photo = vm.media.img || (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.gal && CLINIC_EXTRA.gal[name] && CLINIC_EXTRA.gal[name][0]) || "";
      if (window.wfGeo && userPt) {
        var coords = window.wfGeo.clinicCoords(c) || (vm.media.lat != null ? [parseFloat(vm.media.lat), parseFloat(vm.media.lng)] : null);
        if (coords) vm.distKm = window.wfGeo.haversineKm(userPt, coords);
      }
      var lead = (typeof CLINIC_EXTRA !== "undefined" && CLINIC_EXTRA.lead && CLINIC_EXTRA.lead[name] && CLINIC_EXTRA.lead[name][txs[0]]) || "";
      var addr = vm.media.address || "";
      if (!addr) {
        var parts = [];
        if (vm.X && vm.X.a) parts.push(vm.X.a);
        if (c.city) parts.push(c.city);
        if (c.prov) parts.push(c.prov);
        addr = parts.join(", ");
      }
      pool.push({ vm: vm, tx: txs[0], photo: photo, lead: lead, addr: addr });
    });
    pool.sort(function (a, c) {
      return (a.vm.distKm - c.vm.distKm) || ((c.vm.rating ? c.vm.rating[0] : 0) - (a.vm.rating ? a.vm.rating[0] : 0));
    });
    pool = pool.slice(0, 3);
    host.innerHTML = pool.length ? pool.map(function (p) {
      var vm = p.vm;
      var ph = p.photo
        ? '<div class="ph" style="background-image:url(\'' + esc(p.photo) + '\')" role="img" aria-label="' + esc(vm.name) + '"></div>'
        : '<div class="ph ph--none" aria-hidden="true"><span>' + esc((vm.name || "?").charAt(0)) + "</span></div>";
      var rate = vm.rating
        ? '<span class="rate">★ ' + (vm.rating[0] % 1 ? vm.rating[0].toFixed(1) : vm.rating[0]) + " (" + Number(vm.rating[1] || 0).toLocaleString() + ")</span>"
        : "<span></span>";
      return '<div class="mw-sugg-card">' + ph
        + '<div class="b"><h4>' + esc(vm.name) + "</h4>"
        + (p.lead ? '<p class="desc">' + esc(p.lead) + "</p>" : "")
        + (p.addr ? '<p class="addr">' + esc(p.addr) + "</p>" : "")
        + '<div class="mw-sugg-actions">' + rate
        + '<button type="button" class="mw-savebtn2" data-mw-save="' + esc(vm.name) + '">♥ Save clinic</button></div>'
        + "</div></div>";
    }).join("") : "";
    syncRecVisibility();
  }
  /* The Recommended section shows only when it has something in it —
     no orphan heading over an empty block. */
  function syncRecVisibility() {
    var wrap = $("savedRecWrap");
    if (!wrap) return;
    var g1 = $("savedRecGrid"), g2 = $("mwSuggClinics");
    var has = !!((g1 && g1.children.length) || (g2 && g2.children.length));
    wrap.hidden = !has;
  }

  /* ============================================================
     Archived items (bottom of /saved)
     ============================================================ */
  function renderArchived() {
    var wrap = $("mwArchivedWrap");
    if (!wrap) return;
    var f = favs();
    var names = archived().filter(function (n) { return f.indexOf(n) > -1; });
    if (!names.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    var cnt = $("mwArchivedCount");
    if (cnt) cnt.textContent = String(names.length);
    var list = $("mwArchivedList");
    if (!list) return;
    list.innerHTML = names.map(function (n) {
      var t = treatmentByName(n);
      var tag, sub = "";
      if (t) { tag = "Treatment"; }
      else {
        tag = "Clinic";
        var e = findClinic(n);
        if (e && e.clinic) sub = e.clinic.city || "";
      }
      return '<div class="mw-arch-row"><span class="mw-arch-name">' + esc(n) + '</span>'
        + '<span class="mw-arch-tag">' + tag + "</span>"
        + (sub ? '<span class="mw-arch-city">' + esc(sub) + "</span>" : "")
        + '<span class="mw-arch-sp"></span>'
        + '<button type="button" class="mw-arch-btn" data-restore="' + esc(n) + '">Restore</button>'
        + '<button type="button" class="mw-arch-btn mw-arch-del" data-remove-archived="' + esc(n) + '">Remove</button></div>';
    }).join("");
  }
  function renderAllSaved() {
    render();
    renderRecs();
    renderSuggClinics();
    renderWalletCards();
    renderTimeline();
    renderArchived();
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
    renderArchived();
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
      renderAllSaved();
      return;
    }
    var btn = e.target.closest ? e.target.closest("[data-unsave]") : null;
    if (btn) {
      var name = btn.getAttribute("data-unsave");
      if (window.wfFavs) wfFavs.toggle(name);
      renderAllSaved();
      return;
    }
    var atx = e.target.closest ? e.target.closest("[data-archive-tx]") : null;
    if (atx) {
      archiveItem(atx.getAttribute("data-archive-tx"));
      renderAllSaved();
      return;
    }
    var rtx = e.target.closest ? e.target.closest("[data-remove-tx]") : null;
    if (rtx) {
      if (window.wfFavs) wfFavs.toggle(rtx.getAttribute("data-remove-tx"));
      renderAllSaved();
      return;
    }
    var acl = e.target.closest ? e.target.closest("[data-archive-clinic]") : null;
    if (acl) {
      archiveItem(acl.getAttribute("data-archive-clinic"));
      renderAllSaved();
      return;
    }
    var rst = e.target.closest ? e.target.closest("[data-restore]") : null;
    if (rst) {
      unarchiveItem(rst.getAttribute("data-restore"));
      renderAllSaved();
      return;
    }
    var rar = e.target.closest ? e.target.closest("[data-remove-archived]") : null;
    if (rar) {
      var rname = rar.getAttribute("data-remove-archived");
      unarchiveItem(rname);
      if (window.wfFavs && wfFavs.has(rname)) wfFavs.toggle(rname);
      var mm = metaAll();
      if (mm[rname]) { delete mm[rname]; storeSet(META_KEY, JSON.stringify(mm)); }
      renderAllSaved();
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
        renderAllSaved();
      }
    });
  }

  if (clear) {
    clear.addEventListener("click", function () {
      storeSet(FAV_KEY, "[]");
      setArchived([]);
      renderAllSaved();
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
