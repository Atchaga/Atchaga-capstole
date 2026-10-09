/* ============================================================
   ATCHAGA MART - API Client (fetch + JWT Bearer handling)
   ============================================================ */

async function apiFetch(path, options = {}) {
    const url = AM.API_BASE + path;
    const token = AM.getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
            ...(options.headers || {})
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            AM.clearSession();
            AM.toast('Session expired. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
            }, 1200);
            throw new Error('Unauthorized');
        }

        // Handle empty responses
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            const message = (data && data.error) || (data && data.message) || 'Request failed. Please try again.';
            throw new Error(message);
        }

        return data;
    } catch (error) {
        if (error.message === 'Unauthorized') throw error;
        if (error instanceof TypeError) {
            throw new Error('Cannot connect to server. Please make sure the backend is running on port 8080.');
        }
        throw error;
    }
}

/* ============ AUTH API ============ */
const AuthAPI = {
    register: (userData) => apiFetch('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: credentials }),
    forgotPassword: (email) => apiFetch('/auth/forgot-password', { method: 'POST', body: { email } }),
    me: () => apiFetch('/auth/me')
};

/* ============ PRODUCTS API ============ */
const ProductAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') query.set(key, value);
        });
        const qs = query.toString();
        return apiFetch('/products' + (qs ? '?' + qs : ''));
    },
    getById: (id) => apiFetch('/products/' + id),
    getCategories: () => apiFetch('/products/categories')
};

/* ============ ORDERS API ============ */
const OrderAPI = {
    placeOrder: (orderData) => apiFetch('/orders', { method: 'POST', body: orderData }),
    getMyOrders: () => apiFetch('/orders/my-orders'),
    getOrder: (orderId) => apiFetch('/orders/' + orderId)
};

/* ============ USER API ============ */
const UserAPI = {
    getProfile: () => apiFetch('/users/me'),
    updateProfile: (data) => apiFetch('/users/me', { method: 'PUT', body: data })
};
