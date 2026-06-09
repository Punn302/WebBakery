const Contact = (function() {
    function initFaq() {
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question');
            question?.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        });
    }

    function validateForm(formData) {
        const errors = [];
        const phone = formData.get('phone')?.trim() || '';
        const email = formData.get('email')?.trim() || '';

        if (!formData.get('name')?.trim()) errors.push('Vui lòng nhập họ tên');
        if (!email) errors.push('Vui lòng nhập email');
        else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) errors.push('Email không hợp lệ');
        if (!phone) errors.push('Vui lòng nhập số điện thoại');
        else if (!/^[0-9]{10,11}$/.test(phone)) errors.push('Số điện thoại không hợp lệ');
        if (!formData.get('subject')?.trim()) errors.push('Vui lòng chọn chủ đề');
        if (!formData.get('message')?.trim()) errors.push('Vui lòng nhập nội dung tin nhắn');

        return errors;
    }

    function showMessage(type, text) {
        const successDiv = document.getElementById('successMessage');
        const errorDiv = document.getElementById('errorMessage');
        const target = type === 'success' ? successDiv : errorDiv;
        const other = type === 'success' ? errorDiv : successDiv;

        other?.classList.remove('show');
        if (!target) return;
        target.innerHTML = text;
        target.classList.add('show');
        setTimeout(() => target.classList.remove('show'), 5000);
    }

    function initFormSubmit() {
        const form = document.getElementById('contactForm');
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const errors = validateForm(formData);
            if (errors.length > 0) {
                showMessage('error', errors.join('<br>'));
                return;
            }

            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Đang gửi...';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        subject: formData.get('subject'),
                        message: formData.get('message')
                    })
                });
                const data = await response.json();
                if (data.success) {
                    showMessage('success', data.message || 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.');
                    form.reset();
                } else {
                    showMessage('error', data.message || 'Gửi tin nhắn thất bại. Vui lòng thử lại.');
                }
            } catch (error) {
                showMessage('error', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function init() {
        initFaq();
        initFormSubmit();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Contact.init());
