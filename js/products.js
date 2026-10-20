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
  isDemo:true,
  description:"Example listing shared for consideration. Verify the exact model, outlet layout, USB output, surge protection details, seller and current price on Amazon before recommending.",
  amazonAffiliateUrl:"https://www.amazon.com/Charger-Protector-QINLIANF-Extender-Charging/dp/B08R6S1M1K?tag=smartpickorau-20",
  imageAlt:"Illustrative placeholder; replace with an authorized product image after verification."
 }
};
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"-").replace(/-$/,"");
function placeholderImage(label,hue,seed){
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
