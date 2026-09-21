/* WellFinder universal navigation.
 * Injected into every page's <header class="site-header"> so the nav stays
 * consistent site-wide. Edit the NAV_LINKS list below to change the nav;
 * no per-page edits needed.
 */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  if (!header) return;

  var path = location.pathname;
  var hash = location.hash;

  // The four universal nav items: label + target.
  var NAV_LINKS = [
    { label: "Discover",  href: "/discover" },
    { label: "Browse",    href: "/#directory" },
    { label: "Resources", href: "/#resources" },
    { label: "About",     href: "/about" }
  ];

  // Highlight the link matching the current page (and home-page anchor).
  function isActive(link) {
    var hashIdx = link.href.indexOf("#");
    if (hashIdx !== -1) {
      // e.g. "/#directory": active on the home page with that hash.
      var base = link.href.slice(0, hashIdx);
      var anchor = link.href.slice(hashIdx);
      var onBase = (base === "" || base === "/") ? path === "/" : path === base;
      return onBase && hash === anchor;
    }
    if (link.href === "/discover") return path === "/discover";
    if (link.href === "/about") return path === "/about";
    return path === link.href;
  }

  // "Browse" also covers the clinic directory pages it links into.
  function isBrowseActive() {
    if (path === "/" && hash === "#directory") return true;
    return path === "/pilates" || path === "/naturopath" || path === "/golf";
  }

  function linkHTML(link) {
    var active = link.label === "Browse" ? isBrowseActive() : isActive(link);
    return '<a href="' + link.href + '"' +
      (active ? ' aria-current="page" class="is-active"' : "") +
      ">" + link.label + "</a>";
  }

  var desktopLinks = NAV_LINKS.map(linkHTML).join("");
  var mobileLinks = NAV_LINKS.map(linkHTML).join("") +
    '<a href="/saved">Saved providers</a>';

  header.className = "site-header universal-header";
  header.innerHTML =
    '<div class="wrap"><nav class="nav universal-nav">' +
      '<a class="brand" href="/">' +
        '<img src="/assets/wellfinder-mark-active.svg" alt="" width="34" height="34"> WellFinder' +
      "</a>" +
      '<div class="nav-links universal-links">' + desktopLinks + "</div>" +
      '<div class="nav-right">' +
        '<a class="universal-saved" href="/saved"' +
          (path === "/saved" ? ' aria-current="page" class="is-active"' : "") +
          '><span aria-hidden="true">♡</span> Saved <b id="universalSavedCount">0</b></a>' +
        '<a class="btn btn--honey btn--sm universal-join" href="/#subscribe">Join WellFinder</a>' +
      "</div>" +
      '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobileMenu">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
          '<path d="M4 7h16M4 12h16M4 17h16"/>' +
        "</svg>" +
      "</button>" +
    "</nav></div>" +
    '<div class="mobile-menu" id="mobileMenu">' + mobileLinks + "</div>";

  // Saved-count badge (unchanged behaviour).
  var count = 0;
  try {
    var providerLikes = JSON.parse(localStorage.getItem("wf_provider_interactions")) || {};
    count = Object.keys(providerLikes).filter(function (k) {
      return providerLikes[k] === "liked";
    }).length;
    if (!count) {
      count = (JSON.parse(localStorage.getItem("wf_favourites")) || []).length;
    }
  } catch (_) {}
  var badge = document.getElementById("universalSavedCount");
  badge.textContent = count;
  badge.hidden = !count;

  // Mobile menu toggle (unchanged behaviour).
  var toggle = header.querySelector(".nav-toggle");
  var menu = document.getElementById("mobileMenu");
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
