// Custom cursor
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mouseX = 0,
  mouseY = 0,
  ringX = 0,
  ringY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (cursor) {
    const cx = cursor.offsetWidth / 2 || 10;
    cursor.style.left = mouseX - cx + "px";
    cursor.style.top = mouseY - cx + "px";
  }
});

function animateRing() {
  const rx = ring ? ring.offsetWidth / 2 : 18;
  ringX += (mouseX - ringX - rx) * 0.12;
  ringY += (mouseY - ringY - rx) * 0.12;
  if (ring) {
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";
  }
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll("button, a, input").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    if (cursor) cursor.style.transform = "scale(2)";
    if (ring) ring.style.transform = "scale(1.4)";
  });
  el.addEventListener("mouseleave", () => {
    if (cursor) cursor.style.transform = "scale(1)";
    if (ring) ring.style.transform = "scale(1)";
  });
});

// Cart management (persisted)
const CART_KEY = "gstore_cart_v1";
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
} catch (e) {
  cart = [];
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const cartEl = document.getElementById("cartCount");
  if (!cartEl) return;
  const total = cart.reduce((s, i) => s + (i.qty || 0), 0);
  cartEl.textContent = total;
}

function addToCart(item) {
  // If no item supplied, increment a generic counter (backwards-compatible)
  if (!item) {
    item = {
      id: "book-" + Date.now(),
      title: "Book",
      author: "Unknown",
      price: 199,
      qty: 1,
      img: "",
    };
  }
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty = (existing.qty || 0) + (item.qty || 1);
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart();
  showToast("✅ বই cart-এ যোগ হয়েছে!");
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const it = cart.find((i) => i.id === id);
  if (!it) return;
  it.qty = Math.max(0, (it.qty || 0) + delta);
  if (it.qty === 0) removeFromCart(id);
  else saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
  showToast("Cart cleared");
}

function cartSubtotal() {
  return cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
}

function cartSummaryText() {
  if (!cart.length) return "My cart is empty.";
  const lines = cart.map(
    (item) => `- ${item.title} x${item.qty || 1} (₹${item.price || 0})`,
  );
  lines.push(`Subtotal: ₹${cartSubtotal()}`);
  return lines.join("\n");
}

// Drawer controls & render
const cartBtnEl = document.getElementById("cartBtn");
const cartDrawerEl = document.getElementById("cartDrawer");
const cartOverlayEl = document.getElementById("cartOverlay");

function openCart() {
  if (cartDrawerEl) cartDrawerEl.setAttribute("aria-hidden", "false");
  if (cartOverlayEl) {
    cartOverlayEl.hidden = false;
    cartOverlayEl.style.opacity = "1";
  }
  renderCart();
}

function closeCart() {
  if (cartDrawerEl) cartDrawerEl.setAttribute("aria-hidden", "true");
  if (cartOverlayEl) {
    cartOverlayEl.style.opacity = "0";
    setTimeout(() => (cartOverlayEl.hidden = true), 250);
  }
}

function renderCart() {
  const list = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  if (!list || !empty || !subtotalEl) return;
  list.innerHTML = "";
  if (!cart || cart.length === 0) {
    empty.style.display = "block";
    subtotalEl.textContent = "₹0";
    if (totalEl) totalEl.textContent = "₹0";
    return;
  }
  empty.style.display = "none";
  cart.forEach((it) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <img src="${it.img || "https://via.placeholder.com/56x72?text=Book"}" alt="${it.title}" />
      <div class="meta">
        <div class="title">${it.title}</div>
        <div class="author">${it.author || ""}</div>
        <div class="qty">
          <button data-action="dec" data-id="${it.id}">−</button>
          <div class="count">${it.qty}</div>
          <button data-action="inc" data-id="${it.id}">+</button>
          <button data-action="remove" data-id="${it.id}" style="margin-left:8px;background:transparent;border:none;cursor:pointer;color:var(--muted);">Remove</button>
        </div>
      </div>
      <div class="price">₹${(it.price || 0) * (it.qty || 0)}</div>
    `;
    list.appendChild(li);
  });
  const subtotal = cartSubtotal();
  subtotalEl.textContent = "₹" + subtotal;
  if (totalEl) totalEl.textContent = "₹" + subtotal;
  updateCartCount();
}

// Wire drawer buttons after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  if (cartBtnEl) cartBtnEl.addEventListener("click", openCart);
  const closeBtn = document.getElementById("closeCart");
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (cartOverlayEl) cartOverlayEl.addEventListener("click", closeCart);
  const clearBtn = document.getElementById("clearCart");
  if (clearBtn)
    clearBtn.addEventListener("click", () => {
      clearCart();
    });
  const checkout = document.getElementById("checkoutBtn");
  if (checkout)
    checkout.addEventListener("click", () => {
      if (!cart || cart.length === 0) return showToast("Cart is empty");
      const text = encodeURIComponent(
        `Hi গল্পশৈলী, I want to order:\n${cartSummaryText()}`,
      );
      window.open(
        `https://wa.me/919876543210?text=${text}`,
        "_blank",
        "noopener,noreferrer",
      );
      showToast("Opening WhatsApp checkout...");
    });

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart({
        id: btn.dataset.id,
        title: btn.dataset.title,
        author: btn.dataset.author,
        price: Number(btn.dataset.price || 0),
        img: btn.dataset.img || "",
        qty: 1,
      });
      openCart();
    });
  });

  // delegate qty/remove clicks
  document.getElementById("cartItems")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    if (action === "inc") changeQty(id, 1);
    if (action === "dec") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  // initial render
  renderCart();
});

// Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toastMsg");
  if (msgEl) msgEl.textContent = msg;
  if (!toast) return;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 60);
      }
    });
  },
  { threshold: 0.1 },
);
reveals.forEach((el) => observer.observe(el));

// Wishlist toggle
document.querySelectorAll(".wishlist-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.textContent === "♡") {
      this.textContent = "♥";
      this.style.color = "var(--rust)";
      this.style.borderColor = "var(--rust)";
      this.style.background = "#fef2f2";
      showToast("❤️ Wishlist-এ যোগ হয়েছে!");
    } else {
      this.textContent = "♡";
      this.style.color = "";
      this.style.borderColor = "";
      this.style.background = "";
    }
  });
});

// Open section (or footer) in a new tab when user clicks non-interactive areas.
(function () {
  function isInteractive(target) {
    return !!target.closest(
      'a, button, input, textarea, select, label, [role="button"], .wishlist-btn, .cart-btn, .view-all, .category-card, .book-card, .nav-links',
    );
  }

  const baseUrl = window.location.href.split("#")[0];
  const containers = document.querySelectorAll("section[id], footer[id]");
  containers.forEach((el) => {
    // make section focusable for keyboard activation
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;

    el.addEventListener("click", (e) => {
      if (isInteractive(e.target)) return; // allow controls to work
      const url = el.dataset.url;
      if (url) {
        // redirect to the branch/page for this section in the same tab
        window.location.href = url;
      } else {
        // fallback: open anchor with id as hash in same tab
        const id = el.id;
        if (id) window.location.href = baseUrl + "#" + id;
      }
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (isInteractive(e.target)) return;
        const url = el.dataset.url;
        if (url) {
          window.location.href = url;
        } else {
          const id = el.id;
          if (id) window.location.href = baseUrl + "#" + id;
        }
      }
    });
  });
})();

// Mobile nav toggle behavior
(function () {
  const nav = document.querySelector("nav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;

  function setOpen(open) {
    if (open) {
      nav.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
    } else {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  toggle.addEventListener("click", (e) => {
    const open = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // close when clicking outside nav links on mobile
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("nav-open")) return;
    if (e.target.closest("nav")) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
})();

// Open most links in a new tab by default, unless they are hashes or explicitly marked
(function () {
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    const lower = href.toLowerCase();
    // skip internal anchors and protocols that should stay in-place
    if (
      lower.startsWith("#") ||
      lower.startsWith("mailto:") ||
      lower.startsWith("tel:")
    )
      return;
    // allow explicitly keeping same-tab behavior using data-same-tab
    if (a.hasAttribute("data-same-tab")) return;
    // set target to _blank and add safe rel
    if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
    const rel = a.getAttribute("rel") || "";
    if (!/noopener/i.test(rel))
      a.setAttribute("rel", (rel + " noopener noreferrer").trim());
  });
})();

// Copy address button handler
const copyBtn = document.getElementById("copyAddress");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    const addrEl = document.getElementById("footerAddress");
    const text = addrEl ? addrEl.innerText.trim() : "";
    if (!text) return showToast("No address to copy");
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Address copied to clipboard"))
      .catch(() => showToast("Failed to copy address"));
  });
}
