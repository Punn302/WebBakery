/**
 * Login Page Module
 */

const Login = (function() {

    // Toggle password visibility
    function initTogglePassword() {
        const toggleBtns = document.querySelectorAll('.toggle-password');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                btn.textContent = type === 'password' ? 'visibility_off' : 'visibility';
            });
        });
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const successDiv = document.getElementById('successMessage');

        if (successDiv) successDiv.style.display = 'none';
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        const successText = document.getElementById('successText');
        const errorDiv = document.getElementById('errorMessage');

        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv && successText) {
            successText.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Login API call
    async function login(email, password, rememberMe) {
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ email, password, rememberMe })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' };
        }
    }

    // Handle form submission
    function initLoginForm() {
        const form = document.getElementById('loginForm');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe')?.checked || false;

                // Validate
                if (!email || !password) {
                    showError('Vui lòng nhập đầy đủ email và mật khẩu');
                    return;
                }

                if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) {
                    showError('Email không hợp lệ');
                    return;
                }

                // Disable button
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><span class="material-symbols-outlined">hourglass_empty</span>Đang xử lý...</span>';

                // Call API
                const result = await login(email, password, rememberMe);

                if (result.success) {
                    showSuccess('Đăng nhập thành công! Đang chuyển hướng...');

                    const urlParams = new URLSearchParams(window.location.search);
                    const requestedRedirect = urlParams.get('redirect') || '/';
                    const redirectUrl = result.redirectUrl === '/admin' ? '/admin' : requestedRedirect;

                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1500);
                } else {
                    showError(result.message || 'Email hoặc mật khẩu không đúng');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        }
    }

    // Social login placeholders
    function initSocialLogin() {
        const socialBtns = document.querySelectorAll('.social-btn');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                showError('Tính năng đang được phát triển. Vui lòng đăng nhập bằng email.');
            });
        });
    }

    // Check for redirect message
    function checkRedirectMessage() {
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        if (message === 'registered') {
            showSuccess('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
        } else if (message === 'required') {
            showError('Vui lòng đăng nhập để tiếp tục.');
        }
    }

    // Initialize
    function init() {
        initTogglePassword();
        initLoginForm();
        initSocialLogin();
        checkRedirectMessage();
    }

    return { init: init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Login.init());
} else {
    Login.init();
}
