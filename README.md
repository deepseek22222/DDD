# TXT WORLDWIDE SHOP — Gadgets Store

A modern electronics storefront: smartphones, audio & speakers, gaming + RGB,
chargers & USB4 hubs, smart home / IoT, wearables and accessories. Dozens of
brands, search, filters, cart and checkout. Dark glassmorphism design, fully
responsive, light/dark theme.

> Static site built with plain **HTML + CSS + JavaScript**. No build step and no
> dependencies — it opens in any browser and deploys to any static host.

---

## Features

- Catalog of 50+ products, filter by category and brand, search and sorting
- Cart with localStorage persistence, totals, and free-shipping threshold
- Order-request checkout: customer leaves name + phone, you confirm the order
- Discounted pricing with a struck-through market price and a discount badge
- Product photos with an automatic SVG fallback
- 3-year worldwide warranty messaging (hero, trust band, and policy section)
- Responsive 375 → 1440, dark/light theme, `prefers-reduced-motion` support

## Project structure

| File            | Purpose                                             |
|-----------------|-----------------------------------------------------|
| `index.html`    | markup + inline SVG icon sprite                     |
| `styles.css`    | styles, themes, responsive layout                   |
| `data.js`       | **product & brand catalog** — edit this             |
| `config.js`     | **store settings, payment, discount %**             |
| `app.js`        | logic: filters, cart, checkout, images, pricing     |

## Run locally

Open `index.html` directly, or serve the folder with any static server, e.g.:

```bash
python3 -m http.server
```

Then open the URL it prints.

## Deploy

The site is fully static with `index.html` at the root, so it works on any static
host (GitHub Pages, Netlify, Vercel, Render Static Site, Cloudflare Pages, …):

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `(root)`.
- **Render / Netlify / Vercel:** create a Static Site, pick the repo, set the
  publish directory to `.` and leave the build command empty. A `render.yaml`
  blueprint is included for Render.

## Ordering

There is **no online payment** on the site. Checkout is an **order request**: the
customer picks products, opens the cart, leaves their **name and phone**, and
submits. They see an order confirmation, and you follow up to confirm payment and
delivery off-site. No card data is collected anywhere.

## Product photos

Cards use category stock photos as **illustrative placeholders** (the photo pool
lives in `app.js` → `IMG_POOL`). They show the product type, not the exact model.
Replace them with your own licensed product photography by adding an `image`
field in `data.js`:

```js
{ id: "ph-01", name: "iPhone 15 Pro 256GB", brand: "Apple", cat: "phones",
  price: 8999, rating: 4.9, image: "images/iphone-15-pro.jpg" }
```

## Pricing

Prices in `data.js` are treated as **market prices**. The storefront displays them
struck through and computes the discounted price from `discountPct` in `config.js`
(default −40%). Set it to `0` to disable the discount.

## Before going live

- Replace placeholder photos with licensed product images.
- Optionally add a payment provider and email order confirmation.
- Add legal pages: shipping, returns, privacy, terms.

## License

Project code: your choice (e.g. MIT). Product/brand names and logos are the
property of their respective owners — use only with the appropriate rights.
