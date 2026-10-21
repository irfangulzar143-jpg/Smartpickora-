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
      const items = PRODUCTS.filter(p => (cat === "all" || cat === "pets" || p.category === cat) && inPrice(p, fPrice.value) && (!q || p.name.toLowerCase().includes(q))).sort(SORTS[fSort.value] || byName);
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
    let searchTimer = 0;
    fQ.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(update, 160);
    });
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
          <div class="imgbox big"><img id="mainImg" src="${esc(gallery[0])}" data-pid="${esc(p.id)}" alt="${esc(p.imageAlt)}" width="400" height="300">${p.isDemo ? '<span class="demo">SAMPLE</span>' : ""}</div>
          <div class="thumbs">${gallery.map((g, i) => `<button type="button" class="thumb" data-src="${esc(g)}" aria-label="Show product image ${i + 1}"><img src="${esc(g)}" alt="" loading="lazy" width="80" height="60"></button>`).join("")}</div>
        </div>
        <div class="detail-copy">
          <span class="cat">${esc(c.name)}</span><h1>${esc(p.name)}</h1>
          <p class="muted">${esc(p.description)}</p>
          <p class="meta"><strong>Price:</strong> ${p.price == null ? "Price to be verified" : esc(p.price)}</p>
          <p class="meta"><strong>Rating:</strong> ${p.rating == null ? "Not independently verified — check the retailer listing" : esc(p.rating)}</p>
          <div class="actions"><button type="button" class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="false">Compare</button>${affiliateButton(p)}</div>
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
    const defaults = ["supportive-dog-bed", "dog-harness", "pet-water-fountain"];
    let chosen = compare.length ? compare.slice(0, 3) : defaults;
    const options = sel => '<option value="">None</option>' + CATEGORIES.map(c => `<optgroup label="${esc(c.name)}">${PRODUCTS.filter(p => p.category === c.id).map(p => `<option value="${esc(p.id)}"${p.id === sel ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</optgroup>`).join("");
    setMeta("Compare Pet Accessories – SmartPickora", "Compare dog and cat accessories by features, care needs and practical buying considerations. Verify current product details with the retailer.");
    root.innerHTML = crumbs([["Home","index.html"],["Products","products.html"],["Comparisons"]]) + `<section class="section wrap">
      <h1>Compare pet accessories</h1>${NOTICE}
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
    ["How to Choose a Supportive Dog Bed", "comfort", "Compare sleeping space, materials, cleaning and support claims before choosing a bed.",
      ["Measure your dog in its usual sleeping position", "Check cover washing instructions and replacement options", "Review materials and any support claims carefully", "Confirm dimensions, delivery and return terms"]],
    ["How to Choose a Dog Harness", "walking", "Use fit, adjustability and secure fastening as the starting points for comparison.",
      ["Measure your dog using the maker's sizing guide", "Check secure clips, stitching and adjustment points", "Look for reflective details if useful for your routine", "Introduce the harness gradually and check comfort"]],
    ["Pet Travel Carrier Buying Checklist", "walking", "Compare carriers for your pet and the journey you plan to take.",
      ["Check your pet's measurements and weight", "Review ventilation, closure security and cleaning", "Check the airline or transport provider's current rules", "Confirm dimensions and return policy"]],
    ["Choosing a Grooming Brush for Your Pet", "grooming", "Match grooming tools to coat type, sensitivity and your pet's comfort.",
      ["Identify coat length and texture", "Check maker guidance for suitable coat types", "Inspect contact points and cleanability", "Stop if grooming causes discomfort"]],
    ["How to Choose Safe Enrichment Toys", "play", "Compare toys by size, play style, materials and supervision needs.",
      ["Choose a size suitable for your pet", "Consider chewing habits and play style", "Check materials and cleaning instructions", "Inspect regularly and supervise play"]],
    ["Choosing Pet Bowls and Water Fountains", "feeding", "Compare daily-use convenience, cleaning and ongoing maintenance.",
      ["Choose capacity suited to your pet", "Check material and cleaning instructions", "For fountains, confirm filter availability and replacement costs", "Keep drinking water fresh and clean equipment regularly"]]
  ];
  function guidesPage(){
    setMeta("Pet Buying Guides – SmartPickora", "Practical checklists for choosing pet beds, harnesses, carriers, grooming tools, enrichment toys and feeding accessories.");
    root.innerHTML = crumbs([["Home","index.html"],["Buying Guides"]]) + `<section class="section wrap">
      <h1>Pet Buying Guides</h1>${NOTICE}
      <p class="muted">Use these practical checklists as a starting point. They are not product tests; verify product specifications, fit, safety guidance and current retailer details before buying.</p>
      <div class="grid">${GUIDES.map(([t, c, s, pts]) => `<article class="card"><div class="cb">
        <span class="demo-tag">DEMO CONTENT</span><h2 class="gh">${esc(t)}</h2><p>${esc(s)}</p>
        <details class="faq"><summary>Sample checklist</summary><ul>${listHTML(pts)}</ul></details>
        <div class="actions"><a class="btn btn-teal" href="products.html?cat=${encodeURIComponent(c)}">Browse related demo products</a></div></div></article>`).join("")}</div>
      <p class="small muted" style="margin-top:16px">Affiliate disclosure: SmartPickora may earn a commission from active affiliate links at no extra cost to you. <a href="affiliate-disclosure.html">Read more</a>.</p></section>`;
  }

  /* ---------- ABOUT / PRIVACY / TERMS / DISCLOSURE ---------- */
  
  const INFO = {
    about: {title: "About SmartPickora", desc: "Learn how SmartPickora creates practical dog and cat accessory buying guides, comparison checklists and transparent product research.", body: `
      <p>SmartPickora is an independent pet-accessory research website for people who want to make more informed choices for dogs and cats. We turn common shopping questions into practical checklists so readers can compare fit, materials, cleaning, durability, maintenance and value before choosing a product.</p>
      <h2>Our editorial approach</h2><ul><li><strong>Start with the need:</strong> explain the problem a product is intended to solve.</li><li><strong>Compare meaningful features:</strong> focus on dimensions, fit, materials, cleaning, safety guidance and ongoing costs.</li><li><strong>Explain trade-offs:</strong> show what to check and where a feature may not suit every pet or household.</li><li><strong>Verify before buying:</strong> retailer prices, stock, specifications and policies can change, so readers should confirm the current listing.</li></ul>
      <h2>What we cover</h2><p>Our current focus is dog and cat accessories, including beds and comfort, walking and travel, grooming, toys and enrichment, feeding and hydration.</p>
      <h2>How to read our catalogue</h2><p>Some catalogue entries are illustrative research examples rather than verified products. We label examples and do not claim that a product has been personally tested unless a page clearly explains a real testing process. Placeholder entries should not be treated as endorsements or customer reviews.</p>
      <h2>Independence and affiliate links</h2><p>SmartPickora is not owned by or officially endorsed by Amazon or any retailer. If we use affiliate links, we may earn a commission from qualifying purchases at no extra cost to the customer. Affiliate relationships do not replace our responsibility to provide clear, useful information. Read our <a href="affiliate-disclosure.html">Affiliate Disclosure</a>.</p>
      <h2>Corrections and contact</h2><p>If you notice an error or want us to consider a topic, please use our <a href="contact.html">Contact page</a>. We aim to correct unclear or outdated information when it is brought to our attention.</p>`},
    privacy: {title: "Privacy Policy", desc: "SmartPickora privacy information covering site hosting, browser storage, contact messages, analytics and third-party affiliate links.", body: `
      <p><strong>Last updated: 22 October 2026.</strong></p>
      <p>This policy describes the information practices currently intended for SmartPickora. We do not ask visitors to create accounts or submit payment details on this website.</p>
      <h2>Information you choose to provide</h2><p>If you contact us by email or through a contact method we make available, we receive the information you choose to send, such as your email address and message, so we can read and respond. Please do not send sensitive personal information unless it is necessary.</p>
      <h2>Browser storage</h2><p>The product comparison feature may store selected product IDs in your browser's local storage so your comparison selection can persist on your device. This feature is not an account and is not used by us to identify you.</p>
      <h2>Hosting and technical data</h2><p>SmartPickora is hosted using GitHub Pages. The hosting provider may process technical data, such as IP address, browser information and request logs, for security and service operation under its own terms and privacy notices.</p>
      <h2>Analytics and cookies</h2><p>Google Analytics is not currently configured on this website. If analytics, advertising, or other tracking technologies are introduced, this policy will be updated to describe the tools, purposes and relevant choices before they are used where required.</p>
      <h2>Affiliate and external links</h2><p>Some pages may link to third-party retailers or affiliate partners. When you follow a link, the third party's website and privacy policy apply. Retailers may use cookies or other technologies to attribute purchases to referrals; we do not control their systems.</p>
      <h2>Children</h2><p>This website is a general shopping-information site and is not designed to collect personal information from children.</p>
      <h2>Changes and contact</h2><p>We may update this policy when site features or applicable requirements change. For privacy questions, use our <a href="contact.html">Contact page</a>.</p>
      <p>This policy is general information, not legal advice. The site owner should review it against the laws applicable to the business and its visitors.</p>`},
    terms: {title: "Terms and Conditions", desc: "Terms for using SmartPickora's independent pet accessory research and buying guides.", body: `
      <p><strong>Last updated: 22 October 2026.</strong></p>
      <h2>Purpose of the website</h2><p>SmartPickora provides general shopping research, educational checklists and product-comparison information about dog and cat accessories. The site is not a retailer, veterinary service or substitute for professional advice about an animal's health or safety.</p>
      <h2>Accuracy and changing product details</h2><p>We aim to make information clear, but product specifications, prices, availability, seller details, delivery options, warranties and return terms can change. Some catalogue entries are illustrative examples and are not verified endorsements. Always confirm the current information with the manufacturer or retailer before purchasing.</p>
      <h2>No product-testing claim</h2><p>Unless a page explicitly describes a genuine testing method and results, you should not assume that we have physically tested a product or personally used it. Sample pros, cons and checklists are general research guidance, not customer reviews.</p>
      <h2>Third-party websites and purchases</h2><p>When you leave SmartPickora, the third party's terms, privacy practices and purchase conditions apply. Orders, payments, shipping, returns, warranties and customer support are handled by the retailer, not SmartPickora.</p>
      <h2>Affiliate relationships</h2><p>Some links may be affiliate links that can earn a commission from qualifying purchases at no extra cost to you. Affiliate relationships are disclosed on the site and do not guarantee that a product is right for every reader. See our <a href="affiliate-disclosure.html">Affiliate Disclosure</a>.</p>
      <h2>Intellectual property and acceptable use</h2><p>Unless otherwise stated, site text and design are provided by SmartPickora. Brand names and product names belong to their respective owners. Do not copy or republish site content in a way that violates applicable rights or law.</p>
      <h2>Changes</h2><p>We may update site content and these terms as the website develops. Continued use of the website after an update means you are viewing the current version.</p>
      <p>These terms are general information and should be reviewed by the site owner for the laws applicable to the business and its visitors.</p>`},
    disclosure: {title: "Affiliate Disclosure", desc: "How SmartPickora discloses affiliate links and potential commissions to readers.", body: `
      <p>SmartPickora may use affiliate links. If you click an affiliate link and make a qualifying purchase, we may earn a commission at no additional cost to you. A commission does not mean a product is suitable for every shopper.</p>
      <h2>Amazon Associates disclosure</h2><p>When SmartPickora participates in the Amazon Associates Program, this site will clearly display the required statement: <strong>“As an Amazon Associate I earn from qualifying purchases.”</strong> We will not describe ourselves as an active Amazon Associate unless our participation is accepted and active.</p>
      <h2>How to recognise affiliate links</h2><p>Where affiliate links are active, we aim to place a clear notice near the link or product recommendation, in addition to this page. A retailer button may take you to a third-party website, where the retailer's terms, prices, availability and privacy policy apply.</p>
      <h2>Product information and editorial independence</h2><p>Some catalogue entries are illustrative examples and are not verified product endorsements or product tests. We do not claim personal testing unless a page describes a real test. Always check the current seller listing for price, stock, specifications, sizing, safety information and return terms.</p>
      <h2>Independence</h2><p>SmartPickora is an independent website and is not owned by or officially endorsed by Amazon or any retailer. Brand and product names belong to their respective owners.</p>
      <h2>Updates</h2><p>This disclosure will be kept aligned with the affiliate programmes and links actually used on the site.</p>`}
  };
  function infoPage(key){
    const i = INFO[key];
    setMeta(i.title + " – SmartPickora", i.desc);\n    const ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.content = i.title + " – SmartPickora";\n    const ogDesc = document.querySelector('meta[property="og:description"]'); if (ogDesc) ogDesc.content = i.desc;
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
