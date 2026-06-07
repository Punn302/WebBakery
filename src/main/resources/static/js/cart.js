/**
 * Cart Page Module
 */

const Cart = (function() {

    function formatCurrency(value) {
        return Number(value || 0).toLocaleString('vi-VN') + 'd';
    }

    async function loadCart() {
        try {
            const response = await fetch('/api/cart', { credentials: 'same-origin' });
            const data = await response.json();
            if (data.success) {
                renderCartItems(data.items || []);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    function renderCartItems(items) {
        const container = document.getElementById('cartItemsContainer');
        if (!container) {
            return;
        }

        container.innerHTML = items.map(item => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition" data-product-id="${item.productId}">
                <td class="py-4 px-4">
                    <div class="flex items-center gap-4">
                        <img src="${item.imageUrl}" alt="${item.productName}" class="w-16 h-16 object-cover rounded-lg">
                        <div>
                            <h3 class="font-semibold text-gray-800">${item.productName}</h3>
                            <p class="text-xs text-gray-400">SKU: <span>${item.productId}</span></p>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="font-medium text-gray-700">${formatCurrency(item.price)}</span>
                </td>
                <td class="py-4 px-4">
                    <div class="flex justify-center">
                        <div class="quantity-selector">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="font-bold text-[#47654c] item-total">${formatCurrency(item.total)}</span>
                </td>
                <td class="py-4 px-4 text-center">
                    <button class="remove-item text-gray-400 hover:text-red-500 transition">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');

        bindCartItemEvents();
        updateCartDisplay();
    }

    function updateCartDisplay() {
        const rows = document.querySelectorAll('#cartItemsContainer tr');
        let subtotal = 0;

        rows.forEach(row => {
            const price = parseFloat(row.querySelector('td:nth-child(2) .font-medium').innerText.replace(/[^0-9]/g, ''));
            const quantity = parseInt(row.querySelector('.quantity-input').value) || 1;
            const total = price * quantity;
            subtotal += total;
            row.querySelector('.item-total').innerText = formatCurrency(total);
        });

        const shipping = rows.length > 0 ? 30000 : 0;
        const total = subtotal + shipping;

        document.getElementById('subtotal').innerText = formatCurrency(subtotal);
        document.getElementById('total').innerText = formatCurrency(total);
        updateCartBadge();
    }

    function updateCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        const rows = document.querySelectorAll('#cartItemsContainer tr');
        let totalQuantity = 0;

        rows.forEach(row => {
            totalQuantity += parseInt(row.querySelector('.quantity-input').value) || 0;
        });

        if (cartBadge) {
            cartBadge.textContent = totalQuantity;
            cartBadge.classList.toggle('hidden', totalQuantity === 0);
        }

        document.getElementById('emptyCart')?.classList.toggle('hidden', totalQuantity > 0);
    }

    function bindCartItemEvents() {
        document.querySelectorAll('.quantity-selector').forEach(selector => {
            const minusBtn = selector.querySelector('.minus');
            const plusBtn = selector.querySelector('.plus');
            const input = selector.querySelector('.quantity-input');
            const row = selector.closest('tr');
            const productId = row.getAttribute('data-product-id');

            minusBtn.addEventListener('click', async () => {
                let val = parseInt(input.value) || 1;
                if (val > 1) {
                    input.value = val - 1;
                    await updateQuantity(productId, val - 1);
                    updateCartDisplay();
                }
            });

            plusBtn.addEventListener('click', async () => {
                let val = parseInt(input.value) || 1;
                input.value = Math.min(val + 1, 99);
                await updateQuantity(productId, parseInt(input.value));
                updateCartDisplay();
            });

            input.addEventListener('change', async () => {
                let val = parseInt(input.value);
                if (isNaN(val) || val < 1) input.value = 1;
                if (val > 99) input.value = 99;
                await updateQuantity(productId, parseInt(input.value));
                updateCartDisplay();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', async () => {
                const row = btn.closest('tr');
                const productId = row.getAttribute('data-product-id');

                if (confirm('Ban co chac muon xoa san pham nay khoi gio hang?')) {
                    await removeItem(productId);
                    row.remove();
                    updateCartDisplay();
                }
            });
        });
    }

    async function updateQuantity(productId, quantity) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
                credentials: 'same-origin'
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async function removeItem(productId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
                credentials: 'same-origin'
            });
            return await response.json();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    function initCheckout() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        const loginModal = document.getElementById('loginModal');

        if (!checkoutBtn || !loginModal) {
            return;
        }

        checkoutBtn.addEventListener('click', async () => {
            const isLoggedIn = await checkLoginStatus();

            if (isLoggedIn) {
                window.location.href = '/checkout';
            } else {
                loginModal.style.display = 'flex';
                loginModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/user/status', { credentials: 'same-origin' });
            const data = await response.json();
            return data.loggedIn;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    function initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const loginModal = document.getElementById('loginModal');
        const closeBtns = document.querySelectorAll('.close-modal');

        if (!loginForm || !loginModal) {
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const result = await login(email, password);

            if (result.success) {
                loginModal.style.display = 'none';
                loginModal.classList.remove('show');
                document.body.style.overflow = '';
                if (result.redirectUrl === '/admin') {
                    window.location.href = '/admin';
                    return;
                }
                await saveCart();
                window.location.href = '/checkout';
            } else {
                alert('Email hoac mat khau khong dung!');
            }
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                loginModal.style.display = 'none';
                loginModal.classList.remove('show');
                document.body.style.overflow = '';
            });
        });

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                loginModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    async function login(email, password) {
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'same-origin'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false };
        }
    }

    async function saveCart() {
        try {
            const response = await fetch('/api/cart/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin'
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    async function init() {
        await loadCart();
        initCheckout();
        initLoginForm();
    }

    return { init: init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Cart.init());
} else {
    Cart.init();
}
