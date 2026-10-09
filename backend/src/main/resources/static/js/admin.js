/* ============================================================
   ATCHAGA MART - Admin Dashboard Logic
   Sections: Summary, Users, Products, Orders, Carts, DB Viewer
   ============================================================ */

const TRACKING_FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
let currentDbPage = {};
let currentDbTable = '';

async function initAdmin() {
    const role = AM.getUserRole();
    if (role !== 'ADMIN') {
        AM.toast('Access denied. Admin only.', 'error');
        setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        return;
    }
    await showSection('summary');
}

function showSection(section) {
    const container = document.getElementById('adminContent');
    if (!container) return;

    const loaders = {
        summary: loadSummary,
        users: loadUsers,
        products: loadProducts,
        orders: loadOrders,
        carts: loadCarts,
        database: loadDatabaseViewer
    };

    if (loaders[section]) {
        loaders[section]();
    }
}

/* ============ 1. DASHBOARD SUMMARY ============ */
async function loadSummary() {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div class="am-loading-text">Loading summary... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const data = await AdminAPI.getDashboard();
        container.innerHTML = `
            <div class="row g-4">
                <div class="col-6 col-md-4 col-lg-2">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">👥</div>
                        <div class="am-stat-value">${data.totalUsers}</div>
                        <div class="am-stat-label">Total Users</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">🏪</div>
                        <div class="am-stat-value">${data.totalSellers}</div>
                        <div class="am-stat-label">Total Sellers</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">📦</div>
                        <div class="am-stat-value">${data.totalProducts}</div>
                        <div class="am-stat-label">Total Products</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">🛒</div>
                        <div class="am-stat-value">${data.totalOrders}</div>
                        <div class="am-stat-label">Total Orders</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">💰</div>
                        <div class="am-stat-value">${AM.formatPrice(data.totalSales)}</div>
                        <div class="am-stat-label">Total Sales</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">⏳</div>
                        <div class="am-stat-value">${data.pendingOrders}</div>
                        <div class="am-stat-label">Pending Orders</div>
                    </div>
                </div>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

/* ============ 2. REGISTERED ACCOUNTS ============ */
async function loadUsers() {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div class="am-loading-text">Loading users... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const users = await AdminAPI.getAllUsers();
        if (users.length === 0) {
            container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">👥</div><h4>No users found</h4><p>No registered accounts yet.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="am-filter-card" style="overflow-x: auto;">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Registered</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map((u, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${AM.escapeHtml(u.name)}</td>
                                <td>${AM.escapeHtml(u.email)}</td>
                                <td>${AM.escapeHtml(u.phone || '-')}</td>
                                <td><span class="badge ${u.role === 'ADMIN' ? 'bg-danger' : u.role === 'SELLER' ? 'bg-warning text-dark' : 'bg-success'}">${u.role}</span></td>
                                <td>${AM.formatDate(u.createdAt)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

/* ============ 3. PRODUCT MANAGEMENT ============ */
async function loadProducts() {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div class="am-loading-text">Loading products... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const products = await AdminAPI.getAllProducts();
        if (products.length === 0) {
            container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">📦</div><h4>No products found</h4><p>No products in the database yet.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="am-filter-card" style="overflow-x: auto;">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map((p, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${AM.escapeHtml(p.name)}</td>
                                <td>${AM.escapeHtml(p.category)}</td>
                                <td>${AM.escapeHtml(p.brand || '-')}</td>
                                <td>${AM.formatPrice(p.price)}</td>
                                <td><span class="badge ${p.stock === 0 ? 'bg-danger' : p.stock <= 10 ? 'bg-warning text-dark' : 'bg-success'}">${p.stock}</span></td>
                                <td>${p.rating.toFixed(1)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Delete</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    AM.showSpinner();
    try {
        await AdminAPI.deleteProduct(id);
        AM.toast('Product deleted successfully', 'success');
        await loadProducts();
    } catch (error) {
        AM.toast(error.message, 'error');
    } finally {
        AM.hideSpinner();
    }
}

/* ============ 4. ORDER MANAGEMENT ============ */
async function loadOrders() {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div class="am-loading-text">Loading orders... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const orders = await AdminAPI.getAllOrders();
        if (orders.length === 0) {
            container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">🛒</div><h4>No orders found</h4><p>No orders have been placed yet.</p></div>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="am-order-card">
                <div class="am-order-header">
                    <span class="order-id">Order #${AM.escapeHtml(order.orderId)}</span>
                    <span>Placed: ${AM.formatDate(order.createdAt)}</span>
                    <span class="am-order-status">${AM.escapeHtml(order.status)}</span>
                    <span class="fw-bold">Total: ${AM.formatPrice(order.totalAmount)}</span>
                </div>
                <div class="am-order-body">
                    <div class="text-muted small mb-2">
                        <strong>Customer:</strong> ${AM.escapeHtml(order.customerName)} (${AM.escapeHtml(order.customerEmail)})<br>
                        <strong>Phone:</strong> ${AM.escapeHtml(order.customerPhone || '-')}<br>
                        <strong>Address:</strong> ${AM.escapeHtml(order.shippingAddress)}
                    </div>
                    ${order.items.map(item => `
                        <div class="am-order-item-row">
                            <span>${AM.escapeHtml(item.productName)} <span class="text-muted">× ${item.quantity}</span></span>
                            <span class="fw-semibold">${AM.formatPrice(item.price * item.quantity)}</span>
                        </div>`).join('')}
                    <div class="mt-3 d-flex gap-2 align-items-center flex-wrap">
                        <select class="form-select form-select-sm" id="status-select-${AM.escapeHtml(order.orderId)}" style="width: auto;">
                            ${TRACKING_FLOW.map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s.replace(/_/g, ' ')}</option>`).join('')}
                        </select>
                        <button class="am-btn am-btn-accent" style="padding: 6px 16px; font-size: 0.82rem;" onclick="updateOrderStatus('${AM.escapeHtml(order.orderId)}')">
                            Update Status
                        </button>
                    </div>
                </div>
            </div>`).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

async function updateOrderStatus(orderId) {
    const select = document.getElementById('status-select-' + orderId);
    if (!select) return;
    AM.showSpinner();
    try {
        await AdminAPI.updateOrderStatus(orderId, select.value);
        AM.toast(`Order ${orderId} status updated to ${select.value}`, 'success');
        await loadOrders();
    } catch (error) {
        AM.toast(error.message, 'error');
    } finally {
        AM.hideSpinner();
    }
}

/* ============ 5. CART MANAGEMENT ============ */
async function loadCarts() {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div class="am-loading-text">Loading carts... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const carts = await AdminAPI.getAllCarts();
        if (carts.length === 0) {
            container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">🛒</div><h4>No carts found</h4><p>No user carts in the database yet.</p></div>';
            return;
        }

        container.innerHTML = carts.map(cart => `
            <div class="am-order-card">
                <div class="am-order-header">
                    <span class="order-id">${AM.escapeHtml(cart.userName)}</span>
                    <span>${AM.escapeHtml(cart.userEmail)}</span>
                    <span class="badge ${cart.userRole === 'ADMIN' ? 'bg-danger' : cart.userRole === 'SELLER' ? 'bg-warning text-dark' : 'bg-success'}">${cart.userRole}</span>
                    <span class="fw-bold">${cart.itemCount} item${cart.itemCount !== 1 ? 's' : ''} — ${AM.formatPrice(cart.subtotal)}</span>
                </div>
                <div class="am-order-body">
                    ${cart.items.length === 0
                        ? '<p class="text-muted mb-0">Cart is empty</p>'
                        : cart.items.map(item => `
                            <div class="am-order-item-row">
                                <span>${AM.escapeHtml(item.productName)} <span class="text-muted">× ${item.quantity}</span></span>
                                <span class="fw-semibold">${AM.formatPrice(item.price * item.quantity)}</span>
                            </div>`).join('')}
                </div>
            </div>`).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

/* ============ 6. DATABASE VIEWER ============ */
async function loadDatabaseViewer() {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div class="am-loading-text">Loading database tables... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const tables = await AdminAPI.getDatabaseTables();
        container.innerHTML = `
            <div class="am-filter-card mb-3">
                <h6 class="fw-bold mb-3">Database Tables</h6>
                <div class="d-flex gap-2 flex-wrap">
                    ${tables.map(t => `
                        <button class="am-btn am-btn-outline" style="padding: 6px 14px; font-size: 0.82rem;" onclick="loadTableData('${t.tableName}', 1)">
                            ${t.tableName} (${t.rowCount})
                        </button>`).join('')}
                </div>
            </div>
            <div id="dbTableContent"></div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

async function loadTableData(tableName, page) {
    currentDbTable = tableName;
    currentDbPage[tableName] = page;
    const container = document.getElementById('dbTableContent');
    if (!container) return;
    container.innerHTML = '<div class="am-loading-text" style="padding: 20px;">Loading table data... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const data = await AdminAPI.getTableData(tableName, page, 20);
        container.innerHTML = `
            <div class="am-filter-card" style="overflow-x: auto;">
                <h6 class="fw-bold mb-3">${AM.escapeHtml(data.tableName)} — ${data.total} records (Page ${data.page} of ${data.totalPages})</h6>
                <table class="table table-sm table-striped mb-0">
                    <thead>
                        <tr>
                            ${data.columns.map(c => `<th>${AM.escapeHtml(c)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.rows.map(row => `
                            <tr>
                                ${data.columns.map(c => `<td>${AM.escapeHtml(String(row[c] ?? ''))}</td>`).join('')}
                            </tr>`).join('')}
                    </tbody>
                </table>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <button class="btn btn-sm btn-outline-secondary" onclick="loadTableData('${tableName}', ${data.page - 1})" ${data.page <= 1 ? 'disabled' : ''}>Previous</button>
                    <span class="text-muted small">Page ${data.page} of ${data.totalPages}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="loadTableData('${tableName}', ${data.page + 1})" ${data.page >= data.totalPages ? 'disabled' : ''}>Next</button>
                </div>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);
