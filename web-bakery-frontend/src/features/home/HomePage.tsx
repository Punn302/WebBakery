import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  Leaf,
  Truck,
  Calculator,
  Flame,
  Activity,
  HeartPulse,
  Scale,
  ChevronRight,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductCard } from '@/features/products/ProductCard'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import type { Product } from '@/types'
import heroStitchImg from '@/assets/hero_stitch.jpg'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Live backend connection to Spring Boot /api/products
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-bestseller'],
    queryFn: () => productApi.getProducts({ page: 0, size: 8, activeOnly: true }),
    staleTime: 5 * 60 * 1000,
  })

  const bestSellerProducts = productData?.content || []

  // 4 Signature Flavors (Section 2)
  const signatureFlavors = [
    {
      title: 'FRUITY GRAINS',
      subtitle: 'Hạt & quả mọng',
      description: 'Cranberry dâu rừng & yến mạch',
      image:
        'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=800&auto=format&fit=crop',
      tag: 'Eat Clean',
      query: 'granola',
    },
    {
      title: 'DARK CHOCO',
      subtitle: 'Cacao nguyên chất',
      description: 'Cacao Đắk Lắk đậm vị 0g đường',
      image:
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop',
      tag: 'Sugar-Free',
      query: 'cacao',
    },
    {
      title: 'PURE MATCHA',
      subtitle: 'Trà xanh Uji',
      description: 'Matcha Nhật Bản hữu cơ thanh tao',
      image:
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      tag: 'Antioxidant',
      query: 'matcha',
    },
    {
      title: 'SALTY CHEESE',
      subtitle: 'Phô mai ít béo',
      description: 'Parmesan thơm bùi chuẩn Keto',
      image:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      tag: 'Keto Friendly',
      query: 'phô mai',
    },
  ]

  // 4 Certifications & Commitments (Section 3)
  const commitments = [
    {
      icon: ShieldCheck,
      code: 'ISO 22000:2018',
      title: 'An toàn thực phẩm quốc tế',
      subtitle: 'Kiểm soát nghiêm ngặt từng mẻ bánh',
    },
    {
      icon: Award,
      code: 'HACCP Codex',
      title: 'Kiểm soát chất lượng',
      subtitle: 'Phân tích mối nguy chuẩn khoa học',
    },
    {
      icon: Leaf,
      code: '100% Nguyên liệu sạch',
      title: '0g đường tinh luyện',
      subtitle: 'Bột nguyên cám & mật ngọt tự nhiên',
    },
    {
      icon: Truck,
      code: 'Giao hàng toàn quốc',
      title: 'Freeship từ 299k',
      subtitle: 'Giao nhanh 2h TP.HCM & Hà Nội',
    },
  ]

  // 6 Category Pills (Section 4)
  const categoryPills = [
    {
      name: 'Granola',
      query: 'granola',
      image:
        'https://images.unsplash.com/photo-1517093157656-b9ec84eb09d2?q=80&w=300&auto=format&fit=crop',
      badge: 'Bestseller',
    },
    {
      name: 'Biscotti',
      query: 'biscotti',
      image:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
      badge: 'Giòn rụm',
    },
    {
      name: 'Thanh hạt',
      query: 'bar',
      image:
        'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=300&auto=format&fit=crop',
      badge: 'Protein',
    },
    {
      name: 'Bánh ngói',
      query: 'keto',
      image:
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=300&auto=format&fit=crop',
      badge: 'Keto 100%',
    },
    {
      name: 'Cookies',
      query: 'cookies',
      image:
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=300&auto=format&fit=crop',
      badge: 'Nguyên cám',
    },
    {
      name: 'Mix Nuts',
      query: 'nuts',
      image:
        'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?q=80&w=300&auto=format&fit=crop',
      badge: 'Sấy lạnh',
    },
  ]

  // 3 Health Tools (Section 6)
  const healthTools = [
    {
      title: 'TÍNH TDEE',
      badge: 'Năng lượng tiêu hao',
      desc: 'Tổng năng lượng tiêu hao mỗi ngày theo cường độ tập luyện và thói quen sinh hoạt.',
      highlight: 'Calo thâm hụt / Calo duy trì',
      icon: Activity,
    },
    {
      title: 'TÍNH BMI',
      badge: 'Chỉ số khối cơ thể',
      desc: 'Đánh giá tỷ lệ thể trạng chuẩn theo thang chuẩn WHO và Viện Dinh Dưỡng Quốc Gia.',
      highlight: '18.5 – 22.9 Lý tưởng',
      icon: Scale,
    },
    {
      title: 'TÍNH BMR',
      badge: 'Trao đổi chất cơ bản',
      desc: 'Mức năng lượng tối thiểu cơ thể cần để duy trì sự sống ở trạng thái nghỉ ngơi hoàn toàn.',
      highlight: 'Công thức Mifflin-St Jeor',
      icon: HeartPulse,
    },
  ]

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* ================= SECTION 1: mew_mobile_slide (Hero Banner) ================= */}
      <section className="relative pt-2 sm:pt-4 md:pt-6">
        <div className="rounded-3xl bg-[#FEFBF4] border border-[#E5E2DF] overflow-hidden p-6 sm:p-10 lg:p-14 tactile-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Minimal Text */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E2DF] text-[#006561] text-xs font-semibold select-none shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
                <span className="tracking-wide">TIỆM BÁNH DINH DƯỠNG &amp; ĂN KIÊNG HEALTHY</span>
              </motion.div>

              {/* Title in Wix Madefor Display */}
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-bold text-[#2A2725] leading-[1.14] tracking-tight"
              >
                BÁNH TƯƠI MỖI NGÀY, TỐT CHO VÓC DÁNG &amp; SỨC KHỎE
              </motion.h1>

              {/* Subtitle: Minimal punchy tags */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium text-[#6B6661]"
              >
                <span className="bg-[#006561]/8 text-[#006561] px-3 py-1 rounded-full font-semibold">
                  100% bột nguyên cám
                </span>
                <span>•</span>
                <span className="bg-[#C9785C]/15 text-[#B23A2A] px-3 py-1 rounded-full font-semibold">
                  Không đường tinh luyện
                </span>
                <span>•</span>
                <span className="bg-[#2A2725]/6 text-[#2A2725] px-3 py-1 rounded-full font-semibold">
                  Nướng tươi mỗi sáng
                </span>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="flex items-center gap-3 pt-2"
              >
                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] font-semibold px-7 py-3 rounded-full text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Khám phá thực đơn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="border border-[#2A2725] bg-transparent hover:bg-[#2A2725] hover:text-[#FEFBF4] text-[#2A2725] font-semibold px-7 py-3 rounded-full text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Về HeBekery
                </button>
              </motion.div>

              {/* Quick Trust Badges */}
              <div className="pt-4 border-t border-[#E5E2DF] flex items-center gap-5 sm:gap-7 text-xs font-semibold text-[#2A2725]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#006561]" />
                  <span>&gt;15.000 Khách hàng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#7B9461]" />
                  <span>Eat Clean &amp; Keto</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C9785C]" />
                  <span>Giao 2H TP.HCM &amp; HN</span>
                </div>
              </div>
            </div>

            {/* Right Column: Aesthetic Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden p-2.5 bg-white border border-[#E5E2DF] shadow-md group">
                <img
                  src={heroStitchImg}
                  alt="HeBekery bánh tươi nướng mộc mạc tốt cho vóc dáng"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[420px] object-cover rounded-xl group-hover:scale-102 transition-transform duration-700 ease-out"
                />

                {/* Floating Micro-Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E5E2DF] flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B6661] tracking-wider block">
                      Signature Hebekery
                    </span>
                    <h4 className="font-display text-xs sm:text-sm font-bold text-[#2A2725]">
                      Granola Siêu Hạt Mật Hoa
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#006561] block">
                      112 kcal <span className="text-[10px] font-sans text-[#6B6661]">/ 30g</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#7B9461]">0g Đường Cát</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: mew_about (Triết lý & 4 hương vị Signature) ================= */}
      <section className="space-y-8">
        {/* Cormorant Garamond Serif Quote */}
        <div className="text-center max-w-3xl mx-auto px-4 space-y-2">
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl italic text-[#2A2725] leading-relaxed">
            &ldquo;Chọn nguyên liệu kỹ, làm chỉn chu — HeBekery đồng hành cùng lối sống lành mạnh của bạn.&rdquo;
          </p>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#006561]">
            — 4 Hương Vị Signature HeBekery —
          </span>
        </div>

        {/* 4 Vertical Aesthetic Image Columns (aspect 3:4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {signatureFlavors.map((flavor, idx) => (
            <motion.div
              key={flavor.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              onClick={() => navigate(`/products?search=${encodeURIComponent(flavor.query)}`)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-[#E5E2DF] shadow-xs hover:shadow-lg transition-all"
            >
              {/* Background Photo */}
              <img
                src={flavor.image}
                alt={flavor.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A2725]/90 via-[#2A2725]/30 to-transparent" />

              {/* Top Tag Badge */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/90 text-[#2A2725] backdrop-blur-xs shadow-xs">
                  {flavor.tag}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <h3 className="font-display text-base sm:text-lg font-bold tracking-wide">
                  {flavor.title}
                </h3>
                <p className="text-xs text-[#f6e9df] font-medium">{flavor.subtitle}</p>
                <div className="pt-1 flex items-center text-[11px] text-[#FEFBF4]/80 group-hover:text-white transition-colors">
                  <span>Khám phá</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 3: m_policy (4 Chứng nhận & Cam kết) ================= */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commitments.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E2DF] tactile-card flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#006561]/8 text-[#006561] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[11px] font-bold text-[#C9785C] tracking-wide block">
                    {item.code}
                  </span>
                  <h4 className="font-display text-sm font-bold text-[#2A2725]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#6B6661] leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ================= SECTION 4: mew_cate (6 Thẻ Danh Mục) ================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
            Mời bạn sống lành cùng Hebekery
          </h2>
          <p className="text-xs text-[#6B6661] font-medium">
            Chọn món dinh dưỡng phù hợp với nhu cầu cơ thể bạn hôm nay
          </p>
        </div>

        {/* 6 Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoryPills.map((cate) => (
            <motion.div
              key={cate.name}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18 }}
              onClick={() => navigate(`/products?search=${encodeURIComponent(cate.query)}`)}
              className="group p-3 rounded-2xl bg-white border border-[#E5E2DF] tactile-card hover:border-[#006561] cursor-pointer flex flex-col items-center text-center space-y-2.5 transition-all"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E5E2DF] bg-[#F8F6F5] relative">
                <img
                  src={cate.image}
                  alt={cate.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-display text-xs sm:text-sm font-bold text-[#2A2725] group-hover:text-[#006561] transition-colors">
                  {cate.name}
                </h3>
                <span className="inline-block mt-0.5 text-[9px] font-semibold text-[#006561] bg-[#006561]/8 px-2 py-0.5 rounded-full">
                  {cate.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 5: mew_bestseller (Mua Nhiều Nhất) ================= */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex items-end justify-between border-b border-[#E5E2DF] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B23A2A] bg-[#FFE6DC] px-2 py-0.5 rounded-sm">
                TOP YÊU THÍCH
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
              MUA NHIỀU NHẤT
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-[#006561] hover:text-[#1a9a9b] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-column product grid with live data from backend */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#6B6661]">
            Đang tải sản phẩm bán chạy...
          </div>
        ) : bestSellerProducts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#E5E2DF] rounded-2xl bg-white p-6 space-y-2">
            <p className="text-sm font-semibold text-[#2A2725]">Chưa có sản phẩm nào</p>
            <p className="text-xs text-[#6B6661]">Mời bạn ghé lại sau hoặc khám phá thực đơn chung.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellerProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= SECTION 6: mew_tool (Bộ Công Cụ Sức Khỏe) ================= */}
      <section className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-10 lg:p-12 tactile-card space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/8 text-[#006561] text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Khoa Học Dinh Dưỡng Thực Chứng</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
            Hiểu cơ thể để ăn đúng nhu cầu
          </h2>
          <p className="text-xs text-[#6B6661] leading-relaxed">
            Chỉ số cơ thể chuẩn xác là kim chỉ nam để lựa chọn khẩu phần bánh healthy phù hợp với mục tiêu vóc dáng của bạn.
          </p>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {healthTools.map((tool) => {
            const ToolIcon = tool.icon
            return (
              <div
                key={tool.title}
                className="rounded-2xl p-6 bg-[#FEFBF4] border border-[#E5E2DF] flex flex-col justify-between space-y-4 hover:border-[#006561] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#006561] text-white flex items-center justify-center">
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#006561] bg-[#006561]/10 px-2.5 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#2A2725]">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-[#6B6661] leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="pt-1 text-[11px] font-mono font-semibold text-[#7B9461]">
                    ✓ {tool.highlight}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/bmi-tdee')}
                    className="w-full text-center text-xs font-semibold text-[#006561] hover:text-[#1a9a9b] py-2.5 rounded-full border border-[#006561] hover:bg-[#006561]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Tính ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
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
