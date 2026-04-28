// ===== FORMAT RUPIAH =====
function formatRupiah(number) {
  return "Rp " + number.toLocaleString("id-ID");
}

// ===== CART STORAGE =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===== ADD TO CART =====
function addToCart(name, price, btn) {
  let cart = getCart();

  let item = cart.find(i => i.name === name);

  if (item) {
    item.qty += 1;
  } else {
    cart.push({
      name: name,
      price: Number(price),
      qty: 1
    });
  }

  setCart(cart);
  updateCart();

  if (btn) {
    btn.innerText = "✓";
    setTimeout(() => (btn.innerText = "Add"), 800);
  }

  showToast();
}

// ===== TOAST =====
function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

// ===== UPDATE CART =====
function updateCart() {
  let cart = getCart();

  let list = document.getElementById("cart-items");
  let totalEl = document.getElementById("total");
  let count = document.getElementById("cart-count");

  if (!list || !totalEl || !count) return;

  list.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;

    let li = document.createElement("li");
    li.textContent = `${item.name} x${qty}`;
    list.appendChild(li);

    total += price * qty;
    totalQty += qty;
  });

  totalEl.textContent = formatRupiah(total);
  count.textContent = totalQty;
}

// ===== CLEAR CART =====
function clearCart() {
  setCart([]);
  updateCart();
}

// ===== GO CHECKOUT =====
function goToCheckout() {
  window.location.href = "checkout.html";
}

// ===== LOAD CHECKOUT =====
function loadCheckout() {
  const list = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");

  if (!list || !totalEl) return; // ✅ prevent crash on index

  let cart = getCart();

  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const discountRow = document.getElementById("discount-row");

  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;

    const li = document.createElement("li");

    li.innerHTML = `
      <span>${item.name} x${qty}</span>
      <span>${formatRupiah(price * qty)}</span>
    `;

    list.appendChild(li);
    subtotal += price * qty;
  });

  let discountPercent = Number(localStorage.getItem("discount")) || 0;
  let discount = (subtotal * discountPercent) / 100;
  let total = subtotal - discount;

  if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);

  if (discountRow && discountEl) {
    if (discountPercent > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = "- " + formatRupiah(discount);
    } else {
      discountRow.style.display = "none";
    }
  }

  totalEl.textContent = formatRupiah(total);
}

// ===== APPLY VOUCHER =====
function applyVoucher() {
  const input = document.getElementById("voucher");
  const msg = document.getElementById("voucher-msg");

  if (!input || !msg) return;

  const code = input.value.toLowerCase();

  if (code === "sabreencantik") {
    localStorage.setItem("discount", 15);
    msg.innerText = "Voucher applied 💖";
    msg.style.color = "#d88c95";
  } else {
    localStorage.removeItem("discount");
    msg.innerText = "Invalid voucher ❌";
    msg.style.color = "red";
  }

  loadCheckout();
}

// ===== PLACE ORDER =====
function placeOrder() {
  let cart = getCart();

  if (cart.length === 0) {
    alert("Cart kosong!");
    return;
  }

  let discount = Number(localStorage.getItem("discount")) || 0;

  localStorage.setItem("lastOrder", JSON.stringify(cart));
  localStorage.setItem("lastDiscount", discount);

  localStorage.removeItem("cart");

  window.location.href = "success.html";
}

// ===== PAYMENT UI =====
function setupPaymentUI() {
  const payments = document.querySelectorAll('input[name="pay"]');
  const qrisBox = document.getElementById("qrisBox");

  if (!payments.length || !qrisBox) return;

  payments.forEach((radio, index) => {
    radio.addEventListener("change", () => {
      qrisBox.style.display = index === 0 ? "block" : "none";
    });
  });
}

// ===== LOAD RECEIPT =====
function loadReceipt() {
  const list = document.getElementById("receipt-items");
  const totalEl = document.getElementById("receipt-total");

  if (!list || !totalEl) return; // ✅ prevent crash

  const cart = JSON.parse(localStorage.getItem("lastOrder")) || [];
  const discountPercent = Number(localStorage.getItem("lastDiscount")) || 0;

  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;

    const li = document.createElement("li");

    li.innerHTML = `
      <span>${item.name} x${qty}</span>
      <span>${formatRupiah(price * qty)}</span>
    `;

    list.appendChild(li);
    subtotal += price * qty;
  });

  let discount = (subtotal * discountPercent) / 100;
  let total = subtotal - discount;

  if (discountPercent > 0) {
    const disc = document.createElement("li");
    disc.innerHTML = `
      <span>Discount (${discountPercent}%)</span>
      <span>- ${formatRupiah(discount)}</span>
    `;
    list.appendChild(disc);
  }

  totalEl.textContent = formatRupiah(total);
}

// ===== INIT (SAFE) =====
document.addEventListener("DOMContentLoaded", () => {
  updateCart();

  if (document.getElementById("checkout-items")) {
    loadCheckout();
  }

  if (document.getElementById("receipt-items")) {
    loadReceipt();
  }

  setupPaymentUI();
});