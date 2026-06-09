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

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function selectByText(select, text) {
        const expectedText = normalizeText(text);
        if (!select || !expectedText) return false;
        const option = Array.from(select.options).find(item => normalizeText(item.textContent) === expectedText);
        if (!option) return false;
        select.value = option.value;
        return true;
    }

    function applySavedAddressFallback(option) {
        if (!option || !option.value) return;
        document.getElementById('customerName').value = option.dataset.name || document.getElementById('customerName').value;
        document.getElementById('phone').value = option.dataset.phone || document.getElementById('phone').value;
        document.getElementById('address').value = [
            option.dataset.line,
            option.dataset.ward,
            option.dataset.district,
            option.dataset.province
        ].filter(Boolean).join(', ');
    }

    async function applySavedAddress(option) {
        if (!option || !option.value) return;
        const customerNameInput = document.getElementById('customerName');
        const phoneInput = document.getElementById('phone');
        const addressInput = document.getElementById('address');
        const provinceSelect = document.getElementById('provinceSelect');
        const districtSelect = document.getElementById('districtSelect');
        const wardSelect = document.getElementById('wardSelect');

        if (customerNameInput) customerNameInput.value = option.dataset.name || customerNameInput.value;
        if (phoneInput) phoneInput.value = option.dataset.phone || phoneInput.value;
        if (addressInput) addressInput.value = option.dataset.line || '';

        if (!provinceSelect || !districtSelect || !wardSelect) return;
        if (!selectByText(provinceSelect, option.dataset.province)) return;

        districtSelect.innerHTML = '<option value="">Quận/huyện</option>';
        wardSelect.innerHTML = '<option value="">Phường/xã</option>';
        districtSelect.disabled = true;
        wardSelect.disabled = true;

        const province = await fetchProvinceApi('p/' + provinceSelect.value + '?depth=2');
        fillSelect(districtSelect, province.districts || [], 'Quận/huyện');
        if (!selectByText(districtSelect, option.dataset.district)) return;

        const district = await fetchProvinceApi('d/' + districtSelect.value + '?depth=2');
        fillSelect(wardSelect, district.wards || [], 'Phường/xã');
        selectByText(wardSelect, option.dataset.ward);
    }

    function initProvinceDropdowns() {
        const provinceSelect = document.getElementById('provinceSelect');
        const districtSelect = document.getElementById('districtSelect');
        const wardSelect = document.getElementById('wardSelect');
        const savedAddressSelect = document.getElementById('savedAddressSelect');
        if (!provinceSelect || !districtSelect || !wardSelect) return;

        fetchProvinceApi('?depth=1')
            .then(async (provinces) => {
                fillSelect(provinceSelect, provinces, 'Tỉnh/thành phố');
                if (savedAddressSelect?.value) {
                    await applySavedAddress(savedAddressSelect.selectedOptions[0]);
                }
            })
            .catch(() => {
                provinceSelect.innerHTML = '<option value="">Không tải được tỉnh/thành</option>';
                if (savedAddressSelect?.value) {
                    applySavedAddressFallback(savedAddressSelect.selectedOptions[0]);
                }
            });

        savedAddressSelect?.addEventListener('change', () => applySavedAddress(savedAddressSelect.selectedOptions[0]));

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
