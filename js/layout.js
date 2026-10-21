/* SmartPickora shared header, menu and footer — pet accessories niche only. */
(function(){
  "use strict";
  const NAV = [
    ["index.html","Home"],["pet-accessories.html","Pet Accessories"],["products.html","Browse Products"],
    ["buying-guides.html","Buying Guides"],["comparisons.html","Comparisons"],["about.html","About Us"],["contact.html","Contact"]
  ];
  const FOOT = [
    ["pet-accessories.html","Pet Accessories"],["buying-guides.html","Buying Guides"],["about.html","About Us"],
    ["contact.html","Contact"],["privacy-policy.html","Privacy Policy"],["affiliate-disclosure.html","Affiliate Disclosure"],["terms.html","Terms"]
  ];
  const GA_MEASUREMENT_ID = "";
  if (/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", GA_MEASUREMENT_ID);
    const s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
  }
  function slot(id, top){
    let el=document.getElementById(id);
    if(!el){el=document.createElement("div");el.id=id;if(top&&document.body.firstChild)document.body.insertBefore(el,document.body.firstChild);else document.body.appendChild(el);}
    return el;
  }
  function build(){
    slot("site-header",true).innerHTML = `
      <a class="skip" href="#main">Skip to content</a>
      <header class="site-header"><div class="wrap bar">
        <a class="logo" href="index.html" aria-label="SmartPickora home">Smart<span>Pickora</span></a>
        <div class="tools"><button type="button" id="searchToggle" class="icon-btn" aria-label="Search products" aria-expanded="false" aria-controls="searchPanel">&#128269;</button>
        <button type="button" id="menuToggle" class="icon-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav">&#9776;</button></div></div>
        <div id="searchPanel" class="search-panel"><form id="searchForm" class="wrap" role="search"><label class="sr" for="searchInput">Search pet accessories</label><input id="searchInput" type="search" placeholder="Search pet accessories" autocomplete="off"><button class="btn btn-teal" type="submit">Search</button></form></div>
        <nav id="mainNav" class="main-nav" aria-label="Main"><div class="wrap">${NAV.map(([h,t])=>`<a href="${h}">${t}</a>`).join("")}</div></nav>
      </header><section id="searchResults" class="section wrap" hidden><h2>Search results</h2><p id="searchInfo" class="muted" aria-live="polite"></p><div id="searchGrid" class="grid"></div></section>`;
    slot("site-footer",false).innerHTML = `
      <div id="tray" class="tray" hidden aria-live="polite"><span id="trayText"></span><a class="btn btn-gold" href="comparisons.html">Compare now</a><button type="button" id="trayClear" class="btn btn-line">Clear</button></div>
      <footer class="site-footer"><div class="wrap"><p class="logo-foot">Smart<span>Pickora</span></p>
      <p>Independent pet accessory research and buying guides. If affiliate links are active, we may earn a commission at no extra cost to you. When participating in the Amazon Associates Program, we display the required statement: “As an Amazon Associate I earn from qualifying purchases.” See our <a href="affiliate-disclosure.html">Affiliate Disclosure</a>.</p>
      <p class="links">${FOOT.map(([h,t])=>`<a href="${h}">${t}</a>`).join(" ")}</p><p>&copy; <span id="year">${new Date().getFullYear()}</span> SmartPickora. Product details and availability may change.</p></div></footer>`;
    const file=location.pathname.split("/").pop()||"index.html";
    document.querySelectorAll("#mainNav a").forEach(a=>{const p=a.getAttribute("href").split("?");if(p[0]===file)a.setAttribute("aria-current","page");});
  }
  window.spToast=function(msg){let t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.appendChild(t);}t.textContent=msg;t.hidden=false;clearTimeout(window.spToast.timer);window.spToast.timer=setTimeout(()=>{t.hidden=true;},2800);};
  try{build();}catch(err){console.error("SmartPickora layout.js problem:",err);}
})();