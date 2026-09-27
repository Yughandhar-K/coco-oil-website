/* =====================================================================
   CART.JS
   =====================================================================
   Everything related to the shopping cart lives here: loading/saving it
   from localStorage, adding/removing/updating items, and calculating
   the subtotal, delivery charge and total.

   The cart is stored in the browser's localStorage, so it survives a
   page refresh and stays available when the customer moves between
   pages (index.html -> product.html -> cart.html -> checkout.html).
   ===================================================================== */

/* ---- DELIVERY CONFIGURATION -------------------------------------------
   Simple flat charge for now. You can later change "type" and "charge"
   to add free-delivery thresholds or location-based pricing — just make
   calculateDelivery() below a bit smarter when you're ready for that. */
const deliveryConfig = {
  type: "fixed",   // "fixed" is the only type used right now
  charge: 0         // e.g. change to 49 for a flat ₹49 delivery fee
};

const CART_STORAGE_KEY = "cocoCart";

/**
 * Loads the cart from localStorage.
 * Returns an array of { id, quantity } objects, or an empty array if
 * nothing is saved yet (or the saved data is invalid).
 */
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only keep items whose product still exists in PRODUCTS.
    return parsed.filter(function (item) {
      return getProductById(item.id) && item.quantity > 0;
    });
  } catch (error) {
    console.error("Could not read the saved cart:", error);
    return [];
  }
}

/**
 * Saves the current cart array to localStorage.
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Could not save the cart:", error);
  }
}

// The cart is kept in this variable while the page is open, and is
// re-loaded from localStorage every time a page loads.
let cart = loadCart();

/**
 * Adds a product to the cart, or increases its quantity if it's
 * already in the cart.
 */
function addToCart(productId, quantity) {
  const product = getProductById(productId);
  if (!product) return;
  if (product.price === null) {
    showToast("This product's price isn't set yet.");
    return;
  }

  quantity = Math.max(1, Math.min(99, Number(quantity) || 1));

  const existingItem = cart.find(function (item) {
    return item.id === productId;
  });

  if (existingItem) {
    existingItem.quantity = Math.min(99, existingItem.quantity + quantity);
  } else {
    cart.push({ id: productId, quantity: quantity });
  }

  saveCart(cart);
  renderCartBadge();
  showToast("🥥 " + product.name + " – " + product.size + " added to cart");
}

/**
 * Changes the quantity of an item already in the cart.
 * Removes the item entirely if the new quantity is 0 or less.
 */
function updateCartQuantity(productId, newQuantity) {
  const item = cart.find(function (i) { return i.id === productId; });
  if (!item) return;

  newQuantity = Number(newQuantity);
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = Math.min(99, newQuantity);
  saveCart(cart);
  renderCartBadge();
  if (typeof renderCartPage === "function") renderCartPage();
}

/**
 * Removes a product from the cart completely.
 */
function removeFromCart(productId) {
  cart = cart.filter(function (item) { return item.id !== productId; });
  saveCart(cart);
  renderCartBadge();
  if (typeof renderCartPage === "function") renderCartPage();
}

/**
 * Returns the total number of items in the cart (used for the badge).
 */
function getCartItemCount() {
  return cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
}

/**
 * Adds up price × quantity for every item in the cart.
 */
function calculateSubtotal() {
  return cart.reduce(function (sum, item) {
    const product = getProductById(item.id);
    if (!product || product.price === null) return sum;
    return sum + product.price * item.quantity;
  }, 0);
}

/**
 * Works out the delivery charge for the current cart.
 * Right now this simply returns the flat charge from deliveryConfig,
 * or ₹0 if the cart is empty.
 */
function calculateDelivery() {
  if (cart.length === 0) return 0;
  return deliveryConfig.charge;
}

/**
 * Subtotal + delivery = the final total the customer pays.
 */
function calculateTotal() {
  return calculateSubtotal() + calculateDelivery();
}

/* =====================================================================
   CART BADGE (shown in the header on every page)
   ===================================================================== */
function renderCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const count = getCartItemCount();
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

/* =====================================================================
   CART PAGE (only runs if a #cartItems element exists, i.e. on cart.html)
   ===================================================================== */
function renderCartPage() {
  const container = document.getElementById("cartItems");
  if (!container) return; // We're not on cart.html — nothing to do.

  const emptyState = document.getElementById("emptyCart");
  const cartContent = document.getElementById("cartContent");

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (cartContent) cartContent.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (cartContent) cartContent.style.display = "grid";

  container.innerHTML = cart.map(function (item) {
    const product = getProductById(item.id);
    if (!product) return "";
    return (
      '<div class="cart-item">' +
        '<img src="' + product.image + '" alt="' + product.name + ' – ' + product.size + '">' +
        '<div>' +
          '<p class="cart-item-name">' + product.name + ' – ' + product.size + '</p>' +
          '<p class="cart-item-meta">' + formatPrice(product.price) + ' each</p>' +
          '<div class="cart-item-controls">' +
            '<button class="qty-btn" data-cart-decrease="' + product.id + '" aria-label="Decrease quantity">−</button>' +
            '<span class="qty-value">' + item.quantity + '</span>' +
            '<button class="qty-btn" data-cart-increase="' + product.id + '" aria-label="Increase quantity">+</button>' +
            '<button class="cart-item-remove" data-cart-remove="' + product.id + '">Remove</button>' +
          '</div>' +
        '</div>' +
        '<p class="cart-item-price">' + formatPrice(product.price * item.quantity) + '</p>' +
      '</div>'
    );
  }).join("");

  const subtotal = calculateSubtotal();
  const delivery = calculateDelivery();
  const total = calculateTotal();

  setText("cartSubtotal", formatPrice(subtotal));
  setText("cartDelivery", delivery === 0 ? "Free" : formatPrice(delivery));
  setText("cartTotal", formatPrice(total));
}

// Small helper: sets the text content of an element if it exists.
function setText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
}

// Handles clicks on the +/- and Remove buttons inside the cart page.
document.addEventListener("click", function (event) {
  const decreaseId = event.target.closest("[data-cart-decrease]");
  const increaseId = event.target.closest("[data-cart-increase]");
  const removeId = event.target.closest("[data-cart-remove]");

  if (decreaseId) {
    const id = decreaseId.getAttribute("data-cart-decrease");
    const item = cart.find(function (i) { return i.id === id; });
    if (item) updateCartQuantity(id, item.quantity - 1);
  }
  if (increaseId) {
    const id = increaseId.getAttribute("data-cart-increase");
    const item = cart.find(function (i) { return i.id === id; });
    if (item) updateCartQuantity(id, item.quantity + 1);
  }
  if (removeId) {
    removeFromCart(removeId.getAttribute("data-cart-remove"));
  }
});

// Run once when any page loads: update the badge, and render the cart
// page itself if we're on cart.html.
document.addEventListener("DOMContentLoaded", function () {
  renderCartBadge();
  renderCartPage();
});
