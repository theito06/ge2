// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  inicializarHeaderScroll();
  inicializarScrollReveal();
  inicializarPaginaCatalogo();
  inicializarModalHTML();
});

// 1. Header con fondo al hacer Scroll
function inicializarHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// 2. Animación de revelación al desplazar la página
function inicializarScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// 3. Renderizado y Filtro por URLSearchParams (Catalogo.html)
function inicializarPaginaCatalogo() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return; // Solo ejecuta en catalogo.html

  // Leer la categoría de la URL (?categoria=granos)
  const params = new URLSearchParams(window.location.search);
  const catURL = params.get('categoria');

  renderizarProductos(catURL || 'all');

  // Listeners para botones de filtro
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    if (catURL && btn.dataset.filter === catURL) {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderizarProductos(btn.dataset.filter);
    });
  });

  // Listener para el buscador
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const text = e.target.value.toLowerCase();
      const filtrados = productosCafeteria.filter(p => 
        p.nombre.toLowerCase().includes(text) || p.descripcion.toLowerCase().includes(text)
      );
      renderizarTarjetas(filtrados);
    });
  }
}

function renderizarProductos(categoria) {
  const filtrados = (categoria === 'all') 
    ? productosCafeteria 
    : productosCafeteria.filter(p => p.categoria === categoria);
  
  renderizarTarjetas(filtrados);
}

function renderizarTarjetas(lista) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No se encontraron productos.</p>`;
    return;
  }

  lista.forEach(p => {
    const cardHTML = `
      <div class="product-card reveal active">
        <div class="img-container">
          <!-- ESPACIO PARA TU IMAGEN: Reemplaza 'src' por tu archivo real -->
          <img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          
          <!-- Placeholder animado visible si la imagen falla o no existe -->
          <div class="img-placeholder" style="display:none;">
            <span>☕</span>
            <small>Aroma & Co.</small>
          </div>

          <div class="badge-container">
            ${p.etiquetas.map(e => `<span class="badge">${e}</span>`).join('')}
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-title">${p.nombre}</h3>
          <p class="product-desc">${p.descripcion}</p>
          <div class="product-footer">
            <span class="product-price">$${p.precio.toFixed(2)}</span>
            <button class="btn-card-action" onclick="abrirModalPersonalización(${p.id})">
              ${(p.opcionesLeche || p.opcionesMolienda) ? 'Personalizar' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    `;
    grid.innerHTML += cardHTML;
  });
}

// 4. Ventana Modal de Personalización
function inicializarModalHTML() {
  const modalHTML = `
    <div class="modal-overlay" id="productModal">
      <div class="modal-content">
        <button class="modal-close" id="closeModalBtn">&times;</button>
        <h3 id="modalTitle" class="product-title" style="font-size:1.6rem;">Personaliza tu pedido</h3>
        <p id="modalDesc" style="color:var(--text-muted); margin-bottom:15px; font-size:0.9rem;"></p>
        
        <form id="modalForm">
          <div id="modalOptionsContainer"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:25px;">
            <span id="modalTotalPrice" style="font-size:1.4rem; font-weight:bold; color:var(--accent);">$0.00</span>
            <button type="submit" class="btn-cta">Añadir al Carrito</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  document.getElementById('closeModalBtn').addEventListener('click', cerrarModal);
}

let productoModalActual = null;

function abrirModalPersonalización(id) {
  const producto = productosCafeteria.find(p => p.id === id);
  if (!producto) return;
  productoModalActual = producto;

  document.getElementById('modalTitle').textContent = producto.nombre;
  document.getElementById('modalDesc').textContent = producto.descripcion;
  
  const optionsContainer = document.getElementById('modalOptionsContainer');
  optionsContainer.innerHTML = '';

  // Opciones de Leche
  if (producto.opcionesLeche) {
    optionsContainer.innerHTML += `
      <div class="modal-group">
        <label>Tipo de Leche:</label>
        <select class="modal-select" id="selectLeche">
          <option value="Entera (Estándar)" data-extra="0">Leche Entera</option>
          <option value="Almendra" data-extra="0.50">Leche de Almendras (+$0.50)</option>
          <option value="Avena" data-extra="0.60">Leche de Avena (+$0.60)</option>
          <option value="Sin Lactosa" data-extra="0.30">Sin Lactosa (+$0.30)</option>
        </select>
      </div>
    `;
  }

  // Opciones de Molienda
  if (producto.opcionesMolienda) {
    optionsContainer.innerHTML += `
      <div class="modal-group">
        <label>Tipo de Molienda:</label>
        <select class="modal-select" id="selectMolienda">
          <option value="En Grano">En Grano (Sin Moler)</option>
          <option value="Molienda Fina (Espresso)">Fina (Espresso)</option>
          <option value="Molienda Media (Filtro/V60)">Media (Filtro / V60)</option>
          <option value="Molienda Gruesa (Prensa Francesa)">Gruesa (Prensa Francesa)</option>
        </select>
      </div>
    `;
  }

  // Si no tiene opciones complejas, lo añade directo
  if (!producto.opcionesLeche && !producto.opcionesMolienda) {
    agregarAlCarrito(producto.id);
    return;
  }

  calcularPrecioModal();
  
  document.querySelectorAll('.modal-select').forEach(select => {
    select.addEventListener('change', calcularPrecioModal);
  });

  document.getElementById('productModal').classList.add('active');
}

function calcularPrecioModal() {
  if (!productoModalActual) return;
  let total = productoModalActual.precio;
  
  const selectLeche = document.getElementById('selectLeche');
  if (selectLeche) {
    const extra = parseFloat(selectLeche.options[selectLeche.selectedIndex].dataset.extra || 0);
    total += extra;
  }

  document.getElementById('modalTotalPrice').textContent = `$${total.toFixed(2)}`;
}

function cerrarModal() {
  document.getElementById('productModal').classList.remove('active');
}

// Evento submit del Modal
document.addEventListener('submit', (e) => {
  if (e.target.id === 'modalForm') {
    e.preventDefault();
    if (!productoModalActual) return;

    let detalles = [];
    const selectLeche = document.getElementById('selectLeche');
    const selectMolienda = document.getElementById('selectMolienda');

    if (selectLeche) detalles.push(`Leche: ${selectLeche.value}`);
    if (selectMolienda) detalles.push(`Molienda: ${selectMolienda.value}`);

    const precioFinal = parseFloat(document.getElementById('modalTotalPrice').textContent.replace('$', ''));

    agregarAlCarrito(productoModalActual.id, {
      precioCalculado: precioFinal,
      detalles: detalles.join(' | ')
    });

    cerrarModal();
  }
});

// Agrega esta función dentro del evento DOMContentLoaded en js/main.js

document.addEventListener('DOMContentLoaded', () => {
  inicializarHeaderScroll();
  inicializarScrollReveal();
  inicializarPaginaCatalogo();
  inicializarModalHTML();
  inicializarMenuMovil(); // <-- AGREGAR ESTA LÍNEA
});

// Función para abrir/cerrar el menú hamburguesa en celulares
function inicializarMenuMovil() {
  const menuBtn = document.getElementById('menuToggleBtn');
  const navLinks = document.getElementById('navLinks');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Cerrar el menú al hacer clic en cualquier enlace
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}