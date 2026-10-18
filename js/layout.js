/* ===== SmartPickora shared header, menu, footer (js/layout.js) =====
   Edit the menu links here ONCE and every page updates.
   This file does not depend on any other script. */
(function(){
  "use strict";
  const NAV = [
    ["index.html","Home"],["products.html?cat=electronics","Electronics"],["products.html?cat=home-kitchen","Home &amp; Kitchen"],
    ["products.html?cat=travel","Travel"],["products.html?cat=fitness","Fitness"],["products.html?cat=beauty","Beauty &amp; Personal Care"],
    ["products.html?cat=office","Office &amp; Productivity"],["buying-guides.html","Buying Guides"],["comparisons.html","Comparisons"],
    ["about.html","About Us"],["contact.html","Contact"]
  ];
  const FOOT = [["about.html","About Us"],["contact.html","Contact"],["privacy-policy.html","Privacy Policy"],["affiliate-disclosure.html","Affiliate Disclosure"],["terms.html","Terms"]];

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
      <p>SmartPickora is an independent website. It is not officially affiliated with, endorsed by or sponsored by Amazon, CJ Affiliate or any retailer or brand shown. Some links may become affiliate links, and we may earn a commission at no extra cost to you.</p>
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
