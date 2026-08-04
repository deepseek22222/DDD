/* =========================================================================
   TXT WORLDWIDE SHOP — store settings and payment configuration.
   This is the only place the store owner connects payments.

   SECURITY NOTE:
   The storefront NEVER collects card number / CVC on its own pages.
   Payment always happens on the provider's secure hosted page
   (Stripe Checkout / PayPal), which the customer is redirected to.
   That way you never touch card data and stay out of PCI-DSS scope.
   ========================================================================= */

window.STORE_CONFIG = {
  storeName: "TXT WORLDWIDE SHOP",
  tagline: "Gadgets, audio & smart home — delivered across Hong Kong",
  currency: "HK$",            // display currency symbol
  currencyCode: "HKD",        // code passed to the payment provider
  freeShippingOver: 800,      // free shipping above this amount (HK$)
  flatShipping: 40,           // flat shipping fee below the threshold (HK$)

  /* Prices in data.js are treated as MARKET prices. The storefront shows
     them struck through and computes the discounted price. 0 = no discount. */
  discountPct: 40,

  /* --- PAYMENT CONNECTION (filled in by the store owner) --------------------
     Leave checkoutEndpoint empty for demo mode
     (orders are placed without a real charge — handy for a client preview).

     To enable real Stripe payments:
       1. Host a small server endpoint that creates a Stripe Checkout Session
          (example in README.md).
       2. Put its URL here, e.g.:
          checkoutEndpoint: "https://api.your-store.example/create-checkout"
     The frontend sends the order there and gets back a secure Stripe URL,
     then redirects the customer to it.
  ------------------------------------------------------------------------- */
  payments: {
    provider: "demo",          // "demo" | "stripe" | "paypal"
    checkoutEndpoint: "",      // URL of your server endpoint
  },
};
