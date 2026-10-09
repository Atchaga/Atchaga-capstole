/* ============================================================
   ATCHAGA MART - Seller Dashboard Logic
   Sections: Overview, Add Product, My Products, Stock, Orders
   Role is read from JWT (backend-issued), not from user input.
   ============================================================ */

async function initSeller() {
    const role = AM.getUserRole();
    if (role !== 'SELLER' && role !== 'ADMIN') {
        AM.toast('Access denied. Seller only.', 'error');
        setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        return;
    }
    await showSellerSection('overview');
}

function showSellerSection(section) {
    const container = document.getElementById('sellerContent');
    if (!container) return;

    const loaders = {
        overview: loadSellerOverview,
        add: loadAddProduct,
        products: loadMyProducts,
        stock: loadStockManagement,
        orders: loadSellerOrders
    };

    if (loaders[section]) loaders[section]();
}

/* ============ OVERVIEW ============ */
async function loadSellerOverview() {
    const container = document.getElementById('sellerContent');
    container.innerHTML = '<div class="am-loading-text">Loading overview... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const data = await SellerAPI.getDashboard();
        container.innerHTML = `
            <div class="row g-4">
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">📦</div>
                        <div class="am-stat-value">${data.myProductCount}</div>
                        <div class="am-stat-label">My Products</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">🛒</div>
                        <div class="am-stat-value">${data.totalOrders}</div>
                        <div class="am-stat-label">Total Orders</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">💰</div>
                        <div class="am-stat-value">${AM.formatPrice(data.totalRevenue)}</div>
                        <div class="am-stat-label">Total Revenue</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">⚠️</div>
                        <div class="am-stat-value">${data.lowStock}</div>
                        <div class="am-stat-label">Low Stock</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">🚚</div>
                        <div class="am-stat-value">${data.shipped}</div>
                        <div class="am-stat-label">Shipped</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">✅</div>
                        <div class="am-stat-value">${data.delivered}</div>
                        <div class="am-stat-label">Delivered</div>
                    </div>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="am-stat-card">
                        <div class="am-stat-icon">❌</div>
                        <div class="am-stat-value">${data.outOfStock}</div>
                        <div class="am-stat-label">Out of Stock</div>
                    </div>
                </div>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

/* ============ ADD PRODUCT ============ */
function loadAddProduct() {
    const container = document.getElementById('sellerContent');
    container.innerHTML = `
        <div class="am-profile-card" style="max-width: 700px;">
            <h5 class="fw-bold mb-4">Add New Product</h5>
            <form id="addProductForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="am-form-group">
                            <label>Product Name *</label>
                            <input type="text" class="am-form-control" id="prodName" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="am-form-group">
                            <label>Category *</label>
                            <select class="am-form-control" id="prodCategory" required>
                                <option value="">Select category</option>
                                <option>Electronics</option>
                                <option>Mobiles</option>
                                <option>Fashion</option>
                                <option>Computers</option>
                                <option>Home & Kitchen</option>
                                <option>Grocery</option>
                                <option>Books</option>
                                <option>Sports</option>
                                <option>Toys</option>
                                <option>Beauty</option>
                                <option>Accessories</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="am-form-group">
                    <label>Description</label>
                    <textarea class="am-form-control" id="prodDescription" rows="3"></textarea>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <div class="am-form-group">
                            <label>Price (₹) *</label>
                            <input type="number" class="am-form-control" id="prodPrice" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="am-form-group">
                            <label>Stock *</label>
                            <input type="number" class="am-form-control" id="prodStock" min="0" required>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="am-form-group">
                            <label>Brand</label>
                            <input type="text" class="am-form-control" id="prodBrand">
                        </div>
                    </div>
                </div>
                <div class="am-form-group">
                    <label>Image URL</label>
                    <input type="url" class="am-form-control" id="prodImageUrl" placeholder="https://...">
                </div>
                <button type="submit" class="am-btn am-btn-accent w-100">Add Product</button>
            </form>
        </div>`;

    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const product = {
            name: document.getElementById('prodName').value.trim(),
            category: document.getElementById('prodCategory').value,
            description: document.getElementById('prodDescription').value.trim(),
            price: parseFloat(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value),
            brand: document.getElementById('prodBrand').value.trim(),
            imageUrl: document.getElementById('prodImageUrl').value.trim()
        };

        if (!product.name || !product.category || !product.price || product.stock === undefined) {
            AM.toast('Please fill all required fields', 'error');
            return;
        }

        AM.showSpinner();
        try {
            await SellerAPI.addProduct(product);
            AM.toast('Product added successfully', 'success');
            e.target.reset();
            await showSellerSection('products');
        } catch (error) {
            AM.toast(error.message, 'error');
        } finally {
            AM.hideSpinner();
        }
    });
}

/* ============ MY PRODUCTS ============ */
async function loadMyProducts() {
    const container = document.getElementById('sellerContent');
    container.innerHTML = '<div class="am-loading-text">Loading products... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const products = await SellerAPI.getMyProducts();
        if (products.length === 0) {
            container.innerHTML = `
                <div class="am-empty-state">
                    <div class="empty-icon">📦</div>
                    <h4>No products yet</h4>
                    <p>Add your first product to get started.</p>
                    <button class="am-btn am-btn-accent" onclick="showSellerSection('add')">Add Product</button>
                </div>`;
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
                                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${p.id})">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSellerProduct(${p.id})">Delete</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

function editProduct(id) {
    AM.showSpinner();
    SellerAPI.getMyProducts().then(products => {
        const product = products.find(p => p.id === id);
        if (!product) {
            AM.toast('Product not found', 'error');
            AM.hideSpinner();
            return;
        }

        const container = document.getElementById('sellerContent');
        container.innerHTML = `
            <div class="am-profile-card" style="max-width: 700px;">
                <h5 class="fw-bold mb-4">Edit Product</h5>
                <form id="editProductForm">
                    <input type="hidden" id="editProdId" value="${product.id}">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="am-form-group">
                                <label>Product Name *</label>
                                <input type="text" class="am-form-control" id="editProdName" value="${AM.escapeHtml(product.name)}" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="am-form-group">
                                <label>Category *</label>
                                <select class="am-form-control" id="editProdCategory" required>
                                    ${['Electronics','Mobiles','Fashion','Computers','Home & Kitchen','Grocery','Books','Sports','Toys','Beauty','Accessories']
                                        .map(c => `<option ${c === product.category ? 'selected' : ''}>${c}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="am-form-group">
                        <label>Description</label>
                        <textarea class="am-form-control" id="editProdDescription" rows="3">${AM.escapeHtml(product.description || '')}</textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="am-form-group">
                                <label>Price (₹) *</label>
                                <input type="number" class="am-form-control" id="editProdPrice" value="${product.price}" min="0" step="0.01" required>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="am-form-group">
                                <label>Stock *</label>
                                <input type="number" class="am-form-control" id="editProdStock" value="${product.stock}" min="0" required>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="am-form-group">
                                <label>Brand</label>
                                <input type="text" class="am-form-control" id="editProdBrand" value="${AM.escapeHtml(product.brand || '')}">
                            </div>
                        </div>
                    </div>
                    <div class="am-form-group">
                        <label>Image URL</label>
                        <input type="url" class="am-form-control" id="editProdImageUrl" value="${AM.escapeHtml(product.imageUrl || '')}">
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="am-btn am-btn-accent flex-fill">Save Changes</button>
                        <button type="button" class="am-btn am-btn-outline" onclick="showSellerSection('products')">Cancel</button>
                    </div>
                </form>
            </div>`;

        document.getElementById('editProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updates = {
                name: document.getElementById('editProdName').value.trim(),
                category: document.getElementById('editProdCategory').value,
                description: document.getElementById('editProdDescription').value.trim(),
                price: parseFloat(document.getElementById('editProdPrice').value),
                stock: parseInt(document.getElementById('editProdStock').value),
                brand: document.getElementById('editProdBrand').value.trim(),
                imageUrl: document.getElementById('editProdImageUrl').value.trim()
            };

            AM.showSpinner();
            try {
                await SellerAPI.updateProduct(id, updates);
                AM.toast('Product updated successfully', 'success');
                await showSellerSection('products');
            } catch (error) {
                AM.toast(error.message, 'error');
            } finally {
                AM.hideSpinner();
            }
        });
    }).catch(error => {
        AM.toast(error.message, 'error');
    }).finally(() => {
        AM.hideSpinner();
    });
}

async function deleteSellerProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    AM.showSpinner();
    try {
        await SellerAPI.deleteProduct(id);
        AM.toast('Product deleted successfully', 'success');
        await showSellerSection('products');
    } catch (error) {
        AM.toast(error.message, 'error');
    } finally {
        AM.hideSpinner();
    }
}

/* ============ STOCK MANAGEMENT ============ */
async function loadStockManagement() {
    const container = document.getElementById('sellerContent');
    container.innerHTML = '<div class="am-loading-text">Loading stock... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const products = await SellerAPI.getMyProducts();
        if (products.length === 0) {
            container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">📦</div><h4>No products</h4><p>Add products to manage stock.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="am-filter-card" style="overflow-x: auto;">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Current Stock</th>
                            <th>Status</th>
                            <th>Update Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => {
                            const status = p.stock === 0 ? '<span class="badge bg-danger">Out of Stock</span>'
                                : p.stock <= 10 ? '<span class="badge bg-warning text-dark">Low Stock</span>'
                                : '<span class="badge bg-success">In Stock</span>';
                            return `
                            <tr>
                                <td>${AM.escapeHtml(p.name)}</td>
                                <td><strong>${p.stock}</strong></td>
                                <td>${status}</td>
                                <td>
                                    <div class="d-flex gap-2 align-items-center">
                                        <input type="number" class="form-control form-control-sm" id="stock-${p.id}" value="${p.stock}" min="0" style="width: 80px;">
                                        <button class="btn btn-sm btn-primary" onclick="updateStock(${p.id})">Update</button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${AM.escapeHtml(error.message)}</p>`;
    }
}

async function updateStock(productId) {
    const input = document.getElementById('stock-' + productId);
    if (!input) return;
    const newStock = parseInt(input.value);
    if (isNaN(newStock) || newStock < 0) {
        AM.toast('Invalid stock value', 'error');
        return;
    }

    AM.showSpinner();
    try {
        const products = await SellerAPI.getMyProducts();
        const product = products.find(p => p.id === productId);
        if (!product) {
            AM.toast('Product not found', 'error');
            return;
        }
        await SellerAPI.updateProduct(productId, { ...product, stock: newStock });
        AM.toast('Stock updated successfully', 'success');
        await showSellerSection('stock');
    } catch (error) {
        AM.toast(error.message, 'error');
    } finally {
        AM.hideSpinner();
    }
}

/* ============ SELLER ORDERS ============ */
async function loadSellerOrders() {
    const container = document.getElementById('sellerContent');
    container.innerHTML = '<div class="am-loading-text">Loading orders... <span class="spinner-border spinner-border-sm"></span></div>';

    try {
        const orders = await SellerAPI.getSellerOrders();
        if (orders.length === 0) {
            container.innerHTML = '<div class="am-empty-state"><div class="empty-icon">🛒</div><h4>No orders yet</h4><p>Orders will appear here when customers place them.</p></div>';
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
                        <strong>Address:</strong> ${AM.escapeHtml(order.shippingAddress)}
                    </div>
                    ${order.items.map(item => `
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

document.addEventListener('DOMContentLoaded', initSeller);
