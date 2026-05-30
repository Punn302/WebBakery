/**
 * Knowledge Page Module
 */

const Knowledge = (function() {

    // Article data for modal
    const articlesData = {
        0: {
            title: 'Chất lượng hơn số lượng: Chìa khóa vàng của giảm cân bền vững',
            content: `
                <div class="article-content">
                    <p class="text-gray-500 mb-6">Một nghiên cứu quan trọng từ Đại học Stanford được công bố trên tạp chí JAMA đã làm thay đổi cách nhìn của giới khoa học về giảm cân. Nghiên cứu kéo dài 1 năm với sự tham gia của 600 người trưởng thành cho thấy: <strong>chất lượng thực phẩm mới là yếu tố quyết định, không phải số lượng calo hay tỷ lệ carb-fat</strong>.</p>
                    
                    <h2>📊 Kết quả đáng kinh ngạc</h2>
                    <p>Những người tham gia được khuyến khích cắt giảm đường tinh luyện, tinh bột trắng (bánh mì trắng, bánh quy, mì ống) và thay thế bằng ngũ cốc nguyên cám, rau xanh, các loại đậu. Nhóm low-carb được ăn thêm bơ, các loại hạt, dầu ô liu và cá hồi.</p>
                    <p>Điều đặc biệt: <strong>Họ không cần tính calo, không cần kiểm soát khẩu phần, cũng không bắt buộc tập thể dục</strong>. Họ chỉ ăn cho đến khi cảm thấy no.</p>
                    <p>Kết quả: Trung bình mỗi người giảm 5-6 kg trong vòng một năm, một số người giảm tới 27 kg [citation:2].</p>
                    
                    <div class="highlight">
                        <p class="font-semibold text-[#47654c] mb-2">✨ Bài học rút ra:</p>
                        <ul class="list-disc pl-5">
                            <li>Không cần ăn kiêng khắc nghiệt để có kết quả</li>
                            <li>Tập trung vào chất lượng thực phẩm thay vì đếm calo</li>
                            <li>Ăn cùng gia đình, nấu ăn tại nhà, không ăn trước TV</li>
                            <li>Ăn nhiều rau củ nhất có thể</li>
                        </ul>
                    </div>
                    
                    <h2>🍎 Ứng dụng thực tế</h2>
                    <p>Áp dụng ngay vào cuộc sống: thay bánh mì trắng bằng bánh mì nguyên cám, thay nước ngọt bằng nước lọc hoặc trà xanh, thêm một phần rau vào mỗi bữa ăn. Hebekery cam kết đồng hành cùng bạn với những sản phẩm từ nguyên liệu sạch, không đường tinh luyện.</p>
                </div>
            `
        },
        1: {
            title: 'Chế độ ăn Địa Trung Hải: Lối sống vàng cho sức khỏe',
            content: `
                <div class="article-content">
                    <p>Được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại từ năm 2013, chế độ ăn Địa Trung Hải không chỉ là một phương pháp ăn uống mà còn là một triết lý sống [citation:5].</p>
                    
                    <h2>🥗 Tháp dinh dưỡng Địa Trung Hải</h2>
                    <p><strong>Nên ăn hàng ngày:</strong> Rau củ quả, các loại hạt, ngũ cốc nguyên cám, dầu ô liu nguyên chất, các loại đậu.</p>
                    <p><strong>Ăn thường xuyên (2-3 lần/tuần):</strong> Cá, hải sản, trứng, thịt gia cầm, sữa chua, phô mai.</p>
                    <p><strong>Hạn chế tối đa:</strong> Thịt đỏ, thịt chế biến sẵn, đồ ngọt, đồ uống có đường.</p>
                    
                    <div class="highlight">
                        <p class="font-semibold text-[#47654c] mb-2">📈 Lợi ích khoa học:</p>
                        <ul class="list-disc pl-5">
                            <li>Giảm nguy cơ bệnh tim mạch và đột quỵ</li>
                            <li>Cải thiện độ nhạy insulin, phòng ngừa tiểu đường tuýp 2</li>
                            <li>Hỗ trợ giảm cân và duy trì vóc dáng</li>
                            <li>Chống viêm và làm chậm quá trình lão hóa</li>
                        </ul>
                    </div>
                    
                    <p>Các nghiên cứu đã chỉ ra rằng chế độ ăn Địa Trung Hải có tác động tích cực đến việc giảm nguy cơ mắc các bệnh không lây nhiễm như tim mạch, ung thư và tiểu đường [citation:1]. Đây là mô hình dinh dưỡng bền vững, thân thiện với môi trường và dễ áp dụng.</p>
                </div>
            `
        },
        2: {
            title: 'Kiến thức dinh dưỡng tỷ lệ thuận với sức khỏe',
            content: `
                <div class="article-content">
                    <p>Nghiên cứu được công bố trên tạp chí Human Nutrition & Metabolism (Elsevier) năm 2024 đã khảo sát gần 1.800 sinh viên đại học về mối liên hệ giữa kiến thức dinh dưỡng, chế độ ăn và chỉ số BMI [citation:3][citation:8].</p>
                    
                    <h2>📊 Phát hiện chính</h2>
                    <ul class="list-disc pl-5">
                        <li><strong>Người có kiến thức dinh dưỡng cao hơn có BMI thấp hơn</strong> - điểm kiến thức càng cao, cân nặng càng khỏe mạnh</li>
                        <li><strong>Tuân thủ chế độ ăn lành mạnh (MedDiet) tỷ lệ thuận với kiến thức</strong> - hiểu biết dẫn đến hành động</li>
                        <li><strong>Khoảng 52% sinh viên tự đánh giá sức khỏe ở mức trung bình hoặc kém</strong> - cho thấy nhu cầu cấp thiết về giáo dục dinh dưỡng</li>
                    </ul>
                    
                    <div class="highlight">
                        <p class="font-semibold text-[#47654c] mb-2">💡 Bài học cho bạn:</p>
                        <p>Đầu tư thời gian tìm hiểu về dinh dưỡng không chỉ giúp bạn ăn ngon hơn mà còn cải thiện sức khỏe lâu dài. Mỗi ngày một chút kiến thức mới - đó là nền tảng của lối sống lành mạnh bền vững.</p>
                    </div>
                </div>
            `
        }
    };

    // Category filtering
    function initCategoryFilter() {
        const tabs = document.querySelectorAll('.category-tab');
        const cards = document.querySelectorAll('.knowledge-card');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.getAttribute('data-category');

                // Filter cards
                cards.forEach(card => {
                    const cardCategories = card.getAttribute('data-category');
                    if (category === 'all' || (cardCategories && cardCategories.includes(category))) {
                        card.style.display = 'block';
                        // Add animation
                        card.style.animation = 'fadeInUp 0.5s ease-out';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Article Modal
    function initArticleModal() {
        const modal = document.getElementById('articleModal');
        const modalContent = document.getElementById('modalContent');
        const readMoreBtns = document.querySelectorAll('.read-more');
        const closeBtns = document.querySelectorAll('.close-modal');

        function openModal(articleIndex) {
            const article = articlesData[articleIndex];
            if (article && modalContent) {
                modalContent.innerHTML = `
                    <div class="text-left">
                        <h2 class="text-2xl font-bold text-gray-800 mb-3">${article.title}</h2>
                        <div class="article-meta">
                            <span>📅 Nguồn: Hebekery | Cập nhật 2025</span>
                            <span class="ml-4">⏱️ 5 phút đọc</span>
                        </div>
                        ${article.content}
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <p class="text-gray-500 text-sm">📌 Sản phẩm liên quan: <a href="/products" class="text-[#47654c] hover:underline">Granola hữu cơ</a> | <a href="/products" class="text-[#47654c] hover:underline">Bánh Biscotti ăn kiêng</a></p>
                        </div>
                    </div>
                `;
            }
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeModal() {
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }

        readMoreBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // For demo, use index mapping
                const card = btn.closest('.knowledge-card');
                const cardIndex = Array.from(document.querySelectorAll('.knowledge-card')).indexOf(card);
                const articleIndex = cardIndex % Object.keys(articlesData).length;
                openModal(articleIndex);
            });
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    }

    // Newsletter form
    function initNewsletter() {
        const form = document.querySelector('.max-w-lg.mx-auto');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                if (email) {
                    alert('Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi kiến thức mới nhất đến bạn.');
                    form.reset();
                } else {
                    alert('Vui lòng nhập email!');
                }
            });
        }
    }

    // Initialize
    function init() {
        initCategoryFilter();
        initArticleModal();
        initNewsletter();
    }

    return { init };
})();

// Run when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Knowledge.init());
} else {
    Knowledge.init();
}