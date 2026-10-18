/* ===== SmartPickora product data =====
   All items are DEMO samples. Nothing here is verified. */

/* 1. Categories */
const CATEGORIES = [
  {id:"electronics", name:"Electronics", hue:200, sample:"A demo electronics example for readers comparing features, portability and compatibility. Details to be verified."},
  {id:"home-kitchen", name:"Home & Kitchen", hue:25, sample:"A demo home and kitchen example for readers comparing size, ease of use and cleaning. Details to be verified."},
  {id:"travel", name:"Travel Accessories", hue:260, sample:"A demo travel example for readers comparing weight, durability and convenience. Details to be verified."},
  {id:"fitness", name:"Fitness", hue:150, sample:"A demo fitness example for readers comparing comfort, build quality and use cases. Details to be verified."},
  {id:"beauty", name:"Beauty & Personal Care", hue:330, sample:"A demo personal care example for readers comparing features and suitability. Details to be verified."},
  {id:"office", name:"Office & Productivity", hue:45, sample:"A demo office example for readers comparing comfort, setup and compatibility. Details to be verified."}
];

/* 2. Product list: [category id, product name].
   Add a line here to add a new demo product. */
const RAW_PRODUCTS = [
  ["electronics","Apple AirPods Pro 2"],["electronics","Samsung Galaxy Buds3 Pro"],["electronics","Anker 737 Power Bank"],["electronics","Logitech MX Master 3S"],["electronics","Sony WH-1000XM5 Headphones"],
  ["home-kitchen","Ninja Air Fryer"],["home-kitchen","Instant Pot Duo"],["home-kitchen","Philips Air Purifier"],["home-kitchen","Brita Water Filter Pitcher"],["home-kitchen","KitchenAid Stand Mixer"],
  ["travel","Samsonite Carry-On Suitcase"],["travel","Anker Portable Charger"],["travel","Travel Neck Pillow"],["travel","Packing Cubes Set"],["travel","Universal Travel Adapter"],
  ["fitness","Adjustable Dumbbells"],["fitness","Resistance Bands Set"],["fitness","Yoga Mat"],["fitness","Digital Bathroom Scale"],["fitness","Stainless Steel Water Bottle"],
  ["beauty","Facial Cleansing Brush"],["beauty","Electric Toothbrush"],["beauty","Hair Dryer"],["beauty","Electric Trimmer"],["beauty","Skincare Storage Organizer"],
  ["office","Wireless Keyboard"],["office","Ergonomic Office Chair"],["office","Laptop Stand"],["office","USB-C Hub"],["office","LED Desk Lamp"]
];

/* 3. Images. To use a real photo you have permission to use:
   upload it to assets/images/ and add a line like
   "anker-737-power-bank": "assets/images/anker-737.jpg"
   (the key is the product name in lowercase with dashes). */
const IMAGE_FILES = {
};

/* 4. Replace demo info with verified info later:
   add an entry here using the same key. Example:
   "anker-737-power-bank": {isDemo:false, price:"$00.00", description:"Your verified text",
      amazonAffiliateUrl:"your approved link", cjAffiliateUrl:""}  */
const OVERRIDES = {
};

/* ----- Builder (no need to edit below) ----- */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function placeholderImage(label, hue, seed){
  const h2 = (hue + 40 + seed * 7) % 360;
  const ini = label.split(/\s+/).filter(w => /^[A-Za-z0-9]/.test(w)).slice(0,2).map(w => w[0].toUpperCase()).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},55%,88%)'/><stop offset='1' stop-color='hsl(${h2},60%,78%)'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><circle cx='${80 + (seed * 37) % 240}' cy='70' r='46' fill='hsl(${hue},50%,96%)' opacity='.7'/><rect x='130' y='95' width='140' height='110' rx='18' fill='hsl(${hue},55%,32%)'/><text x='200' y='168' font-family='Arial' font-size='44' font-weight='700' fill='white' text-anchor='middle'>${ini}</text><text x='200' y='255' font-family='Arial' font-size='16' fill='hsl(${hue},45%,25%)' text-anchor='middle'>Demo image placeholder</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const PRODUCTS = RAW_PRODUCTS.map(([cat, name], i) => {
  const c = CATEGORIES.find(x => x.id === cat);
  const id = slug(name);
  const base = {
    id, name, category: cat,
    description: c.sample,
    features: ["Key features to be verified", "Compatibility to be verified"],
    pros: ["Sample pro: useful comparison example", "Sample pro: fits the " + c.name + " category"],
    cons: ["Specifications need verification", "Price and availability need checking"],
    price: null, rating: null, isDemo: true,
    amazonAffiliateUrl: "", cjAffiliateUrl: "",
    image: IMAGE_FILES[id] || placeholderImage(name, c.hue, i),
    imageAlt: "Demo placeholder image for " + name
  };
  return Object.assign(base, OVERRIDES[id] || {});
});
