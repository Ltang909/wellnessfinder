/* WellFinder — public provider submission */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const form = $("#submitForm");
  if (!form) return;

  const typeSel = $("#type");
  const golf = document.querySelector(".type-golf");
  const naturo = document.querySelector(".type-naturopath");
  function sync() {
    const t = typeSel.value;
    [[golf, t === "golf"], [naturo, t === "naturopath"]].forEach(([section, active]) => {
      if (!section) return;
      section.hidden = !active;
      section.querySelectorAll("input, select, textarea, button").forEach((control) => {
        control.disabled = !active;
      });
    });
  }
  typeSel.addEventListener("change", sync);
  sync();

  const btn = $("#submitBtn");
  const status = $("#formStatus");
  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");
    if (!typeSel.value) { setStatus("Please choose a category.", "err"); return; }
    if (!$("#name").value.trim()) { setStatus("Please enter the provider name.", "err"); return; }

    const payload = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true;
    btn.textContent = "Submitting…";
    try {
      const res = await fetch("api/submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data.ok) {
        form.reset();
        sync();
        setStatus(data.message || "Thanks! Your submission is in review.", "ok");
      } else {
        setStatus((data && data.error) || "Something went wrong. Please try again.", "err");
      }
    } catch (err) {
      setStatus("Network error — please try again in a moment.", "err");
    }
    btn.disabled = false;
    btn.textContent = "Submit for review";
  });
})();
