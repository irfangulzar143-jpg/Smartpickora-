/* SmartPickora shared layout: header, menu, footer, compare tray.
   Edit the menu links here ONCE and every page updates. */
(function(){
  const NAV = [
    ["index.html","Home"],["products.html?cat=electronics","Electronics"],["products.html?cat=home-kitchen","Home &amp; Kitchen"],
    ["products.html?cat=travel","Travel"],["products.html?cat=fitness","Fitness"],["products.html?cat=beauty","Beauty &amp; Personal Care"],
    ["buying-guides.html","Buying Guides"],["comparisons.html","Comparisons"],["about.html","About Us"],["contact.html","Contact"]
  ];
  /* Pages that are not built yet. When you add a page later,
     delete its name from this list so the link opens normally. */
  const PENDING = ["buying-guides.html","about.html","contact.html","privacy-policy.html","affiliate-disclosure.html","terms.html"];

  document.getElementById("site-header").innerHTML = `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap bar">
      <a class="logo" href="index.html" aria-label="SmartPickora home">Smart<span>Pickora</span></a>
      <div class="tools">
        <button id="searchToggle" class="icon-btn" aria-label="Search products" aria-expanded="false" aria-controls="searchPanel">&#128269;</button>
        <button id="menuToggle" class="icon-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav">&#9776;</button>
      </div>
    </div>
    <div id="searchPanel" class="search-panel">
      <form id="searchForm" class="wrap" role="search">
        <input id="searchInput" type="search" placeholder="Search by product or category" aria-label="Search products">
        <button class="btn btn-teal" type="submit">Search</button>
      </form>
    </div>
    <nav id="mainNav" class="main-nav" aria-label="Main"><div class="wrap">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></nav>
  </header>
  <section id="searchResults" class="section wrap" hidden>
    <h2>Search results</h2><p id="searchInfo" class="muted" aria-live="polite"></p><div id="searchGrid" class="grid"></div>
  </section>`;

  document.getElementById("site-footer").innerHTML = `
  <div id="tray" class="tray" hidden aria-live="polite"><span id="trayText"></span>
    <a class="btn btn-gold" href="comparisons.html">Compare now</a><button id="trayClear" class="btn btn-line">Clear</button></div>
  <footer class="site-footer"><div class="wrap">
    <p class="logo-foot">Smart<span>Pickora</span></p>
    <p>Some links on this site may become affiliate links. If a link is active and you buy through it, SmartPickora may earn a commission at no extra cost to you.</p>
    <p class="links"><a href="about.html">About Us</a> <a href="contact.html">Contact</a> <a href="privacy-policy.html">Privacy Policy</a> <a href="affiliate-disclosure.html">Affiliate Disclosure</a> <a href="terms.html">Terms</a></p>
    <p>&copy; <span id="year"></span> SmartPickora. Demo content.</p></div></footer>`;

  function toast(msg){
    let t = document.getElementById("toast");
    if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 2800);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const file = a.getAttribute("href").split("#")[0].split("?")[0];
    if (PENDING.includes(file)){ e.preventDefault(); toast("This page is coming in a later part of the build."); }
  });
})();
