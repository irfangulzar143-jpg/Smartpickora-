/* ===== SmartPickora shared helpers, product cards, compare tray (js/main.js) ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
window.esc = esc;

/* Is the data file (js/products.js) loaded? */
const DATA_OK = typeof CATEGORIES !== "undefined" && typeof PRODUCTS !== "undefined" && typeof placeholderImage === "function";
const catById = id => (DATA_OK && CATEGORIES.find(c => c.id === id)) || {name: String(id), hue: 200};
const productById = new Map((DATA_OK ? PRODUCTS : []).map(p => [p.id, p]));
const firstProductByCategory = new Map();
if (DATA_OK) PRODUCTS.forEach(p => { if (!firstProductByCategory.has(p.category)) firstProductByCategory.set(p.category, p); });
const safeUrl = u => { const s = String(u || "").trim(); return /^https:\/\//i.test(s) ? s : ""; };

/* Show a visible message instead of failing silently */
function showProblem(msg){
  try {
    const host = $("#main") || document.body;
    const d = document.createElement("div");
    d.className = "errbox"; d.setAttribute("role", "alert"); d.textContent = msg;
    host.insertBefore(d, host.firstChild);
  } catch (e) { console.error(msg); }
}

/* Compare selection (up to 3), remembered in this browser */
let compare = [];
try {
  const saved = JSON.parse(localStorage.getItem("sp_compare") || "[]");
  if (Array.isArray(saved)) compare = saved.filter(x => typeof x === "string").slice(0, 3);
} catch (e) {}
const saveCompare = () => { try { localStorage.setItem("sp_compare", JSON.stringify(compare)); } catch (e) {} };

/* Affiliate buttons: only real https:// links are shown, otherwise a disabled placeholder */
function affiliateButton(p){
  const a = safeUrl(p.amazonAffiliateUrl), c = safeUrl(p.cjAffiliateUrl);
  let html = "";
  if (a) html += `<a class="btn btn-gold" href="${esc(a)}" target="_blank" rel="sponsored noopener noreferrer">View on Amazon</a>`;
  if (c) html += `<a class="btn btn-gold" href="${esc(c)}" target="_blank" rel="sponsored noopener noreferrer">View at partner store</a>`;
  return html || '<button type="button" class="btn btn-off" disabled>Affiliate link coming soon</button>';
}

const listHTML = arr => (arr || []).map(f => `<li>${esc(f)}</li>`).join("");

function productCard(p){
  const on = compare.includes(p.id);
  return `<article class="card">
    <div class="imgbox"><img src="${esc(p.image)}" data-pid="${esc(p.id)}" alt="${esc(p.imageAlt)}" loading="lazy" width="400" height="300">${p.isDemo ? '<span class="demo">DEMO</span>' : ""}</div>
    <div class="cb">
      <span class="cat">${esc(catById(p.category).name)}</span>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description)}</p>
      <p class="lbl">Key features</p><ul>${listHTML(p.features)}</ul>
      <div class="pc"><div class="pro"><p class="lbl">Pros</p><ul>${listHTML(p.pros)}</ul></div>
      <div class="con"><p class="lbl">Cons</p><ul>${listHTML(p.cons)}</ul></div></div>
      <p class="meta"><strong>Price:</strong> ${p.price == null ? "Price to be verified" : esc(p.price)}</p>
      <p class="meta"><strong>Rating:</strong> ${p.rating == null ? "Not independently verified — check the retailer listing" : esc(p.rating)}</p>
      ${(safeUrl(p.amazonAffiliateUrl) || safeUrl(p.cjAffiliateUrl)) ? '<p class="small affiliate-note">Affiliate link: we may earn a commission from qualifying purchases at no extra cost to you.</p>' : ""}
      <div class="actions">
        <a class="btn btn-teal" href="product.html?id=${encodeURIComponent(p.id)}">View Product Details</a>
        <button type="button" class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="${on}">${on ? "Selected" : "Compare"}</button>
        ${affiliateButton(p)}
      </div></div></article>`;
}

function renderHome(){
  const cg = $("#categoryGrid"), fg = $("#featuredGrid");
  if (cg) cg.innerHTML = CATEGORIES.map(c => {
    const first = firstProductByCategory.get(c.id);
    if (!first) return "";
    return `<a class="cat-card" href="products.html?cat=${encodeURIComponent(c.id)}"><img src="${esc(first.image)}" data-pid="${esc(first.id)}" alt="Demo placeholder for ${esc(c.name)}" loading="lazy" width="400" height="300"><span>${esc(c.name)}</span></a>`;
  }).join("");
  if (fg) fg.innerHTML = CATEGORIES.map(c => firstProductByCategory.get(c.id)).filter(Boolean).map(productCard).join("");
}

/* Compare tray and button states */
function syncCompare(){
  document.querySelectorAll("[data-compare]").forEach(b => {
    const on = compare.includes(b.dataset.compare);
    b.textContent = on ? "Selected" : "Compare";
    b.setAttribute("aria-pressed", String(on));
  });
  const tray = $("#tray"), txt = $("#trayText");
  if (!tray || !txt) return;
  tray.hidden = compare.length === 0;
  const names = compare.map(id => (productById.get(id) || {}).name).filter(Boolean);
  txt.textContent = names.length + " of 3 selected: " + names.join(", ");
}

/* One click listener for the whole page, so it never depends on an element existing */
document.addEventListener("click", e => {
  const menu = e.target.closest("#menuToggle");
  if (menu){
    const nav = $("#mainNav");
    if (nav){ const open = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); }
    return;
  }
  if (e.target.closest("#trayClear")){ compare = []; saveCompare(); syncCompare(); return; }
  const b = e.target.closest("[data-compare]");
  if (!b) return;
  const id = b.dataset.compare;
  if (compare.includes(id)) compare = compare.filter(x => x !== id);
  else if (compare.length >= 3){ if (window.spToast) window.spToast("You can compare up to 3 products. Remove one first."); return; }
  else compare.push(id);
  saveCompare(); syncCompare();
});

/* If a real photo fails to load, show the generated placeholder instead */
document.addEventListener("error", e => {
  const img = e.target;
  if (!DATA_OK || !img || img.tagName !== "IMG" || img.dataset.failed) return;
  img.dataset.failed = "1";
  const failedProduct = productById.get(img.dataset.pid);
  if (failedProduct){
    const i = PRODUCTS.indexOf(failedProduct);
    img.src = placeholderImage(failedProduct.name, catById(failedProduct.category).hue, Math.max(0, i));
  }
}, true);

/* Start */
(function init(){
  if (!DATA_OK){
    showProblem("The product data did not load. Check that js/products.js exists in your repository, is spelled exactly like that, and was saved completely.");
    return;
  }
  compare = compare.filter(id => productById.has(id));
  try { renderHome(); } catch (err) { console.error(err); showProblem("Part of this page could not load: " + err.message); }
  try { syncCompare(); } catch (err) { console.error(err); }
})();
