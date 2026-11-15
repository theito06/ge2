// js/cart.js

// Estado global del carrito en localStorage
let carritoItems = JSON.parse(localStorage.getItem('carritoCafeteria')) || [];

document.addEventListener('DOMContentLoaded', () => {
  inicializarCarritoHTML();
  actualizarBadgeCarrito();
  renderizarCarrito();
});

// Crear Drawer Lateral dinámicamente si no existe
function inicializarCarritoHTML() {
  if (!document.querySelector('.cart-drawer')) {
    const drawerHTML = `
      <div class="cart-overlay" id="cartOverlay"></div>
      <aside class="cart-drawer" id="cartDrawer">
        <div class="cart-header">
          <h3>Tu Pedido</h3>
          <button class="close-cart" id="closeCartBtn">&times;</button>
        </div>
        <div class="cart-items" id="cartItemsContainer"></div>
        <div class="cart-footer">
          <div class="cart-total">
            <span>Total:</span>
            <span id="cartTotalAmount">$0.00</span>
          </div>
          <a href="checkout.html" class="btn-cta" style="display:block; text-align:center;">Finalizar Compra</a>
        </div>
      </aside>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    // Eventos abrir/cerrar
    document.getElementById('closeCartBtn').addEventListener('click', cerrarCarrito);
    document.getElementById('cartOverlay').addEventListener('click', cerrarCarrito);
    
    const navCartBtn = document.getElementById('openCartBtn');
    if (navCartBtn) navCartBtn.addEventListener('click', abrirCarrito);
  }
}

function abrirCarrito() {
  document.getElementById('cartDrawer').classList.add('active');
  document.getElementById('cartOverlay').classList.add('active');
}

function cerrarCarrito() {
  document.getElementById('cartDrawer').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
}

// Agregar producto al carrito
function agregarAlCarrito(productoId, opciones = {}) {
  const productoOriginal = productosCafeteria.find(p => p.id === productoId);
  if (!productoOriginal) return;

  const item = {
    cartUniqueId: Date.now(),
    id: productoOriginal.id,
    nombre: productoOriginal.nombre,
    precio: opciones.precioCalculado || productoOriginal.precio,
    imagen: productoOriginal.imagen,
    detalles: opciones.detalles || "Estándar"
  };

  carritoItems.push(item);
  guardarCarrito();
  renderizarCarrito();
  actualizarBadgeCarrito();
  abrirCarrito();
}

function eliminarDelCarrito(cartUniqueId) {
  carritoItems = carritoItems.filter(item => item.cartUniqueId !== cartUniqueId);
  guardarCarrito();
  renderizarCarrito();
  actualizarBadgeCarrito();
}

function guardarCarrito() {
  localStorage.setItem('carritoCafeteria', JSON.stringify(carritoItems));
}

function actualizarBadgeCarrito() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    badge.textContent = carritoItems.length;
  }
}

function renderizarCarrito() {
  const container = document.getElementById('cartItemsContainer');
  const totalElem = document.getElementById('cartTotalAmount');
  if (!container) return;

  container.innerHTML = '';
  let total = 0;

  if (carritoItems.length === 0) {
    container.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top:30px;">El carrito está vacío</p>`;
  } else {
    carritoItems.forEach(item => {
      total += item.precio;
      const itemHTML = `
        <div class="cart-item">
          <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/50/1c140e/d4a373?text=☕'">
          <div class="cart-item-details">
            <h4>${item.nombre}</h4>
            <small>${item.detalles}</small>
            <span class="cart-item-price">$${item.precio.toFixed(2)}</span>
          </div>
          <button class="remove-btn" onclick="eliminarDelCarrito(${item.cartUniqueId})">&times;</button>
        </div>
      `;
      container.innerHTML += itemHTML;
    });
  }

  if (totalElem) totalElem.textContent = `$${total.toFixed(2)}`;
}