/* =========================================================
   ZUBSTUDIO
   Frontend Store
========================================================= */

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  brand: "ZUBSTUDIO",
  currency: "INR",
  locale: "en-IN",
};

/* =========================================================
   PRODUCTS
   Temporary frontend data.
   Later this comes from MongoDB through our API.
========================================================= */

const products = [
  {
    id: "signature-black-dress",

    name: "Signature Black Dress",

    price: 129,

    category: "Dresses",

    description:
      "A refined black silhouette designed with understated structure and effortless movement. Created for evenings, occasions and elevated everyday dressing.",

    images: ["./assets/churi1.jpeg", "./assets/churi1.jpeg"],

    sizes: ["XS", "S", "M", "L", "XL"],

    color: "Black",

    stock: 10,

    featured: true,

    isNew: true,
  },

  {
    id: "ivory-tailored-set",

    name: "Ivory Tailored Set",

    price: 159,

    category: "Sets",

    description:
      "Clean tailoring meets relaxed elegance. A sophisticated ivory set designed for effortless styling from day to evening.",

    images: ["./assets/churi2.jpeg", "./assets/churi2.jpeg"],

    sizes: ["XS", "S", "M", "L"],

    color: "Ivory",

    stock: 8,

    featured: true,

    isNew: true,
  },

  {
    id: "midnight-abaya",

    name: "Midnight Abaya",

    price: 145,

    category: "Abayas",

    description:
      "An elegant flowing silhouette in deep black with considered proportions and a timeless, minimal finish.",

    images: ["./assets/churi3.jpeg", "./assets/churi3.jpeg"],

    sizes: ["S", "M", "L", "XL"],

    color: "Black",

    stock: 7,

    featured: true,

    isNew: false,
  },

  {
    id: "sand-linen-set",

    name: "Sand Linen Set",

    price: 139,

    category: "Sets",

    description:
      "An easy two-piece linen-inspired set in a warm neutral tone. Designed for understated everyday luxury.",

    images: ["./assets/churi4.jpeg", "./assets/churi4.jpeg"],

    sizes: ["XS", "S", "M", "L", "XL"],

    color: "Sand",

    stock: 12,

    featured: true,

    isNew: true,
  },
];

/* =========================================================
   STATE
========================================================= */

let cart = JSON.parse(localStorage.getItem("zubstudioCart")) || [];

let activeCategory = "All";

let selectedSize = null;

/* =========================================================
   ELEMENTS
========================================================= */

const app = document.getElementById("app");

const mobileMenu = document.getElementById("mobile-nav");

const mobileMenuToggle = document.getElementById("mobile-menu-toggle");

const searchOverlay = document.getElementById("search-overlay");

const searchInput = document.getElementById("global-search");

const searchResults = document.getElementById("search-results");

/* =========================================================
   UTILITIES
========================================================= */

function money(value) {
  return new Intl.NumberFormat(CONFIG.locale, {
    style: "currency",
    currency: CONFIG.currency,
    minimumFractionDigits: 0,
  }).format(value);
}

function saveCart() {
  localStorage.setItem("zubstudioCart", JSON.stringify(cart));

  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);

  const badge = document.getElementById("cart-count");

  if (badge) {
    badge.textContent = count;
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function findProduct(id) {
  return products.find((product) => product.id === id);
}

function footer() {
  return `

    <footer class="footer">

      <div class="footer-inner">

        <div class="footer-logo">
          ZUBSTUDIO
        </div>


        <div class="footer-grid">

          <!-- BRAND -->

          <div>

            <h4>ZUBSTUDIO</h4>

            <p>
              Considered silhouettes.<br>
              Refined details.<br>
              Pieces designed to remain.
            </p>

          </div>


          <!-- EXPLORE -->

          <div>

            <h4>Explore</h4>

            <div class="footer-links">

              <a href="#/shop">
                Shop
              </a>

              <a href="#/shop">
                New Arrivals
              </a>

              <a href="#/about">
                Our Story
              </a>

              <a href="#/cart">
                Shopping Bag
              </a>

            </div>

          </div>


          <!-- CONTACT -->

          <div>

            <h4>Contact</h4>

            <div class="footer-links">

              <a href="tel:+919535611778">
                +91 95356 11778
              </a>

              <a
                href="https://wa.me/919535611778"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>

              <a
                href="https://www.instagram.com/zubstudio_by_subi?stkn=MTl5YXB6Z2t5M2RsNA=="
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>

            </div>

          </div>

        </div>


        <div class="footer-bottom">

          <span>
            © ${new Date().getFullYear()} ZUBSTUDIO
          </span>

          <span>
            DESIGNED WITH INTENTION
          </span>

        </div>

      </div>

    </footer>

  `;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function productCard(product) {
  return `

    <article class="product-card">

      <a
        href="#/product/${product.id}"
        class="product-image-wrap"
      >

        ${
          product.isNew
            ? `
              <span class="product-badge">
                New
              </span>
            `
            : ""
        }


        <img
          class="product-image"
          src="${product.images[0]}"
          alt="${product.name}"
          loading="lazy"
        >


        <button
          class="quick-add"
          type="button"
          onclick="
            event.preventDefault();
            event.stopPropagation();
            quickAdd('${product.id}');
          "
        >
          Quick Add
        </button>

      </a>


      <div class="product-info">

        <p class="product-category">
          ${product.category}
        </p>


        <a href="#/product/${product.id}">

          <h3 class="product-name">
            ${product.name}
          </h3>

        </a>


        <p class="product-price">
          ${money(product.price)}
        </p>

      </div>

    </article>

  `;
}

/* =========================================================
   HOME
========================================================= */

function homePage() {
  const featured = products.filter((product) => product.featured);

  return `

    <!-- HERO -->

    <section class="hero">

      <div class="hero-content">

        <p class="hero-eyebrow">
          ZUBSTUDIO — NEW COLLECTION
        </p>


        <h1>
          Quiet luxury.<br>
          Lasting presence.
        </h1>


        <p class="hero-description">
          Timeless silhouettes,
          considered details and effortless pieces
          created for the modern wardrobe.
        </p>


        <div class="hero-actions">

          <a
            href="#/shop"
            class="btn btn-light"
          >
            Shop Collection
          </a>


          <a
            href="#/about"
            class="btn btn-outline-light"
          >
            Discover ZUBSTUDIO
          </a>

        </div>

      </div>

    </section>



    <!-- FEATURED -->

    <section class="section">

      <div class="section-header">

        <div>

          <p class="section-eyebrow">
            The Edit
          </p>

          <h2 class="section-title">
            New Arrivals
          </h2>

        </div>


        <a
          class="text-link"
          href="#/shop"
        >
          View Collection
        </a>

      </div>


      <div class="product-grid">

        ${featured.map(productCard).join("")}

      </div>

    </section>



    <!-- EDITORIAL -->

    <section class="editorial">

      <div class="editorial-image"></div>


      <div class="editorial-copy">

        <p class="section-eyebrow">
          The ZUBSTUDIO Philosophy
        </p>


        <h2>
          Elegance without excess.
        </h2>


        <p>
          We believe the most memorable pieces
          do not need to demand attention.
          ZUBSTUDIO is an exploration of proportion,
          simplicity and timeless femininity.
        </p>


        <div>

          <a
            href="#/shop"
            class="btn btn-dark"
          >
            Explore The Collection
          </a>

        </div>

      </div>

    </section>


    ${footer()}

  `;
}

/* =========================================================
   SHOP
========================================================= */

function shopPage() {
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return `

    <section class="shop-header">

      <p class="section-eyebrow">
        ZUBSTUDIO
      </p>


      <h1>
        The Collection
      </h1>


      <p>
        Refined wardrobe pieces designed
        with intention, versatility and
        enduring style.
      </p>

    </section>


    <div class="shop-toolbar">

      <div class="filters">

        ${categories
          .map(
            (category) => `

            <button
              class="
                filter-button
                ${activeCategory === category ? "active" : ""}
              "
              onclick="
                setCategory('${category}')
              "
            >
              ${category}
            </button>

          `,
          )
          .join("")}

      </div>


      <div class="product-count">

        ${filtered.length}
        ${filtered.length === 1 ? "piece" : "pieces"}

      </div>

    </div>


    <section class="shop-products">

      <div class="product-grid">

        ${filtered.map(productCard).join("")}

      </div>

    </section>


    ${footer()}

  `;
}

function setCategory(category) {
  activeCategory = category;

  render();
}

/* =========================================================
   PRODUCT PAGE
========================================================= */

function productPage(id) {
  const product = findProduct(id);

  if (!product) {
    return `
      <div class="empty-cart">

        <h2>
          Product not found
        </h2>

        <a
          href="#/shop"
          class="btn btn-dark"
        >
          Return to Shop
        </a>

      </div>
    `;
  }

  selectedSize = null;

  return `

    <section class="product-page">

      <div class="product-gallery">

        ${product.images
          .map(
            (image) => `

            <img
              src="${image}"
              alt="${product.name}"
            >

          `,
          )
          .join("")}

      </div>


      <div class="product-details">

        <p class="product-category">
          ${product.category}
        </p>


        <h1>
          ${product.name}
        </h1>


        <p class="detail-price">
          ${money(product.price)}
        </p>


        <p class="detail-description">
          ${product.description}
        </p>


        <div class="option-label">

          <span>
            Select Size
          </span>

          <span>
            Size Guide
          </span>

        </div>


        <div class="size-options">

          ${product.sizes
            .map(
              (size) => `

              <button
                class="size-button"
                data-size="${size}"
                onclick="
                  chooseSize(
                    '${size}',
                    this
                  )
                "
              >
                ${size}
              </button>

            `,
            )
            .join("")}

        </div>


        <button
          class="product-add"
          onclick="
            addToCart('${product.id}')
          "
        >
          Add to Bag — ${money(product.price)}
        </button>


        <div class="detail-meta">

          <div class="detail-meta-row">

            <span>Color</span>

            <span>
              ${product.color}
            </span>

          </div>


          <div class="detail-meta-row">

            <span>Availability</span>

            <span>
              ${product.stock > 0 ? "In Stock" : "Sold Out"}
            </span>

          </div>


          <div class="detail-meta-row">

            <span>Shipping</span>

            <span>
              Calculated at checkout
            </span>

          </div>

        </div>

      </div>

    </section>


    ${footer()}

  `;
}

function chooseSize(size, button) {
  selectedSize = size;

  document.querySelectorAll(".size-button").forEach((item) => {
    item.classList.remove("selected");
  });

  button.classList.add("selected");
}

/* =========================================================
   CART ACTIONS
========================================================= */

function addToCart(productId) {
  const product = findProduct(productId);

  if (!product) {
    return;
  }

  if (!selectedSize) {
    showToast("Please select your size.");

    return;
  }

  const existing = cart.find(
    (item) => item.productId === productId && item.size === selectedSize,
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId,

      size: selectedSize,

      quantity: 1,
    });
  }

  saveCart();

  showToast(`${product.name} added to your bag.`);
}

function quickAdd(productId) {
  window.location.hash = `#/product/${productId}`;
}

/* =========================================================
   CART PAGE
========================================================= */

function cartPage() {
  if (cart.length === 0) {
    return `
      <section class="empty-cart">

        <i class="bx bx-shopping-bag"></i>

        <h2>Your bag is empty</h2>

        <p>
          Discover the latest ZUBSTUDIO collection.
        </p>

        <a
          href="#/shop"
          class="btn btn-dark"
        >
          Continue Shopping
        </a>

      </section>

      ${footer()}
    `;
  }

  let subtotal = 0;

  const cartItems = cart
    .map((item) => {
      const product = findProduct(item.productId);

      if (!product) {
        return "";
      }

      const itemTotal = product.price * item.quantity;

      subtotal += itemTotal;

      return `

      <div class="cart-item">

        <a
          href="#/product/${product.id}"
        >
          <img
            class="cart-item-image"
            src="${product.images[0]}"
            alt="${product.name}"
          >
        </a>


        <div>

          <h3>
            ${product.name}
          </h3>

          <p class="cart-item-meta">
            Size: ${item.size}
            &nbsp;•&nbsp;
            ${product.color || ""}
          </p>


          <div class="quantity">

            <button
              type="button"
              onclick="changeQuantity(
                '${item.productId}',
                '${item.size}',
                -1
              )"
              aria-label="Decrease quantity"
            >
              −
            </button>


            <span>
              ${item.quantity}
            </span>


            <button
              type="button"
              onclick="changeQuantity(
                '${item.productId}',
                '${item.size}',
                1
              )"
              aria-label="Increase quantity"
            >
              +
            </button>

          </div>


          <br>


          <button
            type="button"
            class="remove-button"
            onclick="removeCartItem(
              '${item.productId}',
              '${item.size}'
            )"
          >
            Remove
          </button>

        </div>


        <div class="cart-item-price">
          ${money(itemTotal)}
        </div>

      </div>

    `;
    })
    .join("");

  return `

    <section class="cart-page">

      <h1>Your Bag</h1>


      <div class="checkout-layout">


        <!-- =========================================
             LEFT SIDE
             CART + CUSTOMER DETAILS
        ========================================== -->

        <div>

          <div class="cart-items">

            ${cartItems}

          </div>


          <!-- =====================================
               DELIVERY DETAILS
          ====================================== -->

          <div class="delivery-section">

            <p class="checkout-eyebrow">
              Checkout
            </p>

            <h2>
              Delivery Details
            </h2>

            <p class="delivery-intro">
              Enter your delivery information below.
              Your complete order will then be sent
              to ZUBSTUDIO through WhatsApp.
            </p>


            <div class="checkout-form">


              <!-- NAME -->

              <div class="form-group form-full">

                <label for="customerName">
                  Full Name
                </label>

                <input
                  id="customerName"
                  type="text"
                  placeholder="Your full name"
                  autocomplete="name"
                >

              </div>


              <!-- PHONE -->

              <div class="form-group form-full">

                <label for="customerPhone">
                  Phone Number
                </label>

                <input
                  id="customerPhone"
                  type="tel"
                  placeholder="Your phone number"
                  autocomplete="tel"
                >

              </div>


              <!-- ADDRESS -->

              <div class="form-group form-full">

                <label for="customerAddress">
                  Delivery Address
                </label>

                <textarea
                  id="customerAddress"
                  placeholder="House / apartment, street, area"
                  autocomplete="street-address"
                  rows="3"
                ></textarea>

              </div>


              <!-- CITY -->

              <div class="form-group">

                <label for="customerCity">
                  City
                </label>

                <input
                  id="customerCity"
                  type="text"
                  placeholder="City"
                  autocomplete="address-level2"
                >

              </div>


              <!-- STATE -->

              <div class="form-group">

                <label for="customerState">
                  State
                </label>

                <input
                  id="customerState"
                  type="text"
                  placeholder="State"
                  autocomplete="address-level1"
                >

              </div>


              <!-- PIN CODE -->

              <div class="form-group form-full">

                <label for="customerPin">
                  PIN Code
                </label>

                <input
                  id="customerPin"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="6-digit PIN code"
                  autocomplete="postal-code"
                >

              </div>


            </div>


            <div
              id="checkoutError"
              class="checkout-error"
            ></div>

          </div>

        </div>



        <!-- =========================================
             RIGHT SIDE
             ORDER SUMMARY
        ========================================== -->

        <aside class="cart-summary">

          <h2>
            Order Summary
          </h2>


          <div class="summary-row">

            <span>
              Subtotal
            </span>

            <span>
              ${money(subtotal)}
            </span>

          </div>


          <div class="summary-row">

            <span>
              Delivery
            </span>

            <span>
              Confirm on WhatsApp
            </span>

          </div>


          <div class="summary-row summary-total">

            <span>
              Total
            </span>

            <span>
              ${money(subtotal)}
            </span>

          </div>


          <p class="cart-note">
            Delivery charges and payment details
            will be confirmed by ZUBSTUDIO.
          </p>


          <button
            type="button"
            class="whatsapp-order-button"
            onclick="startCheckout()"
          >

            <i class="bx bxl-whatsapp"></i>

            Place Order on WhatsApp

          </button>


          <p class="whatsapp-note">
            Your order and delivery details will
            be prepared automatically. You only
            need to send the message in WhatsApp.
          </p>

        </aside>


      </div>

    </section>


    ${footer()}

  `;
}

function changeQuantity(index, amount) {
  if (!cart[index]) {
    return;
  }

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();

  render();
}

function removeCartItem(index) {
  cart.splice(index, 1);

  saveCart();

  render();
}

/* =========================================================
   CHECKOUT PLACEHOLDER
========================================================= */

/* =========================================================
   GET PUBLIC PRODUCT IMAGE URL
========================================================= */

function getProductImageURL(product) {
  const image = product.images?.[0];

  if (!image) {
    return "";
  }

  /* API / CLOUDINARY / FULL URL */

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  /* LOCAL ASSETS IMAGE */

  return new URL(image, window.location.href).href;
}

/* =========================================================
   WHATSAPP CHECKOUT
========================================================= */

function startCheckout() {
  /* -------------------------------------------------------
     MAKE SURE CART IS NOT EMPTY
  ------------------------------------------------------- */

  if (cart.length === 0) {
    showToast("Your bag is empty.");

    return;
  }

  /* -------------------------------------------------------
     GET CUSTOMER DETAILS
  ------------------------------------------------------- */

  const name = document.getElementById("customerName")?.value.trim();

  const phone = document.getElementById("customerPhone")?.value.trim();

  const address = document.getElementById("customerAddress")?.value.trim();

  const city = document.getElementById("customerCity")?.value.trim();

  const state = document.getElementById("customerState")?.value.trim();

  const pin = document.getElementById("customerPin")?.value.trim();

  const errorBox = document.getElementById("checkoutError");

  /* -------------------------------------------------------
     VALIDATE
  ------------------------------------------------------- */

  if (!name || !phone || !address || !city || !state || !pin) {
    if (errorBox) {
      errorBox.textContent =
        "Please complete all delivery details before placing your order.";
    }

    return;
  }

  /* PIN VALIDATION */

  if (!/^\d{6}$/.test(pin)) {
    if (errorBox) {
      errorBox.textContent = "Please enter a valid 6-digit PIN code.";
    }

    return;
  }

  /* PHONE VALIDATION */

  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    if (errorBox) {
      errorBox.textContent = "Please enter a valid phone number.";
    }

    return;
  }

  if (errorBox) {
    errorBox.textContent = "";
  }

  /* =======================================================
     ZUBSTUDIO WHATSAPP NUMBER

     CHANGE THIS TO THE REAL NUMBER.

     Example:
     919876543210

     NO +
     NO SPACES
     NO DASHES
  ======================================================= */

  const whatsappNumber = "919535611778";

  /* -------------------------------------------------------
     CREATE ORDER
  ------------------------------------------------------- */

  let message = `*NEW ZUBSTUDIO ORDER*

`;

  let total = 0;

  let orderNumber = 1;

  cart.forEach((item) => {
    const product = findProduct(item.productId);

    if (!product) {
      return;
    }

    const itemTotal = product.price * item.quantity;

    total += itemTotal;

    const imageURL = getProductImageURL(product);

    message += `*${orderNumber}. ${product.name}*

Size: ${item.size}
Color: ${product.color || "-"}
Quantity: ${item.quantity}
Price: ${money(itemTotal)}
`;

    /*
      Product image link.
      Works with /assets now and
      full API image URLs later.
    */

    if (imageURL) {
      message += `
Product Image:
${imageURL}
`;
    }

    message += `
`;

    orderNumber++;
  });

  /* -------------------------------------------------------
     TOTAL
  ------------------------------------------------------- */

  message += `──────────────────
*TOTAL: ${money(total)}*
──────────────────

`;

  /* -------------------------------------------------------
     CUSTOMER DETAILS
  ------------------------------------------------------- */

  message += `*DELIVERY DETAILS*

Name: ${name}
Phone: ${phone}

Address:
${address}

City: ${city}
State: ${state}
PIN Code: ${pin}

Please confirm availability, delivery charges and payment details.`;

  /* -------------------------------------------------------
     OPEN WHATSAPP
  ------------------------------------------------------- */

  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank", "noopener,noreferrer");
}

/* =========================================================
   ABOUT
========================================================= */

function aboutPage() {
  return `

    <section class="about-hero">

      <div>

        <p class="section-eyebrow">
          Our Story
        </p>


        <h1>
          Designed to be remembered.
        </h1>


        <p>

          ZUBSTUDIO is built around a simple idea:
          clothing can feel expressive without being excessive.

          Our collections celebrate considered silhouettes,
          refined details and pieces designed to move
          effortlessly through the moments that matter.

        </p>

      </div>

    </section>


    ${footer()}

  `;
}

/* =========================================================
   SEARCH
========================================================= */

function openSearch() {
  searchOverlay.classList.add("open");

  searchOverlay.setAttribute("aria-hidden", "false");

  document.body.classList.add("no-scroll");

  setTimeout(() => {
    searchInput.focus();
  }, 200);
}

function closeSearch() {
  searchOverlay.classList.remove("open");

  searchOverlay.setAttribute("aria-hidden", "true");

  document.body.classList.remove("no-scroll");

  searchInput.value = "";

  searchResults.innerHTML = "";
}

function runSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    searchResults.innerHTML = "";

    return;
  }

  const matches = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.color.toLowerCase().includes(query)
    );
  });

  if (!matches.length) {
    searchResults.innerHTML = `

      <div class="search-result">
        No pieces found.
      </div>

    `;

    return;
  }

  searchResults.innerHTML = matches
    .map(
      (product) => `

        <a
          class="search-result"
          href="#/product/${product.id}"
          onclick="closeSearch()"
        >

          ${product.name}
          — ${money(product.price)}

        </a>

      `,
    )
    .join("");
}

/* =========================================================
   ROUTER
========================================================= */

function getRoute() {
  const hash = window.location.hash || "#/home";

  return hash.replace("#/", "").split("/");
}

function render() {
  const [page, parameter] = getRoute();

  mobileMenu.classList.remove("open");

  switch (page) {
    case "shop":
      app.innerHTML = shopPage();
      break;

    case "product":
      app.innerHTML = productPage(parameter);
      break;

    case "cart":
      app.innerHTML = cartPage();
      break;

    case "about":
      app.innerHTML = aboutPage();
      break;

    /* ==========================================
       ADMIN
    ========================================== */

    case "admin":
      app.innerHTML = adminPage();
      break;

    case "home":

    default:
      app.innerHTML = homePage();
      break;
  }

  updateCartCount();

  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  });
}

/* =========================================================
   EVENTS
========================================================= */

mobileMenuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});

document.querySelector(".search-toggle").addEventListener("click", openSearch);

document.getElementById("search-close").addEventListener("click", closeSearch);

searchOverlay.addEventListener("click", (event) => {
  if (event.target === searchOverlay) {
    closeSearch();
  }
});

searchInput.addEventListener("input", runSearch);

window.addEventListener("hashchange", render);

/* =========================================================
   INITIALIZE
========================================================= */

updateCartCount();

render();

/* =========================================================
   ZUBSTUDIO ADMIN
   FRONTEND ONLY FOR NOW

   Later:
   Publish -> /api/products -> MongoDB
   Images -> Cloudinary -> URLs stored in MongoDB
========================================================= */

let adminImages = [];

/* =========================================================
   ADMIN PAGE
========================================================= */

function adminPage() {
  return `
    <section class="admin-page">

      <div class="admin-header">

        <div>
          <p class="admin-eyebrow">
            ZUBSTUDIO
          </p>

          <h1>
            Product Manager
          </h1>

          <p class="admin-subtitle">
            Add new products to your online collection.
          </p>
        </div>

        <a
          href="#/shop"
          class="admin-view-store"
        >
          View Store
          <i class="bx bx-right-arrow-alt"></i>
        </a>

      </div>


      <div class="admin-layout">


        <!-- =========================================
             LEFT SIDE
             PRODUCT FORM
        ========================================== -->

        <div class="admin-card">

          <div class="admin-card-heading">

            <span class="admin-step">
              01
            </span>

            <div>
              <h2>
                Product Information
              </h2>

              <p>
                Enter the details customers will see.
              </p>
            </div>

          </div>


          <div class="admin-form">


            <!-- PRODUCT NAME -->

            <div class="admin-field admin-full">

              <label for="adminProductName">
                Product Name
              </label>

              <input
                id="adminProductName"
                type="text"
                placeholder="e.g. Falah Premium Pure Cotton Collection"
              >

            </div>


            <!-- CODE -->

            <div class="admin-field">

              <label for="adminProductCode">
                Product Code
              </label>

              <input
                id="adminProductCode"
                type="text"
                placeholder="e.g. Nop37"
              >

            </div>


            <!-- PRICE -->

            <div class="admin-field">

              <label for="adminProductPrice">
                Price
              </label>

              <div class="admin-price-input">

                <span>
                  ₹
                </span>

                <input
                  id="adminProductPrice"
                  type="number"
                  min="0"
                  placeholder="1599"
                >

              </div>

            </div>


            <!-- CATEGORY -->

            <div class="admin-field">

              <label for="adminProductCategory">
                Category
              </label>

              <select id="adminProductCategory">

                <option value="Sets">
                  Sets
                </option>

                <option value="Dresses">
                  Dresses
                </option>

                <option value="Kurtas">
                  Kurtas
                </option>

                <option value="Abayas">
                  Abayas
                </option>

                <option value="New Arrivals">
                  New Arrivals
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            <!-- AVAILABILITY -->

            <div class="admin-field">

              <label for="adminProductStatus">
                Availability
              </label>

              <select id="adminProductStatus">

                <option value="available">
                  Available
                </option>

                <option value="sold-out">
                  Sold Out
                </option>

              </select>

            </div>


            <!-- DESCRIPTION -->

            <div class="admin-field admin-full">

              <label for="adminProductDescription">
                Product Description
              </label>

              <textarea
                id="adminProductDescription"
                rows="7"
                placeholder="Top heavy Cotton embroidered&#10;Bottom Cotton&#10;Dupatta Cotton Dup Embroidered"
              ></textarea>

              <p class="admin-field-help">
                You can paste the same description you normally
                send on WhatsApp.
              </p>

            </div>


          </div>

        </div>



        <!-- =========================================
             IMAGE UPLOAD
        ========================================== -->

        <div class="admin-card">

          <div class="admin-card-heading">

            <span class="admin-step">
              02
            </span>

            <div>

              <h2>
                Product Photos
              </h2>

              <p>
                Upload multiple photos of the outfit.
              </p>

            </div>

          </div>


          <label
            for="adminImageUpload"
            class="admin-upload-box"
          >

            <i class="bx bx-image-add"></i>

            <strong>
              Add Product Photos
            </strong>

            <span>
              Choose images from your phone or computer
            </span>

            <span class="admin-upload-button">
              Select Photos
            </span>

          </label>


          <input
            id="adminImageUpload"
            class="admin-file-input"
            type="file"
            accept="image/*"
            multiple
            onchange="handleAdminImages(event)"
          >


          <div
            id="adminImagePreview"
            class="admin-image-preview"
          ></div>

        </div>



        <!-- =========================================
             PUBLISH
        ========================================== -->

        <div class="admin-publish-card">

          <div>

            <p class="admin-publish-label">
              Ready to publish?
            </p>

            <h2>
              Add this product to ZUBSTUDIO
            </h2>

            <p>
              Once the backend is connected, publishing will
              immediately make this product available in the shop.
            </p>

          </div>


          <button
            type="button"
            class="admin-publish-button"
            onclick="publishAdminProduct()"
          >

            Publish Product

            <i class="bx bx-right-arrow-alt"></i>

          </button>


          <div
            id="adminMessage"
            class="admin-message"
          ></div>

        </div>


      </div>

    </section>
  `;
}

/* =========================================================
   IMAGE PREVIEW
========================================================= */

function handleAdminImages(event) {
  const files = Array.from(event.target.files);

  if (!files.length) {
    return;
  }

  files.forEach((file) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      adminImages.push({
        file: file,
        preview: e.target.result,
      });

      renderAdminImages();
    };

    reader.readAsDataURL(file);
  });
}

/* =========================================================
   RENDER IMAGE PREVIEWS
========================================================= */

function renderAdminImages() {
  const container = document.getElementById("adminImagePreview");

  if (!container) {
    return;
  }

  container.innerHTML = adminImages
    .map((image, index) => {
      return `

          <div class="admin-preview-image">

            <img
              src="${image.preview}"
              alt="Product preview"
            >

            ${
              index === 0
                ? `
                  <span class="admin-cover-label">
                    Cover
                  </span>
                `
                : ""
            }


            <button
              type="button"
              onclick="removeAdminImage(${index})"
              aria-label="Remove image"
            >
              <i class="bx bx-x"></i>
            </button>

          </div>

        `;
    })
    .join("");
}

/* =========================================================
   REMOVE UPLOADED IMAGE
========================================================= */

function removeAdminImage(index) {
  adminImages.splice(index, 1);

  renderAdminImages();
}

/* =========================================================
   PUBLISH PRODUCT
   FRONTEND TEST FOR NOW
========================================================= */

function publishAdminProduct() {
  const name = document.getElementById("adminProductName")?.value.trim();

  const code = document.getElementById("adminProductCode")?.value.trim();

  const price = document.getElementById("adminProductPrice")?.value;

  const category = document.getElementById("adminProductCategory")?.value;

  const status = document.getElementById("adminProductStatus")?.value;

  const description = document
    .getElementById("adminProductDescription")
    ?.value.trim();

  const message = document.getElementById("adminMessage");

  if (!name || !code || !price || !description) {
    message.innerHTML = `
        <span class="admin-error">
          Please complete the product name,
          code, price and description.
        </span>
      `;

    return;
  }

  if (adminImages.length === 0) {
    message.innerHTML = `
        <span class="admin-error">
          Please add at least one product photo.
        </span>
      `;

    return;
  }

  const product = {
    name: name,

    code: code,

    price: Number(price),

    category: category,

    status: status,

    description: description,

    images: adminImages.map((image) => image.file.name),
  };

  /*
     FRONTEND TEST ONLY.

     Later this is where we'll:

     1. Upload images to Cloudinary
     2. Receive image URLs
     3. POST product to /api/products
     4. Save product to MongoDB
  */

  console.log("ZUBSTUDIO PRODUCT:", product);

  message.innerHTML = `
      <span class="admin-success">
        ✓ Product is ready.

        Backend connection is the next step.
      </span>
    `;
}
