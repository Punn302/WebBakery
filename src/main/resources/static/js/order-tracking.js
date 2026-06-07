const form = document.getElementById('trackingForm');
const results = document.getElementById('trackingResults');

if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const orderId = document.getElementById('trackingOrderId').value.trim();
        const phone = document.getElementById('trackingPhone').value.trim();
        const params = new URLSearchParams();
        if (orderId) params.set('orderId', orderId);
        if (phone) params.set('phone', phone);

        const response = await fetch('/api/orders/track?' + params.toString());
        const data = await response.json();
        const orders = data.orders || [];
        if (orders.length === 0) {
            results.innerHTML = '<div class="text-gray-400 text-center py-6">Không tìm thấy đơn hàng phù hợp.</div>';
            return;
        }

        results.innerHTML = orders.map(order => `
            <div class="border border-gray-100 rounded-lg p-4">
                <div class="flex justify-between gap-4">
                    <div>
                        <p class="font-semibold text-gray-800">${order.id}</p>
                        <p class="text-sm text-gray-500">${order.customerName || ''} - ${order.phone || ''}</p>
                        <p class="text-sm text-gray-500">${order.orderStatus} / ${order.paymentStatus}</p>
                    </div>
                    <p class="font-bold text-[#47654c]">${Number(order.total || 0).toLocaleString('vi-VN')}đ</p>
                </div>
            </div>
        `).join('');
    });
}
