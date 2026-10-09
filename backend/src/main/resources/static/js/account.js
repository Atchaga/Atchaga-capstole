/* ============================================================
   ATCHAGA MART - My Account Page Logic
   (user details, profile update, order history, order tracking)
   ============================================================ */

const TRACKING_STAGES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STAGE_LABELS = {
    'PLACED': 'Order Placed',
    'CONFIRMED': 'Order Confirmed',
    'SHIPPED': 'Shipped',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered'
};

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
            <div class="mt-3 d-flex gap-2 flex-wrap">
                <button class="am-btn am-btn-accent" style="padding: 8px 18px; font-size: 0.85rem;" onclick="trackOrder('${AM.escapeHtml(order.orderId)}')">
                    📍 Track Order
                </button>
                <button class="am-btn am-btn-outline" style="padding: 8px 18px; font-size: 0.85rem;" onclick="advanceOrderStatus('${AM.escapeHtml(order.orderId)}')">
                    ⏭️ Advance Status (Demo)
                </button>
            </div>
        </div>
    </div>
    <div id="tracking-${AM.escapeHtml(order.orderId)}"></div>`;
}

async function trackOrder(orderId) {
    const container = document.getElementById('tracking-' + orderId);
    if (!container) return;

    // Toggle: if already showing, hide it
    if (container.innerHTML.trim() !== '') {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '<div class="am-loading-text" style="padding: 20px;">Loading tracking info... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const tracking = await OrderAPI.getTracking(orderId);
        container.innerHTML = buildTrackingTimeline(tracking);
    } catch (error) {
        container.innerHTML = `<p class="text-danger small">${AM.escapeHtml(error.message)}</p>`;
    }
}

function buildTrackingTimeline(tracking) {
    // Build a map of status -> timestamp from tracking data
    const statusMap = {};
    tracking.forEach(entry => {
        if (!statusMap[entry.status]) {
            statusMap[entry.status] = entry.timestamp;
        }
    });

    // Determine current status index
    let currentIndex = -1;
    for (let i = TRACKING_STAGES.length - 1; i >= 0; i--) {
        if (statusMap[TRACKING_STAGES[i]]) {
            currentIndex = i;
            break;
        }
    }

    // Handle cancelled or unknown statuses
    if (currentIndex === -1 && tracking.length > 0) {
        const lastStatus = tracking[tracking.length - 1].status;
        if (!TRACKING_STAGES.includes(lastStatus)) {
            return `
            <div class="am-tracking-timeline">
                <div class="am-tracking-header">
                    <span class="am-tracking-status-badge cancelled">${AM.escapeHtml(lastStatus)}</span>
                </div>
                <div class="am-tracking-stage current">
                    <div class="am-tracking-dot cancelled"></div>
                    <div class="am-tracking-content">
                        <div class="am-tracking-stage-title">${AM.escapeHtml(lastStatus)}</div>
                        <div class="am-tracking-stage-date">${AM.formatDate(tracking[tracking.length - 1].timestamp)}</div>
                        <div class="am-tracking-stage-notes">${AM.escapeHtml(tracking[tracking.length - 1].notes || '')}</div>
                    </div>
                </div>
            </div>`;
        }
    }

    const stagesHTML = TRACKING_STAGES.map((stage, index) => {
        const timestamp = statusMap[stage];
        const isCompleted = timestamp !== undefined;
        const isCurrent = index === currentIndex;
        const isPending = !isCompleted;

        let stageClass = 'pending';
        let dotClass = 'pending';
        if (isCompleted) {
            stageClass = 'completed';
            dotClass = 'completed';
        }
        if (isCurrent) {
            stageClass = 'current';
            dotClass = 'current';
        }

        const icon = isCompleted ? '✓' : (isCurrent ? '●' : '○');
        const dateDisplay = isCompleted ? AM.formatDate(timestamp) : 'Pending';

        return `
        <div class="am-tracking-stage ${stageClass}">
            <div class="am-tracking-dot ${dotClass}">${icon}</div>
            <div class="am-tracking-content">
                <div class="am-tracking-stage-title">${STAGE_LABELS[stage]}</div>
                <div class="am-tracking-stage-date">${dateDisplay}</div>
                ${isCompleted && tracking.find(t => t.status === stage) ? `<div class="am-tracking-stage-notes">${AM.escapeHtml(tracking.find(t => t.status === stage).notes || '')}</div>` : ''}
            </div>
        </div>`;
    }).join('');

    const currentStatusText = currentIndex >= 0 ? STAGE_LABELS[TRACKING_STAGES[currentIndex]] : 'Unknown';

    return `
    <div class="am-tracking-timeline">
        <div class="am-tracking-header">
            <span class="am-tracking-status-badge ${currentIndex >= 0 ? 'active' : 'cancelled'}">${AM.escapeHtml(currentStatusText)}</span>
        </div>
        ${stagesHTML}
    </div>`;
}

async function advanceOrderStatus(orderId) {
    AM.showSpinner();
    try {
        const result = await OrderAPI.advanceStatus(orderId);
        AM.toast(`Status updated to: ${result.status}`, 'success');
        await loadOrderHistory();
    } catch (error) {
        AM.toast(error.message, 'error');
    } finally {
        AM.hideSpinner();
    }
}

document.addEventListener('DOMContentLoaded', initAccount);
