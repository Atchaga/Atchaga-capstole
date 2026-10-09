/* ============================================================
   ATCHAGA MART - Checkout Page Logic
   (customer details, address, order summary, place order)
   ============================================================ */

let checkoutCart = [];

async function initCheckout() {
    // Require login
    if (!AM.requireAuth('checkout.html')) return;

    checkoutCart = AM.getCart();

    // Empty cart handling
    if (checkoutCart.length === 0) {
        document.getElementById('checkoutContent').innerHTML = `
            <div class="am-empty-state">
                <div class="empty-icon">🛒</div>
                <h4>Your cart is empty</h4>
                <p>Add some products to your cart before checking out.</p>
                <a class="am-btn am-btn-accent" href="products.html">Browse Products</a>
            </div>`;
        return;
    }

    // Pre-fill customer details from profile
    try {
        const profile = await UserAPI.getProfile();
        document.getElementById('checkoutName').value = profile.name || '';
        document.getElementById('checkoutEmail').value = profile.email || '';
        document.getElementById('checkoutPhone').value = profile.phone || '';
        document.getElementById('checkoutAddress').value = profile.address || '';
    } catch {
        // Profile load failed - user can still fill manually
    }

    renderCheckoutSummary();

    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
}

function renderCheckoutSummary() {
    const container = document.getElementById('checkoutSummary');
    if (!container) return;

    const subtotal = checkoutCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal >= 999 ? 0 : 49;
    const total = subtotal + delivery;

    container.innerHTML = `
        <h5 class="fw-bold mb-3">Order Summary</h5>
        ${checkoutCart.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2" style="border-bottom: 1px solid #eee;">
                <div>
                    <span class="small fw-semibold">${AM.escapeHtml(item.name)}</span>
                    <span class="text-muted small"> × ${item.quantity}</span>
                </div>
                <span class="fw-semibold">${AM.formatPrice(item.price * item.quantity)}</span>
            </div>`).join('')}
        <div class="am-summary-row mt-3"><span>Subtotal</span><span>${AM.formatPrice(subtotal)}</span></div>
        <div class="am-summary-row"><span>Delivery</span><span>${delivery === 0 ? '<span class="text-success">FREE</span>' : AM.formatPrice(delivery)}</span></div>
        <div class="am-summary-row total"><span>Total</span><span>${AM.formatPrice(total)}</span></div>`;
}

async function placeOrder() {
    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();

    // Validation
    if (!name) { AM.toast('Please enter your full name', 'error'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { AM.toast('Please enter a valid email', 'error'); return; }
    if (phone && !/^[0-9]{10}$/.test(phone)) { AM.toast('Phone number must be exactly 10 digits', 'error'); return; }
    if (!address) { AM.toast('Please enter your shipping address', 'error'); return; }

    // Stock re-check before placing order
    for (const item of checkoutCart) {
        if (item.quantity > item.stock) {
            AM.toast(`"${item.name}" has only ${item.stock} items in stock. Please update your cart.`, 'error');
            return;
        }
    }

    const orderData = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        items: checkoutCart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    AM.showSpinner();
    try {
        const order = await OrderAPI.placeOrder(orderData);
        AM.clearCart();
        renderOrderSuccess(order);
    } catch (error) {
        AM.toast(error.message, 'error');
    } finally {
        AM.hideSpinner();
    }
}

function renderOrderSuccess(order) {
    const container = document.getElementById('checkoutContent');
    container.innerHTML = `
    <div class="am-success-card">
        <div class="am-success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p class="text-muted">Thank you for shopping with ATCHAGA MART.<br>Your order has been confirmed and will be delivered soon.</p>
        <div class="order-id-display">Order ID: ${AM.escapeHtml(order.orderId)}</div>
        <p class="text-muted">Total Paid: <strong class="text-dark">${AM.formatPrice(order.totalAmount)}</strong></p>
        <div class="d-flex gap-3 justify-content-center mt-4 flex-wrap">
            <a class="am-btn am-btn-accent" href="account.html#orders">View My Orders</a>
            <a class="am-btn am-btn-outline" href="products.html">Continue Shopping</a>
        </div>
    </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', initCheckout);
