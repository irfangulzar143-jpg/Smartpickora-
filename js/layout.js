/* ===== SmartPickora shared header, menu, footer (js/layout.js) =====
   Edit the menu links here ONCE and every page updates.
   This file does not depend on any other script. */
(function(){
  "use strict";
  const NAV = [
    ["index.html","Home"],["fashion.html","Fashion Collection"],["products.html?cat=electronics","Electronics"],["products.html?cat=home-kitchen","Home &amp; Kitchen"],
    ["products.html?cat=travel","Travel"],["products.html?cat=fitness","Fitness"],["products.html?cat=beauty","Beauty &amp; Personal Care"],
    ["products.html?cat=office","Office &amp; Productivity"],["buying-guides.html","Buying Guides"],["comparisons.html","Comparisons"],
    ["about.html","About Us"],["contact.html","Contact"]
  ];
  const FOOT = [["about.html","About Us"],["contact.html","Contact"],["fashion.html","Fashion Collection"],["privacy-policy.html","Privacy Policy"],["affiliate-disclosure.html","Affiliate Disclosure"],["terms.html","Terms"]];

  /* Google Analytics 4: add the real Measurement ID (format G-XXXXXXXXXX) after creating a GA4 web stream.
     Analytics stays disabled while this value is blank. Never paste an account password or secret here. */
  const GA_MEASUREMENT_ID = "";
  if (/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID);
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(gaScript);
    document.addEventListener("click", function(event) {
      const link = event.target.closest("a[rel~='sponsored']");
      if (link && typeof window.gtag === "function") {
        window.gtag("event", "affiliate_click", {
          link_url: link.href,
          link_text: (link.innerText || link.textContent || "").trim(),
          page_location: window.location.href
        });
      }
    });
  }

  function slot(id, atTop){
    let el = document.getElementById(id);
    if (!el){
      el = document.createElement("div"); el.id = id;
      if (atTop && document.body.firstChild) document.body.insertBefore(el, document.body.firstChild);
      else document.body.appendChild(el);
    }
    return el;
  }

  function build(){
    slot("site-header", true).innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="wrap bar">
        <a class="logo" href="index.html" aria-label="SmartPickora home">Smart<span>Pickora</span></a>
        <div class="tools">
          <button type="button" id="searchToggle" class="icon-btn" aria-label="Search products" aria-expanded="false" aria-controls="searchPanel">&#128269;</button>
          <button type="button" id="menuToggle" class="icon-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav">&#9776;</button>
        </div>
      </div>
      <div id="searchPanel" class="search-panel">
        <form id="searchForm" class="wrap" role="search">
          <label class="sr" for="searchInput">Search products</label>
          <input id="searchInput" type="search" placeholder="Search by product or category" autocomplete="off">
          <button class="btn btn-teal" type="submit">Search</button>
        </form>
      </div>
      <nav id="mainNav" class="main-nav" aria-label="Main"><div class="wrap">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></nav>
    </header>
    <section id="searchResults" class="section wrap" hidden>
      <h2>Search results</h2><p id="searchInfo" class="muted" aria-live="polite"></p><div id="searchGrid" class="grid"></div>
    </section>`;

    slot("site-footer", false).innerHTML = `
    <div id="tray" class="tray" hidden aria-live="polite"><span id="trayText"></span>
      <a class="btn btn-gold" href="comparisons.html">Compare now</a><button type="button" id="trayClear" class="btn btn-line">Clear</button></div>
    <footer class="site-footer"><div class="wrap">
      <p class="logo-foot">Smart<span>Pickora</span></p>
      <p>SmartPickora is an independent website and is not endorsed by Amazon or any retailer. Some links are affiliate links, meaning we may earn from qualifying purchases at no extra cost to you. <strong>As an Amazon Associate I earn from qualifying purchases.</strong> See our <a href="affiliate-disclosure.html">Affiliate Disclosure</a>.</p>
      <p class="links">${FOOT.map(([h, t]) => `<a href="${h}">${t}</a>`).join(" ")}</p>
      <p>&copy; <span id="year">${new Date().getFullYear()}</span> SmartPickora. Demo content.</p></div></footer>`;

    /* highlight the current page in the menu */
    const file = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("#mainNav a").forEach(a => {
      const parts = a.getAttribute("href").split("?");
      if (parts[0] === file && (!parts[1] || location.search === "?" + parts[1])) a.setAttribute("aria-current", "page");
    });
  }

  /* small pop-up message, also used by other scripts: spToast("text") */
  window.spToast = function(msg){
    let t = document.getElementById("toast");
    if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(window.spToast.timer);
    window.spToast.timer = setTimeout(function(){ t.hidden = true; }, 2800);
  };

  try { build(); } catch (err) { console.error("SmartPickora layout.js problem:", err); }
})();
