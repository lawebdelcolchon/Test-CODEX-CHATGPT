const state = {
  products: [],
  images: [],
  cart: [],
};

const elements = {
  productGrid: document.getElementById('product-grid'),
  productAdminList: document.getElementById('product-admin-list'),
  imageAdminList: document.getElementById('image-admin-list'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  statProducts: document.getElementById('stat-products'),
  statImages: document.getElementById('stat-images'),
  statCart: document.getElementById('stat-cart'),
  storeView: document.getElementById('store-view'),
  adminView: document.getElementById('admin-view'),
  toast: document.getElementById('toast'),
};

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
});

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle('error', isError);
  elements.toast.classList.remove('hidden');
  setTimeout(() => elements.toast.classList.add('hidden'), 2500);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Error ${response.status}`);
  }
  if (response.status === 204) {
    return {};
  }
  return response.json();
}

function updateStats() {
  elements.statProducts.textContent = state.products.length;
  elements.statImages.textContent = state.images.length;
  elements.statCart.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderProducts() {
  if (!state.products.length) {
    elements.productGrid.innerHTML = '<p>No hay productos, agrega uno en la pestaña de administración.</p>';
    return;
  }
  elements.productGrid.innerHTML = state.products
    .map(
      (product) => `
        <article class="card">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
          <div class="price">${currency.format(product.price)}</div>
          <button class="primary" data-add="${product.id}">Agregar</button>
        </article>
      `,
    )
    .join('');
}

function renderAdminProducts() {
  if (!state.products.length) {
    elements.productAdminList.innerHTML = '<li>No hay registros.</li>';
    return;
  }
  elements.productAdminList.innerHTML = state.products
    .map(
      (product) => `
        <li>
          <div>
            <strong>${product.name}</strong>
            <span>${currency.format(product.price)}</span>
          </div>
          <button data-remove-product="${product.id}">Eliminar</button>
        </li>
      `,
    )
    .join('');
}

function renderImages() {
  if (!state.images.length) {
    elements.imageAdminList.innerHTML = '<li>Sin imágenes.</li>';
    return;
  }
  elements.imageAdminList.innerHTML = state.images
    .map(
      (image) => `
        <li>
          <span>${image.alt}</span>
          <button data-remove-image="${image.id}">Eliminar</button>
        </li>
      `,
    )
    .join('');
}

function renderCart() {
  if (!state.cart.length) {
    elements.cartItems.innerHTML = '<p>Tu carrito está vacío.</p>';
    elements.cartTotal.textContent = currency.format(0);
    updateStats();
    return;
  }

  elements.cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart__item">
          <div>
            <strong>${item.name}</strong>
            <p>${currency.format(item.price)}</p>
          </div>
          <div>
            <button data-decrease="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button data-increase="${item.id}">+</button>
          </div>
        </div>
      `,
    )
    .join('');

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  elements.cartTotal.textContent = currency.format(total);
  updateStats();
}

function syncCart(productId, delta) {
  const existing = state.cart.find((item) => item.id === productId);
  if (!existing && delta > 0) {
    const product = state.products.find((p) => p.id === productId);
    state.cart.push({ ...product, quantity: 1 });
  } else if (existing) {
    existing.quantity += delta;
    if (existing.quantity <= 0) {
      state.cart = state.cart.filter((item) => item.id !== productId);
    }
  }
  renderCart();
}

async function loadProducts() {
  state.products = await fetchJson('/api/products');
  renderProducts();
  renderAdminProducts();
  updateStats();
}

async function loadImages() {
  state.images = await fetchJson('/api/images');
  renderImages();
  updateStats();
}

function bindProductGrid() {
  elements.productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-add]');
    if (!button) return;
    const productId = button.dataset.add;
    syncCart(productId, 1);
    showToast('Producto agregado');
  });
}

function bindCart() {
  elements.cartItems.addEventListener('click', (event) => {
    if (event.target.matches('button[data-increase]')) {
      syncCart(event.target.dataset.increase, 1);
    }
    if (event.target.matches('button[data-decrease]')) {
      syncCart(event.target.dataset.decrease, -1);
    }
  });

  document.getElementById('clear-cart').addEventListener('click', () => {
    state.cart = [];
    renderCart();
  });

  document.getElementById('checkout').addEventListener('click', () => {
    if (!state.cart.length) {
      showToast('Agrega productos antes de pagar', true);
      return;
    }
    showToast('Gracias por tu compra ✨');
    state.cart = [];
    renderCart();
  });
}

function bindTabs() {
  const shopTab = document.getElementById('shop-tab');
  const adminTab = document.getElementById('admin-tab');
  shopTab.addEventListener('click', () => {
    shopTab.classList.add('active');
    adminTab.classList.remove('active');
    elements.storeView.classList.remove('hidden');
    elements.adminView.classList.add('hidden');
  });
  adminTab.addEventListener('click', () => {
    adminTab.classList.add('active');
    shopTab.classList.remove('active');
    elements.storeView.classList.add('hidden');
    elements.adminView.classList.remove('hidden');
  });
}

function bindAdmin() {
  const productForm = document.getElementById('product-form');
  productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const body = Object.fromEntries(formData.entries());
    body.price = Number(body.price);
    try {
      const created = await fetchJson('/api/products', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      state.products.push(created);
      productForm.reset();
      renderProducts();
      renderAdminProducts();
      updateStats();
      showToast('Producto creado');
    } catch (error) {
      showToast(error.message, true);
    }
  });

  elements.productAdminList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-remove-product]');
    if (!button) return;
    const id = button.dataset.removeProduct;
    try {
      await fetchJson(`/api/products/${id}`, { method: 'DELETE' });
      state.products = state.products.filter((product) => product.id !== id);
      state.cart = state.cart.filter((item) => item.id !== id);
      renderProducts();
      renderAdminProducts();
      renderCart();
      updateStats();
      showToast('Producto eliminado');
    } catch (error) {
      showToast(error.message, true);
    }
  });

  const imageForm = document.getElementById('image-form');
  imageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(imageForm);
    const body = Object.fromEntries(formData.entries());
    try {
      const created = await fetchJson('/api/images', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      state.images.push(created);
      imageForm.reset();
      renderImages();
      updateStats();
      showToast('Imagen guardada');
    } catch (error) {
      showToast(error.message, true);
    }
  });

  elements.imageAdminList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-remove-image]');
    if (!button) return;
    const id = button.dataset.removeImage;
    try {
      await fetchJson(`/api/images/${id}`, { method: 'DELETE' });
      state.images = state.images.filter((image) => image.id !== id);
      renderImages();
      updateStats();
      showToast('Imagen eliminada');
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

async function init() {
  try {
    await Promise.all([loadProducts(), loadImages()]);
  } catch (error) {
    showToast(`No se pudieron cargar los datos: ${error.message}`, true);
  }
  bindProductGrid();
  bindCart();
  bindTabs();
  bindAdmin();
  renderCart();
}

init();
