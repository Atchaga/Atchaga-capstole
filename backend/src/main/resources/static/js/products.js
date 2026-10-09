/* ============================================================
   ATCHAGA MART - Products Page Logic
   (search, category filter, price filter, sorting)
   ============================================================ */

const ProductsPage = {
    filters: {
        category: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        sort: 'asc'
    },

    init() {
        const params = new URLSearchParams(window.location.search);
        this.filters.category = params.get('category') || '';
        this.filters.search = params.get('search') || '';
        this.filters.minPrice = params.get('minPrice') || '';
        this.filters.maxPrice = params.get('maxPrice') || '';
        this.filters.sort = params.get('sort') || 'asc';

        // Pre-fill form fields
        const searchInput = document.getElementById('filterSearch');
        if (searchInput) searchInput.value = this.filters.search;
        const minInput = document.getElementById('filterMinPrice');
        if (minInput) minInput.value = this.filters.minPrice;
        const maxInput = document.getElementById('filterMaxPrice');
        if (maxInput) maxInput.value = this.filters.maxPrice;
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = this.filters.sort;

        // Event listeners
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        sortSelect.addEventListener('change', () => this.applyFilters());

        this.loadCategories();
        this.loadProducts();
    },

    async loadCategories() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;
        try {
            const categories = await ProductAPI.getCategories();
            container.innerHTML = categories.map(cat => `
                <a class="am-filter-category ${this.filters.category === cat ? 'active' : ''}"
                   href="#" data-category="${AM.escapeHtml(cat)}">${AM.escapeHtml(cat)}</a>`).join('');

            container.querySelectorAll('.am-filter-category').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const cat = el.dataset.category;
                    this.filters.category = this.filters.category === cat ? '' : cat;
                    this.loadCategories();
                    this.loadProducts();
                });
            });
        } catch {
            container.innerHTML = '<p class="text-muted small">Categories unavailable</p>';
        }
    },

    applyFilters() {
        this.filters.search = document.getElementById('filterSearch').value.trim();
        this.filters.minPrice = document.getElementById('filterMinPrice').value.trim();
        this.filters.maxPrice = document.getElementById('filterMaxPrice').value.trim();
        this.filters.sort = document.getElementById('sortSelect').value;
        this.loadProducts();
    },

    clearFilters() {
        this.filters = { category: '', search: '', minPrice: '', maxPrice: '', sort: 'asc' };
        document.getElementById('filterSearch').value = '';
        document.getElementById('filterMinPrice').value = '';
        document.getElementById('filterMaxPrice').value = '';
        document.getElementById('sortSelect').value = 'asc';
        this.loadCategories();
        this.loadProducts();
    },

    async loadProducts() {
        const container = document.getElementById('productsGrid');
        const countEl = document.getElementById('resultsCount');
        if (!container) return;

        container.innerHTML = '<div class="col-12"><div class="am-loading-text">Loading products... <span class="spinner-border spinner-border-sm"></span></div></div>';

        try {
            const products = await ProductAPI.getAll(this.filters);

            if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;

            if (products.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="am-empty-state">
                            <div class="empty-icon">🔍</div>
                            <h4>No products found</h4>
                            <p>Try adjusting your search or filters.</p>
                            <button class="am-btn am-btn-accent" onclick="ProductsPage.clearFilters()">Clear Filters</button>
                        </div>
                    </div>`;
                return;
            }

            container.innerHTML = products.map(product => productCardHTML(product)).join('');
        } catch (error) {
            container.innerHTML = `<div class="col-12"><p class="text-danger text-center">${AM.escapeHtml(error.message)}</p></div>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ProductsPage.init());
