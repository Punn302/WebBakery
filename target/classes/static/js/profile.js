const Profile = (function() {
    let currentUser = null;
    let addresses = [];
    let provincesCache = [];

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
            enforcePasswordChangeIfNeeded();
        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = '/login';
        }
    }

    function notify(message, type = 'success') {
        if (window.showToast) window.showToast(message, type);
        else alert(message);
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
                navItems.forEach(nav => nav.classList.remove('active', 'text-[#47654c]', 'bg-[#f7f3ec]'));
                navItems.forEach(nav => nav.classList.add('text-gray-600'));
                item.classList.add('active', 'text-[#47654c]', 'bg-[#f7f3ec]');
                item.classList.remove('text-gray-600');
                tabs.forEach(tab => tab.classList.add('hidden'));
                document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
            });
        });
    }

    function activateTab(tabId) {
        document.querySelectorAll('.profile-nav-item').forEach(nav => {
            const active = nav.getAttribute('data-tab') === tabId;
            nav.classList.toggle('active', active);
            nav.classList.toggle('text-[#47654c]', active);
            nav.classList.toggle('bg-[#f7f3ec]', active);
            nav.classList.toggle('text-gray-600', !active);
        });
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    }

    function enforcePasswordChangeIfNeeded() {
        const params = new URLSearchParams(window.location.search);
        if (!currentUser?.forcePasswordChange && params.get('forcePasswordChange') !== 'true') return;
        activateTab('password');
        const passwordTab = document.getElementById('tab-password');
        if (passwordTab && !document.getElementById('forcePasswordNotice')) {
            passwordTab.insertAdjacentHTML('afterbegin', `
                <div id="forcePasswordNotice" class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                    Mật khẩu của bạn vừa được reset về mặc định. Vui lòng đổi mật khẩu mới trước khi tiếp tục.
                </div>
            `);
        }
    }

    function initEditProfile() {
        const viewDiv = document.getElementById('profileView');
        const editDiv = document.getElementById('profileEdit');
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            viewDiv?.classList.add('hidden');
            editDiv?.classList.remove('hidden');
        });
        document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
            viewDiv?.classList.remove('hidden');
            editDiv?.classList.add('hidden');
            displayUserInfo();
        });
        document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
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
                    notify('Cập nhật thông tin thành công');
                } else {
                    notify(data.message || 'Cập nhật thất bại', 'error');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                notify('Có lỗi xảy ra', 'error');
            }
        });
    }

    function initChangePassword() {
        document.getElementById('changePasswordBtn')?.addEventListener('click', async () => {
            const currentPassword = document.getElementById('currentPassword')?.value || '';
            const newPassword = document.getElementById('newPassword')?.value || '';
            const confirmPassword = document.getElementById('confirmNewPassword')?.value || '';
            if (!currentPassword || !newPassword) return notify('Vui lòng nhập đầy đủ thông tin', 'error');
            if (newPassword !== confirmPassword) return notify('Mật khẩu mới không khớp', 'error');
            if (newPassword.length < 6) return notify('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
            try {
                const response = await fetch('/api/user/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await response.json();
                if (data.success) {
                    notify('Đổi mật khẩu thành công');
                    currentUser.forcePasswordChange = false;
                    document.getElementById('forcePasswordNotice')?.remove();
                    setValue('currentPassword', '');
                    setValue('newPassword', '');
                    setValue('confirmNewPassword', '');
                } else {
                    notify(data.message || 'Đổi mật khẩu thất bại', 'error');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                notify('Có lỗi xảy ra', 'error');
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
                                <p class="font-bold text-[#47654c] mt-2">${Number(order.total || 0).toLocaleString('vi-VN')}đ</p>
                                <a href="/orders/${order.id}" class="inline-block mt-2 text-sm font-semibold text-[#47654c] hover:underline">Xem chi tiết</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                ordersContainer.innerHTML = `<div class="text-center py-8 text-gray-400"><span class="material-symbols-outlined text-4xl">receipt_long</span><p class="mt-2">Bạn chưa có đơn hàng nào</p><a href="/products" class="inline-block mt-4 text-[#47654c] hover:underline">Mua sắm ngay</a></div>`;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async function fetchProvinceApi(path) {
        const response = await fetch('https://provinces.open-api.vn/api/' + path);
        if (!response.ok) throw new Error('Province API unavailable');
        return response.json();
    }

    function fillSelect(select, items, placeholder, selectedName = '') {
        select.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = item.name;
            option.selected = item.name === selectedName;
            select.appendChild(option);
        });
        select.disabled = false;
    }

    async function initAddressDropdowns() {
        const province = document.getElementById('profileProvinceSelect');
        const district = document.getElementById('profileDistrictSelect');
        const ward = document.getElementById('profileWardSelect');
        if (!province || !district || !ward) return;
        try {
            provincesCache = await fetchProvinceApi('?depth=1');
            fillSelect(province, provincesCache, 'Tỉnh/thành phố');
        } catch {
            province.innerHTML = '<option value="">Không tải được tỉnh/thành</option>';
        }
        province.addEventListener('change', async () => {
            district.innerHTML = '<option value="">Quận/huyện</option>';
            ward.innerHTML = '<option value="">Phường/xã</option>';
            district.disabled = true;
            ward.disabled = true;
            if (!province.value) return;
            const data = await fetchProvinceApi('p/' + province.value + '?depth=2');
            fillSelect(district, data.districts || [], 'Quận/huyện');
        });
        district.addEventListener('change', async () => {
            ward.innerHTML = '<option value="">Phường/xã</option>';
            ward.disabled = true;
            if (!district.value) return;
            const data = await fetchProvinceApi('d/' + district.value + '?depth=2');
            fillSelect(ward, data.wards || [], 'Phường/xã');
        });
    }

    function selectedText(id) {
        const select = document.getElementById(id);
        return select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : '';
    }

    function resetAddressForm() {
        const form = document.getElementById('addressForm');
        form.dataset.addressId = '';
        ['addressReceiverName', 'addressPhone', 'addressLine'].forEach(id => setValue(id, ''));
        document.getElementById('addressDefault').checked = false;
        document.getElementById('profileProvinceSelect').selectedIndex = 0;
        document.getElementById('profileDistrictSelect').innerHTML = '<option value="">Quận/huyện</option>';
        document.getElementById('profileDistrictSelect').disabled = true;
        document.getElementById('profileWardSelect').innerHTML = '<option value="">Phường/xã</option>';
        document.getElementById('profileWardSelect').disabled = true;
    }

    async function loadAddresses() {
        const response = await fetch('/api/user/addresses', { credentials: 'same-origin' });
        const data = await response.json();
        addresses = data.addresses || [];
        renderAddresses();
    }

    function renderAddresses() {
        const list = document.getElementById('addressesList');
        if (!list) return;
        if (!addresses.length) {
            list.innerHTML = '<p class="text-gray-400">Bạn chưa có địa chỉ nào.</p>';
            return;
        }
        list.innerHTML = addresses.map(address => `
            <div class="border border-gray-100 rounded-xl p-4">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                        <p class="font-semibold text-gray-800">${address.receiverName} ${address.defaultAddress ? '<span class="ml-2 text-xs text-[#47654c]">Mặc định</span>' : ''}</p>
                        <p class="text-sm text-gray-500">${address.phone}</p>
                        <p class="text-sm text-gray-600 mt-1">${[address.addressLine, address.ward, address.district, address.province].filter(Boolean).join(', ')}</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="edit-address border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold" data-id="${address.id}">Sửa</button>
                        <button class="delete-address border border-red-200 text-red-500 rounded-lg px-3 py-2 text-sm font-semibold" data-id="${address.id}">Xóa</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async function openAddressForm(address = null) {
        const form = document.getElementById('addressForm');
        resetAddressForm();
        if (address) {
            form.dataset.addressId = address.id;
            setValue('addressReceiverName', address.receiverName || '');
            setValue('addressPhone', address.phone || '');
            setValue('addressLine', address.addressLine || '');
            document.getElementById('addressDefault').checked = !!address.defaultAddress;
            const province = document.getElementById('profileProvinceSelect');
            const provinceOption = Array.from(province.options).find(option => option.text === address.province);
            if (provinceOption) {
                province.value = provinceOption.value;
                const provinceData = await fetchProvinceApi('p/' + province.value + '?depth=2');
                fillSelect(document.getElementById('profileDistrictSelect'), provinceData.districts || [], 'Quận/huyện', address.district);
                const districtValue = document.getElementById('profileDistrictSelect').value;
                if (districtValue) {
                    const districtData = await fetchProvinceApi('d/' + districtValue + '?depth=2');
                    fillSelect(document.getElementById('profileWardSelect'), districtData.wards || [], 'Phường/xã', address.ward);
                }
            }
        }
        form.classList.remove('hidden');
    }

    function initAddresses() {
        const form = document.getElementById('addressForm');
        document.getElementById('newAddressBtn')?.addEventListener('click', () => openAddressForm());
        document.getElementById('cancelAddressBtn')?.addEventListener('click', () => {
            resetAddressForm();
            form.classList.add('hidden');
        });
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const addressId = form.dataset.addressId;
            const payload = {
                receiverName: document.getElementById('addressReceiverName').value.trim(),
                phone: document.getElementById('addressPhone').value.trim(),
                addressLine: document.getElementById('addressLine').value.trim(),
                province: selectedText('profileProvinceSelect'),
                district: selectedText('profileDistrictSelect'),
                ward: selectedText('profileWardSelect'),
                defaultAddress: document.getElementById('addressDefault').checked
            };
            const response = await fetch(addressId ? `/api/user/addresses/${addressId}` : '/api/user/addresses', {
                method: addressId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.success) return notify(data.message || 'Không thể lưu địa chỉ', 'error');
            notify('Đã lưu địa chỉ');
            form.classList.add('hidden');
            await loadAddresses();
        });
        document.getElementById('addressesList')?.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('.edit-address');
            const deleteBtn = event.target.closest('.delete-address');
            if (editBtn) {
                const address = addresses.find(item => item.id === editBtn.dataset.id);
                if (address) openAddressForm(address);
            }
            if (deleteBtn) {
                if (!confirm('Xóa địa chỉ này?')) return;
                const response = await fetch(`/api/user/addresses/${deleteBtn.dataset.id}`, { method: 'DELETE', credentials: 'same-origin' });
                const data = await response.json();
                if (!data.success) return notify('Không thể xóa địa chỉ', 'error');
                notify('Đã xóa địa chỉ');
                await loadAddresses();
            }
        });
    }

    async function init() {
        await loadUserData();
        initTabs();
        initEditProfile();
        initChangePassword();
        initLogout();
        await initAddressDropdowns();
        initAddresses();
        loadAddresses();
        loadOrders();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Profile.init());
