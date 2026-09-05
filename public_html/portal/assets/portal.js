/* WellFinder Data Portal — light interactions */
(function () {
  // Dashboard: live-filter the table cards
  var filter = document.getElementById('tableFilter');
  if (filter) {
    var grid = document.getElementById('tableGrid');
    var noMatch = document.getElementById('noMatch');
    filter.addEventListener('input', function () {
      var term = filter.value.trim().toLowerCase();
      var shown = 0;
      grid.querySelectorAll('.table-card').forEach(function (card) {
        var hit = card.dataset.name.indexOf(term) !== -1;
        card.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      if (noMatch) noMatch.hidden = shown !== 0;
    });
  }

  // Table view: click a clamped cell to expand/collapse
  document.addEventListener('click', function (e) {
    var cell = e.target.closest ? e.target.closest('.cell.clamp') : null;
    if (cell) cell.classList.toggle('open');
  });
})();
