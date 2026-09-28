// ==========================================================================
// Base de Dados de Produtos & Categorias - LH STORE (Estilo é Atitude)
// Suporte a armazenamento dinâmico via localStorage para o Painel Admin
// ==========================================================================

const INITIAL_CATEGORIES = [
  { id: 'todos', name: 'Todos os Produtos', icon: 'fa-border-all' },
  { id: 'camisetas', name: 'Camisetas Oversized', icon: 'fa-shirt' },
  { id: 'hoodies', name: 'Hoodies & Casacos', icon: 'fa-user-ninja' },
  { id: 'calcas', name: 'Calças & Cargos', icon: 'fa-vest' },
  { id: 'bones', name: 'Bonés & Chapéus', icon: 'fa-hat-cowboy' },
  { id: 'acessorios', name: 'Acessórios Premium', icon: 'fa-gem' }
];

const INITIAL_PRODUCTS = [
  {
    id: 'lh-prod-1',
    name: 'Camiseta Oversized LH Heavyweight Black',
    subtitle: 'Algodão Heavy 260g | Corte Boxy Fit',
    category: 'camisetas',
    price: 189.90,
    originalPrice: 249.90,
    discountPercent: 24,
    rating: 4.9,
    reviewsCount: 128,
    isNew: true,
    isBestSeller: true,
    freeShipping: true,
    badge: 'MAIS VENDIDO',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    image: 'C:/Users/Win11/.gemini/antigravity/brain/d10acab1-76dc-474c-b7c9-b8dcc5fc436b/lh_oversized_tshirt_1790357706615.jpg',
    description: 'A Camiseta Oversized LH Heavyweight foi desenvolvida para quem busca caimento encorpado e durabilidade extrema. Produzida em 100% algodão super encorpado 260g/m², possui gola ribana grossa de 3cm.',
    stockQuantity: 30
  },
  {
    id: 'lh-prod-2',
    name: 'Hoodie Streetwear LH Crown Premium Slate',
    subtitle: 'Moletom 400g Peluciado | Capuz Duplo',
    category: 'hoodies',
    price: 349.90,
    originalPrice: 429.90,
    discountPercent: 18,
    rating: 5.0,
    reviewsCount: 94,
    isNew: true,
    isBestSeller: true,
    freeShipping: true,
    badge: 'LANÇAMENTO',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    image: 'C:/Users/Win11/.gemini/antigravity/brain/d10acab1-76dc-474c-b7c9-b8dcc5fc436b/lh_hoodie_1790357729123.jpg',
    description: 'O Hoodie LH Crown Premium redefine o conceito de moletom pesado. Fabricado em tecido premium 400g com interior aveludado, ponteiras metálicas de cordão antioxidante.',
    stockQuantity: 25
  },
  {
    id: 'lh-prod-3',
    name: 'Calça Cargo Tactical LH Dark Drip',
    subtitle: 'Tecido Ripstop Utilitário | 6 Bolsos de Fivela',
    category: 'calcas',
    price: 289.90,
    originalPrice: 359.90,
    discountPercent: 19,
    rating: 4.8,
    reviewsCount: 76,
    isNew: false,
    isBestSeller: true,
    freeShipping: true,
    badge: 'DESTAQUE',
    sizes: ['38', '40', '42', '44', '46'],
    image: 'C:/Users/Win11/.gemini/antigravity/brain/d10acab1-76dc-474c-b7c9-b8dcc5fc436b/lh_cargo_pants_1790357752250.jpg',
    description: 'Inspirada na estética militar e techwear urbana, a Calça Cargo Tactical LH conta com tecido Ripstop hidro-repelente de alta resistência e 6 bolsos utilitários.',
    stockQuantity: 20
  },
  {
    id: 'lh-prod-4',
    name: 'Boné Dad Hat LH Crown Metallic Silver',
    subtitle: 'Sarja 100% Algodão | Fivela em Metal Escovado',
    category: 'bones',
    price: 119.90,
    originalPrice: 149.90,
    discountPercent: 20,
    rating: 4.9,
    reviewsCount: 210,
    isNew: true,
    isBestSeller: false,
    freeShipping: false,
    badge: 'ED. LIMITADA',
    sizes: ['ÚNICO'],
    image: 'C:/Users/Win11/.gemini/antigravity/brain/d10acab1-76dc-474c-b7c9-b8dcc5fc436b/lh_cap_1790357778241.jpg',
    description: 'O Boné Dad Hat LH Crown traz o clássico corte desestruturado em sarja pesada de algodão com bordado frontal metálico prateado do logotipo LH STORE.',
    stockQuantity: 40
  },
  {
    id: 'lh-prod-5',
    name: 'Jaqueta Puffer LH Urban Stealth Thermal',
    subtitle: 'Isolamento Térmico Duplo | Acabamento Matte',
    category: 'hoodies',
    price: 499.90,
    originalPrice: 599.90,
    discountPercent: 16,
    rating: 5.0,
    reviewsCount: 45,
    isNew: true,
    isBestSeller: true,
    freeShipping: true,
    badge: 'WINTER 2026',
    sizes: ['P', 'M', 'G', 'GG'],
    image: 'C:/Users/Win11/.gemini/antigravity/brain/d10acab1-76dc-474c-b7c9-b8dcc5fc436b/lh_hoodie_1790357729123.jpg',
    description: 'Projetada para os dias frios sem perder a atitude. A Jaqueta Puffer LH possui acolchoamento sintético de alta retenção de calor e zíper selado à prova de vento.',
    stockQuantity: 15
  },
  {
    id: 'lh-prod-6',
    name: 'Camiseta LH Gothic Crown Off-White Oversized',
    subtitle: 'Estampa Gótica | Fio 30.1 Penteado',
    category: 'camisetas',
    price: 179.90,
    originalPrice: 219.90,
    discountPercent: 18,
    rating: 4.7,
    reviewsCount: 89,
    isNew: false,
    isBestSeller: false,
    freeShipping: true,
    badge: '30% OFF',
    sizes: ['P', 'M', 'G', 'GG'],
    image: 'C:/Users/Win11/.gemini/antigravity/brain/d10acab1-76dc-474c-b7c9-b8dcc5fc436b/lh_oversized_tshirt_1790357706615.jpg',
    description: 'Estética marcante com influências do underground e tipografia gótica exclusiva. Confeccionada em malha premium Off-White com caimento fluído.',
    stockQuantity: 22
  }
];

const INITIAL_PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX (Chave ou QR Code)' },
  { id: 'cartao', name: 'Cartão de Crédito/Débito na Entrega' },
  { id: 'dinheiro', name: 'Dinheiro na Entrega' }
];

const INITIAL_SETTINGS = {
  whatsappNumber: '5535999999999', // Padrão Cambuí - MG
  storeName: 'LH STORE',
  deliveryZone: 'Cambuí - MG e Região',
  freeShippingGoal: 299.00
};

// ==========================================================================
// Gerenciamento de Credenciais de Administração
// ==========================================================================
function getAdminPassword() {
  return localStorage.getItem('lh_store_admin_password') || 'lh1234';
}

function saveAdminPassword(password) {
  localStorage.setItem('lh_store_admin_password', password);
}

function getStoredProducts() {
  const saved = localStorage.getItem('lh_store_products');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler produtos do localStorage', e);
    }
  }
  localStorage.setItem('lh_store_products', JSON.stringify(INITIAL_PRODUCTS));
  return [...INITIAL_PRODUCTS];
}

function saveStoredProducts(products) {
  localStorage.setItem('lh_store_products', JSON.stringify(products));
}

function getStoredCategories() {
  const saved = localStorage.getItem('lh_store_categories');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler categorias do localStorage', e);
    }
  }
  localStorage.setItem('lh_store_categories', JSON.stringify(INITIAL_CATEGORIES));
  return [...INITIAL_CATEGORIES];
}

function saveStoredCategories(categories) {
  localStorage.setItem('lh_store_categories', JSON.stringify(categories));
}

function getStoredPaymentMethods() {
  const saved = localStorage.getItem('lh_store_payment_methods');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler métodos de pagamento do localStorage', e);
    }
  }
  localStorage.setItem('lh_store_payment_methods', JSON.stringify(INITIAL_PAYMENT_METHODS));
  return [...INITIAL_PAYMENT_METHODS];
}

function saveStoredPaymentMethods(methods) {
  localStorage.setItem('lh_store_payment_methods', JSON.stringify(methods));
}

function getStoredSettings() {
  const saved = localStorage.getItem('lh_store_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler configurações do localStorage', e);
    }
  }
  localStorage.setItem('lh_store_settings', JSON.stringify(INITIAL_SETTINGS));
  return { ...INITIAL_SETTINGS };
}

function saveStoredSettings(settings) {
  localStorage.setItem('lh_store_settings', JSON.stringify(settings));
}



