(function () {
  "use strict";

  const stage = document.getElementById("discoverStage");
  const cardWrap = document.getElementById("cardWrap");
  const progress = document.getElementById("cardProgress");
  const savedProgress = document.getElementById("savedProgress");
  const progressBar = document.getElementById("progressBar");
  const toast = document.getElementById("swipeToast");
  const actions = document.getElementById("discoverActions");
  const skipBtn = document.getElementById("skipBtn");
  const saveBtn = document.getElementById("saveBtn");
  if (!stage || !cardWrap || typeof TREATMENTS === "undefined") return;

  const FAV_KEY = "wf_favourites";
  const icons = ["◒", "≈", "⌁", "✦", "✺", "B₁₂", "G", "IV", "Aa", "♫", "⌁"];
  const palettes = [
    ["#315f52", "#dfebe4"], ["#765e4f", "#eee5dc"], ["#416b7a", "#dce9ec"],
    ["#8a5e67", "#f1e2e6"], ["#806237", "#f0e7d5"], ["#48617e", "#e1e8f0"],
    ["#6f586f", "#ede3ed"], ["#3f6c66", "#dfece9"], ["#775c3f", "#eee6db"],
    ["#586c47", "#e5ebdf"], ["#595883", "#e4e4ef"]
  ];
  const shield = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>';

  let index = 0;
  let locked = false;
  let activePointer = null;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let currentCard = null;

  function getSaved() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch (_) { return []; }
  }

  function saveTreatment(name) {
    const saved = getSaved();
    if (!saved.includes(name)) {
      saved.push(name);
      try { localStorage.setItem(FAV_KEY, JSON.stringify(saved)); } catch (_) {}
    }
    return saved.length;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function coverageLabel(treatment) {
    return treatment.categories && treatment.categories.length
      ? treatment.categories.join(" or ")
      : treatment.billed;
  }

  function updateMeta() {
    const shown = Math.min(index + 1, TREATMENTS.length);
    progress.textContent = shown + " of " + TREATMENTS.length;
    savedProgress.textContent = getSaved().length + " saved";
    progressBar.style.width = Math.min((index / TREATMENTS.length) * 100, 100) + "%";
  }

  function renderCard() {
    updateMeta();
    if (index >= TREATMENTS.length) {
      progress.textContent = "Complete";
      progressBar.style.width = "100%";
      actions.hidden = true;
      const count = getSaved().length;
      cardWrap.innerHTML =
        '<section class="discover-complete">' +
          '<div><div class="complete-mark" aria-hidden="true">✓</div>' +
          '<h2>Your wellness shortlist is ready.</h2>' +
          '<p>You saved <strong>' + count + '</strong> treatment' + (count === 1 ? "" : "s") + '. Find them again in the treatment directory, or run through the deck once more.</p>' +
          '<div class="complete-actions">' +
            '<a class="btn btn--primary" href="/#directory">Browse treatments</a>' +
            '<button class="btn btn--ghost" id="restartDiscover" type="button">Start over</button>' +
          '</div></div></section>';
      document.getElementById("restartDiscover").addEventListener("click", function () {
        index = 0;
        actions.hidden = false;
        renderCard();
      });
      currentCard = null;
      return;
    }

    const t = TREATMENTS[index];
    const palette = palettes[index % palettes.length];
    const hasLink = Boolean(t.link);
    cardWrap.innerHTML =
      '<article class="discover-card entering" tabindex="0" aria-label="' + escapeHTML(t.name) + '. Swipe right to save or left to skip."' +
        ' style="--card-accent:' + palette[0] + ';--card-pale:' + palette[1] + '">' +
        '<span class="choice-stamp choice-stamp--save">Save ♥</span>' +
        '<span class="choice-stamp choice-stamp--skip">Skip</span>' +
        '<div class="card-art">' +
          '<span class="card-art-kicker">' + escapeHTML(t.group) + '</span>' +
          '<span class="card-number" aria-hidden="true">' + String(index + 1).padStart(2, "0") + '</span>' +
          '<span class="card-art-icon" aria-hidden="true">' + icons[index % icons.length] + '</span>' +
        '</div>' +
        '<div class="card-content">' +
          '<span class="card-billing">May be billed as ' + escapeHTML(t.billed) + '</span>' +
          '<h2>' + escapeHTML(t.name) + '</h2>' +
          '<p class="card-description">' + escapeHTML(t.desc) + '</p>' +
          '<div class="card-coverage">' +
            '<span class="coverage-shield" aria-hidden="true">' + shield + '</span>' +
            '<div><span>Check this benefit</span><strong>' + escapeHTML(coverageLabel(t)) + '</strong></div>' +
          '</div>' +
        '</div>' +
        (hasLink ? '<a class="card-link visible" href="' + escapeHTML(t.link) + '" aria-label="Find clinics for ' + escapeHTML(t.name) + '">→</a>' : "") +
      '</article>';

    currentCard = cardWrap.querySelector(".discover-card");
    currentCard.addEventListener("pointerdown", onPointerDown);
    currentCard.addEventListener("pointermove", onPointerMove);
    currentCard.addEventListener("pointerup", onPointerUp);
    currentCard.addEventListener("pointercancel", onPointerCancel);
    currentCard.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") dismiss("right");
      if (event.key === "ArrowLeft") dismiss("left");
    });
    locked = false;
  }

  function onPointerDown(event) {
    if (locked || event.target.closest("a")) return;
    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;
    deltaY = 0;
    currentCard.classList.remove("entering");
    currentCard.classList.add("dragging");
    currentCard.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (event.pointerId !== activePointer || locked) return;
    deltaX = event.clientX - startX;
    deltaY = event.clientY - startY;
    const rotation = Math.max(-12, Math.min(12, deltaX / 18));
    currentCard.style.transform = "translate3d(" + deltaX + "px," + (deltaY * 0.16) + "px,0) rotate(" + rotation + "deg)";
    const strength = Math.min(Math.abs(deltaX) / 110, 1);
    currentCard.querySelector(".choice-stamp--save").style.opacity = deltaX > 0 ? strength : 0;
    currentCard.querySelector(".choice-stamp--skip").style.opacity = deltaX < 0 ? strength : 0;
  }

  function onPointerUp(event) {
    if (event.pointerId !== activePointer || locked) return;
    activePointer = null;
    currentCard.classList.remove("dragging");
    const threshold = Math.max(80, currentCard.offsetWidth * 0.2);
    if (Math.abs(deltaX) >= threshold) {
      dismiss(deltaX > 0 ? "right" : "left");
    } else {
      returnToCenter();
    }
  }

  function onPointerCancel() {
    if (locked) return;
    activePointer = null;
    if (currentCard) {
      currentCard.classList.remove("dragging");
      returnToCenter();
    }
  }

  function returnToCenter() {
    if (!currentCard) return;
    currentCard.style.transition = "transform .32s cubic-bezier(.22,.8,.3,1)";
    currentCard.style.transform = "translate3d(0,0,0) rotate(0deg)";
    currentCard.querySelectorAll(".choice-stamp").forEach(function (el) { el.style.opacity = 0; });
    window.setTimeout(function () {
      if (currentCard) currentCard.style.transition = "";
    }, 340);
  }

  function showToast(direction, name) {
    toast.className = "swipe-toast " + (direction === "right" ? "save" : "skip");
    toast.textContent = direction === "right"
      ? "♥ " + name + " saved to My Wellness"
      : "Skipped — you can still find it in Browse";
    void toast.offsetWidth;
    toast.classList.add("show");
  }

  function dismiss(direction) {
    if (locked || !currentCard) return;
    locked = true;
    const t = TREATMENTS[index];
    if (direction === "right") saveTreatment(t.name);
    showToast(direction, t.name);
    updateMeta();

    const distance = window.innerWidth + currentCard.offsetWidth + 180;
    const sign = direction === "right" ? 1 : -1;
    currentCard.classList.remove("dragging", "entering");
    currentCard.style.transition = "transform .56s cubic-bezier(.2,.72,.18,1), opacity .45s ease";
    currentCard.style.transform = "translate3d(" + (sign * distance) + "px,-24px,0) rotate(" + (sign * 18) + "deg)";
    currentCard.style.opacity = "0";

    window.setTimeout(function () {
      index += 1;
      renderCard();
    }, 580);
  }

  skipBtn.addEventListener("click", function () { dismiss("left"); });
  saveBtn.addEventListener("click", function () { dismiss("right"); });

  renderCard();
})();