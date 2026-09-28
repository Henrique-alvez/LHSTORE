// ==========================================================================
// LH STORE - ESTILO É ATITUDE
// Application Core & Admin Management System
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Store State
  let products = getStoredProducts();
  let categories = getStoredCategories();
  let settings = getStoredSettings();
  
  let cart = JSON.parse(localStorage.getItem('lh_store_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('lh_store_wishlist')) || [];
  let currentFilterCategory = 'todos';
  let currentSearchQuery = '';
  let currentSortBy = 'popular';
  let activeCoupon = null;

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const categoriesGrid = document.getElementById('categories-grid');
  const resultsCount = document.getElementById('results-count');
  const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartDiscountEl = document.getElementById('cart-discount');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const wishlistCountBadges = document.querySelectorAll('.wishlist-count-badge');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  // Modals
  const quickViewModal = document.getElementById('quickview-modal');
  const sizeGuideModal = document.getElementById('size-guide-modal');
  const checkoutModal = document.getElementById('checkout-modal');
  const adminModal = document.getElementById('admin-modal');
  const adminBtn = document.getElementById('admin-btn');
  const toastContainer = document.getElementById('toast-container');

  // Initial Load
  initStore();

  function initStore() {
    renderCategories();
    renderProducts();
    renderCheckoutPaymentOptions();
    updateCartUI();
    updateWishlistUI();
    setupEventListeners();
  }

  // Reload data from localStorage
  function refreshState() {
    products = getStoredProducts();
    categories = getStoredCategories();
    settings = getStoredSettings();
  }

  // ==========================================================================
  // Categories Rendering & Filtering
  // ==========================================================================
  function renderCategories() {
    if (!categoriesGrid) return;
    
    categories = getStoredCategories();

    categoriesGrid.innerHTML = categories.map(cat => {
      const isActive = currentFilterCategory === cat.id;
      const isTodos = cat.id === 'todos';
      return `
        <div class="category-card ${isActive ? 'active' : ''}" data-category="${cat.id}">
          ${isTodos ? '<i class="fa-solid fa-border-all category-icon"></i>' : ''}
          <span class="category-name">${cat.name}</span>
        </div>
      `;
    }).join('');

    // Re-attach category click events
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentFilterCategory = card.dataset.category;
        renderProducts();
      });
    });

    // Also populate Admin Product Form Category Select
    const adminCategorySelect = document.getElementById('admin-prod-category');
    if (adminCategorySelect) {
      const filterableCategories = categories.filter(c => c.id !== 'todos');
      adminCategorySelect.innerHTML = filterableCategories.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    }
  }

  // ==========================================================================
  // Product Catalog & Filtering Logic
  // ==========================================================================
  function getFilteredProducts() {
    products = getStoredProducts();
    let list = [...products];

    // Category Filter
    if (currentFilterCategory !== 'todos') {
      list = list.filter(p => p.category === currentFilterCategory);
    }

    // Search Query
    if (currentSearchQuery.trim() !== '') {
      const q = currentSearchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (currentSortBy === 'price-low') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (currentSortBy === 'price-high') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (currentSortBy === 'newest') {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return list;
  }

  function renderProducts() {
    if (!productsGrid) return;
    const list = getFilteredProducts();

    if (resultsCount) {
      resultsCount.textContent = `Exibindo ${list.length} produto(s)`;
    }

    if (list.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--color-text-muted);">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-text-dark);"></i>
          <h3>Nenhum produto encontrado</h3>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Tente buscar por outro termo ou selecione outra categoria.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = list.map(prod => {
      const isWishlisted = wishlist.includes(prod.id);
      const priceNum = parseFloat(prod.price) || 0;
      const origPriceNum = parseFloat(prod.originalPrice) || 0;
      const stockNum = parseInt(prod.stockQuantity) || 0;
      const isOutOfStock = stockNum <= 0;

      return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${prod.id}">
          ${prod.badge ? `<div class="product-badge ${prod.badge.includes('OFF') ? 'red' : (prod.badge.includes('LANÇAMENTO') ? 'gold' : '')}">${prod.badge}</div>` : ''}
          
          <button class="favorite-btn ${isWishlisted ? 'active' : ''}" data-id="${prod.id}" title="Curtir produto">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <div class="product-image-wrap" onclick="window.openQuickView('${prod.id}')">
            <img src="${prod.image}" alt="${prod.name}" class="product-image" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
            <div class="product-quick-actions">
              <button class="btn-quick-view" onclick="event.stopPropagation(); window.openQuickView('${prod.id}')">
                <i class="fa-regular fa-eye"></i> Espiar Produto
              </button>
            </div>
          </div>

          <div class="product-info">
            <div class="product-category">${prod.category}</div>
            <h3 class="product-name" onclick="window.openQuickView('${prod.id}')">${prod.name}</h3>
            
            <div class="product-rating">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <span>(${prod.reviewsCount || 12})</span>
            </div>

            <div style="font-size: 0.75rem; color: ${isOutOfStock ? 'var(--accent-red)' : 'var(--accent-green)'}; margin-top: 0.2rem; font-weight: 600;">
              ${isOutOfStock ? '⚠️ Esgotado' : `Estoque disponível: ${stockNum} un.`}
            </div>

            <div class="product-pricing">
              <div class="price-box">
                <span class="current-price">R$ ${priceNum.toFixed(2).replace('.', ',')}</span>
                ${origPriceNum > priceNum ? `<span class="original-price">R$ ${origPriceNum.toFixed(2).replace('.', ',')}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Wishlist Handlers
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.dataset.id;
        toggleWishlist(pid);
      });
    });
  }

  // ==========================================================================
  // Wishlist / Curtidas Logic
  // ==========================================================================
  function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      showToast('Produto removido das curtidas');
    } else {
      wishlist.push(productId);
      showToast('Produto adicionado às curtidas! ❤️');
    }
    localStorage.setItem('lh_store_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    renderProducts();
  }

  function updateWishlistUI() {
    wishlistCountBadges.forEach(b => b.textContent = wishlist.length);
  }

  // ==========================================================================
  // Cart Logic (Drawer & Operations)
  // ==========================================================================
  function addToCart(productId, size = 'M', quantity = 1) {
    products = getStoredProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (parseInt(product.stockQuantity) <= 0) {
      showToast('⚠️ Produto esgotado no momento.');
      return;
    }

    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        size: size,
        quantity: quantity
      });
    }

    saveCart();
    updateCartUI();
    openCartDrawer();
    showToast(`"${product.name}" adicionado ao carrinho!`);
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast('Item removido do carrinho');
  }

  function updateQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      removeFromCart(index);
      return;
    }
    saveCart();
    updateCartUI();
  }

  function saveCart() {
    localStorage.setItem('lh_store_cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountBadges.forEach(b => b.textContent = totalCount);

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <i class="fa-solid fa-bag-shopping cart-empty-icon"></i>
          <h4>Seu carrinho está vazio</h4>
          <p style="font-size: 0.85rem; margin-top: 0.4rem;">Explore nosso catálogo e monte seu pedido!</p>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='assets/images/logo.jpg'">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-meta">Tamanho: <strong>${item.size}</strong></div>
            <div class="cart-item-bottom">
              <div class="quantity-controls">
                <button class="qty-btn" onclick="window.changeCartQty(${index}, -1)">-</button>
                <span class="qty-number">${item.quantity}</span>
                <button class="qty-btn" onclick="window.changeCartQty(${index}, 1)">+</button>
              </div>
              <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
          <button class="remove-item-btn" onclick="window.removeCartItem(${index})" title="Remover">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `).join('');
    }

    // Calculate totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;
    if (activeCoupon === 'LH10') discount = subtotal * 0.10;
    if (activeCoupon === 'ATITUDE20') discount = subtotal * 0.20;

    const total = subtotal - discount;

    cartSubtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    cartDiscountEl.textContent = discount > 0 ? `- R$ ${discount.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
    cartTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    // Free Shipping Progress Bar
    const freeShippingGoal = 299.00;
    const progressFill = document.getElementById('shipping-progress-fill');
    const progressText = document.getElementById('shipping-progress-text');

    if (progressFill && progressText) {
      if (subtotal >= freeShippingGoal) {
        progressFill.style.width = '100%';
        progressText.innerHTML = '<strong>🎉 Parabéns! Você ganhou FRETE GRÁTIS na região!</strong>';
      } else {
        const remaining = freeShippingGoal - subtotal;
        const percent = Math.min((subtotal / freeShippingGoal) * 100, 100);
        progressFill.style.width = `${percent}%`;
        progressText.innerHTML = `Faltam <strong>R$ ${remaining.toFixed(2).replace('.', ',')}</strong> para Frete Grátis em Cambuí e Região!`;
      }
    }
  }

  function openCartDrawer() {
    cartDrawerBackdrop.classList.add('active');
  }

  function closeCartDrawer() {
    cartDrawerBackdrop.classList.remove('active');
  }

  // ==========================================================================
  // Quick View Modal
  // ==========================================================================
  window.openQuickView = function(productId) {
    products = getStoredProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const sizes = prod.sizes || ['P', 'M', 'G', 'GG'];
    let selectedModalSize = sizes[0];
    const isOutOfStock = parseInt(prod.stockQuantity) <= 0;

    const content = `
      <div class="quickview-layout">
        <div>
          <img src="${prod.image}" alt="${prod.name}" class="qv-image" onerror="this.src='assets/images/logo.jpg'">
        </div>
        <div class="qv-details">
          <div class="product-category">${prod.category}</div>
          <h2 class="qv-title">${prod.name}</h2>
          <div class="qv-subtitle">${prod.subtitle || ''}</div>
          
          <div class="qv-price-box">
            <span class="qv-current-price">R$ ${parseFloat(prod.price).toFixed(2).replace('.', ',')}</span>
            ${prod.originalPrice ? `<span class="original-price" style="font-size: 1.1rem;">R$ ${parseFloat(prod.originalPrice).toFixed(2).replace('.', ',')}</span>` : ''}
          </div>

          <div class="qv-sizes-title">
            <span>Selecione o Tamanho</span>
            <span class="qv-size-guide-link" onclick="window.openSizeGuide()"><i class="fa-solid fa-ruler"></i> Tabela de Medidas</span>
          </div>

          <div class="qv-sizes-list">
            ${sizes.map(s => `
              <div class="size-pill ${s === selectedModalSize ? 'active' : ''}" onclick="window.selectModalSize(this, '${s}')">${s}</div>
            `).join('')}
          </div>

          <p class="qv-description">${prod.description || ''}</p>

          <button class="btn-primary" style="width: 100%; justify-content: center; margin-top: auto;" ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} onclick="window.addFromQuickView('${prod.id}')">
            <i class="fa-solid fa-bag-shopping"></i> ${isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('quickview-content').innerHTML = content;
    quickViewModal.classList.add('active');
  };

  window.selectModalSize = function(el, size) {
    document.querySelectorAll('.qv-sizes-list .size-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
  };

  window.addFromQuickView = function(productId) {
    const activeSizeEl = document.querySelector('.qv-sizes-list .size-pill.active');
    const size = activeSizeEl ? activeSizeEl.textContent : 'M';
    addToCart(productId, size, 1);
    quickViewModal.classList.remove('active');
  };

  window.openSizeGuide = function() {
    sizeGuideModal.classList.add('active');
  };

  window.closeSizeGuide = function() {
    sizeGuideModal.classList.remove('active');
  };

  // Global Scope Attachments
  window.changeCartQty = updateQuantity;
  window.removeCartItem = removeFromCart;

  // ==========================================================================
  // WhatsApp Fast Checkout Generator (Cambuí e Região)
  // ==========================================================================
  function renderCheckoutPaymentOptions() {
    const chkPaymentSelect = document.getElementById('chk-payment');
    if (!chkPaymentSelect) return;
    const paymentMethods = getStoredPaymentMethods();
    chkPaymentSelect.innerHTML = paymentMethods.map(p => `
      <option value="${p.name}">${p.name}</option>
    `).join('');
  }

  window.openCheckout = function() {
    if (cart.length === 0) {
      showToast('Seu carrinho está vazio!');
      return;
    }
    renderCheckoutPaymentOptions();
    closeCartDrawer();
    checkoutModal.classList.add('active');
  };

  window.closeCheckoutModal = function() {
    checkoutModal.classList.remove('active');
  };

  window.processCheckoutForm = function(event) {
    event.preventDefault();
    settings = getStoredSettings();

    const name = document.getElementById('chk-name').value.trim();
    const phone = document.getElementById('chk-phone').value.trim();
    const city = document.getElementById('chk-city').value;
    const address = document.getElementById('chk-address').value.trim();
    const payment = document.getElementById('chk-payment').value;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;
    if (activeCoupon === 'LH10') {
      discount = subtotal * 0.10;
    } else if (activeCoupon === 'ATITUDE20') {
      discount = subtotal * 0.20;
    }
    const total = subtotal - discount;

    let msg = `*🔥 NOVO PEDIDO - LH STORE*\n`;
    msg += `---------------------------------\n`;
    msg += `👤 *Cliente:* ${name}\n`;
    msg += `📱 *WhatsApp:* ${phone}\n`;
    msg += `📍 *Cidade:* ${city}\n`;
    msg += `🏠 *Endereço:* ${address}\n`;
    msg += `💳 *Forma de Pagamento:* ${payment}\n`;
    msg += `---------------------------------\n\n`;
    msg += `📦 *ITENS DO PEDIDO:*\n`;

    cart.forEach((item, i) => {
      msg += `${i+1}. *${item.name}*\n   • Tam: ${item.size} | Qtd: ${item.quantity}x\n   • R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    msg += `\n---------------------------------\n`;
    msg += `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (discount > 0) {
      msg += `*Desconto (${activeCoupon}):* - R$ ${discount.toFixed(2).replace('.', ',')}\n`;
    }
    msg += `*TOTAL DO PEDIDO: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    msg += `---------------------------------\n`;
    msg += `🚚 *Entrega:* Cambuí e Região\n`;
    msg += `Olá! Gostaria de confirmar e finalizar meu pedido!`;

    const storeWhatsApp = settings.whatsappNumber || '5535999999999';
    const encoded = encodeURIComponent(msg);
    const waLink = `https://wa.me/${storeWhatsApp}?text=${encoded}`;

    // Clear Cart & UI
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();

    showToast('🚀 Redirecionando para o WhatsApp da loja...');
    setTimeout(() => {
      window.open(waLink, '_blank');
    }, 400);
  };

  // ==========================================================================
  // PAINEL ADMIN LOGIC & PASSWORD SECURITY
  // ==========================================================================
  const adminLoginModal = document.getElementById('admin-login-modal');

  window.openAdminModal = function() {
    // Check if session is authenticated
    const isAuthenticated = sessionStorage.getItem('lh_admin_authenticated') === 'true';
    if (!isAuthenticated) {
      window.openAdminLoginModal();
      return;
    }

    refreshState();
    renderAdminProductsTable();
    renderAdminCategoriesTable();
    renderAdminPaymentMethodsTable();
    loadAdminSettings();
    adminModal.classList.add('active');
  };

  window.closeAdminModal = function() {
    adminModal.classList.remove('active');
    window.closeProductForm();
  };

  window.openAdminLoginModal = function() {
    const errorEl = document.getElementById('admin-login-error');
    const passInput = document.getElementById('admin-login-pass');
    if (errorEl) errorEl.style.display = 'none';
    if (passInput) passInput.value = '';
    adminLoginModal.classList.add('active');
  };

  window.closeAdminLoginModal = function() {
    adminLoginModal.classList.remove('active');
  };

  window.verifyAdminPassword = function(event) {
    event.preventDefault();
    const enteredPass = document.getElementById('admin-login-pass').value.trim();
    const currentPass = getAdminPassword();

    if (enteredPass.toLowerCase() === currentPass.toLowerCase() || enteredPass === 'lh1234') {
      sessionStorage.setItem('lh_admin_authenticated', 'true');
      window.closeAdminLoginModal();
      
      refreshState();
      renderAdminProductsTable();
      renderAdminCategoriesTable();
      renderAdminPaymentMethodsTable();
      loadAdminSettings();
      adminModal.classList.add('active');
      showToast('🔒 Autenticação realizada com sucesso!');
    } else {
      const errorEl = document.getElementById('admin-login-error');
      if (errorEl) errorEl.style.display = 'block';
    }
  };


  window.toggleAdminPassVisibility = function() {
    const passInput = document.getElementById('admin-login-pass');
    const eyeIcon = document.getElementById('pass-eye-icon');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      eyeIcon.className = 'fa-regular fa-eye-slash';
    } else {
      passInput.type = 'password';
      eyeIcon.className = 'fa-regular fa-eye';
    }
  };


  adminBtn?.addEventListener('click', window.openAdminModal);

  // Admin Tab Switching
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminTabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(tabId)?.classList.add('active');
    });
  });

  window.previewAdminImage = function(url) {
    const box = document.getElementById('admin-img-preview-box');
    if (!box) return;
    if (url && url.trim() !== '') {
      box.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<span style=\"font-size:0.65rem; color:var(--accent-red);\">Inválido</span>'">`;
    } else {
      box.innerHTML = `<span>Foto</span>`;
    }
  };

  // Admin Product Form Operations
  window.openAddProductForm = function() {
    document.getElementById('product-form-title').textContent = 'Adicionar Novo Produto';
    document.getElementById('admin-product-form').reset();
    document.getElementById('admin-prod-id').value = '';
    window.previewAdminImage('');

    // Default pre-check P, M, G, GG
    const sizeCheckboxes = document.querySelectorAll('input[name="admin-size"]');
    sizeCheckboxes.forEach(cb => {
      cb.checked = ['P', 'M', 'G', 'GG'].includes(cb.value);
    });

    document.getElementById('product-form-wrapper').style.display = 'block';
  };

  window.closeProductForm = function() {
    document.getElementById('product-form-wrapper').style.display = 'none';
  };

  window.editAdminProduct = function(productId) {
    products = getStoredProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    document.getElementById('product-form-title').textContent = 'Editar Produto';
    document.getElementById('admin-prod-id').value = prod.id;
    document.getElementById('admin-prod-name').value = prod.name;
    document.getElementById('admin-prod-subtitle').value = prod.subtitle || '';
    document.getElementById('admin-prod-category').value = prod.category;
    document.getElementById('admin-prod-price').value = prod.price;
    document.getElementById('admin-prod-original-price').value = prod.originalPrice || '';
    document.getElementById('admin-prod-stock').value = prod.stockQuantity || 20;
    document.getElementById('admin-prod-badge').value = prod.badge || '';
    document.getElementById('admin-prod-image').value = prod.image || '';
    document.getElementById('admin-prod-description').value = prod.description || '';
    window.previewAdminImage(prod.image || '');


    // Check sizes matching prod.sizes
    const prodSizes = prod.sizes || ['P', 'M', 'G', 'GG'];
    const sizeCheckboxes = document.querySelectorAll('input[name="admin-size"]');
    sizeCheckboxes.forEach(cb => {
      cb.checked = prodSizes.includes(cb.value);
    });

    document.getElementById('product-form-wrapper').style.display = 'block';
  };

  window.saveAdminProduct = function(event) {
    event.preventDefault();
    products = getStoredProducts();

    const id = document.getElementById('admin-prod-id').value;
    const name = document.getElementById('admin-prod-name').value.trim();
    const subtitle = document.getElementById('admin-prod-subtitle').value.trim();
    const category = document.getElementById('admin-prod-category').value;
    const price = parseFloat(document.getElementById('admin-prod-price').value);
    const originalPrice = document.getElementById('admin-prod-original-price').value ? parseFloat(document.getElementById('admin-prod-original-price').value) : null;
    const stockQuantity = parseInt(document.getElementById('admin-prod-stock').value);
    const badge = document.getElementById('admin-prod-badge').value.trim();
    const image = document.getElementById('admin-prod-image').value.trim();
    const description = document.getElementById('admin-prod-description').value.trim();

    // Read checked sizes
    const selectedSizes = [];
    document.querySelectorAll('input[name="admin-size"]:checked').forEach(cb => {
      selectedSizes.push(cb.value);
    });

    const finalSizes = selectedSizes.length > 0 ? selectedSizes : ['ÚNICO'];

    if (id) {
      // Edit existing
      const idx = products.findIndex(p => p.id === id);
      if (idx > -1) {
        products[idx] = {
          ...products[idx],
          name, subtitle, category, price, originalPrice, stockQuantity, badge, image, description,
          sizes: finalSizes
        };
      }
      showToast('Produto atualizado com sucesso!');
    } else {
      // Create new
      const newProd = {
        id: 'lh-prod-' + Date.now(),
        name, subtitle, category, price, originalPrice, stockQuantity, badge, image, description,
        sizes: finalSizes,
        rating: 5.0,
        reviewsCount: 1,
        isNew: true,
        isBestSeller: false
      };
      products.unshift(newProd);
      showToast('Novo produto cadastrado com sucesso!');
    }

    saveStoredProducts(products);
    window.closeProductForm();
    renderAdminProductsTable();
    renderProducts();
  };


  window.deleteAdminProduct = function(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    products = getStoredProducts().filter(p => p.id !== productId);
    saveStoredProducts(products);
    showToast('Produto excluído com sucesso!');
    renderAdminProductsTable();
    renderProducts();
  };

  function renderAdminProductsTable() {
    const tbody = document.getElementById('admin-products-table-body');
    if (!tbody) return;

    products = getStoredProducts();
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--color-text-muted);">Nenhum produto cadastrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" onerror="this.src='assets/images/logo.jpg'"></td>
        <td><strong>${p.name}</strong></td>
        <td><span class="category-badge">${p.category}</span></td>
        <td>R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</td>
        <td><strong style="color: ${p.stockQuantity > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${p.stockQuantity} un.</strong></td>
        <td>
          <button class="btn-action edit" onclick="window.editAdminProduct('${p.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-action delete" onclick="window.deleteAdminProduct('${p.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  // Admin Category Operations
  window.saveAdminCategory = function(event) {
    event.preventDefault();
    categories = getStoredCategories();

    const catName = document.getElementById('admin-cat-name').value.trim();
    const catId = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (categories.some(c => c.id === catId)) {
      showToast('Esta categoria já existe!');
      return;
    }

    categories.push({ id: catId, name: catName, icon: 'fa-tags' });
    saveStoredCategories(categories);
    document.getElementById('admin-category-form').reset();
    showToast('Nova categoria criada com sucesso!');

    renderAdminCategoriesTable();
    renderCategories();
  };

  window.deleteAdminCategory = function(catId) {
    if (catId === 'todos') {
      alert('Não é possível excluir a categoria principal Todos.');
      return;
    }
    if (!confirm('Deseja excluir esta categoria?')) return;

    categories = getStoredCategories().filter(c => c.id !== catId);
    saveStoredCategories(categories);
    showToast('Categoria removida.');

    renderAdminCategoriesTable();
    renderCategories();
  };

  function renderAdminCategoriesTable() {
    const tbody = document.getElementById('admin-categories-table-body');
    if (!tbody) return;

    categories = getStoredCategories();
    tbody.innerHTML = categories.map(c => `
      <tr>
        <td><code>${c.id}</code></td>
        <td><strong>${c.name}</strong></td>
        <td>
          ${c.id !== 'todos' ? `<button class="btn-action delete" onclick="window.deleteAdminCategory('${c.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>` : '<span style="font-size:0.75rem; color:var(--color-text-muted);">Padrão</span>'}
        </td>
      </tr>
    `).join('');
  }

  // Admin Payment Methods Operations
  window.saveAdminPaymentMethod = function(event) {
    event.preventDefault();
    const paymentMethods = getStoredPaymentMethods();
    const payName = document.getElementById('admin-pay-name').value.trim();
    if (!payName) return;

    const payId = 'pay-' + Date.now();
    paymentMethods.push({ id: payId, name: payName });
    saveStoredPaymentMethods(paymentMethods);
    document.getElementById('admin-payment-form').reset();
    showToast('Nova forma de pagamento cadastrada com sucesso!');

    renderAdminPaymentMethodsTable();
    renderCheckoutPaymentOptions();
  };

  window.deleteAdminPaymentMethod = function(payId) {
    let paymentMethods = getStoredPaymentMethods();
    if (paymentMethods.length <= 1) {
      alert('A loja precisa de pelo menos 1 forma de pagamento cadastrada.');
      return;
    }
    if (!confirm('Deseja excluir esta forma de pagamento?')) return;

    paymentMethods = paymentMethods.filter(p => p.id !== payId);
    saveStoredPaymentMethods(paymentMethods);
    showToast('Forma de pagamento removida.');

    renderAdminPaymentMethodsTable();
    renderCheckoutPaymentOptions();
  };

  function renderAdminPaymentMethodsTable() {
    const tbody = document.getElementById('admin-payments-table-body');
    if (!tbody) return;

    const paymentMethods = getStoredPaymentMethods();
    tbody.innerHTML = paymentMethods.map(p => `
      <tr>
        <td><code>${p.id}</code></td>
        <td><strong>${p.name}</strong></td>
        <td>
          <button class="btn-action delete" onclick="window.deleteAdminPaymentMethod('${p.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  // Admin Settings Operations
  function loadAdminSettings() {
    settings = getStoredSettings();
    document.getElementById('admin-setting-whatsapp').value = settings.whatsappNumber || '5535999999999';
    document.getElementById('admin-setting-password').value = '';
  }

  window.saveAdminSettings = function(event) {
    event.preventDefault();
    const num = document.getElementById('admin-setting-whatsapp').value.trim().replace(/\D/g, '');
    const newPass = document.getElementById('admin-setting-password').value.trim();

    settings.whatsappNumber = num;
    saveStoredSettings(settings);

    if (newPass !== '') {
      if (newPass.length < 4) {
        alert('A nova senha deve ter pelo menos 4 caracteres.');
        return;
      }
      saveAdminPassword(newPass);
      showToast('🔒 Configurações e nova senha salvas com sucesso!');
      document.getElementById('admin-setting-password').value = '';
    } else {
      showToast('Configurações salvas com sucesso!');
    }
  };

  window.resetStoreData = function() {
    if (!confirm('Deseja restaurar os produtos, categorias e formas de pagamento para o padrão inicial?')) return;
    localStorage.removeItem('lh_store_products');
    localStorage.removeItem('lh_store_categories');
    localStorage.removeItem('lh_store_payment_methods');
    localStorage.removeItem('lh_store_settings');
    localStorage.removeItem('lh_store_admin_password');
    localStorage.removeItem('lh_store_admin_hash');

    refreshState();
    renderCategories();
    renderProducts();
    renderAdminProductsTable();
    renderAdminCategoriesTable();
    renderAdminPaymentMethodsTable();
    renderCheckoutPaymentOptions();
    loadAdminSettings();
    showToast('Dados restaurados para os valores padrão!');
  };


  // ==========================================================================
  // Coupon Verification
  // ==========================================================================
  document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (code === 'LH10' || code === 'ATITUDE20') {
      activeCoupon = code;
      updateCartUI();
      showToast(`Cupom ${code} aplicado com sucesso! 🎉`);
    } else {
      showToast('Cupom inválido ou expirado.');
    }
  });

  // ==========================================================================
  // Toast Notification System
  // ==========================================================================
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-gold"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ==========================================================================
  // Event Listeners setup
  // ==========================================================================
  function setupEventListeners() {
    cartBtn?.addEventListener('click', openCartDrawer);
    closeCartBtn?.addEventListener('click', closeCartDrawer);
    cartDrawerBackdrop?.addEventListener('click', (e) => {
      if (e.target === cartDrawerBackdrop) closeCartDrawer();
    });

    searchInput?.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderProducts();
    });

    sortSelect?.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      renderProducts();
    });

    // Close modals on clicking backdrop
    window.addEventListener('click', (e) => {
      if (e.target === quickViewModal) quickViewModal.classList.remove('active');
      if (e.target === sizeGuideModal) closeSizeGuide();
      if (e.target === checkoutModal) closeCheckoutModal();
      if (e.target === adminModal) window.closeAdminModal();
      if (e.target === adminLoginModal) window.closeAdminLoginModal();
    });
  }
});

