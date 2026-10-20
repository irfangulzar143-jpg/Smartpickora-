/* ===== SmartPickora page scripts (js/pages.js) =====
   Products list, Product detail, Comparison, Buying guides, and the
   About / Contact / Privacy / Terms / Affiliate Disclosure pages. */
(function(){
  "use strict";

  /* Put your real contact email between the quotes to make the Contact form open the visitor's email app.
     While it is empty, the form says clearly that it does not send messages yet. */
  const CONTACT_EMAIL = "";

  const root = document.getElementById("pageRoot");
  const page = document.body ? document.body.dataset.page : "";
  if (!root || !page) return;

  const params = new URLSearchParams(location.search);
  const NOTICE = '<aside class="notice" role="note"><strong>Product information notice:</strong> Most catalogue entries are examples and have not been independently tested. Verify product specifications, price, availability, seller and reviews on the retailer listing. Some products may have active affiliate links.</aside>';
  const ul = a => `<ul>${listHTML(a)}</ul>`;
  const crumbs = items => `<nav class="crumbs wrap" aria-label="Breadcrumb">${items.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`).join("<i> / </i>")}</nav>`;
  const setMeta = (title, desc) => { document.title = title; const m = document.querySelector('meta[name="description"]'); if (m) m.content = desc; };
  const problem = msg => { root.innerHTML = '<div class="wrap section"><div class="errbox" role="alert"></div></div>'; root.querySelector(".errbox").textContent = msg; };

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
      <div class="chips" id="chips" role="group" aria-label="Product categories">${tabs.map(([id, n]) => `<button type="button" class="chip" data-cat="${esc(id)}" aria-pressed="false">${esc(n)}</button>`).join("")}</div>
      <div class="controls">
        <label>Search by name<input id="fQ" type="search" placeholder="Type a product name" autocomplete="off"></label>
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
      const items = PRODUCTS.filter(p => (cat === "all" || p.category === cat) && inPrice(p, fPrice.value) && (!q || p.name.toLowerCase().includes(q))).sort(SORTS[fSort.value] || byName);
      const cn = cat === "all" ? "All products" : catById(cat).name;
      $("#pTitle").textContent = cn;
      setMeta(cn + " – SmartPickora", "Browse product listings and research candidates in " + cn + " on SmartPickora. Verify current details with the retailer before purchase.");
      document.querySelectorAll(".chip").forEach(b => { const on = b.dataset.cat === cat; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
      $("#count").textContent = items.length + " product" + (items.length === 1 ? "" : "s") + " shown";
      $("#priceNote").textContent = PRODUCTS.some(p => priceNum(p) === null)
        ? "Some products do not yet have verified prices or ratings. Unverified values are shown clearly; confirm current details on the retailer listing."
        : "";
      $("#pGrid").innerHTML = items.length ? items.map(productCard).join("") : '<div class="empty">No products match your search or filters. Try a different word, choose All, or set Price range to Any price.</div>';
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
    setMeta(p.name + (p.isDemo ? " (Demo)" : "") + " – SmartPickora", p.isDemo ? "Sample product overview for " + p.name + ". Verify specifications, price and availability before purchase." : "Product information for " + p.name + ". Verify specifications, price and availability on the retailer listing.");
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.href = location.origin + location.pathname + "?id=" + encodeURIComponent(p.id);
    const gallery = p.gallery || [p.image, placeholderImage(p.name, c.hue, idx + 1), placeholderImage(p.name, c.hue, idx + 2)];
    const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
    const faq = [
      ["Is this a real review?", p.isDemo ? "No. This is sample catalogue content. No hands-on testing, customer reviews or verified ratings are shown." : "No. This is a product listing, not a hands-on review. We have not independently tested the product or verified customer ratings."],
      ["What does it cost?", "Price to be verified. Always check the seller’s page for the current price."],
      ["Where can I buy it?", (p.amazonAffiliateUrl || p.cjAffiliateUrl) ? "Use the active retailer button on this page to view the listing. Check the seller, current price, specifications and availability before buying." : "An affiliate link is not available for this product yet. Check back later for an eligible retailer link."],
      ["How do I compare it?", "Tap Compare on this page, then open the comparison tool to see up to three products side by side."]
    ];
    root.innerHTML = crumbs([["Home","index.html"],["Products","products.html"],[c.name,"products.html?cat=" + p.category],[p.name]]) + `
    <article class="section wrap">
      <div class="detail-grid">
        <div>
          <div class="imgbox big"><img id="mainImg" src="${esc(gallery[0])}" data-pid="${esc(p.id)}" alt="${esc(p.imageAlt)}" width="400" height="300">${p.isDemo ? '<span class="demo">DEMO</span>' : ""}</div>
          <div class="thumbs">${gallery.map((g, i) => `<button type="button" class="thumb" data-src="${esc(g)}" aria-label="Show demo image ${i + 1}"><img src="${esc(g)}" alt="" loading="lazy" width="80" height="60"></button>`).join("")}</div>
        </div>
        <div>
          <span class="cat">${esc(c.name)}</span><h1>${esc(p.name)}</h1>
          <p class="muted">${esc(p.description)}</p>
          <p class="meta"><strong>Price:</strong> ${p.price == null ? "Price to be verified" : esc(p.price)}</p>
          <p class="meta"><strong>Rating:</strong> ${p.rating == null ? "Not independently verified — check the retailer listing" : esc(p.rating)}</p>
          <div class="actions"><button type="button" class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="false">Compare</button>${p.id === "amazon-echo-dot-smart-speaker" ? '<a class="btn btn-line" href="echo-dot-motion.html">Watch Cinematic Motion Preview</a>' : ""}${affiliateButton(p)}</div>
        </div>
      </div>
      ${NOTICE}
      <h2>Overview</h2><p>${esc(p.description)} This page has no first-hand testing and does not describe verified specifications.</p>
      <h2>Important features</h2>${ul(p.features)}
      <div class="pc"><div class="pro"><h3>Sample pros</h3>${ul(p.pros)}</div><div class="con"><h3>Sample cons</h3>${ul(p.cons)}</div></div>
      <h2>Who might consider this product</h2><p>Readers who want to compare ${esc(c.name)} options and check verified specifications before choosing.</p>
      <h2>Who might prefer an alternative</h2><p>Readers with specific needs, such as budget, size or compatibility, may prefer another option once verified details are available.</p>
      <h2>Compare this product</h2><p>Add it to a comparison with up to two other products.</p>
      <div class="btn-row"><button type="button" class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="false">Compare</button><a class="btn btn-teal" href="comparisons.html">Open comparison tool</a></div>
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
    const defaults = ["bluetooth-speaker", "bluetooth-headphones", "portable-charger"];
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
      ["Verified price", p => p.price == null ? "To be verified" : esc(p.price)],
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

  /* ---------- BUYING GUIDES (demo outlines, not tested reviews) ---------- */
  const GUIDES = [
    ["How to Choose the Right Power Bank", "electronics", "Things to think about before choosing a portable charger.",
      ["Capacity and physical size (verify on the product page)", "Ports and cable compatibility with your devices", "Weight and how easy it is to carry", "Safety information published by the maker"]],
    ["What to Consider Before Buying Wireless Earbuds", "electronics", "A sample checklist for comparing wireless earbuds.",
      ["Fit and comfort", "Battery life claims (verify independently)", "Device compatibility", "Call and noise features, where listed"]],
    ["How to Choose an Air Fryer for Your Kitchen", "home-kitchen", "Sample points for comparing air fryers.",
      ["Capacity for your household", "Counter space and storage", "Ease of cleaning", "Controls you will actually use"]],
    ["Essential Accessories for International Travel", "travel", "A starter checklist of travel accessories to research.",
      ["Plug adapter for your destinations", "Portable charger", "Packing organizers", "Comfort items for long journeys"]],
    ["How to Choose a Laptop Stand", "office", "Sample points for comparing laptop stands.",
      ["Adjustable height or angle", "Laptop size and weight it supports", "Portability", "Stability and ventilation"]],
    ["Important Features to Compare Before Buying Headphones", "electronics", "A sample checklist for comparing headphones.",
      ["Comfort and fit", "Wired or wireless connection", "Noise reduction features, where listed", "Battery life and charging, where applicable"]]
  ];
  function guidesPage(){
    setMeta("Buying Guides (Demo) – SmartPickora", "Sample buying guide outlines on SmartPickora. Demo content only.");
    root.innerHTML = crumbs([["Home","index.html"],["Buying Guides"]]) + `<section class="section wrap">
      <h1>Buying Guides</h1>${NOTICE}
      <article class="notice"><strong>Featured collection:</strong> Explore men’s and women’s fashion for every season—from shirts, T-shirts, jeans and trousers to dresses, jackets, activewear and accessories. <a href="fashion.html">Explore the All-Season Fashion Collection</a>.</article>
      <p class="muted">These are short sample outlines. Full guides will be written after real research. They are not product tests.</p>
      <div class="grid">${GUIDES.map(([t, c, s, pts]) => `<article class="card"><div class="cb">
        <span class="demo-tag">DEMO CONTENT</span><h2 class="gh">${esc(t)}</h2><p>${esc(s)}</p>
        <details class="faq"><summary>Sample checklist</summary><ul>${listHTML(pts)}</ul></details>
        <div class="actions"><a class="btn btn-teal" href="products.html?cat=${encodeURIComponent(c)}">Browse related demo products</a></div></div></article>`).join("")}</div>
      <p class="small muted" style="margin-top:16px">Affiliate disclosure: SmartPickora may earn a commission from active affiliate links at no extra cost to you. <a href="affiliate-disclosure.html">Read more</a>.</p></section>`;
  }

  /* ---------- ABOUT / PRIVACY / TERMS / DISCLOSURE ---------- */
  const DRAFT = '<div class="draft" role="note"><strong>Draft template.</strong> Please review and complete this text, and check it against the laws that apply to you, before relying on it.</div>';
  const INFO = {
    about: {title: "About Us", desc: "About SmartPickora, a product research and comparison website.", body: `
      <p>SmartPickora is designed to help people research and compare products before they buy.</p>
      <h2>What we cover</h2><ul><li>Electronics</li><li>Home &amp; Kitchen</li><li>Travel</li><li>Fitness</li><li>Beauty &amp; Personal Care</li><li>Office &amp; Productivity</li></ul>
      <h2>Demo content</h2><p>Right now, products, descriptions, pros and cons are samples for demonstration. Real information and verified reviews will be added later.</p>
      <h2>Independence</h2><p>SmartPickora is an independent website. It is not officially affiliated with, endorsed by or sponsored by Amazon, CJ Affiliate or any retailer or brand mentioned. Brand and product names belong to their owners and are used only as examples.</p>
      <h2>How we may earn</h2><p>Some links may become affiliate links. See the <a href="affiliate-disclosure.html">Affiliate Disclosure</a>.</p>`},
    privacy: {title: "Privacy Policy (Draft)", desc: "Draft privacy policy template for SmartPickora.", body: `${DRAFT}
      <p>Last updated: to be completed.</p>
      <h2>Information you give us</h2><p>This site does not ask you to create an account. If you contact us by email, we receive the details you send so we can reply.</p>
      <h2>Information stored in your browser</h2><p>The comparison feature saves your selected products in your own browser (local storage). This stays on your device.</p>
      <h2>Hosting</h2><p>This site is hosted on GitHub Pages. The hosting provider may collect technical information such as IP addresses in its server logs.</p>
      <h2>Analytics, cookies and advertising</h2><p>Google Analytics 4 is not active until a valid Measurement ID is configured in the site code. If analytics or advertising tools are enabled later, this policy must be updated to explain the data collected, purposes, retention and available controls before relying on it as a final policy.</p>
      <h2>Third-party links</h2><p>Links to other websites, including affiliate partners, are governed by those sites’ own privacy policies.</p>
      <h2>Contact</h2><p>See the <a href="contact.html">Contact page</a>. Add your own contact details here when ready.</p>`},
    terms: {title: "Terms and Conditions (Draft)", desc: "Draft terms and conditions template for SmartPickora.", body: `${DRAFT}
      <h2>Using this website</h2><p>SmartPickora provides general product information for research only. Content is currently demo content.</p>
      <h2>No guarantees</h2><p>We do not guarantee that information is complete, current or error-free. Check prices, specifications and availability with the seller before buying.</p>
      <h2>Third-party websites</h2><p>We are not responsible for the content, products or policies of other websites we link to.</p>
      <h2>Affiliate links</h2><p>Some links may earn us a commission. See the <a href="affiliate-disclosure.html">Affiliate Disclosure</a>.</p>
      <h2>Changes</h2><p>We may update these terms and the site at any time.</p>`},
    disclosure: {title: "Affiliate Disclosure", desc: "How SmartPickora may earn commissions from affiliate links.", body: `
      <p>SmartPickora may earn a commission when you click an affiliate link and make a qualifying purchase, at no additional cost to you. Affiliate relationships do not guarantee that a product is suitable for every shopper.</p>
      <p><strong>As an Amazon Associate I earn from qualifying purchases.</strong> A short disclosure is also shown near the featured Amazon link on the Fashion Product Shortlist.</p>
      <h2>Current status</h2><p>The Fashion Product Shortlist includes a tagged Amazon link to a specific listing. Other catalogue products are still demo placeholders and should not be treated as verified recommendations. Please check each listing’s details, seller, price, availability, size and return terms directly on Amazon.</p>
      <h2>No official affiliation</h2><p>SmartPickora is an independent website. It is not officially affiliated with, endorsed by or sponsored by Amazon, CJ Affiliate or any retailer or brand shown.</p>
      <h2>Our approach</h2><ul><li>Commissions do not change the price you pay.</li><li>We aim to show pros and cons clearly.</li><li>Sample content is labelled as demo content.</li></ul>
      <p>When a program is approved, its required wording will be added to this page.</p>`}
  };
  function infoPage(key){
    const i = INFO[key];
    setMeta(i.title + " – SmartPickora", i.desc);
    root.innerHTML = crumbs([["Home","index.html"],[i.title]]) + `<section class="section wrap page"><h1>${i.title}</h1>${i.body}</section>`;
  }

  /* ---------- CONTACT (does not pretend to send) ---------- */
  function contactPage(){
    setMeta("Contact Us – SmartPickora", "Contact SmartPickora.");
    root.innerHTML = crumbs([["Home","index.html"],["Contact Us"]]) + `<section class="section wrap page"><h1>Contact Us</h1>
      <p>Have a question or a product suggestion? Use the form below.</p>
      <form id="contactForm" class="form">
        <label for="cName">Your name</label><input id="cName" required autocomplete="name">
        <label for="cEmail">Your email</label><input id="cEmail" type="email" required autocomplete="email">
        <label for="cSubject">Subject</label><input id="cSubject" required>
        <label for="cMsg">Message</label><textarea id="cMsg" rows="5" required></textarea>
        <button class="btn btn-teal" type="submit">Send message</button>
      </form>
      <p id="cStatus" class="note" role="status" hidden></p></section>`;
    $("#contactForm").addEventListener("submit", e => {
      e.preventDefault();
      const st = $("#cStatus"); st.hidden = false;
      if (!CONTACT_EMAIL){ st.textContent = "This form is not connected to an email service yet, so your message was not sent. Please check back soon."; return; }
      const body = "Name: " + $("#cName").value + "\nEmail: " + $("#cEmail").value + "\n\n" + $("#cMsg").value;
      st.textContent = "Opening your email app…";
      location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent($("#cSubject").value) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- START (an error here never stops the rest of the site) ---------- */
  const NEEDS_DATA = {products: productsPage, product: productPage, comparisons: comparePage, guides: guidesPage};
  const NO_DATA = {about: () => infoPage("about"), privacy: () => infoPage("privacy"), terms: () => infoPage("terms"), disclosure: () => infoPage("disclosure"), contact: contactPage};
  try {
    if (NEEDS_DATA[page]){
      if (!DATA_OK) problem("The product data did not load. Check that js/products.js exists in your repository, is spelled exactly like that, and was saved completely.");
      else NEEDS_DATA[page]();
    } else if (NO_DATA[page]) NO_DATA[page]();
  } catch (err) {
    console.error("SmartPickora pages.js problem:", err);
    problem("This page could not finish loading: " + err.message);
  }
})();
