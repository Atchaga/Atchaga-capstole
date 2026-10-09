/* ============================================================
   ATCHAGA MART - Product Details Page Logic
   ============================================================ */

let currentProduct = null;
let selectedQuantity = 1;

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const container = document.getElementById('productDetail');
    if (!container) return;

    if (!productId) {
        container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">⚠️</div><h4>Product not specified</h4><p>Please select a product from the catalog.</p><a class="am-btn am-btn-accent" href="products.html">Browse Products</a></div>';
        return;
    }

    container.innerHTML = '<div class="am-loading-text">Loading product... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const product = await ProductAPI.getById(productId);
        currentProduct = product;
        selectedQuantity = 1;
        renderProductDetail(product);
    } catch (error) {
        container.innerHTML = `<div class="am-empty-state"><div class="empty-icon">😕</div><h4>Product not found</h4><p>${AM.escapeHtml(error.message)}</p><a class="am-btn am-btn-accent" href="products.html">Browse Products</a></div>`;
    }
}

function renderProductDetail(product) {
    const container = document.getElementById('productDetail');
    const stockClass = product.stock === 0 ? 'out' : product.stock <= 10 ? 'low' : 'in';
    const stockText = product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? `Hurry! Only ${product.stock} left in stock` : 'In Stock';
    const mrp = (product.price * 1.25).toFixed(0);

    container.innerHTML = `
    <div class="am-product-detail">
        <div class="row g-4">
            <div class="col-md-5 text-center">
                <img class="am-product-detail-img" src="${AM.escapeHtml(product.imageUrl || 'https://placehold.co/400x400?text=No+Image')}"
                     alt="${AM.escapeHtml(product.name)}"
                     onerror="this.src='https://placehold.co/400x400/e9ecef/343a40?text=No+Image'">
            </div>
            <div class="col-md-7">
                <span class="am-product-brand">${AM.escapeHtml(product.brand || '')} &nbsp;|&nbsp; ${AM.escapeHtml(product.category)}</span>
                <h2 class="mt-2 mb-2">${AM.escapeHtml(product.name)}</h2>
                <div class="am-product-rating mb-3">${renderStars(product.rating)} <span class="rating-num">${product.rating.toFixed(1)} / 5</span></div>
                <hr>
                <div class="am-detail-price mb-1">
                    ${AM.formatPrice(product.price)}
                    <span class="mrp" style="font-size: 1rem; color: var(--am-text-muted); text-decoration: line-through; font-weight: 400;">₹${Number(mrp).toLocaleString('en-IN')}</span>
                    <span style="font-size: 1rem; color: var(--am-success); font-weight: 600;">20% off</span>
                </div>
                <p class="text-muted small mb-3">Inclusive of all taxes</p>

                <div class="am-stock-status ${stockClass}" style="font-size: 1rem; margin-bottom: 16px;">${stockText}</div>

                <h6 class="fw-bold">Description</h6>
                <p class="text-muted" style="font-size: 0.95rem; line-height: 1.6;">${AM.escapeHtml(product.description || 'No description available.')}</p>

                <div class="d-flex align-items-center gap-3 mt-4 flex-wrap">
                    <span class="fw-bold">Quantity:</span>
                    <div class="am-qty-selector">
                        <button type="button" id="qtyMinus">−</button>
                        <input type="text" id="qtyInput" value="1" readonly>
                        <button type="button" id="qtyPlus">+</button>
                    </div>
                </div>

                <div class="d-flex gap-3 mt-4 flex-wrap">
                    <button class="am-btn am-btn-accent flex-fill" id="addToCartBtn" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                    </button>
                    <button class="am-btn am-btn-danger-custom flex-fill" id="buyNowBtn" ${product.stock === 0 ? 'disabled' : ''}>
                        ⚡ Buy Now
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    // Quantity controls
    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (selectedQuantity > 1) {
            selectedQuantity--;
            document.getElementById('qtyInput').value = selectedQuantity;
        }
    });

    document.getElementById('qtyPlus').addEventListener('click', () => {
        if (selectedQuantity < product.stock) {
            selectedQuantity++;
            document.getElementById('qtyInput').value = selectedQuantity;
        } else {
            AM.toast('Maximum available stock: ' + product.stock, 'info');
        }
    });

    // Add to cart
    document.getElementById('addToCartBtn').addEventListener('click', () => {
        if (!AM.isLoggedIn()) {
            AM.toast('Please login to add items to cart', 'info');
            setTimeout(() => { window.location.href = 'login.html?redirect=product-details.html?id=' + product.id; }, 900);
            return;
        }
        if (selectedQuantity > product.stock) {
            AM.toast('Only ' + product.stock + ' items available', 'error');
            return;
        }
        AM.addToCart(product, selectedQuantity);
        AM.toast(selectedQuantity + ' × ' + product.name + ' added to cart', 'success');
        renderHeader('cart');
    });

    // Buy now
    document.getElementById('buyNowBtn').addEventListener('click', () => {
        if (!AM.isLoggedIn()) {
            AM.toast('Please login to continue', 'info');
            setTimeout(() => { window.location.href = 'login.html?redirect=product-details.html?id=' + product.id; }, 900);
            return;
        }
        if (selectedQuantity > product.stock) {
            AM.toast('Only ' + product.stock + ' items available', 'error');
            return;
        }
        // Replace cart with just this item for Buy Now
        AM.saveCart([{
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            quantity: selectedQuantity
        }]);
        window.location.href = 'checkout.html';
    });
}

document.addEventListener('DOMContentLoaded', loadProductDetails);
