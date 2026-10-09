/* ============================================================
   ATCHAGA MART - Authentication Page Logic
   Role-based redirect: USER → home.html, SELLER → seller.html
   Role is read from the JWT response (backend-issued), not from user input.
   ============================================================ */

function redirectBasedOnRole(role) {
    if (role === 'SELLER') {
        return 'seller.html';
    } else if (role === 'ADMIN') {
        return 'admin.html';
    }
    return 'home.html';
}

/* ============ LOGIN ============ */
function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            AM.toast('Please enter email and password', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            AM.toast('Please enter a valid email address', 'error');
            return;
        }

        AM.showSpinner();
        try {
            const data = await AuthAPI.login({ email, password });
            AM.setSession(data.token, { name: data.name, email: data.email, role: data.role });
            AM.toast('Welcome back, ' + data.name + '!', 'success');

            const params = new URLSearchParams(window.location.search);
            const redirectParam = params.get('redirect');
            const destination = redirectParam || redirectBasedOnRole(data.role);
            setTimeout(() => { window.location.href = destination; }, 700);
        } catch (error) {
            AM.toast(error.message, 'error');
        } finally {
            AM.hideSpinner();
        }
    });

    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value.trim();
            if (!email) {
                AM.toast('Please enter your email', 'error');
                return;
            }
            AM.showSpinner();
            try {
                const data = await AuthAPI.forgotPassword(email);
                AM.toast(data.message, 'success');
                const modalEl = document.getElementById('forgotPasswordModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                forgotForm.reset();
            } catch (error) {
                AM.toast(error.message, 'error');
            } finally {
                AM.hideSpinner();
            }
        });
    }
}

/* ============ REGISTER ============ */
function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const address = document.getElementById('regAddress').value.trim();
        const role = document.getElementById('regRole').value;

        if (!name || !email || !password || !role) {
            AM.toast('Please fill in all required fields', 'error');
            return;
        }
        if (name.length < 2) {
            AM.toast('Name must be at least 2 characters', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            AM.toast('Please enter a valid email address', 'error');
            return;
        }
        if (password.length < 6) {
            AM.toast('Password must be at least 6 characters', 'error');
            return;
        }
        if (password !== confirmPassword) {
            AM.toast('Passwords do not match', 'error');
            return;
        }
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            AM.toast('Phone number must be exactly 10 digits', 'error');
            return;
        }

        AM.showSpinner();
        try {
            const data = await AuthAPI.register({ name, email, phone, password, address, role });
            AM.setSession(data.token, { name: data.name, email: data.email, role: data.role });
            AM.toast('Account created successfully. Welcome to ATCHAGA MART!', 'success');
            setTimeout(() => { window.location.href = redirectBasedOnRole(data.role); }, 800);
        } catch (error) {
            AM.toast(error.message, 'error');
        } finally {
            AM.hideSpinner();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
    initRegisterPage();
});
