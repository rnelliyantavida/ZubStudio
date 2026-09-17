/* =========================================================
   ZUBSTUDIO
   FRONTEND STORE + ADMIN + API
========================================================= */

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  brand: "ZUBSTUDIO",

  currency: "INR",

  locale: "en-IN",

  /* LOCAL BACKEND */
  api: "https://zubstudio-backend.onrender.com/api",

  /* ZUBSTUDIO WHATSAPP */
  whatsappNumber: "919535611778",

  /* NUMBER OF PRODUCTS ON HOMEPAGE */
  homeNewArrivalLimit: 4,

  /* HOW MANY DAYS COUNT AS "NEW" */
  newArrivalDays: 3,
};

/* =========================================================
   STATE
========================================================= */

let products = [];

let productsLoaded = false;

let productsLoading = false;

let productLoadError = "";

let cart = JSON.parse(localStorage.getItem("zubstudioCart")) || [];

let selectedSize = null;

let adminImages = [];

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
   MONEY
========================================================= */

function money(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat(CONFIG.locale, {
    style: "currency",

    currency: CONFIG.currency,

    minimumFractionDigits: 0,

    maximumFractionDigits: 0,
  }).format(number);
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   PRODUCT ID

   MongoDB gives us _id.

   Local/future data may have id.

   This function supports both.
========================================================= */

function productId(product) {
  return String(product?._id || product?.id || "");
}

/* =========================================================
   FIND PRODUCT
========================================================= */

function findProduct(id) {
  return products.find((product) => productId(product) === String(id));
}

/* =========================================================
   PRODUCT IMAGES

   Backend returns:

   images: [
     {
       url: "...",
       publicId: "..."
     }
   ]

   This converts that into:

   [
     "https://..."
   ]
========================================================= */

function getProductImages(product) {
  if (!Array.isArray(product?.images)) {
    return [];
  }

  return product.images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      return image?.url || "";
    })
    .filter(Boolean);
}

function getProductImageURL(product) {
  return getProductImages(product)[0] || "";
}

/* =========================================================
   OPTIONAL SIZES

   If backend doesn't send sizes,
   no sizes are created.
========================================================= */

function getProductSizes(product) {
  if (!Array.isArray(product?.sizes)) {
    return [];
  }

  return product.sizes.filter(
    (size) => size !== null && size !== undefined && String(size).trim() !== "",
  );
}

function productHasSizes(product) {
  return getProductSizes(product).length > 0;
}

/* =========================================================
   SOLD OUT
========================================================= */

function isSoldOut(product) {
  if (product?.status === "sold-out") {
    return true;
  }

  if (
    product?.stock !== undefined &&
    product?.stock !== null &&
    Number(product.stock) <= 0
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   NEW ARRIVALS

   THIS IS NOW BASED ON MONGODB createdAt.

   NOT CATEGORY.
   NOT isNew.
========================================================= */

function sortNewestFirst(productList) {
  return [...productList].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();

    const dateB = new Date(b.createdAt || 0).getTime();

    return dateB - dateA;
  });
}

/* =========================================================
   GET LATEST PRODUCTS

   Used on homepage.

   Example:
   newest 4 products.
========================================================= */

function getLatestProducts(limit = CONFIG.homeNewArrivalLimit) {
  return sortNewestFirst(
    products.filter((product) => product.status !== "sold-out"),
  ).slice(0, limit);
}

/* =========================================================
   IS PRODUCT NEW?

   A product is "New" if created
   within the configured number
   of days.
========================================================= */

function isNewProduct(product) {
  if (!product?.createdAt) {
    return false;
  }

  const created = new Date(product.createdAt).getTime();

  if (Number.isNaN(created)) {
    return false;
  }

  const now = Date.now();

  const age = now - created;

  const maxAge = CONFIG.newArrivalDays * 24 * 60 * 60 * 1000;

  return age >= 0 && age <= maxAge;
}

/* =========================================================
   GET NEW ARRIVALS

   Shows products added within
   last 30 days.
========================================================= */

function getNewArrivals() {
  return sortNewestFirst(products.filter((product) => isNewProduct(product)));
}

/* =========================================================
   CART STORAGE
========================================================= */

function saveCart() {
  localStorage.setItem(
    "zubstudioCart",

    JSON.stringify(cart),
  );

  updateCartCount();
}

/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {
  const count = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),

    0,
  );

  const badge = document.getElementById("cart-count");

  if (badge) {
    badge.textContent = count;
  }
}

/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(
    () => {
      toast.classList.remove("show");
    },

    2600,
  );
}

/* =========================================================
   LOAD PRODUCTS FROM API
========================================================= */

async function loadProducts(force = false) {
  if (productsLoading) {
    return;
  }

  if (productsLoaded && !force) {
    return;
  }

  productsLoading = true;

  productLoadError = "";

  try {
    const response = await fetch(`${CONFIG.api}/products`);

    if (!response.ok) {
      throw new Error(`Unable to load products (${response.status})`);
    }

    const result = await response.json();

    /*
      Supports:

      [
        product,
        product
      ]

      OR

      {
        products: [...]
      }
    */

    if (Array.isArray(result)) {
      products = result;
    } else if (Array.isArray(result.products)) {
      products = result.products;
    } else {
      products = [];
    }

    /*
      Always keep newest
      products first.
    */

    products = sortNewestFirst(products);

    productsLoaded = true;

    cleanCart();
  } catch (error) {
    console.error("Product loading error:", error);

    productLoadError = "We couldn't load the collection.";

    products = [];
  } finally {
    productsLoading = false;
  }
}

/* =========================================================
   CLEAN CART

   Removes products that no
   longer exist.
========================================================= */

function cleanCart() {
  const cleaned = cart.filter((item) => findProduct(item.productId));

  if (cleaned.length !== cart.length) {
    cart = cleaned;

    saveCart();
  }
}

/* =========================================================
   FOOTER
========================================================= */

function footer() {
  return `

    <footer class="footer">

      <div class="footer-inner">


        <div class="footer-logo">

          ZUBSTUDIO

        </div>


        <div class="footer-grid">


          <div>

            <h4>
              ZUBSTUDIO
            </h4>

            <p>

              Considered silhouettes.<br>

              Refined details.<br>

              Pieces designed to remain.

            </p>

          </div>


          <div>

            <h4>
              Explore
            </h4>


            <div class="footer-links">

              <a href="#/shop">
                Shop
              </a>


              <a href="#/new">
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


          <div>

            <h4>
              Contact
            </h4>


            <div class="footer-links">

              <a
                href="tel:+919535611778"
              >
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
                href="https://www.instagram.com/zubstudio_by_subi"
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

            © ${new Date().getFullYear()}
            ZUBSTUDIO

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
   LOADING PAGE
========================================================= */

function loadingPage() {
  return `

    <section class="empty-cart">

      <h2>
        Loading ZUBSTUDIO...
      </h2>

    </section>

  `;
}

/* =========================================================
   ERROR PAGE
========================================================= */

function errorPage() {
  return `

    <section class="empty-cart">

      <h2>

        ${escapeHTML(productLoadError || "Unable to load the collection.")}

      </h2>


      <button
        type="button"
        class="btn btn-dark"
        onclick="retryProducts()"
      >

        Try Again

      </button>

    </section>

  `;
}

async function retryProducts() {
  productsLoaded = false;

  await loadProducts(true);

  render();
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function productCard(product) {
  const id = productId(product);

  const image = getProductImageURL(product) || "./favicon.jpeg";

  const soldOut = isSoldOut(product);

  return `

    <article class="product-card">


      <a
        href="#/product/${id}"
        class="product-image-wrap"
      >


        ${
          isNewProduct(product)
            ? `

              <span class="product-badge">

                New

              </span>

            `
            : ""
        }


        <img
          class="product-image"

          src="${escapeHTML(image)}"

          alt="${escapeHTML(product.name || "ZUBSTUDIO product")}"

          loading="lazy"
        >


        ${
          !soldOut
            ? `

              <button
                class="quick-add"

                type="button"

                onclick="
                  event.preventDefault();
                  event.stopPropagation();

                  quickAdd(
                    '${id}'
                  );
                "
              >

                View Piece

              </button>

            `
            : ""
        }


      </a>


      <div class="product-info">


        <a
          href="#/product/${id}"
        >

          <h3 class="product-name">

            ${escapeHTML(product.name || "ZUBSTUDIO Piece")}

          </h3>

        </a>


        ${
          product.price !== undefined && product.price !== null
            ? `

              <p class="product-price">

                ${money(product.price)}

              </p>

            `
            : ""
        }


      </div>

    </article>

  `;
}

/* =========================================================
   HOME PAGE

   HOMEPAGE NEW ARRIVALS =
   NEWEST 4 PRODUCTS FROM MONGODB
========================================================= */

function homePage() {
  const latest = getLatestProducts(CONFIG.homeNewArrivalLimit);

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



    <!-- LATEST PRODUCTS -->


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
          href="#/new"
        >

          View New Arrivals

        </a>


      </div>


      ${
        latest.length
          ? `

            <div class="product-grid">

              ${latest.map(productCard).join("")}

            </div>

          `
          : `

            <div class="empty-cart">

              <p>

                New pieces coming soon.

              </p>

            </div>

          `
      }


    </section>



    <!-- EDITORIAL -->


    <section class="editorial">


      <div
        class="editorial-image"
      ></div>


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
  const filtered = products;

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

      <div class="product-count">

        ${filtered.length}

        ${filtered.length === 1 ? "piece" : "pieces"}

      </div>

    </div>


    <section class="shop-products">

      ${
        filtered.length
          ? `

            <div class="product-grid">

              ${filtered.map(productCard).join("")}

            </div>

          `
          : `

            <div class="empty-cart">

              <p>
                No pieces available yet.
              </p>

            </div>

          `
      }

    </section>


    ${footer()}

  `;
}

/* =========================================================
   GET NEW ARRIVALS

   Shows products added within
   last 3 days.
========================================================= */

function newArrivalsPage() {
  const newProducts = getNewArrivals();

  return `


    <section class="shop-header">


      <p class="section-eyebrow">

        ZUBSTUDIO

      </p>


      <h1>

        New Arrivals

      </h1>


      <p>

        The latest pieces added to

        the ZUBSTUDIO collection.

      </p>


    </section>



    <section class="shop-products">


      ${
        newProducts.length
          ? `

            <div class="product-grid">

              ${newProducts.map(productCard).join("")}

            </div>

          `
          : `

            <div class="empty-cart">


              <h2>

                New pieces coming soon

              </h2>


              <a
                href="#/shop"
                class="btn btn-dark"
              >

                View Collection

              </a>


            </div>

          `
      }


    </section>


    ${footer()}

  `;
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


      ${footer()}

    `;
  }

  selectedSize = null;

  const images = getProductImages(product);

  const sizes = getProductSizes(product);

  const soldOut = isSoldOut(product);

  return `


    <section class="product-page">


      <div class="product-gallery">


        ${
          images.length
            ? images
                .map(
                  (image) => `


                    <img

                      src="${escapeHTML(image)}"

                      alt="${escapeHTML(product.name || "ZUBSTUDIO product")}"

                    >


                  `,
                )
                .join("")
            : `

              <img
                src="./favicon.jpeg"
                alt="ZUBSTUDIO"
              >

            `
        }


      </div>



      <div class="product-details">


        <h1>

          ${escapeHTML(product.name || "ZUBSTUDIO Piece")}

        </h1>


        ${
          product.price !== undefined && product.price !== null
            ? `

              <p class="detail-price">

                ${money(product.price)}

              </p>

            `
            : ""
        }


        ${
          product.code
            ? `

              <div class="detail-meta-row">

                <span>

                  Product Code

                </span>


                <span>

                  ${escapeHTML(product.code)}

                </span>

              </div>

            `
            : ""
        }


        ${
          product.description
            ? `

              <p class="detail-description">

                ${escapeHTML(product.description).replaceAll("\n", "<br>")}

              </p>

            `
            : ""
        }


        ${
          sizes.length
            ? `


              <div class="option-label">

                <span>

                  Select Size

                </span>

              </div>


              <div class="size-options">


                ${sizes
                  .map(
                    (size) => `


                      <button

                        class="size-button"

                        data-size="${escapeHTML(size)}"

                        onclick="
                          chooseSize(
                            '${escapeHTML(size)}',
                            this
                          )
                        "
                      >

                        ${escapeHTML(size)}

                      </button>


                    `,
                  )
                  .join("")}


              </div>


            `
            : ""
        }


        ${
          soldOut
            ? `

              <button
                class="product-add"
                type="button"
                disabled
              >

                Sold Out

              </button>

            `
            : `

              <button

                class="product-add"

                type="button"

                onclick="
                  addToCart(
                    '${productId(product)}'
                  )
                "
              >

                Add to Bag

                ${
                  product.price !== undefined && product.price !== null
                    ? `— ${money(product.price)}`
                    : ""
                }

              </button>

            `
        }


        <div class="detail-meta">


          ${
            product.color
              ? `

                <div class="detail-meta-row">


                  <span>

                    Color

                  </span>


                  <span>

                    ${escapeHTML(product.color)}

                  </span>


                </div>

              `
              : ""
          }


          ${
            product.status
              ? `

                <div class="detail-meta-row">


                  <span>

                    Availability

                  </span>


                  <span>

                    ${soldOut ? "Sold Out" : "Available"}

                  </span>


                </div>

              `
              : ""
          }


        </div>


      </div>


    </section>


    ${footer()}

  `;
}

/* =========================================================
   CHOOSE SIZE
========================================================= */

function chooseSize(size, button) {
  selectedSize = size;

  document.querySelectorAll(".size-button").forEach((item) => {
    item.classList.remove("selected");
  });

  button.classList.add("selected");
}

/* =========================================================
   ADD TO CART

   SIZE IS ONLY REQUIRED
   IF BACKEND HAS SIZES.
========================================================= */

function addToCart(productIdValue) {
  const product = findProduct(productIdValue);

  if (!product) {
    return;
  }

  if (isSoldOut(product)) {
    showToast("This piece is sold out.");

    return;
  }

  const hasSizes = productHasSizes(product);

  if (hasSizes && !selectedSize) {
    showToast("Please select your size.");

    return;
  }

  const cartSize = hasSizes ? selectedSize : null;

  const existing = cart.find(
    (item) =>
      item.productId === productIdValue && (item.size || null) === cartSize,
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    const cartItem = {
      productId: productIdValue,

      quantity: 1,
    };

    if (cartSize) {
      cartItem.size = cartSize;
    }

    cart.push(cartItem);
  }

  saveCart();

  showToast(`${product.name} added to your bag.`);
}

/* =========================================================
   QUICK ADD
========================================================= */

function quickAdd(productIdValue) {
  window.location.hash = `#/product/${productIdValue}`;
}

/* =========================================================
   CART PAGE
========================================================= */

function cartPage() {
  if (cart.length === 0) {
    return `

      <section class="empty-cart">


        <i
          class="bx bx-shopping-bag"
        ></i>


        <h2>

          Your bag is empty

        </h2>


        <p>

          Discover the latest
          ZUBSTUDIO collection.

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
    .map((item, index) => {
      const product = findProduct(item.productId);

      if (!product) {
        return "";
      }

      const itemTotal = Number(product.price || 0) * Number(item.quantity || 1);

      subtotal += itemTotal;

      const image = getProductImageURL(product) || "./favicon.jpeg";

      return `


            <div class="cart-item">


              <a
                href="#/product/${productId(product)}"
              >


                <img

                  class="cart-item-image"

                  src="${escapeHTML(image)}"

                  alt="${escapeHTML(product.name || "ZUBSTUDIO product")}"

                >


              </a>



              <div>


                <h3>

                  ${escapeHTML(product.name || "ZUBSTUDIO Piece")}

                </h3>


                ${
                  item.size || product.color || product.code
                    ? `

                      <p class="cart-item-meta">


                        ${item.size ? `Size: ${escapeHTML(item.size)}` : ""}


                        ${item.size && product.color ? "&nbsp;•&nbsp;" : ""}


                        ${product.color ? escapeHTML(product.color) : ""}


                        ${
                          product.code
                            ? `

                              <br>

                              Code:
                              ${escapeHTML(product.code)}

                            `
                            : ""
                        }


                      </p>

                    `
                    : ""
                }


                <div class="quantity">


                  <button

                    type="button"

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

                    type="button"

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

                  type="button"

                  class="remove-button"

                  onclick="
                    removeCartItem(
                      ${index}
                    )
                  "
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


      <h1>

        Your Bag

      </h1>


      <div class="checkout-layout">



        <div>


          <div class="cart-items">

            ${cartItems}

          </div>



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

            Delivery charges and payment details

            will be confirmed by ZUBSTUDIO.

          </p>



          <button

            type="button"

            class="whatsapp-order-button"

            onclick="
              startCheckout()
            "
          >


            <i
              class="bx bxl-whatsapp"
            ></i>


            Place Order on WhatsApp


          </button>


          <p class="whatsapp-note">

            Your order and delivery details

            will be prepared automatically.

          </p>


        </aside>


      </div>


    </section>


    ${footer()}

  `;
}

/* =========================================================
   CART ACTIONS
========================================================= */

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
   WHATSAPP CHECKOUT
========================================================= */

function startCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty.");

    return;
  }

  const name = document.getElementById("customerName")?.value.trim();

  const phone = document.getElementById("customerPhone")?.value.trim();

  const address = document.getElementById("customerAddress")?.value.trim();

  const city = document.getElementById("customerCity")?.value.trim();

  const state = document.getElementById("customerState")?.value.trim();

  const pin = document.getElementById("customerPin")?.value.trim();

  const errorBox = document.getElementById("checkoutError");

  if (!name || !phone || !address || !city || !state || !pin) {
    if (errorBox) {
      errorBox.textContent =
        "Please complete all delivery details before placing your order.";
    }

    return;
  }

  if (!/^\d{6}$/.test(pin)) {
    if (errorBox) {
      errorBox.textContent = "Please enter a valid 6-digit PIN code.";
    }

    return;
  }

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

  let message = `*NEW ZUBSTUDIO ORDER*

`;

  let total = 0;

  let orderNumber = 1;

  cart.forEach((item) => {
    const product = findProduct(item.productId);

    if (!product) {
      return;
    }

    const itemTotal = Number(product.price || 0) * Number(item.quantity || 1);

    total += itemTotal;

    const imageURL = getProductImageURL(product);

    message += `*${orderNumber}. ${product.name}*
`;

    /*
        ONLY SEND CODE
        IF IT EXISTS
      */

    if (product.code) {
      message += `Code: ${product.code}
`;
    }

    /*
        ONLY SEND SIZE
        IF IT EXISTS
      */

    if (item.size) {
      message += `Size: ${item.size}
`;
    }

    /*
        ONLY SEND COLOR
        IF IT EXISTS
      */

    if (product.color) {
      message += `Color: ${product.color}
`;
    }

    message += `Quantity: ${item.quantity}
Price: ${money(itemTotal)}
`;

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

  message += `──────────────────
*TOTAL: ${money(total)}*
──────────────────

*DELIVERY DETAILS*

Name: ${name}
Phone: ${phone}

Address:
${address}

City: ${city}
State: ${state}
PIN Code: ${pin}

Please confirm availability, delivery charges and payment details.`;

  const whatsappURL = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;

  window.open(
    whatsappURL,

    "_blank",

    "noopener,noreferrer",
  );
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
  searchOverlay?.classList.add("open");

  searchOverlay?.setAttribute("aria-hidden", "false");

  document.body.classList.add("no-scroll");

  setTimeout(
    () => {
      searchInput?.focus();
    },

    200,
  );
}

function closeSearch() {
  searchOverlay?.classList.remove("open");

  searchOverlay?.setAttribute("aria-hidden", "true");

  document.body.classList.remove("no-scroll");

  if (searchInput) {
    searchInput.value = "";
  }

  if (searchResults) {
    searchResults.innerHTML = "";
  }
}

function runSearch() {
  const query = searchInput?.value.trim().toLowerCase() || "";

  if (!query) {
    searchResults.innerHTML = "";

    return;
  }

  const matches = products.filter((product) => {
    const searchable = [
      product.name,

      product.color,

      product.code,

      product.description,
    ]
      .filter(Boolean)

      .join(" ")

      .toLowerCase();

    return searchable.includes(query);
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

            href="#/product/${productId(product)}"

            onclick="
              closeSearch()
            "
          >


            ${escapeHTML(product.name)}


            ${
              product.price !== undefined && product.price !== null
                ? `— ${money(product.price)}`
                : ""
            }


          </a>


        `,
    )
    .join("");
}

/* =========================================================
   ADMIN PAGE
========================================================= */

function adminPage() {
  /*
    Pull category suggestions
    from MongoDB.
  */

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

            Add new pieces to your online collection.

          </p>


        </div>


        <a

          href="#/shop"

          class="admin-view-store"
        >

          View Store

          <i
            class="bx bx-right-arrow-alt"
          ></i>

        </a>


      </div>



      <div class="admin-layout">



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

                Enter the information customers will see.

              </p>


            </div>


          </div>



          <div class="admin-form">



            <div class="admin-field admin-full">


              <label for="adminProductName">

                Product / Collection Name *

              </label>


              <input

                id="adminProductName"

                type="text"

                placeholder="e.g. Falah Premium Pure Cotton Collection"

              >


            </div>



            <div class="admin-field">


              <label for="adminProductCode">

                Product Code

                <small>
                  (optional)
                </small>

              </label>


              <input

                id="adminProductCode"

                type="text"

                placeholder="e.g. Nop37"

              >


            </div>



            <div class="admin-field">


              <label for="adminProductPrice">

                Price *

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


            <div class="admin-field admin-full">


              <label for="adminProductDescription">

                Product Description

                <small>
                  (optional)
                </small>

              </label>


              <textarea

                id="adminProductDescription"

                rows="7"

                placeholder="Top heavy Cotton embroidered&#10;Bottom Cotton&#10;Dupatta Cotton Dup Embroidered"

              ></textarea>


              <p class="admin-field-help">

                Paste the description you normally

                send on WhatsApp.

              </p>


            </div>


          </div>


        </div>



        <!-- PHOTOS -->


        <div class="admin-card">


          <div class="admin-card-heading">


            <span class="admin-step">

              02

            </span>


            <div>


              <h2>

                Clothing Photos

              </h2>


              <p>

                Each selected photo will become

                a separate product using the

                information above.

              </p>


            </div>


          </div>



          <label

            for="adminImageUpload"

            class="admin-upload-box"
          >


            <i
              class="bx bx-image-add"
            ></i>


            <strong>

              Add Clothing Photos

            </strong>


            <span>

              Select all designs in this collection.

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

            onchange="
              handleAdminImages(
                event
              )
            "

          >



          <div

            id="adminImagePreview"

            class="admin-image-preview"

          ></div>


        </div>



        <!-- PUBLISH -->


        <div class="admin-publish-card">


          <div>


            <p class="admin-publish-label">

              Ready to publish?

            </p>


            <h2>

              Add to ZUBSTUDIO

            </h2>


            <p>

              Each selected clothing photo

              will be published as its own piece.

            </p>


          </div>



          <button

            type="button"

            class="admin-publish-button"

            onclick="
              publishAdminProduct()
            "
          >


            Publish Products


            <i
              class="bx bx-right-arrow-alt"
            ></i>


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
   ADMIN IMAGE HANDLER
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
        file,

        preview: e.target.result,
      });

      renderAdminImages();
    };

    reader.readAsDataURL(file);
  });
}

/* =========================================================
   ADMIN IMAGE PREVIEW
========================================================= */

function renderAdminImages() {
  const container = document.getElementById("adminImagePreview");

  if (!container) {
    return;
  }

  container.innerHTML = adminImages
    .map(
      (image, index) => `


          <div class="admin-preview-image">


            <img

              src="${image.preview}"

              alt="Clothing preview"

            >


            <span class="admin-cover-label">

              Piece ${index + 1}

            </span>


            <button

              type="button"

              onclick="
                removeAdminImage(
                  ${index}
                )
              "

              aria-label="Remove image"
            >


              <i
                class="bx bx-x"
              ></i>


            </button>


          </div>


        `,
    )
    .join("");
}

/* =========================================================
   REMOVE ADMIN IMAGE
========================================================= */

function removeAdminImage(index) {
  adminImages.splice(index, 1);

  renderAdminImages();
}

/* =========================================================
   PUBLISH PRODUCTS

   IMPORTANT:

   1 PHOTO = 1 PRODUCT
   5 PHOTOS = 5 PRODUCTS

   SAME CODE IS ALLOWED.
   NO CODE IS ALSO ALLOWED.
========================================================= */

async function publishAdminProduct() {
  const name = document.getElementById("adminProductName")?.value.trim();

  const code = document.getElementById("adminProductCode")?.value.trim();

  const price = document.getElementById("adminProductPrice")?.value;

  const description = document
    .getElementById("adminProductDescription")
    ?.value.trim();

  const message = document.getElementById("adminMessage");

  const button = document.querySelector(".admin-publish-button");

  /* VALIDATION */

  if (!name || !price) {
    message.innerHTML = `

      <span class="admin-error">

        Please enter the product name and price.

      </span>

    `;

    return;
  }

  if (adminImages.length === 0) {
    message.innerHTML = `

      <span class="admin-error">

        Please add at least one clothing photo.

      </span>

    `;

    return;
  }

  button.disabled = true;

  button.innerHTML = `

    Publishing...

  `;

  message.innerHTML = `

    <span>

      Uploading ${adminImages.length}

      ${adminImages.length === 1 ? "piece" : "pieces"}...

    </span>

  `;

  try {
    let published = 0;

    for (const image of adminImages) {
      const formData = new FormData();

      /* REQUIRED */

      formData.append("name", name);

      formData.append("price", price);

      /* OPTIONAL */

      if (code) {
        formData.append("code", code);
      }

      if (description) {
        formData.append("description", description);
      }

      /* ONE IMAGE */

      formData.append("images", image.file);

      const response = await fetch(
        `${CONFIG.api}/products`,

        {
          method: "POST",

          body: formData,
        },
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Unable to publish piece ${published + 1}.`,
        );
      }

      published++;
    }

    /* SUCCESS */

    message.innerHTML = `

      <span class="admin-success">

        ✓ ${published}

        ${published === 1 ? "product" : "products"}

        published successfully.

      </span>

    `;

    /* CLEAR FORM */

    document.getElementById("adminProductName").value = "";

    document.getElementById("adminProductCode").value = "";

    document.getElementById("adminProductPrice").value = "";

    document.getElementById("adminProductDescription").value = "";

    document.getElementById("adminImageUpload").value = "";

    adminImages = [];

    renderAdminImages();

    /*
      RELOAD PRODUCTS FROM MONGODB.

      The newly uploaded products
      immediately become the newest
      products on the homepage.
    */

    await loadProducts(true);
  } catch (error) {
    console.error("Publish error:", error);

    message.innerHTML = `

      <span class="admin-error">

        ${escapeHTML(error.message)}

      </span>

    `;
  } finally {
    button.disabled = false;

    button.innerHTML = `

      Publish Products

      <i
        class="bx bx-right-arrow-alt"
      ></i>

    `;
  }
}

/* =========================================================
   ROUTER
========================================================= */

function getRoute() {
  const hash = window.location.hash || "#/home";

  return hash.replace("#/", "").split("/");
}

/* =========================================================
   RENDER
========================================================= */

async function render() {
  const [page, parameter] = getRoute();

  mobileMenu?.classList.remove("open");

  if (!productsLoaded) {
    app.innerHTML = loadingPage();

    await loadProducts();
  }

  if (productLoadError && !productsLoaded) {
    app.innerHTML = errorPage();

    return;
  }

  switch (page) {
    case "shop":
      app.innerHTML = shopPage();

      break;

    case "new":
      app.innerHTML = newArrivalsPage();

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

mobileMenuToggle?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("open");
});

document.querySelector(".search-toggle")?.addEventListener("click", openSearch);

document.getElementById("search-close")?.addEventListener("click", closeSearch);

searchOverlay?.addEventListener("click", (event) => {
  if (event.target === searchOverlay) {
    closeSearch();
  }
});

searchInput?.addEventListener("input", runSearch);

window.addEventListener("hashchange", render);

/* =========================================================
   INITIALIZE
========================================================= */

updateCartCount();

render();
