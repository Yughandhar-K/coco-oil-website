/* =====================================================================
   PRODUCTS.JS
   =====================================================================
   This file holds ALL product information in one place. Change a price,
   an image path, or any product detail here and it updates everywhere
   on the website automatically (product grid, product detail page,
   cart, and the WhatsApp order message).

   HOW TO ADD A NEW PRODUCT:
   Just copy one of the objects below, paste it into the PRODUCTS array,
   and give it a unique "id".

   HOW TO SET PRICES:
   Change the "price" number. Leave it as `null` if the price isn't
   decided yet — the site will show "₹___" and disable ordering for
   that product until you set a real number.

   ABOUT "1000 ML / 920 ML":
   The bottle's label size and its actual net quantity are two separate
   fields below — "size" (what's printed/shown as the bottle name) and
   "netQuantity" (the actual net quantity). Set them independently once
   you've confirmed the real numbers.
   ===================================================================== */

const PRODUCTS = [
  {
    id: "coconut-250",
    name: "Pure Coconut Oil",
    size: "250 ML",              // shown as the product's display size
    netQuantity: "250 ML",       // actual net quantity on the label
    price: 199,                   // PLACEHOLDER — replace with your real price
    image: "images/coconut-oil-250ml.jpg",
    ingredients: "[INGREDIENTS]",
    suitableFor: "[SUITABLE FOR]",
    productionMethod: "[PRODUCTION METHOD]",
    storage: "[STORAGE]",
    shelfLife: "[SHELF LIFE]"
  },
  {
    id: "coconut-500",
    name: "Pure Coconut Oil",
    size: "500 ML",
    netQuantity: "500 ML",
    price: 349, // PLACEHOLDER — replace with your real price
    image: "images/coconut-oil-500ml.jpg",
    ingredients: "[INGREDIENTS]",
    suitableFor: "[SUITABLE FOR]",
    productionMethod: "[PRODUCTION METHOD]",
    storage: "[STORAGE]",
    shelfLife: "[SHELF LIFE]"
  },
  {
    id: "coconut-1000",
    name: "Pure Coconut Oil",
    // Example of the "1000 ML / 920 ML" naming issue from the brief:
    // the bottle is labelled 1000 ML but the confirmed net quantity is
    // 920 ML. Change either value independently once confirmed.
    size: "1000 ML Bottle",
    netQuantity: "920 ML",
    price: 599, // PLACEHOLDER — replace with your real price
    image: "images/coconut-oil-1l.jpg",
    ingredients: "[INGREDIENTS]",
    suitableFor: "[SUITABLE FOR]",
    productionMethod: "[PRODUCTION METHOD]",
    storage: "[STORAGE]",
    shelfLife: "[SHELF LIFE]"
  }
];

/**
 * Finds a product by its id.
 * Returns undefined if no product with that id exists.
 */
function getProductById(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

/**
 * Formats a price as Indian Rupees, e.g. 199 -> "₹199".
 * If the price hasn't been set yet (null), shows "₹___" instead.
 */
function formatPrice(amount) {
  if (amount === null || amount === undefined) {
    return "₹___";
  }
  return "₹" + Number(amount).toLocaleString("en-IN");
}

/**
 * Returns a short size label that shows both the display size and the
 * net quantity when they are different, so customers are never confused
 * about what they're buying.
 */
function getSizeLabel(product) {
  if (product.size.toLowerCase().indexOf(product.netQuantity.toLowerCase()) !== -1) {
    return product.size;
  }
  return product.size + " (Net Qty: " + product.netQuantity + ")";
}
