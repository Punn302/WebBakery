import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Sparkles,
  Wheat,
  Leaf,
  Clock,
  Activity,
  CheckCircle2,
  Calculator,
  Star,
  Quote,
  ShieldCheck,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductCard } from '@/features/products/ProductCard'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { useTranslation } from 'react-i18next'
import heroStitchImg from '@/assets/hero_stitch.jpg'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all')

  const { data: productData } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => productApi.getProducts({ page: 0, size: 8, activeOnly: true }),
    staleTime: 5 * 60 * 1000,
  })

  const featuredProducts = productData?.content || []

  // Filter products by tab keyword if applicable
  const filteredProducts = featuredProducts.filter((product) => {
    if (selectedCategoryTab === 'all') return true
    if (selectedCategoryTab === 'granola') {
      return product.name.toLowerCase().includes('granola')
    }
    if (selectedCategoryTab === 'biscotti') {
      return product.name.toLowerCase().includes('biscotti')
    }
    if (selectedCategoryTab === 'sourdough') {
      return (
        product.name.toLowerCase().includes('sourdough') ||
        product.name.toLowerCase().includes('bánh mì')
      )
    }
    if (selectedCategoryTab === 'bar') {
      return (
        product.name.toLowerCase().includes('bar') ||
        product.name.toLowerCase().includes('thanh')
      )
    }
    return true
  })

  return (
    <div className="space-y-20 pb-8">
      {/* ================= 1. HERO SECTION (Stitch Japandi Artisan Style) ================= */}
      <section className="relative pt-4 sm:pt-6 md:pt-10 pb-8 border-b border-[#eadbce]/70">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-6 space-y-6">
              {/* Fresh Baked Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#eadbce] text-[#47654c] text-xs font-semibold shadow-xs select-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
                <span>Nướng Mới Mỗi Sáng 06:30 • 100% Thuần Tự Nhiên</span>
              </motion.div>

              {/* Main Hero Headline in Playfair Display serif */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-bold text-[#4a3728] leading-[1.18] tracking-tight"
              >
                BÁNH TƯƠI MỖI NGÀY, TỐT CHO VÓC DÁNG &amp; SỨC KHỎE
              </motion.h1>

              {/* Body Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="font-body text-sm sm:text-base text-[#78716c] max-w-xl leading-relaxed"
              >
                Nguyên liệu ngũ cốc nguyên cám hữu cơ, hạt dinh dưỡng tuyển chọn, 100% không đường tinh luyện và không chất bảo quản. Quy trình lên men chậm giữ trọn hương vị mộc mạc và dưỡng chất.
              </motion.p>

              {/* Dual CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/products')}
                  className="bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold px-7 py-3 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Khám phá thực đơn</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/about')}
                  className="border-[#eadbce] bg-white hover:bg-[#f4efea] text-[#4a3728] font-semibold px-7 py-3 rounded-full transition-all cursor-pointer"
                >
                  Về chúng tôi
                </Button>
              </motion.div>

              {/* Trust Badges Row */}
              <div className="pt-6 border-t border-[#eadbce]/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#4a3728]">
                  <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                  <span>&gt;15.000 Khách Hàng</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#4a3728]">
                  <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                  <span>Chuẩn Eat Clean &amp; Keto</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#4a3728]">
                  <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                  <span>Giao Hỏa Tốc Trong 2H</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card with Authentic Bakery Photography */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden p-3 bg-white border border-[#eadbce] tactile-card">
                <img
                  src={heroStitchImg}
                  alt="Mẻ bánh mì sourdough nướng mộc mạc và các lọ hạt granola Hebekery trên mặt bàn gỗ tự nhiên"
                  className="w-full h-[380px] sm:h-[420px] md:h-[460px] object-cover rounded-xl"
                />

                {/* Floating Macro Nutrient Tag Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#eadbce] flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#47654c]/10 flex items-center justify-center text-[#47654c]">
                      <Wheat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-headline text-sm font-semibold text-[#4a3728]">
                        Sourdough Lúa Mạch Mộc
                      </h4>
                      <p className="text-[11px] text-[#78716c]">
                        Lên men tự nhiên 36h • Giàu lợi khuẩn
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-headline text-base font-bold text-[#4a3728] block">
                      142 <span className="text-[10px] font-sans text-[#78716c]">kcal/lát</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#47654c]">
                      Giàu xơ &amp; Low-GI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. 4 KEY PILLARS (TRIẾT LÝ DINH DƯỠNG LÀNH MẠNH) ================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#47654c]">
            Cam Kết Từ Bếp Bánh Hebekery
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728]">
            TRIẾT LÝ DINH DƯỠNG LÀNH MẠNH
          </h2>
          <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
            Mỗi mẻ bánh ra lò là sự cân bằng tuyệt đối giữa hương vị thơm bùi và chỉ số dinh dưỡng chuẩn mực cho vóc dáng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#4a3728]">
                <Wheat className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#4a3728]">
                100% Hạt &amp; Yến Mạch Tự Nhiên
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Hạnh nhân California, hạt điều Bình Phước tuyển chọn kỹ càng, yến mạch Úc nguyên cám nhập khẩu chính ngạch.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-1.5 text-xs text-[#47654c] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Nguồn gốc minh bạch</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#4a3728]">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#4a3728]">
                Không Đường Tinh Luyện
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Vị ngọt thanh thuần từ mật ong hoa cà phê nguyên chất và trái cây sấy dẻo tự nhiên, chỉ số GI thấp an toàn.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-1.5 text-xs text-[#47654c] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chỉ số đường huyết thấp</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#4a3728]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#4a3728]">
                Nướng Mới Mỗi Sáng
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Bột lên men chậm tự nhiên 24h - 36h, nướng mẻ nhỏ giới hạn mỗi ngày để bảo toàn độ giòn thơm và dưỡng chất sống.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-1.5 text-xs text-[#47654c] font-semibold">
              <Clock className="w-4 h-4" />
              <span>Mẻ bánh giới hạn/ngày</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#4a3728]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#4a3728]">
                Minh Bạch Calo &amp; Macro
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Bảng dinh dưỡng chi tiết trên từng bao bì (Protein, Fat, Net Carbs, Calories) phục vụ chính xác người tập luyện.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-1.5 text-xs text-[#47654c] font-semibold">
              <Activity className="w-4 h-4" />
              <span>Đo kiểm chuẩn khoa học</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURED PRODUCTS (SẢN PHẨM BÁN CHẠY NHẤT) ================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#eadbce] pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#47654c]">
              Bộ Sưu Tập Bánh Nướng
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728]">
              Sản Phẩm Bán Chạy Nhất
            </h2>
            <p className="text-xs text-[#78716c] mt-1">
              Được yêu thích nhất bởi cộng đồng eat clean và chăm sóc vóc dáng
            </p>
          </div>

          {/* Dietary Category Filter Tabs */}
          <div className="flex items-center flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'granola', label: 'Granola Nướng Mật Ong' },
              { id: 'biscotti', label: 'Biscotti Ăn Kiêng' },
              { id: 'sourdough', label: 'Bánh Mì Sourdough' },
              { id: 'bar', label: 'Thanh Hạt Energy Bar' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer ${
                  selectedCategoryTab === tab.id
                    ? 'bg-[#4a3728] text-[#faf8f5]'
                    : 'bg-white hover:bg-[#f4efea] text-[#78716c] border border-[#eadbce]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>

        <div className="text-center pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/products')}
            className="border-[#eadbce] bg-white hover:bg-[#f4efea] text-[#4a3728] font-semibold px-8 py-3 rounded-full transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Xem toàn bộ thực đơn ({featuredProducts.length} món bánh)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ================= 4. BMI & TDEE HEALTH TOOL INTERACTIVE BANNER ================= */}
      <section className="bg-white rounded-3xl border border-[#eadbce] p-8 sm:p-12 tactile-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Tool Left Description */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Công Cụ Sức Khỏe Hebekery</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728] leading-tight">
              Tính Toán Năng Lượng &amp; Cá Nhân Hóa Thực Đơn 7 Ngày
            </h2>
            <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
              Bạn đang muốn giảm cân, siết cơ hay duy trì lối sống lành mạnh? Nhập chỉ số chiều cao, cân nặng và cường độ vận động để Hebekery gợi ý thực đơn bánh nướng chính xác lượng calo mục tiêu.
            </p>
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#eadbce] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4a3728]/10 flex items-center justify-center text-[#4a3728] shrink-0">
                <Sparkles className="w-4 h-4 text-[#d97724]" />
              </div>
              <div className="text-xs text-[#78716c]">
                <strong className="text-[#4a3728] font-semibold block">Gợi ý thông minh từ bếp bánh:</strong>
                Chế độ thâm hụt 300 kcal/ngày kết hợp Granola nguyên hạt giúp giảm 1.5kg an toàn mỗi tháng mà không lo đói lả.
              </div>
            </div>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/bmi-tdee')}
                className="bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold px-7 py-3 rounded-full flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Tính Chỉ Số &amp; Nhận Thực Đơn 7 Ngày</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Visual Calculator Teaser Preview */}
          <div className="lg:col-span-6 bg-[#faf8f5] p-6 sm:p-8 rounded-2xl border border-[#eadbce] space-y-5">
            <div className="flex items-center justify-between border-b border-[#eadbce] pb-3">
              <h3 className="font-headline text-base font-semibold text-[#4a3728]">
                Bảng Phân Tích Thể Trạng Mẫu
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#47654c]/10 text-[#47654c]">
                BMI 21.4 • Cân Đối
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">BMR Cơ Bản</span>
                <span className="font-headline text-base font-bold text-[#4a3728]">1.340</span>
                <span className="text-[10px] text-[#78716c] block">kcal/ngày</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">TDEE Tiêu Hao</span>
                <span className="font-headline text-base font-bold text-[#4a3728]">1.820</span>
                <span className="text-[10px] text-[#78716c] block">kcal/ngày</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#eadbce] ring-2 ring-[#47654c]/30">
                <span className="text-[10px] text-[#47654c] font-semibold block">Mục Tiêu Giảm Mỡ</span>
                <span className="font-headline text-base font-bold text-[#47654c]">1.470</span>
                <span className="text-[10px] text-[#47654c] block">kcal/ngày</span>
              </div>
            </div>

            {/* Macro Ratio Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#78716c]">
                <span>Phân bổ Macro chuẩn:</span>
                <span className="font-semibold text-[#4a3728]">30% Đạm • 45% Carb tốt • 25% Béo tốt</span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-200">
                <div className="h-full bg-[#47654c]" style={{ width: '30%' }} title="Protein" />
                <div className="h-full bg-[#d97724]" style={{ width: '45%' }} title="Good Carbs" />
                <div className="h-full bg-[#4a3728]" style={{ width: '25%' }} title="Healthy Fat" />
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-[#78716c]">
                Khám phá combo 3 bữa bánh/ngày kèm calo chuẩn xác cho riêng bạn
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. ARTISAN REVIEWS & TESTIMONIALS ================= */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#47654c]">
            Đồng Hành Cùng Sức Khỏe Bạn
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728]">
            Được Tin Chọn Bởi Chuyên Gia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-[#d97724] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#d97724]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#78716c] italic leading-relaxed">
                &ldquo;Biscotti và Granola của Hebekery là lựa chọn số 1 cho học viên của tôi trước mỗi buổi tập. Calo chuẩn xác, vị ngọt thanh từ mật ong không hề gắt.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4a3728] text-white flex items-center justify-center font-bold text-xs">
                TL
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#4a3728]">Trần Linh</h4>
                <p className="text-[10px] text-[#78716c]">HLV Thể Hình &amp; Fitness Coach</p>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-[#d97724] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#d97724]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#78716c] italic leading-relaxed">
                &ldquo;Quy trình lên men sourdough tự nhiên 36h giúp hệ vi khuẩn đường ruột rất khỏe, giảm cảm giác đầy bụng so với bánh mì men công nghiệp thông thường.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#47654c] text-white flex items-center justify-center font-bold text-xs">
                MA
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#4a3728]">Bác sĩ Mai Anh</h4>
                <p className="text-[10px] text-[#78716c]">Chuyên gia Dinh dưỡng Lâm sàng</p>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#eadbce] tactile-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-[#d97724] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#d97724]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#78716c] italic leading-relaxed">
                &ldquo;Đã mua lại hơn 10 lần. Thơm bùi mùi hạnh nhân mật ong, giòn rụm không gắt dầu, bao bì hộp đóng gói mộc mạc tinh tế rất ấm áp.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-[#eadbce]/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#d97724] text-white flex items-center justify-center font-bold text-xs">
                MH
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#4a3728]">Minh Hằng</h4>
                <p className="text-[10px] text-[#78716c]">Eat-cleaner 3 năm tại TP. HCM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
