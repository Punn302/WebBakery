const Checkout = (function() {
    let addressMode = 'new';
    let selectedSavedAddress = null;

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

    function setNewAddressRequired(required) {
        document.getElementById('address')?.toggleAttribute('required', required);
        document.getElementById('provinceSelect')?.toggleAttribute('required', required);
        document.getElementById('districtSelect')?.toggleAttribute('required', required);
        document.getElementById('wardSelect')?.toggleAttribute('required', required);
    }

    function showSavedMode() {
        if (!selectedSavedAddress) {
            showNewMode();
            return;
        }
        addressMode = 'saved';
        document.getElementById('savedAddressPanel')?.classList.remove('hidden');
        document.getElementById('newAddressForm')?.classList.add('hidden');
        document.getElementById('addressChoices')?.classList.add('hidden');
        setNewAddressRequired(false);
        fillContactFromSavedAddress(selectedSavedAddress);
    }

    function showNewMode() {
        addressMode = 'new';
        document.getElementById('newAddressForm')?.classList.remove('hidden');
        document.getElementById('addressChoices')?.classList.add('hidden');
        setNewAddressRequired(true);
    }

    function fullAddressFromDataset(dataset) {
        return [
            dataset.line,
            dataset.ward,
            dataset.district,
            dataset.province
        ].filter(Boolean).join(', ');
    }

    function fillContactFromSavedAddress(addressElement) {
        if (!addressElement) return;
        const nameInput = document.getElementById('customerName');
        const phoneInput = document.getElementById('phone');
        if (nameInput) nameInput.value = addressElement.dataset.name || nameInput.value;
        if (phoneInput) phoneInput.value = addressElement.dataset.phone || phoneInput.value;
    }

    function renderCurrentSavedAddress(addressElement) {
        const current = document.getElementById('currentSavedAddress');
        if (!current || !addressElement) return;
        current.dataset.id = addressElement.dataset.id || '';
        current.dataset.name = addressElement.dataset.name || '';
        current.dataset.phone = addressElement.dataset.phone || '';
        current.dataset.line = addressElement.dataset.line || '';
        current.dataset.province = addressElement.dataset.province || '';
        current.dataset.district = addressElement.dataset.district || '';
        current.dataset.ward = addressElement.dataset.ward || '';
        current.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                    <p class="font-semibold text-gray-800">${current.dataset.name || ''}</p>
                    <p class="text-sm text-gray-500">${current.dataset.phone || ''}</p>
                    <p class="text-sm text-gray-600 mt-1">${fullAddressFromDataset(current.dataset)}</p>
                </div>
                ${addressElement.dataset.default === 'true' ? '<span class="text-xs font-semibold text-[#47654c] bg-white rounded-full px-3 py-1">Mặc định</span>' : ''}
            </div>
        `;
    }

    function initSavedAddresses() {
        const current = document.getElementById('currentSavedAddress');
        const firstOption = document.querySelector('.saved-address-option');
        selectedSavedAddress = current || firstOption || null;
        if (selectedSavedAddress) {
            if (!current && firstOption) renderCurrentSavedAddress(firstOption);
            showSavedMode();
        } else {
            showNewMode();
        }

        document.getElementById('changeSavedAddressBtn')?.addEventListener('click', () => {
            document.getElementById('addressChoices')?.classList.toggle('hidden');
        });
        document.getElementById('useNewAddressBtn')?.addEventListener('click', showNewMode);
        document.getElementById('useSavedAddressBtn')?.addEventListener('click', showSavedMode);

        document.querySelectorAll('.saved-address-option').forEach(button => {
            button.addEventListener('click', () => {
                selectedSavedAddress = button;
                renderCurrentSavedAddress(button);
                showSavedMode();
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
            submitBtn.innerHTML = 'Đang xử lý...';

            const payload = {
                customerName: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: buildAddress(),
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
                    showMessage('error', data.message || 'Thanh toán thất bại');
                    return;
                }

                const checkout = data.checkout;
                showMessage('success', data.message || 'Đặt hàng thành công');

                if (checkout.paymentMethod === 'MOMO' && checkout.payUrl) {
                    window.location.href = checkout.payUrl;
                } else {
                    window.location.href = '/checkout/success';
                }
            } catch (error) {
                console.error('Checkout error:', error);
                showMessage('error', 'Có lỗi xảy ra khi thanh toán');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function selectedText(id) {
        const select = document.getElementById(id);
        return select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : '';
    }

    function buildAddress() {
        if (addressMode === 'saved' && selectedSavedAddress) {
            return fullAddressFromDataset(selectedSavedAddress.dataset);
        }
        return [
            document.getElementById('address').value.trim(),
            selectedText('wardSelect'),
            selectedText('districtSelect'),
            selectedText('provinceSelect')
        ].filter(Boolean).join(', ');
    }

    async function fetchProvinceApi(path) {
        const response = await fetch('https://provinces.open-api.vn/api/' + path);
        if (!response.ok) throw new Error('Province API unavailable');
        return response.json();
    }

    function fillSelect(select, items, placeholder) {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = item.name;
            select.appendChild(option);
        });
        select.disabled = false;
    }

    function initProvinceDropdowns() {
        const provinceSelect = document.getElementById('provinceSelect');
        const districtSelect = document.getElementById('districtSelect');
        const wardSelect = document.getElementById('wardSelect');
        const loadingText = document.getElementById('provinceLoadingText');
        if (!provinceSelect || !districtSelect || !wardSelect) return;

        fetchProvinceApi('?depth=1')
            .then((provinces) => {
                fillSelect(provinceSelect, provinces, 'Tỉnh/thành phố');
                loadingText?.classList.add('hidden');
            })
            .catch(() => {
                provinceSelect.innerHTML = '<option value="">Không tải được tỉnh/thành</option>';
                provinceSelect.removeAttribute('required');
                districtSelect.removeAttribute('required');
                wardSelect.removeAttribute('required');
                if (loadingText) {
                    loadingText.textContent = 'Không tải được danh sách tỉnh/thành. Bạn vẫn có thể nhập địa chỉ chi tiết bên dưới.';
                }
            });

        provinceSelect.addEventListener('change', async () => {
            districtSelect.innerHTML = '<option value="">Quận/huyện</option>';
            wardSelect.innerHTML = '<option value="">Phường/xã</option>';
            districtSelect.disabled = true;
            wardSelect.disabled = true;
            if (!provinceSelect.value) return;
            const province = await fetchProvinceApi('p/' + provinceSelect.value + '?depth=2');
            fillSelect(districtSelect, province.districts || [], 'Quận/huyện');
        });

        districtSelect.addEventListener('change', async () => {
            wardSelect.innerHTML = '<option value="">Phường/xã</option>';
            wardSelect.disabled = true;
            if (!districtSelect.value) return;
            const district = await fetchProvinceApi('d/' + districtSelect.value + '?depth=2');
            fillSelect(wardSelect, district.wards || [], 'Phường/xã');
        });
    }

    function init() {
        initPaymentCards();
        initSavedAddresses();
        initProvinceDropdowns();
        initForm();
    }

    return { init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Checkout.init());
} else {
    Checkout.init();
}
