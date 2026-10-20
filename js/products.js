/* SmartPickora product data — demonstration catalogue until each item is verified. */
const CATEGORIES = [
 {id:"pets",name:"Pet Accessories",hue:145,sample:"Research this pet product's size, materials, safety guidance and fit for your pet before purchase."},
 {id:"clothing",name:"Clothing & Fashion",hue:330,sample:"Compare sizing, fabric, care instructions, fit and return policy before choosing clothing."},
 {id:"electronics",name:"Electronics & Gadgets",hue:200,sample:"Check compatibility, electrical specifications, safety certifications and current seller details before purchase."}
];
const RAW_PRODUCTS = [
 ["pets","Dog Bed"],["pets","Dog Collar"],["pets","Dog Harness"],["pets","Dog Leash"],["pets","Cat Water Fountain"],["pets","Litter Box"],["pets","Pet Carrier"],["pets","Pet Grooming Brush"],["pets","Interactive Dog Toy"],["pets","Cat Scratching Post"],
 ["clothing","Women's Clothing Basics"],["clothing","Men's Casual Shirts"],["clothing","T-Shirts & Tops"],["clothing","Jeans & Denim"],["clothing","Dresses & Skirts"],["clothing","Jackets & Coats"],["clothing","Activewear & Leggings"],["clothing","Plus-Size Clothing"],["clothing","Sweaters & Knitwear"],["clothing","Fashion Accessories"],
 ["electronics","Bluetooth Speaker"],["electronics","Bluetooth Headphones"],["electronics","Portable Charger"],["electronics","USB-C Hub"],["electronics","QINLIANF Outlet Extender & USB Charging Station"]
];
const IMAGE_FILES = {};
const OVERRIDES = {
 "qinlianf-outlet-extender-usb-charging-station": {
  isDemo:false,
  description:"QINLIANF outlet extender and USB charging station. Review the exact outlet layout, USB port specifications, surge-protection details, seller and current price on Amazon before purchase.",
  amazonAffiliateUrl:"https://www.amazon.com/Charger-Protector-QINLIANF-Extender-Charging/dp/B08R6S1M1K?tag=smartpickorau-20",
  imageAlt:"Stylized illustration of a wall outlet extender and USB charging station; see Amazon for the actual product photo."
 }
};
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"-").replace(/-$/,"");
function placeholderImage(label,hue,seed){
 if (label.toLowerCase().includes("qinlianf")) {
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Illustration of outlet extender"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef7fb"/><stop offset="1" stop-color="#d9e7f0"/></linearGradient><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dce4ea"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="15" flood-color="#16334b" flood-opacity=".22"/></filter></defs><rect width="800" height="600" rx="30" fill="url(#bg)"/><circle cx="640" cy="120" r="105" fill="#ffffff" opacity=".5"/><circle cx="130" cy="490" r="90" fill="#b9d9e2" opacity=".45"/><g filter="url(#shadow)" transform="translate(185 85) rotate(-5 220 200)"><rect x="90" y="65" width="330" height="365" rx="44" fill="url(#body)" stroke="#9aaab7" stroke-width="5"/><rect x="125" y="100" width="260" height="295" rx="28" fill="#f8fafc" stroke="#d3dce4" stroke-width="3"/><g fill="#24394a"><rect x="174" y="142" width="18" height="52" rx="8"/><rect x="218" y="142" width="18" height="52" rx="8"/><rect x="262" y="142" width="18" height="52" rx="8"/><rect x="306" y="142" width="18" height="52" rx="8"/><rect x="174" y="230" width="18" height="52" rx="8"/><rect x="218" y="230" width="18" height="52" rx="8"/><rect x="262" y="230" width="18" height="52" rx="8"/><rect x="306" y="230" width="18" height="52" rx="8"/></g><g fill="#0e7c86"><rect x="170" y="320" width="45" height="17" rx="8"/><rect x="230" y="320" width="45" height="17" rx="8"/><rect x="290" y="320" width="45" height="17" rx="8"/></g><rect x="222" y="45" width="24" height="40" rx="6" fill="#9aaab7"/><rect x="275" y="45" width="24" height="40" rx="6" fill="#9aaab7"/></g><rect x="45" y="40" width="210" height="44" rx="22" fill="#0f2742"/><text x="150" y="68" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#ffffff">SMARTPICKORA PICK</text><text x="400" y="520" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#0f2742">Outlet Extender + USB Charging</text><text x="400" y="555" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#52667d">Illustration • Verify exact product on Amazon</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
 }
 const h2=(hue+40+seed*7)%360;
 const ini=label.split(/\s+/).filter(w=>/^[A-Za-z0-9]/.test(w)).slice(0,2).map(w=>w[0].toUpperCase()).join("");
 const svg=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},55%,88%)'/><stop offset='1' stop-color='hsl(${h2},60%,78%)'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><circle cx='${80+(seed*37)%240}' cy='70' r='46' fill='hsl(${hue},50%,96%)' opacity='.7'/><rect x='130' y='95' width='140' height='110' rx='18' fill='hsl(${hue},55%,32%)'/><text x='200' y='168' font-family='Arial' font-size='44' font-weight='700' fill='white' text-anchor='middle'>${ini}</text><text x='200' y='255' font-family='Arial' font-size='16' fill='hsl(${hue},45%,25%)' text-anchor='middle'>Demo image placeholder</text></svg>`;
 return "data:image/svg+xml,"+encodeURIComponent(svg);
}
const PRODUCTS=RAW_PRODUCTS.map(([cat,name],i)=>{
 const c=CATEGORIES.find(x=>x.id===cat), id=slug(name);
 const base={id,name,category:cat,description:c.sample,features:["Verify key features on the seller's listing","Check suitability and compatibility before purchase"],pros:["A useful category example for comparison"],cons:["Not independently tested","Current price and availability not verified"],price:null,rating:null,isDemo:true,amazonAffiliateUrl:"",cjAffiliateUrl:"",image:placeholderImage(name,c.hue,i),imageAlt:"Demo placeholder image for "+name};
 return Object.assign(base,OVERRIDES[id]||{});
});
