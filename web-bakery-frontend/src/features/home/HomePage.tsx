import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ShieldCheck,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductCard } from '@/features/products/ProductCard'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import heroStitchImg from '@/assets/hero_stitch.jpg'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all')

  // Real backend API connection: Fetching products from Spring Boot / MySQL
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => productApi.getProducts({ page: 0, size: 8, activeOnly: true }),
    staleTime: 5 * 60 * 1000,
  })

  const featuredProducts = productData?.content || []

  // Filter products by tab keyword
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
    <div className="space-y-16 pb-8">
      {/* ================= 1. HERO SECTION (Minimalist, Visual-First) ================= */}
      <section className="relative pt-4 sm:pt-6 md:pt-8 pb-8 border-b border-[#eadbce]/70">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Editorial - Clean & Punchy */}
            <div className="lg:col-span-6 space-y-5">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#eadbce] text-[#47654c] text-xs font-semibold select-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
                <span>Nướng Mới Mỗi Sáng 06:30 • 100% Tự Nhiên</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-[44px] font-bold text-[#4a3728] leading-[1.18] tracking-tight"
              >
                BÁNH TƯƠI MỖI NGÀY, TỐT CHO VÓC DÁNG
              </motion.h1>

              {/* Minimal 1-line tag instead of long paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="font-body text-xs sm:text-sm text-[#78716c] font-medium flex items-center flex-wrap gap-2"
              >
                <span className="bg-[#47654c]/10 text-[#47654c] px-2.5 py-0.5 rounded-full font-semibold">
                  Ngũ cốc nguyên cám
                </span>
                <span>•</span>
                <span className="bg-[#d97724]/10 text-[#d97724] px-2.5 py-0.5 rounded-full font-semibold">
                  0g Đường tinh luyện
                </span>
                <span>•</span>
                <span className="bg-[#4a3728]/10 text-[#4a3728] px-2.5 py-0.5 rounded-full font-semibold">
                  Chuẩn Macro &amp; Calo
                </span>
              </motion.p>

              {/* Concise CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-3 pt-1"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/products')}
                  className="bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-sm text-xs cursor-pointer btn-tactile"
                >
                  <span>Khám phá thực đơn</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/bmi-tdee')}
                  className="border-[#eadbce] bg-white hover:bg-[#faf8f5] text-[#4a3728] font-semibold px-6 py-2.5 rounded-full text-xs cursor-pointer"
                >
                  Tính BMI &amp; TDEE
                </Button>
              </motion.div>

              {/* Trust Metrics */}
              <div className="pt-4 border-t border-[#eadbce]/70 flex items-center gap-6 text-xs font-semibold text-[#4a3728]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                  <span>&gt;15.000 Khách hàng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                  <span>Eat Clean &amp; Keto</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                  <span>Giao nhanh 2H</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden p-2.5 bg-white border border-[#eadbce] tactile-card">
                <img
                  src={heroStitchImg}
                  alt="Mẻ bánh mì sourdough nướng mộc mạc và lọ granola Hebekery"
                  className="w-full h-[340px] sm:h-[380px] md:h-[420px] object-cover rounded-2xl"
                />

                {/* Compact Nutrient Tag Overlay */}
                <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#eadbce] flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#47654c]/10 flex items-center justify-center text-[#47654c]">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-headline text-xs font-bold text-[#4a3728]">
                        Sourdough Lúa Mạch Mộc
                      </h4>
                      <p className="text-[10px] text-[#78716c]">Men tự nhiên 36h • Giàu lợi khuẩn</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-headline text-sm font-bold text-[#4a3728]">
                      142 <span className="text-[10px] font-sans text-[#78716c]">kcal/lát</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#47654c] block">Low-GI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. 4 KEY PILLARS (Clean, Zero Redundant Text) ================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#47654c]">
            Cam Kết Từ Bếp Bánh
          </span>
          <h2 className="font-headline text-2xl font-bold text-[#4a3728]">
            TRIẾT LÝ DINH DƯỠNG LÀNH MẠNH
          </h2>
        </div>

        {/* 4 Cards - No redundant paragraphs, pure visual badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-[#4a3728]/10 text-[#4a3728] flex items-center justify-center mx-auto">
              <Wheat className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-sm font-bold text-[#4a3728]">100% Nguyên Cám</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#faf8f5] border border-[#eadbce] text-[11px] font-medium text-[#78716c]">
              Hạt &amp; yến mạch hữu cơ
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-[#47654c]/10 text-[#47654c] flex items-center justify-center mx-auto">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-sm font-bold text-[#4a3728]">0g Đường Tinh Luyện</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#faf8f5] border border-[#eadbce] text-[11px] font-medium text-[#78716c]">
              Vị ngọt mật hoa tự nhiên
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-[#d97724]/10 text-[#d97724] flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-sm font-bold text-[#4a3728]">Nướng Mới Mỗi Sáng</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#faf8f5] border border-[#eadbce] text-[11px] font-medium text-[#78716c]">
              Lên men chậm 24h - 36h
            </span>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-[#47654c]/10 text-[#47654c] flex items-center justify-center mx-auto">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-sm font-bold text-[#4a3728]">Chuẩn Calo &amp; Macro</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#faf8f5] border border-[#eadbce] text-[11px] font-medium text-[#78716c]">
              Minh bạch trên bao bì
            </span>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURED PRODUCTS (Connected to Spring Boot API) ================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#eadbce] pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#47654c]">
              Món Bánh Nướng
            </span>
            <h2 className="font-headline text-2xl font-bold text-[#4a3728]">
              Sản Phẩm Bán Chạy Nhất
            </h2>
          </div>

          {/* Minimal Category Tabs */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'granola', label: 'Granola' },
              { id: 'biscotti', label: 'Biscotti' },
              { id: 'sourdough', label: 'Sourdough' },
              { id: 'bar', label: 'Thanh Hạt' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                  selectedCategoryTab === tab.id
                    ? 'bg-[#4a3728] text-[#faf8f5]'
                    : 'bg-white hover:bg-[#faf8f5] text-[#78716c] border border-[#eadbce]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#78716c]">Đang nạp thực đơn bánh...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        <div className="text-center pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/products')}
            className="border-[#eadbce] bg-white hover:bg-[#faf8f5] text-[#4a3728] font-semibold px-6 py-2 rounded-full text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Xem tất cả thực đơn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </section>

      {/* ================= 4. BMI & TDEE HEALTH TOOL (Minimal & Direct) ================= */}
      <section className="bg-white rounded-3xl border border-[#eadbce] p-6 sm:p-10 tactile-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Tool Left Description - Ultra Concise */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Tiện ích sức khỏe</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728] leading-tight">
              Cá Nhân Hóa Năng Lượng &amp; Thực Đơn 7 Ngày
            </h2>
            <p className="text-xs text-[#78716c] leading-relaxed">
              Tính toán TDEE chính xác theo thể trạng để nhận gợi ý combo bánh nướng đạt mục tiêu vóc dáng mà không lo thiếu chất.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => navigate('/bmi-tdee')}
                className="bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold px-6 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-sm cursor-pointer btn-tactile"
              >
                <span>Tính BMI &amp; Nhận Thực Đơn Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Visual Calculator Teaser Preview */}
          <div className="lg:col-span-6 bg-[#faf8f5] p-5 sm:p-6 rounded-2xl border border-[#eadbce] space-y-4">
            <div className="flex items-center justify-between border-b border-[#eadbce] pb-2.5">
              <h3 className="font-headline text-sm font-semibold text-[#4a3728]">
                Bảng Phân Tích Thể Trạng Mẫu
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#47654c]/10 text-[#47654c]">
                BMI 21.4 • Cân Đối
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">BMR Cơ Bản</span>
                <span className="font-headline text-sm font-bold text-[#4a3728]">1.340</span>
                <span className="text-[9px] text-[#78716c] block">kcal</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">TDEE Tiêu Hao</span>
                <span className="font-headline text-sm font-bold text-[#4a3728]">1.820</span>
                <span className="text-[9px] text-[#78716c] block">kcal</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#eadbce] ring-2 ring-[#47654c]/30">
                <span className="text-[10px] text-[#47654c] font-semibold block">Mục Tiêu Giảm Mỡ</span>
                <span className="font-headline text-sm font-bold text-[#47654c]">1.470</span>
                <span className="text-[9px] text-[#47654c] block">kcal</span>
              </div>
            </div>

            {/* Macro Ratio Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-[#78716c]">
                <span>Phân bổ Macro:</span>
                <span className="font-medium text-[#4a3728]">30% Đạm • 45% Carb • 25% Béo</span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-stone-200">
                <div className="h-full bg-[#47654c]" style={{ width: '30%' }} />
                <div className="h-full bg-[#d97724]" style={{ width: '45%' }} />
                <div className="h-full bg-[#4a3728]" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. REVIEWS (Short & Crisp) ================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#47654c]">
            Đánh Giá Khách Hàng
          </span>
          <h2 className="font-headline text-2xl font-bold text-[#4a3728]">
            Được Tin Chọn Bởi Người Yêu Ăn Sạch
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Review 1 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card space-y-3">
            <div className="flex text-[#d97724] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#d97724]" />
              ))}
            </div>
            <p className="text-xs text-[#5c4a3a] leading-relaxed">
              &ldquo;Biscotti thơm bùi, vị ngọt mật ong tự nhiên chuẩn calo trước mỗi buổi tập.&rdquo;
            </p>
            <div className="pt-2.5 border-t border-[#eadbce]/60 text-xs font-bold text-[#4a3728]">
              Trần Linh <span className="font-normal text-[10px] text-[#78716c] block">HLV Thể Hình</span>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card space-y-3">
            <div className="flex text-[#d97724] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#d97724]" />
              ))}
            </div>
            <p className="text-xs text-[#5c4a3a] leading-relaxed">
              &ldquo;Bột lên men tự nhiên 36h ăn êm bụng, rất tốt cho tiêu hóa và tim mạch.&rdquo;
            </p>
            <div className="pt-2.5 border-t border-[#eadbce]/60 text-xs font-bold text-[#4a3728]">
              Bác sĩ Mai Anh <span className="font-normal text-[10px] text-[#78716c] block">Chuyên gia dinh dưỡng</span>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eadbce] tactile-card space-y-3">
            <div className="flex text-[#d97724] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#d97724]" />
              ))}
            </div>
            <p className="text-xs text-[#5c4a3a] leading-relaxed">
              &ldquo;Granola giòn rụm không gắt dầu, đóng hộp mộc mạc tinh tế.&rdquo;
            </p>
            <div className="pt-2.5 border-t border-[#eadbce]/60 text-xs font-bold text-[#4a3728]">
              Minh Hằng <span className="font-normal text-[10px] text-[#78716c] block">Eat-cleaner 3 năm</span>
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
