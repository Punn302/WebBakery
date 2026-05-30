/**
 * Register Page Module
 */

const Register = (function() {

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

    // Validate form
    function validateForm(fullName, email, password, confirmPassword, phone, terms) {
        if (!fullName) {
            showError('Vui lòng nhập họ và tên');
            return false;
        }

        if (!email) {
            showError('Vui lòng nhập email');
            return false;
        }

        if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) {
            showError('Email không hợp lệ');
            return false;
        }

        if (!password) {
            showError('Vui lòng nhập mật khẩu');
            return false;
        }

        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp');
            return false;
        }

        if (phone && !/^[0-9]{10,11}$/.test(phone)) {
            showError('Số điện thoại không hợp lệ (10-11 số)');
            return false;
        }

        if (!terms) {
            showError('Vui lòng đồng ý với Điều khoản sử dụng');
            return false;
        }

        return true;
    }

    // Register API call
    async function register(fullName, email, password, phone) {
        try {
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email: email,
                    password: password,
                    phone: phone
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' };
        }
    }

    // Handle form submission
    function initRegisterForm() {
        const form = document.getElementById('registerForm');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const fullName = document.getElementById('fullName').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const phone = document.getElementById('phone').value.trim();
                const terms = document.getElementById('terms').checked;

                // Validate
                if (!validateForm(fullName, email, password, confirmPassword, phone, terms)) {
                    return;
                }

                // Disable button
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><span class="material-symbols-outlined">hourglass_empty</span>Đang xử lý...</span>';

                // Call API
                const result = await register(fullName, email, password, phone);

                if (result.success) {
                    showSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');

                    setTimeout(() => {
                        window.location.href = '/login?message=registered';
                    }, 2000);
                } else {
                    showError(result.message || 'Email đã tồn tại hoặc có lỗi xảy ra');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        }
    }

    // Social register placeholders
    function initSocialRegister() {
        const socialBtns = document.querySelectorAll('.social-btn');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                showError('Tính năng đang được phát triển. Vui lòng đăng ký bằng email.');
            });
        });
    }

    // Initialize
    function init() {
        initTogglePassword();
        initRegisterForm();
        initSocialRegister();
    }

    return { init: init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Register.init());
} else {
    Register.init();
}