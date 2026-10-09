/* ============================================================
   ATCHAGA MART - Common Utilities, Header, Footer, Toast
   ============================================================ */

const AM = {
    API_BASE: '/api',

    // ---------- Session ----------
    getToken: () => localStorage.getItem('am_token'),
    getUser: () => {
        try { return JSON.parse(localStorage.getItem('am_user')); } catch { return null; }
    },
    setSession: (token, user) => {
        localStorage.setItem('am_token', token);
        localStorage.setItem('am_user', JSON.stringify(user));
    },
    clearSession: () => {
        localStorage.removeItem('am_token');
        localStorage.removeItem('am_user');
    },
    isLoggedIn: () => !!localStorage.getItem('am_token'),

    // ---------- Cart (localStorage) ----------
    getCart: () => {
        try { return JSON.parse(localStorage.getItem('am_cart')) || []; } catch { return []; }
    },
    saveCart: (cart) => localStorage.setItem('am_cart', JSON.stringify(cart)),
    cartCount: () => AM.getCart().reduce((sum, item) => sum + item.quantity, 0),
    clearCart: () => localStorage.removeItem('am_cart'),

    addToCart: (product, quantity = 1) => {
        const cart = AM.getCart();
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
                quantity: quantity
            });
        }
        AM.saveCart(cart);
    },

    // ---------- Helpers ----------
    formatPrice: (n) => '₹' + Number(n).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }),

    escapeHtml: (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c])),

    formatDate: (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
               ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    },

    showSpinner: () => {
        if (document.getElementById('am-spinner')) return;
        const div = document.createElement('div');
        div.id = 'am-spinner';
        div.className = 'am-spinner-overlay';
        div.innerHTML = '<div class="am-spinner"></div>';
        document.body.appendChild(div);
    },

    hideSpinner: () => {
        const el = document.getElementById('am-spinner');
        if (el) el.remove();
    },

    toast: (message, type = 'success') => {
        let container = document.getElementById('am-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'am-toast-container';
            container.className = 'am-toast-container';
            document.body.appendChild(container);
        }
        const icons = { success: '✓', error: '✕', info: 'ℹ' };
        const toast = document.createElement('div');
        toast.className = `am-toast ${type}`;
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${AM.escapeHtml(message)}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    requireAuth: (redirectPage) => {
        if (!AM.isLoggedIn()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(redirectPage || 'home.html');
            return false;
        }
        return true;
    },

    logout: () => {
        AM.clearSession();
        AM.toast('Logged out successfully', 'info');
        setTimeout(() => { window.location.href = 'home.html'; }, 600);
    }
};

/* ============ HEADER ============ */
function renderHeader(activePage) {
    const headerEl = document.getElementById('site-header');
    if (!headerEl) return;

    const user = AM.getUser();
    const cartCount = AM.cartCount();
    const isLoggedIn = AM.isLoggedIn();

    headerEl.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark am-navbar">
        <div class="container">
            <a class="navbar-brand" href="home.html">ATCHAGA <span>MART</span></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#amNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="amNavbar">
                <form class="d-flex am-search-form mx-lg-3 my-2 my-lg-0" id="amSearchForm">
                    <input type="text" id="amSearchInput" placeholder="Search for products, brands and more..." aria-label="Search">
                    <button type="submit" title="Search">&#128269;</button>
                </form>
                <ul class="navbar-nav ms-auto align-items-lg-center">
                    <li class="nav-item">
                        <a class="nav-link am-nav-link ${activePage === 'home' ? 'active fw-bold' : ''}" href="home.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link am-nav-link ${activePage === 'products' ? 'active fw-bold' : ''}" href="products.html">Shop All</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link am-nav-link dropdown-toggle" href="#" id="categoryDropdown" role="button" data-bs-toggle="dropdown">
                            Categories
                        </a>
                        <ul class="dropdown-menu am-dropdown-menu" id="categoryDropdownList">
                            <li><span class="dropdown-item text-muted">Loading...</span></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link am-nav-link ${activePage === 'cart' ? 'active fw-bold' : ''}" href="cart.html">
                            Cart${cartCount > 0 ? `<span class="am-cart-badge">${cartCount}</span>` : ''}
                        </a>
                    </li>
                    ${isLoggedIn ? `
                    <li class="nav-item dropdown">
                        <a class="nav-link am-nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-bs-toggle="dropdown">
                            Hi, ${AM.escapeHtml(user ? user.name.split(' ')[0] : 'User')}
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="account.html">My Account</a></li>
                            <li><a class="dropdown-item" href="account.html#orders">My Orders</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
                        </ul>
                    </li>` : `
                    <li class="nav-item">
                        <a class="nav-link am-nav-link ${activePage === 'login' ? 'active fw-bold' : ''}" href="login.html">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link am-nav-link" href="register.html">Register</a>
                    </li>`}
                </ul>
            </div>
        </div>
    </nav>`;

    // Search handler
    const searchForm = document.getElementById('amSearchForm');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('amSearchInput').value.trim();
        window.location.href = 'products.html' + (query ? '?search=' + encodeURIComponent(query) : '');
    });

    // Logout handler
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            AM.logout();
        });
    }

    // Load categories into dropdown
    loadCategoryDropdown();
}

async function loadCategoryDropdown() {
    const list = document.getElementById('categoryDropdownList');
    if (!list) return;
    try {
        const response = await fetch(AM.API_BASE + '/products/categories');
        const categories = await response.json();
        const icons = {
            'Electronics': '📱', 'Mobiles': '📲', 'Fashion': '👕', 'Computers': '💻',
            'Home & Kitchen': '🏠', 'Grocery': '🛒', 'Books': '📚', 'Sports': '⚽',
            'Toys': '🧸', 'Beauty': '💄', 'Accessories': '⌚'
        };
        list.innerHTML = categories.map(cat => `
            <li>
                <a class="dropdown-item am-dropdown-item" href="products.html?category=${encodeURIComponent(cat)}">
                    ${icons[cat] || '🏷️'} ${AM.escapeHtml(cat)}
                </a>
            </li>`).join('');
    } catch {
        list.innerHTML = '<li><span class="dropdown-item text-muted">Categories unavailable</span></li>';
    }
}

/* ============ FOOTER ============ */
function renderFooter() {
    const footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
    <footer class="am-footer">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-3">
                    <h5>ATCHAGA <span style="color: var(--am-accent)">MART</span></h5>
                    <p style="font-size: 0.88rem;">Shop Smart. Shop More. Easy Shopping.<br>Your one-stop destination for everything you need.</p>
                </div>
                <div class="col-md-2 mb-3">
                    <h5>Quick Links</h5>
                    <a href="home.html">Home</a>
                    <a href="products.html">Shop All</a>
                    <a href="cart.html">Cart</a>
                    <a href="account.html">My Account</a>
                </div>
                <div class="col-md-3 mb-3">
                    <h5>Categories</h5>
                    <a href="products.html?category=Electronics">Electronics</a>
                    <a href="products.html?category=Mobiles">Mobiles</a>
                    <a href="products.html?category=Fashion">Fashion</a>
                    <a href="products.html?category=Books">Books</a>
                </div>
                <div class="col-md-3 mb-3">
                    <h5>Contact Us</h5>
                    <a href="#">📍 12, Market Road, Mumbai</a>
                    <a href="#">📞 +91 98765 43210</a>
                    <a href="#">✉️ support@atchagamart.com</a>
                </div>
            </div>
            <div class="am-footer-bottom">
                &copy; ${new Date().getFullYear()} ATCHAGA MART. All rights reserved. | Shop Smart. Shop More. Easy Shopping.
            </div>
        </div>
    </footer>`;
}

/* ============ RATING STARS ============ */
function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < full) html += '★';
        else if (i === full && half) html += '⯨';
        else html += '☆';
    }
    return html;
}

/* ============ PRODUCT CARD TEMPLATE ============ */
function productCardHTML(product) {
    const stockClass = product.stock === 0 ? 'out' : product.stock <= 10 ? 'low' : 'in';
    const stockText = product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? `Only ${product.stock} left!` : 'In Stock';
    const mrp = (product.price * 1.25).toFixed(0);
    const discount = 20;

    return `
    <div class="col-6 col-md-4 col-lg-3 mb-4">
        <div class="am-product-card">
            <a href="product-details.html?id=${product.id}">
                <img class="am-product-img" src="${AM.escapeHtml(product.imageUrl || 'https://placehold.co/400x400?text=No+Image')}"
                     alt="${AM.escapeHtml(product.name)}" loading="lazy"
                     onerror="this.src='https://placehold.co/400x400/e9ecef/343a40?text=No+Image'">
            </a>
            <div class="am-product-body">
                <span class="am-product-brand">${AM.escapeHtml(product.brand || '')}</span>
                <h6 class="am-product-name"><a href="product-details.html?id=${product.id}">${AM.escapeHtml(product.name)}</a></h6>
                <div class="am-product-rating">${renderStars(product.rating)}<span class="rating-num">${product.rating.toFixed(1)}</span></div>
                <div class="am-product-price">
                    ${AM.formatPrice(product.price)}
                    <span class="mrp">₹${Number(mrp).toLocaleString('en-IN')}</span>
                    <span class="discount">${discount}% off</span>
                </div>
                <div class="am-stock-status ${stockClass}">${stockText}</div>
            </div>
            <div class="am-product-actions d-grid">
                <button class="am-btn am-btn-accent" onclick="addToCartHandler(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    </div>`;
}

/* ============ ADD TO CART HANDLER ============ */
async function addToCartHandler(productId) {
    if (!AM.isLoggedIn()) {
        AM.toast('Please login to add items to cart', 'info');
        setTimeout(() => { window.location.href = 'login.html?redirect=cart.html'; }, 900);
        return;
    }
    try {
        const product = await ProductAPI.getById(productId);
        if (product.stock === 0) {
            AM.toast('Sorry, this product is out of stock', 'error');
            return;
        }
        AM.addToCart(product, 1);
        AM.toast('Added to cart: ' + product.name, 'success');
        renderHeader('cart');
    } catch (error) {
        AM.toast(error.message, 'error');
    }
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
    renderHeader(document.body.dataset.page || '');
    renderFooter();
});
