/* =====================================================================
   CHECKOUT.JS
   =====================================================================
   Handles the delivery-details form on checkout.html: validating the
   fields, building the WhatsApp order message from the cart + form
   data, and showing the "Order Ready" confirmation.
   This file is only loaded on checkout.html.
   ===================================================================== */

/**
 * Checks the checkout form's values and shows/hides error messages.
 * Returns true if everything is valid, false otherwise.
 */
function validateCheckoutForm(data) {
  let isValid = true;

  const checks = {
    name: data.name.trim().length > 0,
    mobile: /^[6-9]\d{9}$/.test(data.mobile.trim()),
    whatsapp: data.whatsapp.trim() === "" || /^[6-9]\d{9}$/.test(data.whatsapp.trim()),
    address: data.address.trim().length > 0,
    city: data.city.trim().length > 0,
    pin: /^\d{6}$/.test(data.pin.trim())
  };

  Object.keys(checks).forEach(function (fieldName) {
    setFieldError(fieldName, !checks[fieldName]);
    if (!checks[fieldName]) isValid = false;
  });

  return isValid;
}

function setFieldError(fieldName, showError) {
  const field = document.querySelector('.field[data-field="' + fieldName + '"]');
  if (!field) return;
  field.classList.toggle("invalid", showError);
}

/**
 * Builds the full WhatsApp order message using the cart contents and
 * the customer's delivery details, in the exact format the business
 * needs to process the order.
 */
function generateWhatsAppMessage(customer) {
  const orderLines = cart.map(function (item) {
    const product = getProductById(item.id);
    return product.name + " – " + product.size + " × " + item.quantity;
  });

  const subtotal = calculateSubtotal();
  const delivery = calculateDelivery();
  const total = calculateTotal();

  const lines = [
    "New Coconut Oil Order 🥥",
    "",
    "Customer Details",
    "",
    "Name: " + customer.name,
    "Phone: " + customer.mobile,
    "WhatsApp: " + customer.whatsapp,
    "",
    "Order:",
    "",
  ].concat(orderLines).concat([
    "",
    "Subtotal: " + formatPrice(subtotal),
    "Delivery: " + (delivery === 0 ? "Free" : formatPrice(delivery)),
    "Total: " + formatPrice(total),
    "",
    "Delivery Address:",
    "",
    customer.address,
    customer.city,
    "PIN Code: " + customer.pin,
    "",
    "Additional Note:",
    customer.note && customer.note.trim() ? customer.note : "-",
    "",
    "Please confirm my order."
  ]);

  return lines.join("\n");
}

function initCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return; // We're not on checkout.html.

  // If the cart is empty, there's nothing to check out — send the
  // customer back to the products.
  if (cart.length === 0) {
    const emptyNotice = document.getElementById("checkoutEmptyNotice");
    if (emptyNotice) emptyNotice.style.display = "block";
    form.style.display = "none";
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const customer = {
      name: form.name.value,
      mobile: form.mobile.value,
      whatsapp: form.whatsapp.value || form.mobile.value,
      address: form.address.value,
      city: form.city.value,
      pin: form.pin.value,
      note: form.note.value
    };

    if (!validateCheckoutForm(customer)) {
      showToast("Please fix the highlighted fields.");
      return;
    }

    const message = generateWhatsAppMessage(customer);
    openWhatsApp(message);

    // The order has been handed off to WhatsApp — clear the cart and
    // show the "Order Ready" confirmation. We do NOT say the order was
    // placed, because the customer still needs to press Send.
    cart = [];
    saveCart(cart);
    renderCartBadge();

    form.style.display = "none";
    const successState = document.getElementById("checkoutSuccess");
    if (successState) successState.style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", initCheckoutForm);
