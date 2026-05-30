// Header scroll behavior
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.classList.remove('shadow-sm');
        return;
    }

    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        header.style.transform = 'translateY(-100%)';
    } else if (currentScroll < lastScroll) {
        header.style.transform = 'translateY(0)';
        header.classList.add('shadow-sm');
    }
    lastScroll = currentScroll;
});

// Cart counter
let cartCount = 0;
const cartBadge = document.querySelector('.cart-badge');

function updateCartCount(count) {
    cartCount = count;
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.classList.toggle('hidden', cartCount === 0);
    }
}

function addToCart() {
    updateCartCount(cartCount + 1);
}

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// User
const userBtn = document.querySelector('.user-btn');
if (userBtn) {
    userBtn.addEventListener('click', () => {
        alert('Chức năng đăng nhập/đăng ký');
    });
}

// Order tracking
const orderTrackingBtn = document.querySelector('.order-tracking-btn');
if (orderTrackingBtn) {
    orderTrackingBtn.addEventListener('click', () => {
        window.location.href = '/order-tracking';
    });
}
// Logout functionality
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/user/logout', { method: 'POST' });
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
}

// Call initLogout when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initLogout();
});
// Add to Cart functionality
function initAddToCart() {
    const addToCartBtns = document.querySelectorAll('.quick-add, .add-to-cart-btn');
    const cartBadge = document.querySelector('.cart-badge');

    async function addToCart(productId, quantity = 1) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
                credentials: 'same-origin'
            });
            const data = await response.json();

            if (data.success) {
                // Update cart badge
                if (cartBadge) {
                    cartBadge.textContent = data.cartCount;
                    if (data.cartCount > 0) {
                        cartBadge.classList.remove('hidden');
                    }
                }
                return data;
            } else {
                console.error('Add to cart failed:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            return null;
        }
    }

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Get product ID from data attribute or from parent
            let productId = btn.getAttribute('data-product-id');
            if (!productId) {
                const productCard = btn.closest('.product-card');
                if (productCard) {
                    productId = productCard.getAttribute('data-product-id');
                }
            }

            if (!productId) {
                console.error('Product ID not found');
                return;
            }

            const originalText = btn.innerHTML;
            const result = await addToCart(productId, 1);

            if (result) {
                // Show feedback
                btn.innerHTML = '✓ Đã thêm';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 1500);
            } else {
                btn.innerHTML = '❌ Thất bại';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 1500);
            }
        });
    });
}
// Search Expand functionality
function initSearchExpand() {
    const searchToggleBtn = document.getElementById('searchToggleBtn');
    const searchExpand = document.getElementById('searchExpand');
    const searchInput = document.getElementById('searchInput');
    const header = document.querySelector('header');

    if (!searchToggleBtn || !searchExpand) {
        console.log('Search elements not found');
        return;
    }

    // Mở ô tìm kiếm khi click vào icon
    searchToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Search button clicked');
        header.classList.add('search-expanded');
        setTimeout(function() {
            if (searchInput) {
                searchInput.focus();
            }
        }, 300);
    });

    // Đóng ô tìm kiếm khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (header.classList.contains('search-expanded')) {
            if (!searchExpand.contains(e.target) && !searchToggleBtn.contains(e.target)) {
                header.classList.remove('search-expanded');
                if (searchInput) {
                    searchInput.value = '';
                }
            }
        }
    });

    // Đóng khi nhấn ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && header.classList.contains('search-expanded')) {
            header.classList.remove('search-expanded');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    });

    // Ngăn chặn form submit rỗng
    const form = searchExpand.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                header.classList.remove('search-expanded');
            }
        });
    }
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initAddToCart();
    initSearchExpand();
    // ... các hàm khác
});
