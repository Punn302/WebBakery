const Checkout = (function() {
    function showMessage(type, text) {
        const box = document.getElementById('checkoutMessage');
        if (!box) return;
        box.classList.remove('hidden', 'bg-red-50', 'text-red-600', 'bg-green-50', 'text-green-700');
        box.classList.add(type === 'success' ? 'bg-green-50' : 'bg-red-50');
        box.classList.add(type === 'success' ? 'text-green-700' : 'text-red-600');
        box.textContent = text;
    }

    function initPaymentCards() {
        document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
            input.addEventListener('change', () => {
                document.querySelectorAll('.payment-card').forEach(card => {
                    card.classList.remove('border-[#47654c]', 'bg-[#f7f3ec]');
                    card.classList.add('border-gray-200');
                });
                const card = input.closest('.payment-card');
                card.classList.remove('border-gray-200');
                card.classList.add('border-[#47654c]', 'bg-[#f7f3ec]');
            });
        });
    }

    function initForm() {
        const form = document.getElementById('checkoutForm');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Dang xu ly...';

            const payload = {
                customerName: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                note: document.getElementById('note').value.trim(),
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
            };

            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'same-origin'
                });
                const data = await response.json();

                if (!data.success) {
                    showMessage('error', data.message || 'Thanh toan that bai');
                    return;
                }

                const checkout = data.checkout;
                showMessage('success', data.message || 'Dat hang thanh cong');

                if (checkout.paymentMethod === 'MOMO' && checkout.payUrl) {
                    window.location.href = checkout.payUrl;
                } else {
                    window.location.href = '/checkout/success';
                }
            } catch (error) {
                console.error('Checkout error:', error);
                showMessage('error', 'Co loi xay ra khi thanh toan');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function init() {
        initPaymentCards();
        initForm();
    }

    return { init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Checkout.init());
} else {
    Checkout.init();
}
