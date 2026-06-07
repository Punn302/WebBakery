const Products = (function() {
    function initAddToCart() {
        const addButtons = document.querySelectorAll('.quick-add');
        const cartBadge = document.querySelector('.cart-badge');

        function updateCartBadge(count) {
            if (!cartBadge) return;
            cartBadge.textContent = count;
            cartBadge.classList.toggle('hidden', count === 0);
        }

        addButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();

                const productId = button.getAttribute('data-product-id');
                if (!productId) return;

                const originalText = button.innerHTML;
                button.disabled = true;

                try {
                    const response = await fetch('/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId, quantity: 1 }),
                        credentials: 'same-origin'
                    });
                    const data = await response.json();

                    if (data.success) {
                        updateCartBadge(data.cartCount || 0);
                        button.innerHTML = 'Đã thêm';
                    } else {
                        button.innerHTML = data.message || 'Thất bại';
                    }
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    button.innerHTML = 'Thất bại';
                } finally {
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.disabled = false;
                    }, 1500);
                }
            });
        });
    }

    function init() {
        initAddToCart();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Products.init());
