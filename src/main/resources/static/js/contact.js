/**
 * Contact Page Module
 */

const Contact = (function() {

    // Initialize FAQ accordion
    function initFaq() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current FAQ
                if (!isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }

    // Validate form
    function validateForm(formData) {
        const errors = [];

        if (!formData.get('name') || formData.get('name').trim() === '') {
            errors.push('Vui lòng nhập họ tên');
        }

        const email = formData.get('email');
        if (!email || email.trim() === '') {
            errors.push('Vui lòng nhập email');
        } else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) {
            errors.push('Email không hợp lệ');
        }

        if (!formData.get('phone') || formData.get('phone').trim() === '') {
            errors.push('Vui lòng nhập số điện thoại');
        } else if (!/^[0-9]{10,11}$/.test(formData.get('phone'))) {
            errors.push('Số điện thoại không hợp lệ (10-11 số)');
        }

        if (!formData.get('subject') || formData.get('subject').trim() === '') {
            errors.push('Vui lòng chọn chủ đề');
        }

        if (!formData.get('message') || formData.get('message').trim() === '') {
            errors.push('Vui lòng nhập nội dung tin nhắn');
        }

        return errors;
    }

    // Show message
    function showMessage(type, text) {
        const successDiv = document.getElementById('successMessage');
        const errorDiv = document.getElementById('errorMessage');

        if (type === 'success') {
            if (successDiv) {
                successDiv.innerHTML = text || 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.';
                successDiv.classList.add('show');
                setTimeout(() => {
                    successDiv.classList.remove('show');
                }, 5000);
            }
            // Reset form
            const form = document.getElementById('contactForm');
            if (form) form.reset();
        } else {
            if (errorDiv) {
                errorDiv.innerHTML = text || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
                errorDiv.classList.add('show');
                setTimeout(() => {
                    errorDiv.classList.remove('show');
                }, 5000);
            }
        }
    }

    // Handle form submission
    function initFormSubmit() {
        const form = document.getElementById('contactForm');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const errors = validateForm(formData);

                if (errors.length > 0) {
                    showMessage('error', errors.join('<br>'));
                    return;
                }

                // Disable submit button
                const submitBtn = form.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Đang gửi...';

                try {
                    // Simulate API call - Replace with your actual endpoint
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // For demo purposes - show success
                    showMessage('success');

                    // Uncomment for real API integration:
                    /*
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: formData.get('name'),
                            email: formData.get('email'),
                            phone: formData.get('phone'),
                            subject: formData.get('subject'),
                            message: formData.get('message')
                        })
                    });

                    if (response.ok) {
                        showMessage('success');
                    } else {
                        showMessage('error', 'Gửi tin nhắn thất bại. Vui lòng thử lại.');
                    }
                    */

                } catch (error) {
                    console.error('Error:', error);
                    showMessage('error', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        }
    }

    // Google Maps - You can replace with your actual location
    function initMap() {
        // This is just a placeholder
        // In production, you should use Google Maps API or embed your actual location
    }

    // Initialize
    function init() {
        initFaq();
        initFormSubmit();
        initMap();
    }

    return {
        init: init
    };
})();

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Contact.init());
} else {
    Contact.init();
}