/* ============================================================
   ATCHAGA MART - Home Page Logic
   ============================================================ */

const CATEGORY_META = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Mobiles', icon: '📲' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Computers', icon: '💻' },
    { name: 'Home & Kitchen', icon: '🏠' },
    { name: 'Grocery', icon: '🛒' },
    { name: 'Books', icon: '📚' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Toys', icon: '🧸' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Accessories', icon: '⌚' }
];

async function loadCategories() {
    const container = document.getElementById('categoryGrid');
    if (!container) return;

    try {
        const categories = await ProductAPI.getCategories();
        const available = new Set(categories);
        const ordered = CATEGORY_META.filter(c => available.has(c.name));
        // Include any categories from DB not in the meta list
        categories.filter(c => !CATEGORY_META.find(m => m.name === c))
                  .forEach(c => ordered.push({ name: c, icon: '🏷️' }));

        container.innerHTML = ordered.map(cat => `
            <div class="col-4 col-sm-3 col-md-2 mb-3">
                <a class="am-category-card" href="products.html?category=${encodeURIComponent(cat.name)}">
                    <div class="am-category-icon">${cat.icon}</div>
                    <h6>${AM.escapeHtml(cat.name)}</h6>
                </a>
            </div>`).join('');
    } catch (error) {
        container.innerHTML = '<p class="text-muted">Unable to load categories.</p>';
    }
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    container.innerHTML = '<div class="col-12"><div class="am-loading-text">Loading products... <span class="spinner-border spinner-border-sm"></span></div></div>';

    try {
        const products = await ProductAPI.getAll({ sort: 'rating' });
        const featured = products.slice(0, 8);

        if (featured.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted text-center">No products available.</p></div>';
            return;
        }

        container.innerHTML = featured.map(product => productCardHTML(product)).join('');
    } catch (error) {
        container.innerHTML = `<div class="col-12"><p class="text-danger text-center">${AM.escapeHtml(error.message)}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadFeaturedProducts();
});
