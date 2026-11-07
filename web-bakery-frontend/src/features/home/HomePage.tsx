import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Flame,
  Activity,
  Scale,
  HeartPulse,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductCard } from '@/features/products/ProductCard'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import type { Product } from '@/types'

// Real Hebekery Hero Slides
const HERO_SLIDES = [
  {
    id: 1,
    title: 'NGŨ CỐC GRANOLA DINH DƯỠNG',
    link: '/products?category=Granola',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img1.png?1790765513162',
    accentColor: '#006561',
  },
  {
    id: 2,
    title: 'BÁNH BISCOTTI ĂN KIÊNG',
    link: '/products?category=Biscotti',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img2.png?1790765513162',
    accentColor: '#91350a',
  },
  {
    id: 3,
    title: 'BÁNH NGÓI HẠNH NHÂN KETO',
    link: '/products?category=B%C3%A1nh+ng%C3%B3i',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img3.png?1790765513162',
    accentColor: '#c8983d',
  },
  {
    id: 4,
    title: 'TRÁI CÂY SẤY NHẬP KHẨU',
    link: '/products?category=H%E1%BA%A1t',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img4.png?1790765513162',
    accentColor: '#B23A2A',
  },
  {
    id: 5,
    title: 'COOKIES HẠNH NHÂN',
    link: '/products?category=Cookies',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img5.png?1790765513162',
    accentColor: '#006561',
  },
]

// Real Hebekery Policy Items
const POLICIES = [
  {
    icon: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/i_policy_1.png?1790765513162',
    title: 'ISO 22000:2018',
    desc: 'Quản lý ATTP đạt chuẩn quốc tế',
  },
  {
    icon: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/i_policy_2.png?1790765513162',
    title: 'HACCP Codex',
    desc: 'Kiểm soát an toàn từng khâu',
  },
  {
    icon: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/i_policy_3.png?1790765513162',
    title: 'Nguyên liệu rõ ràng',
    desc: 'Minh bạch calo & dinh dưỡng',
  },
  {
    icon: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/i_policy_4.png?1790765513162',
    title: 'Giao hàng toàn quốc',
    desc: 'Freeship từ 299k, giao 2h HCM',
  },
]

// Real Hebekery 6 Categories
const PRODUCT_LINES = [
  {
    id: 'granola',
    title: 'Granola',
    desc: '9 loại hạt rang tại bếp, nướng mẻ nhỏ — vị nguyên cám & matcha.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_1.png?1790765513162',
    link: '/products?category=Granola',
  },
  {
    id: 'biscotti',
    title: 'Biscotti',
    desc: 'Bánh nướng 2 lần giòn rụm, 0g đường tinh luyện.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_2.png?1790765513162',
    link: '/products?category=Biscotti',
  },
  {
    id: 'nut-bar',
    title: 'Thanh hạt',
    desc: 'Thanh năng lượng hạt dinh dưỡng cho buổi tập & bữa phụ.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_3.png?1790765513162',
    link: '/products?category=Thanh+h%E1%BA%A1t',
  },
  {
    id: 'banh-ngoi',
    title: 'Bánh ngói',
    desc: 'Hạnh nhân lát mỏng nướng giòn chuẩn Keto.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_4.png?1790765513162',
    link: '/products?category=B%C3%A1nh+ng%C3%B3i',
  },
  {
    id: 'cookies',
    title: 'Cookies',
    desc: 'Bánh quy hạnh nhân socola chip ăn vặt lành mạnh.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_5.png?1790765513162',
    link: '/products?category=Cookies',
  },
  {
    id: 'mix-nuts',
    title: 'Mix Nuts',
    desc: 'Hạt dinh dưỡng sấy lạnh nhập khẩu cao cấp.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_6.png?1790765513162',
    link: '/products?category=H%E1%BA%A1t',
  },
]

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Auto-play hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)

  // Live backend connection to Spring Boot /api/products
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-bestseller'],
    queryFn: () => productApi.getProducts({ page: 0, size: 8, activeOnly: true }),
    staleTime: 5 * 60 * 1000,
  })

  const bestSellerProducts = productData?.content || []

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16">
      {/* ================= SECTION 1: mew_mobile_slide (HERO CAROUSEL) ================= */}
      <section className="relative w-full pt-4 sm:pt-6 md:pt-10 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="relative min-h-[420px] sm:min-h-[520px] md:min-h-[580px] flex items-center justify-center">
            {/* Background Organic Ambient Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#E0CDBE]/25 blur-2xl transform -rotate-12 transition-all duration-700" />
              <div className="absolute w-[200px] h-[200px] sm:w-[320px] sm:h-[320px] rounded-full border-[18px] border-[#E2F4E0]/60 transition-all duration-700" />
            </div>

            {/* Decorative Floating Leaves */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_1_sl_1.png?1790765513162"
                alt="leaf"
                className="absolute top-12 left-6 sm:left-24 w-12 sm:w-16 opacity-80 animate-pulse"
              />
              <img
                src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_2_sl_1.png?1790765513162"
                alt="leaf"
                className="absolute bottom-16 right-6 sm:right-28 w-14 sm:w-20 opacity-80"
              />
            </div>

            {/* Active Slide Display */}
            <div className="relative z-10 text-center max-w-xl mx-auto flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.45 }}
                  className="flex flex-col items-center"
                >
                  <Link
                    to={HERO_SLIDES[currentSlide].link}
                    className="block group relative cursor-pointer"
                  >
                    <div className="relative w-64 h-64 sm:w-84 sm:h-84 md:w-96 md:h-96 mx-auto">
                      <img
                        src={HERO_SLIDES[currentSlide].image}
                        alt={HERO_SLIDES[currentSlide].title}
                        className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>

                  <h2 className="title_slide mt-4 sm:mt-6 mb-2 text-xl sm:text-2xl md:text-3xl font-bold font-display uppercase tracking-tight text-[#2A2725]">
                    {HERO_SLIDES[currentSlide].title}
                  </h2>

                  <Link
                    to={HERO_SLIDES[currentSlide].link}
                    className="sup_slide inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#c8983d] hover:text-[#91350a] transition-all group mt-1"
                  >
                    <span>Mua ngay</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel Navigation Arrows */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide trước"
              className="absolute left-2 sm:left-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 border border-[#E5E2DF] shadow-md flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:scale-105 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Slide tiếp theo"
              className="absolute right-2 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 border border-[#E5E2DF] shadow-md flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:scale-105 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Chuyển tới slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 h-2.5 bg-[#006561]'
                    : 'w-2.5 h-2.5 bg-[#E5E2DF] hover:bg-[#9A938C]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: mew_about (VỀ HEBEKERY STORY) ================= */}
      <section className="relative w-full">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="rounded-3xl bg-white border border-[#E5E2DF] overflow-hidden shadow-xs">
            {/* Top Wide Banner Photo */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] overflow-hidden">
              <img
                src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/about_img_pc.jpg?1790765513162"
                alt="Về HeBekery"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop'
                }}
              />
            </div>

            {/* Story Content Block */}
            <div className="about_story max-w-2xl mx-auto py-12 px-6 sm:py-16 text-center flex flex-col items-center gap-4">
              <span className="eyebrow text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C9785C]">
                Về Hebekery
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-[#2A2725] leading-tight">
                Chọn nguyên liệu kỹ, <b className="font-bold">làm chỉn chu</b>
              </h2>

              <span className="w-10 h-0.5 bg-[#B23A2A] my-1" aria-hidden="true" />

              <p className="text-xs sm:text-sm md:text-base text-[#6B6661] leading-relaxed max-w-xl font-text">
                Chúng tôi là những bạn trẻ yêu lối sống lành mạnh và đam mê tạo nên những sản phẩm
                ngon thật, lành thật, dễ dùng cho người Việt Nam. Để không phải ăn ít hơn, mà là ăn đúng
                hơn — chính là kim chỉ nam Hebekery luôn nỗ lực hướng đến.
              </p>

              <Link
                to="/about"
                className="mt-3 inline-flex items-center justify-center bg-[#B23A2A] hover:bg-[#9A2F20] text-[#FEFBF4] text-xs sm:text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                Tìm hiểu HeBekery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: m_policy (4 CAM KẾT TIÊU CHUẨN) ================= */}
      <section className="relative w-full">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {POLICIES.map((p, idx) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl border border-[#E5E2DF] p-5 sm:p-6 text-center flex flex-col items-center gap-3.5 hover:border-[#006561]/40 transition-colors shadow-xs"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <img
                    src={p.icon}
                    alt={p.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback icon style
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#2A2725] uppercase tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#6B6661] font-text leading-snug">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: mew_cate (DÒNG SẢN PHẨM SỐNG LÀNH) ================= */}
      <section className="relative w-full">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8 sm:space-y-10">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="eyebrow text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C9785C]">
              Dòng sản phẩm
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-[#2A2725]">
              Mời bạn <b className="font-bold">sống lành</b> cùng Hebekery
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {PRODUCT_LINES.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="group flex flex-col bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FEFBF4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop'
                    }}
                  />
                </div>
                <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-[#2A2725] group-hover:text-[#006561] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#6B6661] mt-1 line-clamp-2 leading-snug font-text">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#006561] flex items-center gap-1 group-hover:gap-1.5 transition-all mt-1">
                    <span>Khám phá</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: mew_bestseller (MUA NHIỀU NHẤT) ================= */}
      <section className="relative w-full">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8 sm:space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="eyebrow text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C9785C]">
                Best-seller tháng này
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#2A2725] tracking-tight mt-1">
                MUA NHIỀU NHẤT
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6661] mt-1 font-text">
                8 sản phẩm dinh dưỡng được khách hàng Hebekery tin chọn nhiều nhất
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#006561] hover:text-[#1a9a9b] hover:gap-2.5 transition-all"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid from Backend */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#E5E2DF] p-4 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-[#FEFBF4] rounded-xl" />
                  <div className="space-y-2 mt-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : bestSellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {bestSellerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p: Product) => setSelectedProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E2DF]">
              <p className="text-sm text-[#6B6661]">Đang tải dữ liệu sản phẩm từ bếp HeBekery...</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= SECTION 6: mew_tool (BỘ CÔNG CỤ SỨC KHỎE HEBEKERY) ================= */}
      <section className="relative w-full">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="eyebrow text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C9785C]">
              Công cụ Hebekery
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-[#2A2725]">
              Hiểu cơ thể để <b className="font-bold">ăn đúng nhu cầu</b>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6661] font-text">
              3 phép tính nhanh — biết cơ thể bạn cần gì trước khi chọn bữa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tool 1: TDEE */}
            <Link
              to="/bmi-tdee"
              className="bg-white rounded-2xl border border-[#E5E2DF] p-6 sm:p-7 flex flex-col justify-between hover:shadow-md hover:border-[#c9785c] transition-all group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c9785c]" />
                  <span className="font-mono text-xs font-semibold text-[#6B6661]">kcal · ngày</span>
                </div>
                <div className="font-display text-3xl font-extrabold text-[#2A2725] tracking-tight">
                  TDEE
                </div>
                <h3 className="font-display font-bold text-base text-[#2A2725]">
                  Tổng năng lượng tiêu hao mỗi ngày
                </h3>
                <p className="text-xs text-[#6B6661] leading-relaxed font-text">
                  Tính tổng calo cơ thể đốt trong 24h dựa trên cường độ hoạt động — biết nên ăn bao
                  nhiêu để giữ, giảm mỡ hay tăng cân.
                </p>
              </div>

              <div className="pt-5 border-t border-[#E5E2DF]/60 mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#c9785c] group-hover:text-[#91350a] flex items-center gap-1.5 transition-colors">
                  <span>Tính ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <Activity className="w-5 h-5 text-[#c9785c]/40" />
              </div>
            </Link>

            {/* Tool 2: BMI */}
            <Link
              to="/bmi-tdee"
              className="bg-white rounded-2xl border border-[#E5E2DF] p-6 sm:p-7 flex flex-col justify-between hover:shadow-md hover:border-[#006561] transition-all group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006561]" />
                  <span className="font-mono text-xs font-semibold text-[#6B6661]">kg / m²</span>
                </div>
                <div className="font-display text-3xl font-extrabold text-[#2A2725] tracking-tight">
                  BMI
                </div>
                <h3 className="font-display font-bold text-base text-[#2A2725]">
                  Chỉ số khối cơ thể &amp; Vóc dáng
                </h3>
                <p className="text-xs text-[#6B6661] leading-relaxed font-text">
                  Đánh giá tỷ lệ thể trạng chuẩn (18.5 – 22.9 lý tưởng theo WHO) và biết ngay mình
                  đang thừa cân, thiếu cân hay cân đối.
                </p>
              </div>

              <div className="pt-5 border-t border-[#E5E2DF]/60 mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#006561] group-hover:text-[#1a9a9b] flex items-center gap-1.5 transition-colors">
                  <span>Tính ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <Scale className="w-5 h-5 text-[#006561]/40" />
              </div>
            </Link>

            {/* Tool 3: BMR */}
            <Link
              to="/bmi-tdee"
              className="bg-white rounded-2xl border border-[#E5E2DF] p-6 sm:p-7 flex flex-col justify-between hover:shadow-md hover:border-[#7B9461] transition-all group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7B9461]" />
                  <span className="font-mono text-xs font-semibold text-[#6B6661]">kcal baseline</span>
                </div>
                <div className="font-display text-3xl font-extrabold text-[#2A2725] tracking-tight">
                  BMR
                </div>
                <h3 className="font-display font-bold text-base text-[#2A2725]">
                  Tỷ lệ trao đổi chất cơ bản
                </h3>
                <p className="text-xs text-[#6B6661] leading-relaxed font-text">
                  Mức năng lượng tối thiểu cơ thể cần đốt cháy để duy trì các cơ quan hoạt động ngay cả
                  khi bạn nghỉ ngơi hoàn toàn.
                </p>
              </div>

              <div className="pt-5 border-t border-[#E5E2DF]/60 mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B9461] group-hover:text-[#006561] flex items-center gap-1.5 transition-colors">
                  <span>Tính ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <HeartPulse className="w-5 h-5 text-[#7B9461]/40" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal Quick View Product */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
