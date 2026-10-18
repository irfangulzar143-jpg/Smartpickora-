/* SmartPickora page scripts: Products list, Product detail, Comparison tool */
(function(){
  const NOTICE = '<aside class="notice" role="note"><strong>Demo Content:</strong> Products, descriptions, pros, cons, and other product details shown on this website are sample content for demonstration purposes only. Real product information, verified reviews, and affiliate links will be added later.</aside>';
  const params = new URLSearchParams(location.search);
  const root = $("#pageRoot");
  const ul = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const crumbs = items => `<nav class="crumbs wrap" aria-label="Breadcrumb">${items.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`).join("<i> / </i>")}</nav>`;
  const setMeta = (title, desc) => { document.title = title; const m = document.querySelector('meta[name="description"]'); if (m) m.content = desc; };

  /* Turn a price or rating (for example "$1,299.00" or "4.5 / 5") into a number, or null if not verified yet */
  const num = v => {
    if (v === null || v === undefined || v === "") return null;
    const m = String(v).replace(/,/g, "").match(/\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  };
  const priceNum = p => num(p.price), ratingNum = p => num(p.rating);

  /* ---------- PRODUCTS LIST: categories, search, price filter, sorting ---------- */
  function productsPage(){
    let cat = CATEGORIES.some(c => c.id === params.get("cat")) ? params.get("cat") : "all";
    const tabs = [["all", "All"]].concat(CATEGORIES.map(c => [c.id, c.name]));
    root.innerHTML = crumbs([["Home","index.html"],["Products"]]) + `<section class="section wrap">
      <h1 id="pTitle">Products</h1>${NOTICE}
      <div class="chips" id="chips" role="group" aria-label="Product categories">${tabs.map(([id, n]) => `<button class="chip" data-cat="${id}" aria-pressed="false">${esc(n)}</button>`).join("")}</div>
      <div class="controls">
        <label>Search by name<input id="fQ" type="search" placeholder="Type a product name"></label>
        <label>Price range<select id="fPrice">
          <option value="any">Any price</option><option value="0-25">Under 25</option><option value="25-50">25 – 50</option>
          <option value="50-100">50 – 100</option><option value="100-">Over 100</option><option value="none">Price to be verified</option></select></label>
        <label>Sort by<select id="fSort">
          <option value="az">Name: A to Z</option><option value="za">Name: Z to A</option>
          <option value="pl">Price: low to high</option><option value="ph">Price: high to low</option>
          <option value="rh">Rating: high to low</option></select></label>
      </div>
      <p id="priceNote" class="muted small"></p>
      <p id="count" class="muted" aria-live="polite"></p><div id="pGrid" class="grid"></div></section>`;

    const fQ = $("#fQ"), fPrice = $("#fPrice"), fSort = $("#fSort");
    const byName = (a, b) => a.name.localeCompare(b.name);
    const byNum = (f, dir) => (a, b) => {
      const x = f(a), y = f(b);
      if (x === null && y === null) return byName(a, b);
      if (x === null) return 1;
      if (y === null) return -1;
      return (x - y) * dir || byName(a, b);
    };
    const SORTS = {az: byName, za: (a, b) => byName(b, a), pl: byNum(priceNum, 1), ph: byNum(priceNum, -1), rh: byNum(ratingNum, -1)};
    function inPrice(p, v){
      if (v === "any") return true;
      const n = priceNum(p);
      if (v === "none") return n === null;
      if (n === null) return false;
      const [lo, hi] = v.split("-");
      return n >= Number(lo) && (hi === "" || n < Number(hi));
    }

    function update(){
      const q = fQ.value.trim().toLowerCase();
      const items = PRODUCTS.filter(p => (cat === "all" || p.category === cat) && inPrice(p, fPrice.value) && (!q || p.name.toLowerCase().includes(q))).sort(SORTS[fSort.value]);
      const cn = cat === "all" ? "All demo products" : catById(cat).name;
      $("#pTitle").textContent = cn;
      setMeta(cn + " (Demo) – SmartPickora", "Browse demo product examples in " + cn + " on SmartPickora. Search by name, filter by price and sort. Sample content only.");
      document.querySelectorAll(".chip").forEach(b => { const on = b.dataset.cat === cat; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      $("#count").textContent = items.length + " demo product" + (items.length === 1 ? "" : "s") + " shown";
      $("#priceNote").textContent = PRODUCTS.some(p => priceNum(p) === null)
        ? "Demo products have no verified prices or ratings yet. Products without a verified value are listed last when sorting by price or rating, and are hidden when you choose a price range."
        : "";
      $("#pGrid").innerHTML = items.length ? items.map(productCard).join("") : '<div class="empty">No demo products match your search or filters. Try a different word, choose All, or set Price range to Any price.</div>';
      syncCompare();
      try { history.replaceState(null, "", cat === "all" ? location.pathname : "?cat=" + cat); } catch (e) {}
    }
    $("#chips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (b){ cat = b.dataset.cat; update(); } });
    [fPrice, fSort].forEach(el => el.addEventListener("change", update));
    fQ.addEventListener("input", update);
    update();
  }

  /* ---------- PRODUCT DETAIL (one template for every product) ---------- */
  function productPage(){
    const idx = PRODUCTS.findIndex(p => p.id === params.get("id"));
    if (idx < 0){
      setMeta("Product not found – SmartPickora", "This demo product could not be found.");
      root.innerHTML = crumbs([["Home","index.html"],["Products","products.html"],["Not found"]]) + '<section class="section wrap"><h1>Product not found</h1><p class="muted">We could not find that demo product.</p><a class="btn btn-teal" href="products.html">Browse all products</a></section>';
      return;
    }
    const p = PRODUCTS[idx], c = catById(p.category);
    setMeta(p.name + " (Demo) – SmartPickora", "Demo page for " + p.name + ": sample overview, features, pros and cons. Real details to be verified.");
    const gallery = p.gallery || [p.image, placeholderImage(p.name, c.hue, idx + 1), placeholderImage(p.name, c.hue, idx + 2)];
    const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
    const faq = [
      ["Is this a real review?", "No. This page is demo content. No real testing, customer reviews or verified ratings are shown."],
      ["What does it cost?", "Price to be verified. Always check the seller’s page for the current price."],
      ["Where can I buy it?", "An affiliate link will be added after approval. Until then, the button stays inactive."],
      ["How do I compare it?", "Tap Compare on this page, then open the comparison tool to see up to three products side by side."]
    ];
    root.innerHTML = crumbs([["Home","index.html"],["Products","products.html"],[c.name,"products.html?cat=" + p.category],[p.name]]) + `
    <article class="section wrap">
      <div class="detail-grid">
        <div>
          <div class="imgbox big"><img id="mainImg" src="${esc(gallery[0])}" data-pid="${esc(p.id)}" alt="${esc(p.imageAlt)}" width="400" height="300">${p.isDemo ? '<span class="demo">DEMO</span>' : ""}</div>
          <div class="thumbs">${gallery.map((g, i) => `<button class="thumb" data-src="${esc(g)}" aria-label="Show demo image ${i + 1}"><img src="${esc(g)}" alt="" loading="lazy" width="80" height="60"></button>`).join("")}</div>
        </div>
        <div>
          <span class="cat">${esc(c.name)}</span><h1>${esc(p.name)}</h1>
          <p class="muted">${esc(p.description)}</p>
          <p class="meta"><strong>Price:</strong> ${p.price === null ? "Price to be verified" : esc(p.price)}</p>
          <p class="meta"><strong>Rating:</strong> ${p.rating === null ? "Sample rating — not a real customer rating" : esc(p.rating)}</p>
          <div class="actions"><button class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="false">Compare</button>${affiliateButton(p)}</div>
        </div>
      </div>
      ${NOTICE}
      <h2>Overview</h2><p>${esc(p.description)} This page has no first-hand testing and does not describe verified specifications.</p>
      <h2>Important features</h2>${ul(p.features)}
      <div class="pc"><div class="pro"><h3>Sample pros</h3>${ul(p.pros)}</div><div class="con"><h3>Sample cons</h3>${ul(p.cons)}</div></div>
      <h2>Who might consider this product</h2><p>Readers who want to compare ${esc(c.name)} options and check verified specifications before choosing.</p>
      <h2>Who might prefer an alternative</h2><p>Readers with specific needs, such as budget, size or compatibility, may prefer another option once verified details are available.</p>
      <h2>Compare this product</h2><p>Add it to a comparison with up to two other products.</p>
      <div class="btn-row"><button class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="false">Compare</button><a class="btn btn-teal" href="comparisons.html">Open comparison tool</a></div>
      <h2>Price verification</h2><p>Price and availability have not been checked. Confirm both on the seller’s website before you buy.</p>
      <h2>Frequently asked questions</h2>
      ${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
      <h2>Related products</h2><div class="grid">${related.map(productCard).join("")}</div>
      <h2>Affiliate disclosure</h2><p>SmartPickora may earn a commission if an affiliate link is active and you buy through it, at no extra cost to you. <a href="affiliate-disclosure.html">Read the full disclosure</a>.</p>
    </article>`;
    document.querySelectorAll(".thumb").forEach(b => b.addEventListener("click", () => { $("#mainImg").src = b.dataset.src; }));
    syncCompare();
  }

  /* ---------- COMPARISON TOOL (up to 3 products) ---------- */
  function comparePage(){
    const defaults = ["apple-airpods-pro-2", "samsung-galaxy-buds3-pro", "sony-wh-1000xm5-headphones"];
    let chosen = compare.length ? compare.slice(0, 3) : defaults;
    const options = sel => '<option value="">None</option>' + CATEGORIES.map(c => `<optgroup label="${esc(c.name)}">${PRODUCTS.filter(p => p.category === c.id).map(p => `<option value="${esc(p.id)}"${p.id === sel ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</optgroup>`).join("");
    setMeta("Compare Products (Demo) – SmartPickora", "Compare up to three demo products side by side on SmartPickora. Unverified details are marked To be verified.");
    root.innerHTML = crumbs([["Home","index.html"],["Products","products.html"],["Comparisons"]]) + `<section class="section wrap">
      <h1>Compare products</h1>${NOTICE}
      <p class="muted">Choose up to three demo products. Anything not yet checked says “To be verified”.</p>
      <div class="controls">${[0, 1, 2].map(i => `<label>Product ${i + 1}<select class="cmpSel">${options(chosen[i])}</select></label>`).join("")}</div>
      <div id="cmpOut"></div></section>`;
    const rows = [
      ["Category", p => esc(catById(p.category).name)],
      ["Key features", p => ul(p.features)],
      ["Pros", p => ul(p.pros)],
      ["Cons", p => ul(p.cons)],
      ["Verified price", p => p.price === null ? "To be verified" : esc(p.price)],
      ["Verified specifications", p => p.specs ? ul(p.specs) : "To be verified"],
      ["Affiliate link", p => affiliateButton(p)]
    ];
    function draw(){
      const items = chosen.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
      if (!items.length){ $("#cmpOut").innerHTML = '<div class="empty">Choose at least two products above to compare them.</div>'; return; }
      $("#cmpOut").innerHTML = (items.length < 2 ? '<p class="muted">Choose one more product to compare.</p>' : "") +
        '<p class="muted small">Tip: swipe sideways to see every column.</p><div class="table-scroll"><table class="cmp-table"><thead><tr><th scope="col">Feature</th>' +
        items.map(p => `<th scope="col"><img src="${esc(p.image)}" data-pid="${esc(p.id)}" alt="${esc(p.imageAlt)}" width="120" height="90"><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></th>`).join("") + "</tr></thead><tbody>" +
        rows.map(([label, f]) => `<tr><th scope="row">${label}</th>${items.map(p => `<td>${f(p)}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>";
    }
    document.querySelectorAll(".cmpSel").forEach(s => s.addEventListener("change", () => {
      chosen = [...new Set([...document.querySelectorAll(".cmpSel")].map(x => x.value).filter(Boolean))];
      compare = chosen.slice(); saveCompare(); draw();
    }));
    draw();
  }

  const run = {products: productsPage, product: productPage, comparisons: comparePage}[document.body.dataset.page];
  if (run) run();
})();
