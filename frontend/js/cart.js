/* ============================================================
   ATCHAGA MART - Cart Page Logic
   (quantity +/-, remove, subtotal, stock checking)
   ============================================================ */

function getCart() {
    return AM.getCart();
}

function saveCart(cart) {
    AM.saveCart(cart);
    renderHeader('cart');
    renderCart();
}

function updateQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + change;

    if (newQty <= 0) {
        removeItem(productId);
        return;
    }

    if (newQty > item.stock) {
        AM.toast(`Only ${item.stock} items available in stock`, 'error');
        return;
    }

    item.quantity = newQty;
    saveCart(cart);
    AM.toast('Quantity updated', 'info');
}

function removeItem(productId) {
    let cart = getCart();
    const item = cart.find(i => i.productId === productId);
    cart = cart.filter(i => i.productId !== productId);
    saveCart(cart);
    AM.toast(item ? `Removed "${item.name}" from cart` : 'Item removed', 'info');
}

function clearCart() {
    AM.clearCart();
    renderHeader('cart');
    renderCart();
}

function cartSubtotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
    const container = document.getElementById('cartContent');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="am-empty-state">
                <div class="empty-icon">🛒</div>
                <h4>Your cart is empty</h4>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <a class="am-btn am-btn-accent" href="products.html">Start Shopping</a>
            </div>`;
        return;
    }

    const subtotal = cartSubtotal();
    const delivery = subtotal >= 999 ? 0 : 49;
    const total = subtotal + delivery;

    container.innerHTML = `
    <div class="row g-4">
        <div class="col-lg-8">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Shopping Cart (${cart.length} item${cart.length !== 1 ? 's' : ''})</h5>
                <button class="btn btn-sm btn-outline-danger" onclick="clearCart()">Clear Cart</button>
            </div>
            <div id="cartItemsList">
                ${cart.map(item => cartItemHTML(item)).join('')}
            </div>
        </div>
        <div class="col-lg-4">
            <div class="am-cart-summary">
                <h5>Order Summary</h5>
                <div class="am-summary-row"><span>Subtotal</span><span>${AM.formatPrice(subtotal)}</span></div>
                <div class="am-summary-row"><span>Delivery</span><span>${delivery === 0 ? '<span class="text-success">FREE</span>' : AM.formatPrice(delivery)}</span></div>
                ${delivery > 0 ? `<small class="text-muted d-block mb-2">Free delivery on orders above ₹999</small>` : ''}
                <div class="am-summary-row total"><span>Total</span><span>${AM.formatPrice(total)}</span></div>
                <a href="checkout.html" class="am-btn am-btn-accent w-100 mt-3" style="padding: 12px;">Proceed to Checkout</a>
                <a href="products.html" class="am-btn am-btn-outline w-100 mt-2" style="padding: 10px;">Continue Shopping</a>
            </div>
        </div>
    </div>`;
}

function cartItemHTML(item) {
    const stockWarning = item.quantity >= item.stock
        ? '<div class="text-danger small mt-1">Maximum stock reached</div>'
        : item.stock <= 10
            ? `<div class="text-warning small mt-1">Only ${item.stock} left in stock</div>`
            : '';

    return `
    <div class="am-cart-item">
        <a href="product-details.html?id=${item.productId}">
            <img class="am-cart-item-img" src="${AM.escapeHtml(item.imageUrl || 'https://placehold.co/400x400?text=No+Image')}"
                 alt="${AM.escapeHtml(item.name)}"
                 onerror="this.src='https://placehold.co/400x400/e9ecef/343a40?text=No+Image'">
        </a>
        <div class="flex-grow-1" style="min-width: 200px;">
            <h6 class="fw-bold mb-1">${AM.escapeHtml(item.name)}</h6>
            <p class="text-muted small mb-2">${AM.formatPrice(item.price)} each</p>
            <div class="am-qty-selector">
                <button type="button" onclick="updateQuantity(${item.productId}, -1)">−</button>
                <input type="text" value="${item.quantity}" readonly>
                <button type="button" onclick="updateQuantity(${item.productId}, 1)">+</button>
            </div>
            ${stockWarning}
        </div>
        <div class="text-end">
            <h6 class="fw-bold mb-2">${AM.formatPrice(item.price * item.quantity)}</h6>
            <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${item.productId})">Remove</button>
        </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', renderCart);
