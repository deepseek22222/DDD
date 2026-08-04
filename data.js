/* =========================================================================
   TXT WORLDWIDE SHOP — store catalog (demo data).
   Replace with your real products / feed from your inventory system.
   Prices are in HKD (HK$).
   ========================================================================= */

window.CATEGORIES = [
  { key: "all",         label: "All products",         icon: "🛍️" },
  { key: "phones",      label: "Smartphones",          icon: "📱" },
  { key: "audio",       label: "Audio & Speakers",     icon: "🎧" },
  { key: "gaming",      label: "Gaming & RGB",         icon: "🎮" },
  { key: "charging",    label: "Chargers & USB4 Hubs", icon: "🔌" },
  { key: "smart",       label: "Smart Home / IoT",     icon: "🏠" },
  { key: "wearables",   label: "Wearables",            icon: "⌚" },
  { key: "accessories", label: "Accessories",          icon: "🧩" },
];

/* Accent tint per category (for clean tiles without external images) */
window.CATEGORY_TINT = {
  phones:      ["#4f46e5", "#7c3aed"],
  audio:       ["#0891b2", "#0ea5e9"],
  gaming:      ["#db2777", "#7c3aed"],
  charging:    ["#059669", "#10b981"],
  smart:       ["#d97706", "#f59e0b"],
  wearables:   ["#dc2626", "#f43f5e"],
  accessories: ["#475569", "#64748b"],
};

window.PRODUCTS = [
  // ---------- Smartphones ----------
  { id: "ph-01", name: "iPhone 15 Pro 256GB",        brand: "Apple",   cat: "phones", price: 8999, icon: "📱", rating: 4.9, tag: "Best seller" },
  { id: "ph-02", name: "iPhone 15 128GB",            brand: "Apple",   cat: "phones", price: 6799, icon: "📱", rating: 4.8 },
  { id: "ph-03", name: "Galaxy S24 Ultra 512GB",     brand: "Samsung", cat: "phones", price: 9498, icon: "📱", rating: 4.8, tag: "Best seller" },
  { id: "ph-04", name: "Galaxy S24 256GB",           brand: "Samsung", cat: "phones", price: 6699, icon: "📱", rating: 4.7 },
  { id: "ph-05", name: "Pixel 8 Pro 256GB",          brand: "Google",  cat: "phones", price: 7699, icon: "📱", rating: 4.7 },
  { id: "ph-06", name: "Xiaomi 14 256GB",            brand: "Xiaomi",  cat: "phones", price: 4999, icon: "📱", rating: 4.6, tag: "New" },
  { id: "ph-07", name: "OnePlus 12 256GB",           brand: "OnePlus", cat: "phones", price: 5299, icon: "📱", rating: 4.6 },
  { id: "ph-08", name: "Nothing Phone (2) 256GB",    brand: "Nothing", cat: "phones", price: 4199, icon: "📱", rating: 4.5, tag: "New" },

  // ---------- Audio & Speakers ----------
  { id: "au-01", name: "WH-1000XM5 Headphones",      brand: "Sony",          cat: "audio", price: 2999, icon: "🎧", rating: 4.9, tag: "Best seller" },
  { id: "au-02", name: "QuietComfort Ultra",         brand: "Bose",          cat: "audio", price: 3180, icon: "🎧", rating: 4.8 },
  { id: "au-03", name: "AirPods Pro 2 USB-C",        brand: "Apple",         cat: "audio", price: 1899, icon: "🎧", rating: 4.8, tag: "Best seller" },
  { id: "au-04", name: "Momentum 4 Wireless",        brand: "Sennheiser",    cat: "audio", price: 2680, icon: "🎧", rating: 4.7 },
  { id: "au-05", name: "Charge 5 Speaker",           brand: "JBL",           cat: "audio", price: 1099, icon: "🔊", rating: 4.7 },
  { id: "au-06", name: "Emberton II Speaker",        brand: "Marshall",      cat: "audio", price: 1199, icon: "🔊", rating: 4.6 },
  { id: "au-07", name: "Era 100 Speaker",            brand: "Sonos",         cat: "audio", price: 1780, icon: "🔊", rating: 4.7 },
  { id: "au-08", name: "Aura Studio 4",              brand: "Harman Kardon", cat: "audio", price: 1999, icon: "🔊", rating: 4.5 },

  // ---------- Gaming & RGB ----------
  { id: "ga-01", name: "BlackWidow V4 Pro Keyboard", brand: "Razer",       cat: "gaming", price: 1299, icon: "⌨️", rating: 4.8, tag: "RGB" },
  { id: "ga-02", name: "G Pro X Superlight 2 Mouse", brand: "Logitech",    cat: "gaming", price: 999,  icon: "🖱️", rating: 4.9, tag: "Best seller" },
  { id: "ga-03", name: "Arctis Nova Pro Headset",    brand: "SteelSeries", cat: "gaming", price: 2680, icon: "🎧", rating: 4.8 },
  { id: "ga-04", name: "Cloud III Headset",          brand: "HyperX",      cat: "gaming", price: 899,  icon: "🎧", rating: 4.6 },
  { id: "ga-05", name: "iCUE Link RGB Fans x3",      brand: "Corsair",     cat: "gaming", price: 899,  icon: "💡", rating: 4.6, tag: "RGB" },
  { id: "ga-06", name: "Stream Deck MK.2",           brand: "Elgato",      cat: "gaming", price: 999,  icon: "🎛️", rating: 4.7 },
  { id: "ga-07", name: "RGB Light Strip 5m",         brand: "Govee",       cat: "gaming", price: 299,  icon: "💡", rating: 4.5, tag: "RGB" },
  { id: "ga-08", name: "Kraken V3 Headset",          brand: "Razer",       cat: "gaming", price: 799,  icon: "🎧", rating: 4.5 },

  // ---------- Chargers & USB4 Hubs ----------
  { id: "ch-01", name: "737 GaNPrime 120W",          brand: "Anker",  cat: "charging", price: 599, icon: "🔌", rating: 4.8, tag: "GaN" },
  { id: "ch-02", name: "Nexode 100W GaN",            brand: "Ugreen", cat: "charging", price: 399, icon: "🔌", rating: 4.7, tag: "GaN" },
  { id: "ch-03", name: "BoostCharge Pro 108W",       brand: "Belkin", cat: "charging", price: 499, icon: "🔌", rating: 4.6 },
  { id: "ch-04", name: "GaN5 65W Charger",           brand: "Baseus", cat: "charging", price: 259, icon: "🔌", rating: 4.6, tag: "GaN" },
  { id: "ch-05", name: "USB4 Thunderbolt Hub",       brand: "Anker",  cat: "charging", price: 699, icon: "🧷", rating: 4.7, tag: "USB4" },
  { id: "ch-06", name: "USB4 Dock 12-in-1",          brand: "Ugreen", cat: "charging", price: 899, icon: "🧷", rating: 4.6, tag: "USB4" },
  { id: "ch-07", name: "MagGo Power Bank 10K",       brand: "Anker",  cat: "charging", price: 379, icon: "🔋", rating: 4.7 },
  { id: "ch-08", name: "100W USB-C Cable 2m",        brand: "Baseus", cat: "charging", price: 129, icon: "🧵", rating: 4.5 },

  // ---------- Smart Home / IoT ----------
  { id: "sm-01", name: "Smart Frame 10.1\" WiFi",    brand: "Nixplay",     cat: "smart", price: 1080, icon: "🖼️", rating: 4.7, tag: "#1" },
  { id: "sm-02", name: "Hue White & Color Kit",      brand: "Philips Hue", cat: "smart", price: 1299, icon: "💡", rating: 4.8 },
  { id: "sm-03", name: "Smart Hub M3",               brand: "Aqara",       cat: "smart", price: 699,  icon: "🛰️", rating: 4.6 },
  { id: "sm-04", name: "Robot Vacuum X20+",          brand: "Xiaomi",      cat: "smart", price: 2499, icon: "🤖", rating: 4.7, tag: "Best seller" },
  { id: "sm-05", name: "Smart Air Purifier 4",       brand: "Xiaomi",      cat: "smart", price: 1099, icon: "🌀", rating: 4.6 },
  { id: "sm-06", name: "Echo Dot (5th Gen)",         brand: "Amazon",      cat: "smart", price: 399,  icon: "🔊", rating: 4.5 },
  { id: "sm-07", name: "Tapo C220 Camera",           brand: "TP-Link",     cat: "smart", price: 249,  icon: "📷", rating: 4.6 },
  { id: "sm-08", name: "Door & Window Sensor P2",    brand: "Aqara",       cat: "smart", price: 149,  icon: "🚪", rating: 4.5 },

  // ---------- Wearables ----------
  { id: "we-01", name: "Watch Series 9 45mm",        brand: "Apple",   cat: "wearables", price: 3199, icon: "⌚", rating: 4.8, tag: "Best seller" },
  { id: "we-02", name: "Watch Ultra 2 49mm",         brand: "Apple",   cat: "wearables", price: 6299, icon: "⌚", rating: 4.9 },
  { id: "we-03", name: "Galaxy Watch 6 Classic",     brand: "Samsung", cat: "wearables", price: 2288, icon: "⌚", rating: 4.6 },
  { id: "we-04", name: "Fenix 7 Sapphire",           brand: "Garmin",  cat: "wearables", price: 4999, icon: "⌚", rating: 4.8 },
  { id: "we-05", name: "Charge 6 Fitness Band",      brand: "Fitbit",  cat: "wearables", price: 1080, icon: "⌚", rating: 4.5 },
  { id: "we-06", name: "Smart Band 8 Pro",           brand: "Xiaomi",  cat: "wearables", price: 259,  icon: "⌚", rating: 4.6, tag: "Best price" },

  // ---------- Accessories ----------
  { id: "ac-01", name: "MagSafe Case for iPhone",    brand: "Apple",  cat: "accessories", price: 399, icon: "🧩", rating: 4.5 },
  { id: "ac-02", name: "Rugged Armor Case",          brand: "Spigen", cat: "accessories", price: 179, icon: "🧩", rating: 4.6 },
  { id: "ac-03", name: "2.5D Screen Protector x2",   brand: "Anker",  cat: "accessories", price: 99,  icon: "🛡️", rating: 4.4 },
  { id: "ac-04", name: "USB-C to USB-C Cable 1m",    brand: "Ugreen", cat: "accessories", price: 79,  icon: "🧵", rating: 4.6 },
  { id: "ac-05", name: "Power Bank 20,000 mAh",      brand: "Baseus", cat: "accessories", price: 199, icon: "🔋", rating: 4.6, tag: "Best seller" },
  { id: "ac-06", name: "MagSafe Car Mount",          brand: "Belkin", cat: "accessories", price: 299, icon: "🧲", rating: 4.5 },
];

/* Full brand list for the brand strip (order = display order) */
window.BRANDS = [
  "Apple", "Samsung", "Sony", "Xiaomi", "Google", "Bose", "JBL", "Sennheiser",
  "Razer", "Logitech", "SteelSeries", "HyperX", "Corsair", "Elgato", "Govee",
  "Anker", "Ugreen", "Belkin", "Baseus", "Philips Hue", "Aqara", "Nixplay",
  "Garmin", "Marshall", "Nothing", "OnePlus", "Sonos", "Amazon", "TP-Link",
  "Fitbit", "Spigen", "Harman Kardon",
];
