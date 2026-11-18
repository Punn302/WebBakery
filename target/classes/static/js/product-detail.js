/**
 * Product Detail Page Module
 */

const ProductDetail = (function() {

    function initQuantitySelector() {
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const quantityInput = document.querySelector('#quantity');

        if (minusBtn && plusBtn && quantityInput) {
            const maxQuantity = parseInt(quantityInput.getAttribute('max')) || 99;
            minusBtn.addEventListener('click', () => {
                let val = parseInt(quantityInput.value) || 1;
                if (val > 1) {
                    quantityInput.value = val - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                let val = parseInt(quantityInput.value) || 1;
                if (val < maxQuantity) {
                    quantityInput.value = val + 1;
                }
            });

            quantityInput.addEventListener('change', () => {
                let val = parseInt(quantityInput.value);
                if (isNaN(val) || val < 1) quantityInput.value = 1;
                if (val > maxQuantity) quantityInput.value = maxQuantity;
            });
        }
    }

    function initGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.querySelector('#mainImage');

        if (thumbnails.length && mainImage) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    const imgSrc = thumb.querySelector('img').getAttribute('src');
                    mainImage.setAttribute('src', imgSrc);
                });
            });
        }
    }

    function initZoom() {
        const mainImage = document.querySelector('#mainImage');
        const zoomModal = document.querySelector('#zoomModal');
        const zoomImage = document.querySelector('#zoomImage');

        if (mainImage && zoomModal && zoomImage) {
            mainImage.addEventListener('click', () => {
                zoomImage.setAttribute('src', mainImage.getAttribute('src'));
                zoomModal.style.display = 'block';
            });

            zoomModal.addEventListener('click', () => {
                zoomModal.style.display = 'none';
            });
        }
    }

    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }

    function initAddToCart() {
        const addBtn = document.querySelector('#addToCartBtn');
        const cartBadge = document.querySelector('.cart-badge');

        function updateCartBadge(count) {
            if (cartBadge) {
                cartBadge.textContent = count;
                cartBadge.classList.toggle('hidden', count === 0);
            }
        }

        if (addBtn) {
            addBtn.addEventListener('click', async () => {
                const quantity = parseInt(document.querySelector('#quantity')?.value || 1);
                const productId = addBtn.getAttribute('data-product-id');
                const stock = parseInt(addBtn.getAttribute('data-stock')) || 0;
                if (!productId) {
                    return;
                }
                if (stock <= 0) {
                    addBtn.innerHTML = 'Hết hàng';
                    return;
                }

                const originalText = addBtn.innerHTML;
                addBtn.disabled = true;

                try {
                    const response = await fetch('/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId, quantity }),
                        credentials: 'same-origin'
                    });
                    const data = await response.json();

                    if (data.success) {
                        updateCartBadge(data.cartCount || 0);
                        addBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Da them vao gio';
                    } else {
                        addBtn.innerHTML = data.message || 'Them that bai';
                    }
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    addBtn.innerHTML = 'Them that bai';
                } finally {
                    setTimeout(() => {
                        addBtn.innerHTML = originalText;
                        addBtn.disabled = false;
                    }, 2000);
                }
            });
        }
    }

    function initReviews() {
        const form = document.getElementById('reviewForm');
        const deleteBtn = document.getElementById('deleteReviewBtn');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = form.getAttribute('data-product-id');
            const payload = {
                rating: Number(document.getElementById('reviewRating')?.value || 5),
                comment: document.getElementById('reviewComment')?.value.trim() || ''
            };
            const response = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (window.showToast) {
                window.showToast(data.message || (data.success ? 'Đã lưu đánh giá' : 'Không thể lưu đánh giá'), data.success ? 'success' : 'error');
            }
            if (data.success) window.location.reload();
        });

        deleteBtn?.addEventListener('click', async () => {
            const reviewId = form.getAttribute('data-review-id');
            if (!reviewId || !confirm('Xóa đánh giá này?')) return;
            const response = await fetch(`/api/products/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });
            const data = await response.json();
            if (window.showToast) {
                window.showToast(data.message || (data.success ? 'Đã xóa đánh giá' : 'Không thể xóa đánh giá'), data.success ? 'success' : 'error');
            }
            if (data.success) window.location.reload();
        });
    }

    function init() {
        initQuantitySelector();
        initGallery();
        initZoom();
        initTabs();
        initAddToCart();
        initReviews();
    }

    return { init: init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProductDetail.init());
} else {
    ProductDetail.init();
}
