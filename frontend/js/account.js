/* ============================================================
   ATCHAGA MART - My Account Page Logic
   (user details, profile update, order history)
   ============================================================ */

async function initAccount() {
    if (!AM.requireAuth('account.html')) return;

    await loadProfile();
    await loadOrderHistory();
}

async function loadProfile() {
    const container = document.getElementById('profileSection');
    if (!container) return;

    try {
        const profile = await UserAPI.getProfile();
        const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

        container.innerHTML = `
        <div class="am-profile-card">
            <div class="am-profile-avatar">${AM.escapeHtml(initial)}</div>
            <div class="am-profile-info">
                <h4>${AM.escapeHtml(profile.name)}</h4>
                <p>✉️ ${AM.escapeHtml(profile.email)}</p>
                <p>📞 ${AM.escapeHtml(profile.phone || 'Not provided')}</p>
                <p>📍 ${AM.escapeHtml(profile.address || 'Not provided')}</p>
            </div>
            <hr class="my-4">
            <h6 class="fw-bold mb-3">Edit Profile</h6>
            <form id="updateProfileForm">
                <div class="am-form-group">
                    <label>Full Name</label>
                    <input type="text" class="am-form-control" id="updateName" value="${AM.escapeHtml(profile.name)}" required>
                </div>
                <div class="am-form-group">
                    <label>Phone (10 digits)</label>
                    <input type="text" class="am-form-control" id="updatePhone" value="${AM.escapeHtml(profile.phone || '')}" maxlength="10">
                </div>
                <div class="am-form-group">
                    <label>Address</label>
                    <textarea class="am-form-control" id="updateAddress" rows="3">${AM.escapeHtml(profile.address || '')}</textarea>
                </div>
                <button type="submit" class="am-btn am-btn-accent w-100">Save Changes</button>
            </form>
        </div>`;

        document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('updateName').value.trim();
            const phone = document.getElementById('updatePhone').value.trim();
            const address = document.getElementById('updateAddress').value.trim();

            if (!name) { AM.toast('Name is required', 'error'); return; }
            if (phone && !/^[0-9]{10}$/.test(phone)) { AM.toast('Phone must be exactly 10 digits', 'error'); return; }

            AM.showSpinner();
            try {
                await UserAPI.updateProfile({ name, phone, address });
                AM.toast('Profile updated successfully', 'success');
                await loadProfile();
                renderHeader('account');
            } catch (error) {
                AM.toast(error.message, 'error');
            } finally {
                AM.hideSpinner();
            }
        });
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

async function loadOrderHistory() {
    const container = document.getElementById('orderHistory');
    if (!container) return;

    container.innerHTML = '<div class="am-loading-text">Loading orders... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const orders = await OrderAPI.getMyOrders();

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="am-empty-state">
                    <div class="empty-icon">📦</div>
                    <h4>No orders yet</h4>
                    <p>When you place an order, it will appear here.</p>
                    <a class="am-btn am-btn-accent" href="products.html">Start Shopping</a>
                </div>`;
            return;
        }

        container.innerHTML = orders.map(order => orderCardHTML(order)).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

function orderCardHTML(order) {
    return `
    <div class="am-order-card">
        <div class="am-order-header">
            <span class="order-id">Order #${AM.escapeHtml(order.orderId)}</span>
            <span>Placed: ${AM.formatDate(order.createdAt)}</span>
            <span class="am-order-status">${AM.escapeHtml(order.status)}</span>
            <span class="fw-bold">Total: ${AM.formatPrice(order.totalAmount)}</span>
        </div>
        <div class="am-order-body">
            ${order.items.map(item => `
                <div class="am-order-item-row">
                    <span>${AM.escapeHtml(item.productName)} <span class="text-muted">× ${item.quantity}</span></span>
                    <span class="fw-semibold">${AM.formatPrice(item.price * item.quantity)}</span>
                </div>`).join('')}
            <div class="mt-2 text-muted small">
                <strong>Deliver to:</strong> ${AM.escapeHtml(order.shippingAddress)}
            </div>
        </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', initAccount);
