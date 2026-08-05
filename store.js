window.STORE_CONFIG = {
  storeName: "TXT WORLDWIDE SHOP",
  currency: "HK$",
  discountPct: 0,      // 0 – net skidki, mozhesh' postavit' 10, 20 i t.d.
  tagline: "Gadgets, Audio & Smart Home"
};/* =========================================================================
   TXT WORLDWIDE SHOP — store logic: catalog, filters, search.
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

  const state = { cat: "all", brand: null, sort: "pop", q: "" };

  const CAT_ICON = {
    all: "ic-grid", phones: "ic-phone", audio: "ic-headphones", gaming: "ic-gamepad",
    charging: "ic-zap", smart: "ic-home", wearables: "ic-watch", accessories: "ic-package",
  };
  const prodIcon = (cat) => `<svg class="prod-ic"><use href="#${CAT_ICON[cat] || "ic-package"}"/></svg>`;
  const tint = (cat) => (window.CATEGORY_TINT[cat] || ["#5e6ad2"])[0];

  const IMG_POOL = {
    phones:      ["1511707171634-5f897ff02aa9", "1592750475338-74b7b21085ab", "1580910051074-3eb694886505", "1523206489230-c012c64b2b48"],
    audio:       ["1505740420928-5e560c06d30e", "1546435770-a3e426bf472b", "1484704849700-f032a568e944"],
    gaming:      ["1541140532154-b024d705b90a", "1587202372775-e229f172b9d7", "1616588589676-62b3bd4ff6d2"],
    charging:    ["1618410320928-25228d811631"],
    smart:       ["1558002038-1055907df827", "1518444065439-e933c06ce9cd"],
    wearables:   ["1523275335684-37898b6baf30", "1579586337278-3befd40fd17a", "1546868871-7041f2a55e12"],
    accessories: ["1572569511254-d8f925fe2cbb", "1600294037681-c80b4cb5b434"],
  };
  const AUDIO_SPEAKER = "1608043152269-423dbba4e7e1";
  function imgFor(p) {
    if (p.image) return p.image;
    let id;
    if (p.cat === "audio" && /speaker/i.test(p.name)) id = AUDIO_SPEAKER;
    else {
      const pool = IMG_POOL[p.cat];
      if (!pool || !pool.length) return "";
      id = pool[Math.abs(hash(p.id)) % pool.length];
    }
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&h=480&q=70`;
  }

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return h;
  }

  let revealIO;
  function observeReveals() {
    const els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    revealIO = revealIO || new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    els.forEach((e) => revealIO.observe(e));
  }

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
    const pool = window.PRODUCTS.filter((p) => state.cat === "all" || p.cat === state.cat);
    const brands = Array.from(new Set(pool.map((p) => p.brand))).sort();
    $("#brand-chips").innerHTML =
      `<button class="chip${state.brand === null ? " active" : ""}" data-brand="">All brands</button>` +
      brands.map((b) => `<button class="chip${state.brand === b ? " active" : ""}" data-brand="${esc(b)}">${esc(b)}</button>`).join("");
  }

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
      <article class="card reveal" style="transition-delay:${Math.min(i, 12) * 30}ms">
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
            <a class="buy-btn" href="${p.buyUrl ? esc(p.buyUrl) : "/buy?product=" + encodeURIComponent(p.name) + "&price=" + p.price}"${p.buyUrl ? ' target="_blank" rel="noopener noreferrer"' : ""}>Buy</a>
          </div>
        </div>
      </article>`;
    }).join("");
    observeReveals();
  }

  function renderAll() { renderCats(); renderBrandChips(); renderGrid(); }

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

  function bindEvents() {
    document.addEventListener("click", (e) => {
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
    });

    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });

    let searchTimer;
    $("#search").addEventListener("input", (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 120);
    });
  }

  function applyPricing() {
    const pct = Number(CFG.discountPct) || 0;
    if (!pct) return;
    window.PRODUCTS.forEach((p) => {
      if (p.market != null) return;
      p.market = p.price;
      p.price = Math.round((p.market * (1 - pct / 100)) / 10) * 10;
    });
  }

  function applyConfig() {
    document.title = `${CFG.storeName} — Gadgets, Audio & Smart Home in Hong Kong`;
    $$("[data-store-name]").forEach((el) => (el.textContent = CFG.storeName));
    const tag = $("[data-tagline]"); if (tag && CFG.tagline) tag.textContent = CFG.tagline;
    $("#year").textContent = "2026";
  }

  function init() {
    applyConfig();
    applyPricing();
    renderBrandsStrip();
    renderAll();
    initTheme();
    bindEvents();
    observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
