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


        <h2>
          Your bag is empty.
        </h2>


        <p>
          Discover the latest ZUBSTUDIO collection.
        </p>


        <a
          href="#/shop"
          class="btn btn-dark"
        >
          Shop Collection
        </a>

      </section>


      ${footer()}

    `;
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = findProduct(item.productId);

    return sum + product.price * item.quantity;
  }, 0);

  return `

    <section class="cart-page">

      <p class="section-eyebrow">
        ZUBSTUDIO
      </p>


      <h1>
        Shopping Bag
      </h1>


      <div class="cart-layout">

        <div>

          ${cart
            .map((item, index) => {
              const product = findProduct(item.productId);

              return `

                <article class="cart-item">

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

                      ${product.color}
                      · Size ${item.size}

                    </p>


                    <div class="quantity">

                      <button
                        onclick="
                          changeQuantity(
                            ${index},
                            -1
                          )
                        "
                      >
                        −
                      </button>


                      <span>
                        ${item.quantity}
                      </span>


                      <button
                        onclick="
                          changeQuantity(
                            ${index},
                            1
                          )
                        "
                      >
                        +
                      </button>

                    </div>


                    <br>


                    <button
                      class="remove-button"
                      onclick="
                        removeCartItem(${index})
                      "
                    >
                      Remove
                    </button>

                  </div>


                  <div class="cart-item-price">

                    ${money(product.price * item.quantity)}

                  </div>

                </article>

              `;
            })
            .join("")}

        </div>


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
              Shipping
            </span>

            <span>
              Calculated later
            </span>

          </div>


          <div
            class="
              summary-row
              summary-total
            "
          >

            <span>
              Total
            </span>

            <span>
              ${money(subtotal)}
            </span>

          </div>


          <p class="cart-note">

            Taxes and shipping,
            if applicable,
            will be confirmed before
            your order is finalized.

          </p>


        <button
          class="btn btn-dark btn-full"
          onclick="startCheckout()"
        >
            <i class="bx bxl-whatsapp"></i>
            Order on WhatsApp
        </button>

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

function startCheckout() {
  const whatsappNumber = "919535611778";

  if (cart.length === 0) {
    showToast("Your bag is empty.");

    return;
  }

  let message = `NEW ZUBSTUDIO ORDER\n\n`;

  cart.forEach((item, index) => {
    const product = findProduct(item.productId);

    if (!product) {
      return;
    }

    const itemTotal = product.price * item.quantity;

    message += `${index + 1}. ${product.name}
Size: ${item.size}
Color: ${product.color}
Quantity: ${item.quantity}
Price: ${money(itemTotal)}

`;
  });

  const total = cart.reduce((sum, item) => {
    const product = findProduct(item.productId);

    if (!product) {
      return sum;
    }

    return sum + product.price * item.quantity;
  }, 0);

  message += `--------------------
TOTAL: ${money(total)}
--------------------

CUSTOMER DETAILS

Name:
Phone:
Delivery Address:

Please confirm availability and payment details.`;

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
