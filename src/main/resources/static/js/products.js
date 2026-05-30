/**
 * Products Page Module
 */

const Products = (function() {

    function initCategoryFilter() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        const products = document.querySelectorAll('.product-card');
        const noResults = document.getElementById('noResults');

        function filterProducts(category) {
            let visibleCount = 0;

            products.forEach(product => {
                const productCategory = product.getAttribute('data-category');
                if (category === 'all' || productCategory === category) {
                    product.style.display = 'block';
                    visibleCount++;
                } else {
                    product.style.display = 'none';
                }
            });

            if (noResults) {
                noResults.classList.toggle('hidden', visibleCount > 0);
            }
        }

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterProducts(btn.getAttribute('data-category'));
            });
        });
    }

    function initAddToCart() {
        const addBtns = document.querySelectorAll('.quick-add');
        const cartBadge = document.querySelector('.cart-badge');

        function updateCartBadge(count) {
            if (cartBadge) {
                cartBadge.textContent = count;
                cartBadge.classList.toggle('hidden', count === 0);
            }
        }

        addBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productId = btn.getAttribute('data-product-id');
                if (!productId) {
                    return;
                }

                const originalText = btn.innerHTML;
                btn.disabled = true;

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
                        btn.innerHTML = 'Da them';
                    } else {
                        btn.innerHTML = data.message || 'That bai';
                    }
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    btn.innerHTML = 'That bai';
                } finally {
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 1500);
                }
            });
        });
    }

    function init() {
        initCategoryFilter();
        initAddToCart();
    }

    return { init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Products.init());
} else {
    Products.init();
}
