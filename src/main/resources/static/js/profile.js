/**
 * Profile Page Module
 */

const Profile = (function() {

    let currentUser = null;

    // Load user data from server
    async function loadUserData() {
        try {
            const response = await fetch('/api/user/status');
            const data = await response.json();

            if (data.loggedIn) {
                currentUser = data.user;
                displayUserInfo();
            } else {
                window.location.href = '/login?redirect=/profile';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = '/login';
        }
    }

    // Display user info
    function displayUserInfo() {
        if (currentUser) {
            document.getElementById('userNameDisplay').textContent = currentUser.name || 'Người dùng';
            document.getElementById('userEmailDisplay').textContent = currentUser.email;
            document.getElementById('profileName').textContent = currentUser.name || 'Chưa cập nhật';
            document.getElementById('profileEmail').textContent = currentUser.email;
            document.getElementById('profilePhone').textContent = currentUser.phone || 'Chưa cập nhật';
            document.getElementById('profileJoinDate').textContent = new Date().toLocaleDateString('vi-VN');

            document.getElementById('editName').value = currentUser.name || '';
            document.getElementById('editPhone').value = currentUser.phone || '';
        }
    }

    // Tab navigation
    function initTabs() {
        const navItems = document.querySelectorAll('.profile-nav-item');
        const tabs = document.querySelectorAll('.tab-content');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                if (!tabId) return;

                // Update active nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Show active tab
                tabs.forEach(tab => tab.classList.add('hidden'));
                document.getElementById(`tab-${tabId}`).classList.remove('hidden');
            });
        });
    }

    // Edit profile
    function initEditProfile() {
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const viewDiv = document.getElementById('profileView');
        const editDiv = document.getElementById('profileEdit');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                viewDiv.classList.add('hidden');
                editDiv.classList.remove('hidden');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                viewDiv.classList.remove('hidden');
                editDiv.classList.add('hidden');
                displayUserInfo(); // Reset values
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const name = document.getElementById('editName').value;
                const phone = document.getElementById('editPhone').value;

                try {
                    const response = await fetch('/api/user/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone })
                    });
                    const data = await response.json();

                    if (data.success) {
                        currentUser = data.user;
                        displayUserInfo();
                        viewDiv.classList.remove('hidden');
                        editDiv.classList.add('hidden');
                        alert('Cập nhật thông tin thành công!');
                    } else {
                        alert(data.message || 'Cập nhật thất bại');
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('Có lỗi xảy ra');
                }
            });
        }
    }

    // Change password
    function initChangePassword() {
        const changeBtn = document.getElementById('changePasswordBtn');

        if (changeBtn) {
            changeBtn.addEventListener('click', async () => {
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmNewPassword').value;

                if (!currentPassword || !newPassword) {
                    alert('Vui lòng nhập đầy đủ thông tin');
                    return;
                }

                if (newPassword !== confirmPassword) {
                    alert('Mật khẩu mới không khớp');
                    return;
                }

                if (newPassword.length < 6) {
                    alert('Mật khẩu mới phải có ít nhất 6 ký tự');
                    return;
                }

                try {
                    const response = await fetch('/api/user/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                    const data = await response.json();

                    if (data.success) {
                        alert('Đổi mật khẩu thành công!');
                        document.getElementById('currentPassword').value = '';
                        document.getElementById('newPassword').value = '';
                        document.getElementById('confirmNewPassword').value = '';
                    } else {
                        alert(data.message || 'Đổi mật khẩu thất bại');
                    }
                } catch (error) {
                    console.error('Error changing password:', error);
                    alert('Có lỗi xảy ra');
                }
            });
        }
    }

    // Logout
    function initLogout() {
        const logoutBtn = document.getElementById('logoutNav');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await fetch('/api/user/logout', { method: 'POST' });
                    window.location.href = '/';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/';
                }
            });
        }
    }

    // Load orders
    async function loadOrders() {
        try {
            const response = await fetch('/api/user/orders');
            const data = await response.json();

            const ordersContainer = document.getElementById('ordersList');
            if (data.orders && data.orders.length > 0) {
                ordersContainer.innerHTML = data.orders.map(order => `
                    <div class="order-card">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <p class="font-semibold text-gray-800">#${order.id}</p>
                                <p class="text-sm text-gray-400">${new Date(order.date).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <span class="status-badge ${order.statusClass}">${order.statusText}</span>
                        </div>
                        <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span class="text-gray-600">${order.itemCount} sản phẩm</span>
                            <span class="font-bold text-[#47654c]">${order.total.toLocaleString('vi-VN')}₫</span>
                        </div>
                    </div>
                `).join('');
            } else {
                ordersContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <span class="material-symbols-outlined text-4xl">receipt_long</span>
                        <p class="mt-2">Bạn chưa có đơn hàng nào</p>
                        <a href="/products" class="inline-block mt-4 text-[#47654c] hover:underline">Mua sắm ngay →</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    // Initialize
    async function init() {
        await loadUserData();
        initTabs();
        initEditProfile();
        initChangePassword();
        initLogout();
        loadOrders();
    }

    return { init: init };
})();

document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
});