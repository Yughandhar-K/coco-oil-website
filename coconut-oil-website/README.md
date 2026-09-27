# [YOUR BUSINESS NAME] — Coconut Oil Website

A complete, working website built with plain **HTML5, CSS3 and vanilla
JavaScript** — no frameworks, no build tools, no backend. Open
`index.html` in a browser and it just works.

## 1. How to open the website

Double-click `index.html` to open it directly in your browser, or
right-click it and choose "Open with" your preferred browser. No server
or installation is required for local testing.

(Optional: some browsers restrict certain features when opening files
directly with `file://`. If anything looks off, you can also run a tiny
local server — e.g. in a terminal inside this folder, run
`python3 -m http.server` and visit `http://localhost:8000`.)

## 2. Project structure

```
coconut-oil-website/
│
├── index.html            Homepage: hero, about, products, why choose us, how to order
├── product.html           Product detail page (reads ?id= from the URL)
├── cart.html               Shopping cart page
├── checkout.html            Delivery details form + WhatsApp order button
├── contact.html              Contact page
├── privacy-policy.html        Placeholder Privacy Policy
├── terms.html                  Placeholder Terms & Conditions
│
├── css/
│   └── style.css          All styling, including the colour variables
│
├── js/
│   ├── products.js        Product data (prices, sizes, images, details)
│   ├── cart.js             Cart logic (add/remove/update, localStorage, totals)
│   ├── checkout.js          Checkout form validation + WhatsApp message
│   └── main.js               Business info, navigation, product rendering, WhatsApp buttons
│
├── images/
│   ├── logo.png             Placeholder logo
│   ├── hero-coconut.jpg      Placeholder hero image
│   ├── coconut-oil-250ml.jpg  Placeholder product photo
│   ├── coconut-oil-500ml.jpg   Placeholder product photo
│   └── coconut-oil-1l.jpg       Placeholder product photo
│
└── README.md (this file)
```

All the placeholder images were generated as simple labelled graphics
so the site works out of the box. Replace them with real photos any
time — see section 8 below.

## 3. How to change your business name

Open `js/main.js` and edit the `businessConfig` object near the top:

```javascript
const businessConfig = {
  name: "[YOUR BUSINESS NAME]",   // <-- change this
  ...
};
```

This one change updates the name everywhere: header, footer, contact
page, browser tab title, and WhatsApp messages.

## 4. How to change your WhatsApp number

Still inside `js/main.js`:

```javascript
whatsapp: "911234567890",          // digits only, country code, no + or spaces
whatsappDisplay: "[YOUR WHATSAPP NUMBER]", // the friendly text shown to customers
```

`whatsapp` is used to build the `wa.me` links that actually open a
chat, so it must be digits only (country code + number). `whatsappDisplay`
is just the text shown on the Contact page.

## 5. How to change your phone number

```javascript
phone: "[YOUR PHONE NUMBER]",     // shown as text on the Contact page
phoneDial: "",                     // e.g. "+919876543210" — powers the "Call Us" button
```

## 6. How to change your email

```javascript
email: "[YOUR EMAIL]",
```

Once this no longer starts with `[`, the "Email Us" button on the
Contact page will automatically link to `mailto:` that address.

## 7. How to change your address

```javascript
address: "[YOUR BUSINESS ADDRESS]",
```

## 8. How to change product prices, sizes and images

Open `js/products.js`. Each product is one object inside the `PRODUCTS`
array:

```javascript
{
  id: "coconut-250",
  name: "Pure Coconut Oil",
  size: "250 ML",
  netQuantity: "250 ML",
  price: 199,                          // <-- change the price here
  image: "images/coconut-oil-250ml.jpg", // <-- point this at your real photo
  ingredients: "[INGREDIENTS]",
  suitableFor: "[SUITABLE FOR]",
  productionMethod: "[PRODUCTION METHOD]",
  storage: "[STORAGE]",
  shelfLife: "[SHELF LIFE]"
}
```

To replace an image, put your photo file inside the `images/` folder
and update the `image` path to match its filename — or simply save your
new photo over the existing placeholder file with the same name.

If a price isn't finalised yet, set it to `null` (no quotes) and the
site will show "₹___" and disable ordering for that product until you
set a real number.

### The "1000 ML / 920 ML" naming issue

Each product has two separate fields:

- `size` — the size shown as the product's name (e.g. `"1000 ML Bottle"`)
- `netQuantity` — the actual net quantity on the label (e.g. `"920 ML"`)

If these differ, the site automatically shows both, e.g.
"1000 ML Bottle (Net Qty: 920 ML)" — so customers are never confused.
If your bottle's printed size and net quantity are actually the same,
just set both fields to the same value.

## 9. How to add a new product

Copy one of the objects in the `PRODUCTS` array inside `js/products.js`,
paste it as a new entry, and give it a unique `id` (e.g. `"coconut-2000"`).
It will automatically appear in the product grid, the product detail
page, the cart, and the WhatsApp order message — no other file needs
to change.

## 10. How to change delivery charges

Open `js/cart.js` and edit `deliveryConfig` near the top:

```javascript
const deliveryConfig = {
  type: "fixed",
  charge: 0   // e.g. change to 49 for a flat ₹49 delivery fee
};
```

This is intentionally simple for now. If you later want free delivery
above a certain order value, or different charges per city, you can
extend the `calculateDelivery()` function in the same file — it's the
only place delivery is calculated.

## 11. How the cart works

- Cart data is stored in the browser's `localStorage` under the key
  `cocoCart`, so it survives page refreshes and stays available as a
  customer moves between pages.
- `js/cart.js` contains all the cart logic: `addToCart()`,
  `removeFromCart()`, `updateCartQuantity()`, `calculateSubtotal()`,
  `calculateDelivery()`, and `calculateTotal()`.
- The cart badge in the header (the little number on the cart icon)
  updates automatically on every page whenever the cart changes.
- The full cart page (`cart.html`) is rendered by `renderCartPage()`,
  which only runs on that page.

## 12. How WhatsApp ordering works

- `businessConfig.whatsapp` (in `js/main.js`) holds the business's
  WhatsApp number.
- `openWhatsApp(message)` (also in `js/main.js`) builds a
  `https://wa.me/<number>?text=<message>` link using
  `encodeURIComponent()` and opens it in a new tab.
- On the checkout page, `js/checkout.js` validates the delivery-details
  form, then calls `generateWhatsAppMessage()` to build the full order
  message (customer details, products, quantities, subtotal, delivery,
  total, address, and note) and opens it with `openWhatsApp()`.
- On the product detail page, the "Order via WhatsApp" button builds a
  simpler one-product message the same way.
- Nothing is ever sent automatically — the customer still has to press
  **Send** inside WhatsApp, which is why the confirmation screen says
  "Order Ready!" rather than "Order placed."

## Important reminders

- All prices in `js/products.js` are **placeholders** — replace them
  with your real prices before going live.
- The WhatsApp number in `js/main.js` is a **placeholder**
  (`911234567890`) — replace it with your real business WhatsApp number.
- The Privacy Policy and Terms & Conditions pages contain placeholder
  text only. Replace them with real legal text (ideally reviewed by a
  professional) before publishing.
- Don't add claims like "organic," "cold-pressed," "wood-pressed," or
  "chemical-free" anywhere on the site unless they are actually true —
  the placeholder copy intentionally avoids these until you confirm them.
