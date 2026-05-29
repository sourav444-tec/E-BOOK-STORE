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
    cursor.style.left = mouseX - 6 + "px";
    cursor.style.top = mouseY - 6 + "px";
  }
});

function animateRing() {
  ringX += (mouseX - ringX - 18) * 0.12;
  ringY += (mouseY - ringY - 18) * 0.12;
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

// Cart counter
let cartItems = 0;
function addToCart() {
  cartItems++;
  const cartEl = document.getElementById("cartCount");
  if (cartEl) cartEl.textContent = cartItems;
  showToast("✅ বই cart-এ যোগ হয়েছে!");
}

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
