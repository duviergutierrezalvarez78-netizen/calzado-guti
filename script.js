// script.js — Calzado Guti
document.addEventListener('DOMContentLoaded', () => {
 
  // ── PWA: Registro del Service Worker ──────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registrado'))
      .catch(err => console.warn('SW error:', err));
  }
 
  // ── Botón de instalar PWA ─────────────────────────────────────────────────
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('btn-instalar');
    if (btn) {
      btn.style.display = 'inline-flex';
      btn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; btn.style.display = 'none'; });
      });
    }
  });
 
  // ── CONTACTO: WhatsApp, Instagram, Email ──────────────────────────────────
  // Datos de contacto — edita aquí con los reales
  const CONTACTO = {
    whatsapp: '573001234567',          // número sin + ni espacios
    instagram: 'calzadoguti',          // usuario de IG
    email: 'ventas@calzadoguti.com'
  };
 
  // Inyectar hrefs correctos en todos los íconos de redes
  document.querySelectorAll('.iconos-redes a').forEach((a, i) => {
    if (i === 0) {
      // Instagram (primer ícono)
      a.href = `https://www.instagram.com/${CONTACTO.instagram}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'Instagram';
    } else if (i === 1) {
      // WhatsApp (segundo ícono)
      a.href = `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent('Hola, me interesa un producto de Calzado Guti 👟')}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'WhatsApp';
    } else if (i === 2) {
      // Email (tercer ícono)
      a.href = `mailto:${CONTACTO.email}?subject=${encodeURIComponent('Consulta Catálogo Calzado Guti')}`;
      a.title = 'Email';
    }
  });
 
  // ── REFERENCIAS AL DOM ────────────────────────────────────────────────────
  const precioToggle  = document.getElementById('precioToggle');
  const ciudadToggle  = document.getElementById('ciudadToggle');
  const calzadoToggle = document.getElementById('calzadoToggle');
  const precioOptions  = document.getElementById('precioOptions');
  const ciudadOptions  = document.getElementById('ciudadOptions');
  const calzadoOptions = document.getElementById('calzadoOptions');
  const allRadioFilters = document.querySelectorAll('input[name="filtro-calzado"], input[name="filtro-precio"], input[name="filtro-ciudad"]');
  const searchInput = document.getElementById('search-input');
  const productList = document.querySelector('.product-list');
  const pagination  = document.querySelector('.pagination');
  const forms = document.querySelectorAll('form.search-container');
 
  // ── Desplegar/ocultar submenús de filtros ─────────────────────────────────
  function toggleSubmenu(toggle, submenu) {
    if (!toggle || !submenu) return;
    submenu.style.display = toggle.checked ? 'block' : 'none';
  }
 
  if (precioToggle  && precioOptions)  precioToggle.addEventListener('change',  () => toggleSubmenu(precioToggle,  precioOptions));
  if (ciudadToggle  && ciudadOptions)  ciudadToggle.addEventListener('change',  () => toggleSubmenu(ciudadToggle,  ciudadOptions));
  if (calzadoToggle && calzadoOptions) calzadoToggle.addEventListener('change', () => toggleSubmenu(calzadoToggle, calzadoOptions));
 
  // ── Carga de productos ────────────────────────────────────────────────────
  let productosCache = null;
 
  function detectarGenero() {
    const file = (window.location.pathname.split('/').pop() || '').toLowerCase();
    return file.includes('mujer') ? 'mujeres' : 'hombres';
  }
 
  function buildFromDOM() {
    const gender = detectarGenero();
    return Array.from(document.querySelectorAll('.product-card')).map(card => ({
      name:     (card.querySelector('.product-name')?.textContent || '').trim(),
      ref:      ((card.querySelector('.product-ref')?.textContent || '').match(/\d+/) || [''])[0],
      price:    Number((card.querySelector('.product-price')?.textContent || '').replace(/[^\d]/g, '')),
      category: (card.dataset.categoria || '').trim(),
      ciudad:   (card.dataset.ciudad || '').toLowerCase(),
      image:    card.querySelector('img')?.getAttribute('src') || '',
      gender,
      colors:   []
    }));
  }
 
  function cargarProductos() {
    if (productosCache) return Promise.resolve(productosCache);
    return fetch('products.json')
      .then(r => r.ok ? r.json() : Promise.reject('error'))
      .then(data => { productosCache = data; return data; })
      .catch(() => {
        const fb = buildFromDOM();
        productosCache = fb;
        return fb;
      });
  }
 
  // ── Render ────────────────────────────────────────────────────────────────
  function renderItems(items) {
    if (!productList) return;
    productList.innerHTML = '';
    if (!items.length) {
      productList.innerHTML = '<div style="padding:16px;text-align:center;width:100%">No se encontraron productos.</div>';
      return;
    }
    items.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.categoria = p.category;
      card.dataset.ciudad = p.ciudad;
 
      // Botón WhatsApp por producto
      const waMsg = encodeURIComponent(`Hola! Me interesa el modelo *${p.name}* (ref. ${p.ref}) a $${Number(p.price).toLocaleString('es-CO')} 👟`);
      const waUrl = `https://wa.me/${CONTACTO.whatsapp}?text=${waMsg}`;
 
      card.innerHTML = `
        <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-details">
          <p class="product-name">${p.name}</p>
          <p class="product-ref">ref. ${p.ref}</p>
          <p class="product-price">$ ${Number(p.price).toLocaleString('es-CO')}</p>
          <a class="btn-wa" href="${waUrl}" target="_blank" rel="noopener" title="Consultar por WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.077,4.928C17.191,3.041,14.683,2.001,12.011,2c-5.506,0-9.987,4.479-9.989,9.985c-0.001,1.76,0.459,3.478,1.333,4.992L2,22l5.233-1.237c1.459,0.796,3.101,1.215,4.773,1.216h0.004c5.505,0,9.986-4.48,9.989-9.985C22.001,9.325,20.963,6.816,19.077,4.928z"/></svg>
            Consultar
          </a>
        </div>`;
      productList.appendChild(card);
    });
  }
 
  function togglePagination(show) {
    if (pagination) pagination.style.display = show ? 'flex' : 'none';
  }
 
  // ── Filtros ───────────────────────────────────────────────────────────────
  function normalize(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
 
  function getChecked(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }
 
  function parseQuery(qraw) {
    const catSyn   = { zapato:'formal', zapatos:'formal', tenis:'informal', zapatilla:'informal', zapatillas:'informal', bota:'bota', botas:'bota' };
    const genSyn   = { hombre:'hombres', hombres:'hombres', mujer:'mujeres', mujeres:'mujeres' };
    const colorSet = new Set(['negro','blanco','azul','rojo','verde','marron','cafe','beige','dorado','plateado','gris','morado','rosa','amarillo','vino']);
    return normalize(qraw).replace(/[;,=]+/g,' ').split(/\s+/).filter(Boolean).map(t => {
      if (genSyn[t])   return { type:'gender',   value: genSyn[t] };
      if (catSyn[t])   return { type:'category', value: catSyn[t] };
      if (colorSet.has(t)) return { type:'color', value: t };
      if (/^\d{3,}$/.test(t)) return { type:'ref', value: t };
      return { type:'text', value: t };
    });
  }
 
  function applyAllFilters() {
    const catFilter    = getChecked('filtro-calzado');
    const precioFilter = getChecked('filtro-precio');
    const ciudadFilter = getChecked('filtro-ciudad');
    const texto        = searchInput ? searchInput.value.trim() : '';
    const clauses      = texto ? parseQuery(texto) : [];
    const genderClause = clauses.find(c => c.type === 'gender');
    const targetGender = genderClause ? genderClause.value : detectarGenero();
 
    cargarProductos().then(todos => {
      const result = todos.filter(p => {
        if (p.gender !== targetGender) return false;
        if (catFilter    && p.category !== catFilter) return false;
        if (ciudadFilter && p.ciudad   !== ciudadFilter) return false;
        if (precioFilter) {
          const [min, max] = precioFilter.split('-').map(Number);
          if (Number(p.price) < min || Number(p.price) > max) return false;
        }
        if (clauses.length) {
          const name   = normalize(p.name);
          const ref    = normalize(String(p.ref));
          const colors = (p.colors || []).map(normalize);
          return clauses.every(c => {
            if (c.type === 'gender') return true;
            if (c.type === 'category') return p.category === c.value;
            if (c.type === 'ref')   return ref.includes(c.value);
            if (c.type === 'color') return colors.some(col => col.includes(c.value));
            return [name, ref, ...colors].join(' ').includes(c.value);
          });
        }
        return true;
      });
 
      renderItems(result);
      togglePagination(!texto && !catFilter && !precioFilter && !ciudadFilter);
    });
  }
 
  allRadioFilters.forEach(f => f.addEventListener('change', applyAllFilters));
  forms.forEach(f => f.addEventListener('submit', e => { e.preventDefault(); applyAllFilters(); }));
 
  // ── Paginación: estado activo ─────────────────────────────────────────────
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
 
  document.querySelectorAll('.pagination .page-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === currentFile || (currentFile === '' && l.getAttribute('href') === 'index.html'));
  });
 
  const navLinks = document.querySelectorAll('.pagination .pagination-link');
  if (navLinks[0] && ['index.html', '', 'mujeres.html', 'mujeres2.html'].includes(currentFile)) {
    // deshabilitar Anterior si es la primera página de la sección
    if (currentFile === 'index.html' || currentFile === '') navLinks[0].classList.add('disabled');
    if (currentFile === 'mujeres.html') navLinks[0].classList.add('disabled');
  }
  if (navLinks[navLinks.length - 1]) {
    if (currentFile === 'pagina3.html' || currentFile === 'mujeres2.html') {
      navLinks[navLinks.length - 1].classList.add('disabled');
    }
  }
 
  // ── Nav género activo ─────────────────────────────────────────────────────
  const isMujer = currentFile.includes('mujer');
  document.querySelectorAll('.navegacion-genero a').forEach(a => {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('active',
      (isMujer && href.includes('mujeres.html')) ||
      (!isMujer && href.includes('index.html'))
    );
  });
 
  // ── Inicializar ───────────────────────────────────────────────────────────
  try { applyAllFilters(); } catch(e) { console.warn(e); }
 
});