const Profile = (function() {
    let currentUser = null;

    async function loadUserData() {
        try {
            const response = await fetch('/api/user/status', { credentials: 'same-origin' });
            const data = await response.json();
            if (!data.loggedIn) {
                window.location.href = '/login?redirect=/profile';
                return;
            }
            currentUser = data.user;
            displayUserInfo();
        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = '/login';
        }
    }

    function displayUserInfo() {
        if (!currentUser) return;
        setText('userNameDisplay', currentUser.name || 'Người dùng');
        setText('userEmailDisplay', currentUser.email || '');
        setText('profileName', currentUser.name || 'Chưa cập nhật');
        setText('profileEmail', currentUser.email || '');
        setText('profilePhone', currentUser.phone || 'Chưa cập nhật');
        setText('profileJoinDate', new Date().toLocaleDateString('vi-VN'));
        setValue('editName', currentUser.name || '');
        setValue('editPhone', currentUser.phone || '');
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }

    function initTabs() {
        const navItems = document.querySelectorAll('.profile-nav-item');
        const tabs = document.querySelectorAll('.tab-content');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                if (!tabId) return;
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                tabs.forEach(tab => tab.classList.add('hidden'));
                document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
            });
        });
    }

    function initEditProfile() {
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const viewDiv = document.getElementById('profileView');
        const editDiv = document.getElementById('profileEdit');

        editBtn?.addEventListener('click', () => {
            viewDiv?.classList.add('hidden');
            editDiv?.classList.remove('hidden');
        });

        cancelBtn?.addEventListener('click', () => {
            viewDiv?.classList.remove('hidden');
            editDiv?.classList.add('hidden');
            displayUserInfo();
        });

        saveBtn?.addEventListener('click', async () => {
            const name = document.getElementById('editName')?.value || '';
            const phone = document.getElementById('editPhone')?.value || '';
            try {
                const response = await fetch('/api/user/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ name, phone })
                });
                const data = await response.json();
                if (data.success) {
                    currentUser = data.user;
                    displayUserInfo();
                    viewDiv?.classList.remove('hidden');
                    editDiv?.classList.add('hidden');
                    alert('Cap nhat thong tin thanh cong');
                } else {
                    alert(data.message || 'Cap nhat that bai');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Co loi xay ra');
            }
        });
    }

    function initChangePassword() {
        const changeBtn = document.getElementById('changePasswordBtn');
        changeBtn?.addEventListener('click', async () => {
            const currentPassword = document.getElementById('currentPassword')?.value || '';
            const newPassword = document.getElementById('newPassword')?.value || '';
            const confirmPassword = document.getElementById('confirmNewPassword')?.value || '';
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
                    credentials: 'same-origin',
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Doi mat khau thanh cong');
                    setValue('currentPassword', '');
                    setValue('newPassword', '');
                    setValue('confirmNewPassword', '');
                } else {
                    alert(data.message || 'Doi mat khau that bai');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                alert('Co loi xay ra');
            }
        });
    }

    function initLogout() {
        document.getElementById('logoutNav')?.addEventListener('click', async () => {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'same-origin' });
            window.location.href = '/';
        });
    }

    async function loadOrders() {
        try {
            const response = await fetch('/api/user/orders', { credentials: 'same-origin' });
            const data = await response.json();
            const ordersContainer = document.getElementById('ordersList');
            if (!ordersContainer) return;

            if (data.orders && data.orders.length > 0) {
                ordersContainer.innerHTML = data.orders.map(order => `
                    <div class="order-card border border-gray-100 rounded-xl p-4">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <img src="${order.imageUrl || '/images/logo.webp'}" alt="${order.productName || 'Hebekery'}" class="w-16 h-16 rounded-lg object-cover border border-gray-100">
                                <div>
                                    <a href="/orders/${order.id}" class="font-semibold text-gray-800 hover:text-[#47654c]">#${order.id}</a>
                                    <p class="text-sm text-gray-500">${order.productName || ''}</p>
                                    <p class="text-xs text-gray-400">${new Date(order.date).toLocaleDateString('vi-VN')} - ${order.itemCount} sản phẩm</p>
                                </div>
                            </div>
                            <div class="md:text-right">
                                <span class="status-badge ${order.statusClass}">${order.statusText}</span>
                                <p class="font-bold text-[#47654c] mt-2">${Number(order.total || 0).toLocaleString('vi-VN')}d</p>
                                <a href="/orders/${order.id}" class="inline-block mt-2 text-sm font-semibold text-[#47654c] hover:underline">Xem chi tiet</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                ordersContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <span class="material-symbols-outlined text-4xl">receipt_long</span>
                        <p class="mt-2">Bạn chưa có đơn hàng nào</p>
                        <a href="/products" class="inline-block mt-4 text-[#47654c] hover:underline">Mua sắm ngay</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async function init() {
        await loadUserData();
        initTabs();
        initEditProfile();
        initChangePassword();
        initLogout();
        loadOrders();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Profile.init());
