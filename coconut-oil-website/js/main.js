/* =====================================================================
   MAIN.JS
   =====================================================================
   This file holds:
   1. The business configuration (name, phone, WhatsApp, etc.)
   2. Code that fills that information into every page automatically
   3. Shared UI behaviour used on every page: mobile menu, floating
      WhatsApp button, toast notifications
   4. Page-specific rendering that only runs if the relevant element
      exists on the current page (product grid on index.html, product
      detail on product.html) — this keeps one shared file working
      across the whole site without needing a template system.
   ===================================================================== */

/* ---- BUSINESS CONFIGURATION -------------------------------------------
   Change every value here to update contact details across the whole
   site in one place (header, footer, contact page, WhatsApp messages). */
const businessConfig = {
  name: "[YOUR BUSINESS NAME]",
  phone: "[YOUR PHONE NUMBER]",
  phoneDial: "",  // digits only with country code, e.g. "+919876543210" — used by the "Call Us" button. Leave blank to hide the tel: link.
  // WhatsApp number used to build wa.me links. Digits only, with country
  // code, no + or spaces. PLACEHOLDER below — replace with the real number.
  whatsapp: "911234567890",
  whatsappDisplay: "[YOUR WHATSAPP NUMBER]",
  email: "[YOUR EMAIL]",
  address: "[YOUR BUSINESS ADDRESS]",
  instagram: "",   // e.g. "https://instagram.com/yourbrand" — leave "" to hide the icon
  facebook: "",     // e.g. "https://facebook.com/yourbrand" — leave "" to hide the icon
  googleMaps: "",    // e.g. "https://maps.google.com/?q=..." — leave "" to hide the map link
  productionMethod: "[TRADITIONAL / COLD PRESSED / WOOD PRESSED / OTHER]"
};

/* =====================================================================
   FILL BUSINESS INFO INTO THE PAGE
   =====================================================================
   Any element with a data-business="..." attribute gets its text filled
   in automatically. Example: <span data-business="name"></span>
   Any link with data-business-link="phone|whatsapp|email" gets its href
   filled in automatically.
   ===================================================================== */
function applyBusinessConfig() {
  document.querySelectorAll("[data-business]").forEach(function (el) {
    const key = el.getAttribute("data-business");
    if (key === "whatsapp") {
      el.textContent = businessConfig.whatsappDisplay;
    } else if (businessConfig[key] !== undefined) {
      el.textContent = businessConfig[key];
    }
  });

  document.querySelectorAll("[data-business-link]").forEach(function (el) {
    const type = el.getAttribute("data-business-link");
    if (type === "phone" && businessConfig.phoneDial) {
      el.setAttribute("href", "tel:" + businessConfig.phoneDial);
    } else if (type === "email" && businessConfig.email && businessConfig.email.indexOf("[") !== 0) {
      el.setAttribute("href", "mailto:" + businessConfig.email);
    }
  });

  // Social icons — only show the ones that have a real URL configured.
  document.querySelectorAll(".social-links, .footer-social").forEach(function (container) {
    let html = "";
    if (businessConfig.instagram) {
      html += '<a href="' + businessConfig.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + iconSvg("instagram") + '</a>';
    }
    if (businessConfig.facebook) {
      html += '<a href="' + businessConfig.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + iconSvg("facebook") + '</a>';
    }
    container.innerHTML = html;
  });

  // Footer copyright line + current year.
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Production method shown on the About section (index.html).
  const productionEl = document.getElementById("productionMethodText");
  if (productionEl) productionEl.textContent = businessConfig.productionMethod;

  document.title = document.title.replace("[YOUR BUSINESS NAME]", businessConfig.name);
}

function iconSvg(type) {
  if (type === "instagram") {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
  }
  if (type === "facebook") {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/></svg>';
  }
  return "";
}

/* =====================================================================
   MOBILE MENU TOGGLE
   ===================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener("click", function () {
    const isOpen = mobileNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close the menu after tapping a link.
  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* =====================================================================
   TOAST NOTIFICATIONS (small pop-up messages, e.g. "added to cart")
   ===================================================================== */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return; // toast element might not be on every page
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2600);
}

/* =====================================================================
   WHATSAPP HELPERS
   ===================================================================== */

/**
 * Opens WhatsApp with a pre-filled message, using the configured
 * business WhatsApp number. Works for both the generic "chat with us"
 * buttons and the detailed order message built in checkout.js.
 */
function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const url = "https://wa.me/" + businessConfig.whatsapp + "?text=" + encodedMessage;
  window.open(url, "_blank", "noopener");
}

function genericWhatsAppMessage() {
  return "Hello " + businessConfig.name + ", I'd like to know more about your coconut oil.";
}

function initWhatsAppButtons() {
  document.querySelectorAll("[data-whatsapp-generic]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openWhatsApp(genericWhatsAppMessage());
    });
  });
}

/* =====================================================================
   PRODUCT GRID (only runs if #productGrid exists — index.html)
   ===================================================================== */
const gridQuantities = {}; // remembers the quantity selected on each card before "Add to Cart"

function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(function (product) {
    gridQuantities[product.id] = gridQuantities[product.id] || 1;
    return (
      '<div class="product-card">' +
        '<img src="' + product.image + '" alt="' + product.name + ' – ' + product.size + '" loading="lazy">' +
        '<div class="product-card-body">' +
          '<h3>🥥 ' + product.name + '</h3>' +
          '<p class="product-size">' + getSizeLabel(product) + '</p>' +
          '<p class="product-price">' + formatPrice(product.price) + '</p>' +
          '<div class="qty-selector">' +
            '<button class="qty-btn" data-grid-decrease="' + product.id + '" aria-label="Decrease quantity">−</button>' +
            '<span class="qty-value" id="gridQty-' + product.id + '">1</span>' +
            '<button class="qty-btn" data-grid-increase="' + product.id + '" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<div class="product-card-actions">' +
            '<button class="btn btn-primary btn-block" data-grid-add="' + product.id + '" ' + (product.price === null ? "disabled" : "") + '>ADD TO CART</button>' +
            '<a class="btn btn-outline btn-block" href="product.html?id=' + product.id + '">View Details</a>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}

// Handles the quantity +/- and Add to Cart buttons inside the product grid.
document.addEventListener("click", function (event) {
  const decrease = event.target.closest("[data-grid-decrease]");
  const increase = event.target.closest("[data-grid-increase]");
  const add = event.target.closest("[data-grid-add]");

  if (decrease) {
    const id = decrease.getAttribute("data-grid-decrease");
    gridQuantities[id] = Math.max(1, gridQuantities[id] - 1);
    setText("gridQty-" + id, gridQuantities[id]);
  }
  if (increase) {
    const id = increase.getAttribute("data-grid-increase");
    gridQuantities[id] = Math.min(99, gridQuantities[id] + 1);
    setText("gridQty-" + id, gridQuantities[id]);
  }
  if (add) {
    const id = add.getAttribute("data-grid-add");
    addToCart(id, gridQuantities[id] || 1);
  }
});

/* =====================================================================
   PRODUCT DETAIL PAGE (only runs if #productDetail exists — product.html)
   ===================================================================== */
let detailQuantity = 1;

function renderProductDetail() {
  const container = document.getElementById("productDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const product = getProductById(productId) || PRODUCTS[0];

  if (!product) {
    container.innerHTML = "<p>Product not found. <a href=\"index.html#products\">Back to products</a></p>";
    return;
  }

  document.title = product.name + " – " + product.size + " | " + businessConfig.name;

  container.innerHTML =
    '<div>' +
      '<img src="' + product.image + '" alt="' + product.name + ' – ' + product.size + '">' +
    '</div>' +
    '<div>' +
      '<h1>' + product.name + ' – ' + product.size + '</h1>' +
      '<p class="product-price">' + formatPrice(product.price) + '</p>' +
      '<div class="qty-selector">' +
        '<button class="qty-btn" id="detailDecrease" aria-label="Decrease quantity">−</button>' +
        '<span class="qty-value" id="detailQty">1</span>' +
        '<button class="qty-btn" id="detailIncrease" aria-label="Increase quantity">+</button>' +
      '</div>' +
      '<div class="product-card-actions" style="max-width:320px;">' +
        '<button class="btn btn-primary btn-block" id="detailAddToCart" ' + (product.price === null ? "disabled" : "") + '>🛒 ADD TO CART</button>' +
        '<button class="btn btn-whatsapp btn-block" id="detailOrderWhatsApp">💬 ORDER VIA WHATSAPP</button>' +
      '</div>' +
      '<dl class="product-info-table">' +
        '<div class="info-row"><dt>Product</dt><dd>' + product.name + '</dd></div>' +
        '<div class="info-row"><dt>Net Quantity</dt><dd>' + product.netQuantity + '</dd></div>' +
        '<div class="info-row"><dt>Suitable For</dt><dd>' + product.suitableFor + '</dd></div>' +
        '<div class="info-row"><dt>Ingredients</dt><dd>' + product.ingredients + '</dd></div>' +
        '<div class="info-row"><dt>Production Method</dt><dd>' + product.productionMethod + '</dd></div>' +
        '<div class="info-row"><dt>Storage</dt><dd>' + product.storage + '</dd></div>' +
        '<div class="info-row"><dt>Shelf Life</dt><dd>' + product.shelfLife + '</dd></div>' +
      '</dl>' +
    '</div>';

  detailQuantity = 1;

  document.getElementById("detailDecrease").addEventListener("click", function () {
    detailQuantity = Math.max(1, detailQuantity - 1);
    setText("detailQty", detailQuantity);
  });
  document.getElementById("detailIncrease").addEventListener("click", function () {
    detailQuantity = Math.min(99, detailQuantity + 1);
    setText("detailQty", detailQuantity);
  });
  document.getElementById("detailAddToCart").addEventListener("click", function () {
    addToCart(product.id, detailQuantity);
  });
  document.getElementById("detailOrderWhatsApp").addEventListener("click", function () {
    const message = [
      "Hello, I would like to order:",
      "",
      "Product: " + product.name,
      "Size: " + getSizeLabel(product),
      "Quantity: " + detailQuantity,
      "",
      "Please share the details."
    ].join("\n");
    openWhatsApp(message);
  });
}

/* =====================================================================
   INITIALISE EVERYTHING ONCE THE PAGE HAS LOADED
   ===================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  applyBusinessConfig();
  initMobileMenu();
  initWhatsAppButtons();
  renderProductGrid();
  renderProductDetail();
});
