/* ===== SmartPickora header search (js/search.js) ===== */
(function(){
  "use strict";
  if (typeof PRODUCTS === "undefined" || typeof $ !== "function" || typeof productCard !== "function") return;

  function run(){
    const input = $("#searchInput"), box = $("#searchResults"), grid = $("#searchGrid"), info = $("#searchInfo");
    if (!input || !box || !grid || !info) return;
    const raw = input.value.trim(), q = raw.toLowerCase();
    if (!q){ box.hidden = true; return; }
    const hits = PRODUCTS.filter(p => (p.name + " " + catById(p.category).name).toLowerCase().includes(q))
                         .sort((a, b) => a.name.localeCompare(b.name));
    box.hidden = false;
    info.textContent = hits.length
      ? hits.length + " demo product" + (hits.length > 1 ? "s" : "") + " found for “" + raw + "”"
      : "No demo products match “" + raw + "”. Try another word or browse the categories.";
    grid.innerHTML = hits.map(productCard).join("");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("#searchToggle");
    if (!t) return;
    const panel = $("#searchPanel"), input = $("#searchInput");
    if (!panel) return;
    const open = panel.classList.toggle("open");
    t.setAttribute("aria-expanded", String(open));
    if (open && input) input.focus();
  });
  document.addEventListener("input", e => { if (e.target && e.target.id === "searchInput") run(); });
  document.addEventListener("submit", e => {
    if (!e.target || e.target.id !== "searchForm") return;
    e.preventDefault(); run();
    const box = $("#searchResults");
    if (box && !box.hidden) box.scrollIntoView({behavior: "smooth"});
  });
})();
