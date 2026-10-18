/* SmartPickora main script: menu, cards, compare tray, image fallback */
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const catById = id => CATEGORIES.find(c => c.id === id) || {name: id, hue: 200};

/* Compare selection (up to 3), remembered in this browser */
let compare = [];
try { compare = JSON.parse(localStorage.getItem("sp_compare") || "[]"); } catch (e) {}
const saveCompare = () => { try { localStorage.setItem("sp_compare", JSON.stringify(compare)); } catch (e) {} };

function affiliateButton(p){
  const url = p.amazonAffiliateUrl || p.cjAffiliateUrl;
  return url
    ? `<a class="btn btn-gold" href="${esc(url)}" target="_blank" rel="sponsored noopener">View on retailer site</a>`
    : `<button class="btn btn-off" disabled>Affiliate link coming soon</button>`;
}

function productCard(p){
  const on = compare.includes(p.id);
  return `<article class="card">
    <div class="imgbox"><img src="${esc(p.image)}" data-pid="${esc(p.id)}" alt="${esc(p.imageAlt)}" loading="lazy" width="400" height="300">${p.isDemo ? '<span class="demo">DEMO</span>' : ""}</div>
    <div class="cb">
      <span class="cat">${esc(catById(p.category).name)}</span>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description)}</p>
      <p class="lbl">Key features</p><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <div class="pc"><div class="pro"><p class="lbl">Pros</p><ul>${p.pros.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>
      <div class="con"><p class="lbl">Cons</p><ul>${p.cons.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div></div>
      <p class="meta"><strong>Price:</strong> ${p.price === null ? "Price to be verified" : esc(p.price)}</p>
      <p class="meta"><strong>Rating:</strong> ${p.rating === null ? "Sample rating — not a real customer rating" : esc(p.rating)}</p>
      <div class="actions">
        <a class="btn btn-teal" href="product.html?id=${encodeURIComponent(p.id)}">View Product Details</a>
        <button class="btn btn-line" data-compare="${esc(p.id)}" aria-pressed="${on}">${on ? "Selected" : "Compare"}</button>
        ${affiliateButton(p)}
      </div></div></article>`;
}

function renderHome(){
  const cg = $("#categoryGrid"), fg = $("#featuredGrid");
  if (cg) cg.innerHTML = CATEGORIES.map(c => {
    const first = PRODUCTS.find(p => p.category === c.id);
    return `<a class="cat-card" href="products.html?cat=${c.id}"><img src="${esc(first.image)}" data-pid="${esc(first.id)}" alt="Demo placeholder for ${esc(c.name)}" loading="lazy" width="400" height="300"><span>${esc(c.name)}</span></a>`;
  }).join("");
  if (fg) fg.innerHTML = CATEGORIES.map(c => productCard(PRODUCTS.find(p => p.category === c.id))).join("");
}

/* Compare tray */
function syncCompare(){
  document.querySelectorAll("[data-compare]").forEach(b => {
    const on = compare.includes(b.dataset.compare);
    b.textContent = on ? "Selected" : "Compare"; b.setAttribute("aria-pressed", on);
  });
  const tray = $("#tray"); if (!tray) return;
  tray.hidden = compare.length === 0;
  const names = compare.map(id => (PRODUCTS.find(p => p.id === id) || {}).name).filter(Boolean);
  $("#trayText").textContent = names.length + " of 3 selected: " + names.join(", ");
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-compare]");
  if (!b) return;
  const id = b.dataset.compare;
  if (compare.includes(id)) compare = compare.filter(x => x !== id);
  else if (compare.length >= 3) { $("#trayText").textContent = "You can compare up to 3 products. Remove one first."; return; }
  else compare.push(id);
  saveCompare(); syncCompare();
});
$("#trayClear")?.addEventListener("click", () => { compare = []; saveCompare(); syncCompare(); });

/* Image fallback: if a real photo fails to load, show the placeholder */
document.addEventListener("error", e => {
  const img = e.target;
  if (img.tagName !== "IMG" || img.dataset.failed) return;
  img.dataset.failed = "1";
  const i = PRODUCTS.findIndex(p => p.id === img.dataset.pid);
  if (i > -1) img.src = placeholderImage(PRODUCTS[i].name, catById(PRODUCTS[i].category).hue, i);
}, true);

/* Mobile menu */
$("#menuToggle").addEventListener("click", () => {
  const o = $("#mainNav").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", o);
});

$("#year").textContent = new Date().getFullYear();
renderHome(); syncCompare();
