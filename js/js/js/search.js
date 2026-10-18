/* SmartPickora search: type in the header search box to see matching demo products */
(function(){
  const toggle = $("#searchToggle"), panel = $("#searchPanel"), input = $("#searchInput");
  const box = $("#searchResults"), grid = $("#searchGrid"), info = $("#searchInfo");

  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    if (open) input.focus();
  });

  function run(){
    const raw = input.value.trim(), q = raw.toLowerCase();
    if (!q){ box.hidden = true; return; }
    const hits = PRODUCTS.filter(p => (p.name + " " + catById(p.category).name).toLowerCase().includes(q))
                         .sort((a, b) => a.name.localeCompare(b.name));
    box.hidden = false;
    info.textContent = hits.length
      ? hits.length + " demo product" + (hits.length > 1 ? "s" : "") + " found for “" + raw + "”"
      : "No demo products match “" + raw + "”. Try another word or browse the categories below.";
    grid.innerHTML = hits.map(productCard).join("");
  }
  input.addEventListener("input", run);
  $("#searchForm").addEventListener("submit", e => { e.preventDefault(); run(); box.scrollIntoView({behavior:"smooth"}); });
})();
