/* =========================================================================
   TXT WORLDWIDE SHOP — store catalog (demo data).
   Replace with your real products / feed from your inventory system.
   Prices are in HKD (HK$).

   Per-product "Buy" button: add a `buyUrl` field to a product to make its Buy
   button link to a real payment page, e.g. a Stripe Payment Link or a PayPal
   button — the customer pays on the provider's secure hosted page:
     { id: "ph-01", name: "iPhone 15 Pro 256GB", ..., buyUrl: "https://buy.stripe.com/xxxx" }
   Do NOT point it at a page that collects card number / CVC itself.
   ========================================================================= */

window.CATEGORIES = [
  { key: "all",         label: "All products" },
  { key: "phones",      label: "Smartphones" },
  { key: "audio",       label: "Audio & Speakers" },
  { key: "gaming",      label: "Gaming & RGB" },
  { key: "charging",    label: "Chargers & USB4 Hubs" },
  { key: "smart",       label: "Smart Home / IoT" },
  { key: "wearables",   label: "Wearables" },
  { key: "accessories", label: "Accessories" },
];

/* Accent tint per category (for the card-media glow) */
window.CATEGORY_TINT = {
  phones:      ["#4f46e5", "#7c3aed"],
  audio:       ["#0891b2", "#0ea5e9"],
  gaming:      ["#db2777", "#7c3aed"],
  charging:    ["#059669", "#10b981"],
  smart:       ["#d97706", "#f59e0b"],
  wearables:   ["#dc2626", "#f43f5e"],
  accessories: ["#475569", "#64748b"],
};

/* 20 products across all categories */
window.PRODUCTS = [
  // ---------- Smartphones ----------
  { id: "ph-01", name: "iPhone 15 Pro 256GB",        brand: "Apple",   cat: "phones", price: 8999, rating: 4.9, tag: "Best seller" },
  { id: "ph-03", name: "Galaxy S24 Ultra 512GB",     brand: "Samsung", cat: "phones", price: 9498, rating: 4.8, tag: "Best seller" },
  { id: "ph-05", name: "Pixel 8 Pro 256GB",          brand: "Google",  cat: "phones", price: 7699, rating: 4.7 },

  // ---------- Audio & Speakers ----------
  { id: "au-01", name: "WH-1000XM5 Headphones",      brand: "Sony",  cat: "audio", price: 2999, rating: 4.9, tag: "Best seller" },
  { id: "au-03", name: "AirPods Pro 2 USB-C",        brand: "Apple", cat: "audio", price: 1899, rating: 4.8, tag: "Best seller" },
  { id: "au-05", name: "Charge 5 Speaker",           brand: "JBL",   cat: "audio", price: 1099, rating: 4.7 },

  // ---------- Gaming & RGB ----------
  { id: "ga-01", name: "BlackWidow V4 Pro Keyboard", brand: "Razer",       cat: "gaming", price: 1299, rating: 4.8, tag: "RGB" },
  { id: "ga-02", name: "G Pro X Superlight 2 Mouse", brand: "Logitech",    cat: "gaming", price: 999,  rating: 4.9, tag: "Best seller" },
  { id: "ga-03", name: "Arctis Nova Pro Headset",    brand: "SteelSeries", cat: "gaming", price: 2680, rating: 4.8 },

  // ---------- Chargers & USB4 Hubs ----------
  { id: "ch-01", name: "737 GaNPrime 120W",          brand: "Anker",  cat: "charging", price: 599, rating: 4.8, tag: "GaN" },
  { id: "ch-02", name: "Nexode 100W GaN",            brand: "Ugreen", cat: "charging", price: 399, rating: 4.7, tag: "GaN" },
  { id: "ch-05", name: "USB4 Thunderbolt Hub",       brand: "Anker",  cat: "charging", price: 699, rating: 4.7, tag: "USB4" },

  // ---------- Smart Home / IoT ----------
  { id: "sm-01", name: "Smart Frame 10.1\" WiFi",    brand: "Nixplay", cat: "smart", price: 1080, rating: 4.7, tag: "#1" },
  { id: "sm-04", name: "Robot Vacuum X20+",          brand: "Xiaomi",  cat: "smart", price: 2499, rating: 4.7, tag: "Best seller" },
  { id: "sm-06", name: "Echo Dot (5th Gen)",         brand: "Amazon",  cat: "smart", price: 399,  rating: 4.5 },

  // ---------- Wearables ----------
  { id: "we-01", name: "Watch Series 9 45mm",        brand: "Apple",   cat: "wearables", price: 3199, rating: 4.8, tag: "Best seller" },
  { id: "we-03", name: "Galaxy Watch 6 Classic",     brand: "Samsung", cat: "wearables", price: 2288, rating: 4.6 },
  { id: "we-06", name: "Smart Band 8 Pro",           brand: "Xiaomi",  cat: "wearables", price: 259,  rating: 4.6, tag: "Best price" },

  // ---------- Accessories ----------
  { id: "ac-05", name: "Power Bank 20,000 mAh",      brand: "Baseus", cat: "accessories", price: 199, rating: 4.6, tag: "Best seller" },
  { id: "ac-03", name: "2.5D Screen Protector x2",   brand: "Anker",  cat: "accessories", price: 99,  rating: 4.4 },
];

/* Brands shown in the brand strip (before the warranty band) */
window.BRANDS = [
  "Apple", "Samsung", "Sony", "Xiaomi", "Google", "Bose", "JBL", "Sennheiser",
  "Razer", "Logitech", "SteelSeries", "HyperX", "Corsair", "Elgato", "Govee",
  "Anker", "Ugreen", "Belkin", "Baseus", "Philips Hue", "Aqara",
];
