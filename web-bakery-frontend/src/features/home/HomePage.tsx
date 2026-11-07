import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import type { Product } from '@/types'

// Authentic Hebekery Hero Slides matching exact proportions & leaves
const HERO_SLIDES = [
  {
    id: 1,
    title: 'NGŨ CỐC GRANOLA DINH DƯỠNG',
    link: '/products?category=Granola',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img1.png?1790765513162',
    isOdd: true,
    leaves: [
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_1_sl_1.png?1790765513162',
        className: 'bottom-[22%] right-[10%] sm:right-[14%] w-16 sm:w-22 md:w-26',
      },
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_2_sl_1.png?1790765513162',
        className: 'top-[20%] left-[10%] sm:left-[14%] w-16 sm:w-22 md:w-26',
      },
    ],
  },
  {
    id: 2,
    title: 'BÁNH BISCOTTI ĂN KIÊNG',
    link: '/products?category=Biscotti',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img2.png?1790765513162',
    isOdd: false,
    leaves: [
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_1_sl_2.png?1790765513162',
        className: 'top-[22%] left-[8%] sm:left-[12%] md:left-[14%] w-16 sm:w-22 md:w-26',
      },
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_2_sl_2.png?1790765513162',
        className: 'bottom-[22%] right-[8%] sm:right-[12%] md:right-[14%] w-16 sm:w-22 md:w-28',
      },
    ],
  },
  {
    id: 3,
    title: 'BÁNH NGÓI HẠNH NHÂN KETO',
    link: '/products?category=B%C3%A1nh+ng%C3%B3i',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img3.png?1790765513162',
    isOdd: true,
    leaves: [
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_1_sl_3.png?1790765513162',
        className: 'bottom-[24%] right-[10%] sm:right-[14%] w-16 sm:w-22 md:w-26',
      },
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_2_sl_3.png?1790765513162',
        className: 'left-[10%] sm:left-[14%] bottom-[20%] w-16 sm:w-20 md:w-24',
      },
    ],
  },
  {
    id: 4,
    title: 'TRÁI CÂY SẤY NHẬP KHẨU',
    link: '/products?category=H%E1%BA%A1t',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img4.png?1790765513162',
    isOdd: false,
    leaves: [
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_1_sl_4.png?1790765513162',
        className: 'bottom-[22%] left-[10%] sm:left-[14%] w-16 sm:w-22 md:w-26',
      },
      {
        src: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/flo_2_sl_4.png?1790765513162',
        className: 'right-[10%] sm:right-[14%] top-[18%] w-16 sm:w-22 md:w-26',
      },
    ],
  },
  {
    id: 5,
    title: 'COOKIES HẠNH NHÂN',
    link: '/products?category=Cookies',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img5.png?1790765513162',
    isOdd: true,
    leaves: [],
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
    title: 'HACCP CODEX',
    desc: 'Kiểm soát điểm tới hạn từng mẻ',
  },
  {
    icon: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/i_policy_3.png?1790765513162',
    title: 'NGUYÊN LIỆU THÀNH PHẦN RÕ RÀNG',
    desc: 'Liệt kê đầy đủ tên + tỷ lệ % nguyên liệu chính trên bao bì',
  },
  {
    icon: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/i_policy_4.png?1790765513162',
    title: 'GIAO HÀNG TOÀN QUỐC',
    desc: 'Đóng gói kỹ, giao nhanh đến mọi tỉnh thành trên cả nước',
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
    desc: 'Nướng 2 lần — kỹ thuật biscotti truyền thống Ý, giòn rụm tự nhiên.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_2.png?1790765513162',
    link: '/products?category=Biscotti',
  },
  {
    id: 'thanh-hat',
    title: 'Thanh hạt',
    desc: 'Bữa phụ chỉn chu, năng lượng vừa đủ — muối hồng Himalaya hoặc dừa.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_3.png?1790765513162',
    link: '/products?category=Thanh+h%E1%BA%A1t',
  },
  {
    id: 'banh-ngoi',
    title: 'Bánh ngói',
    desc: 'Mỏng giòn, nướng tay — hạnh nhân keto hoặc óc chó nguyên hạt.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_4.png?1790765513162',
    link: '/products?category=B%C3%A1nh+ng%C3%B3i',
  },
  {
    id: 'cookies',
    title: 'Cookies',
    desc: 'Bột mì nguyên cám, không bột tinh luyện. Nướng từng mẻ 24 chiếc.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_5.png?1790765513162',
    link: '/products?category=Cookies',
  },
  {
    id: 'mix-nuts',
    title: 'Mix Nuts',
    desc: '8 loại hạt rang mộc — yến mạch, hạnh nhân, óc chó, hạt điều, hạt dẻ.',
    image: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/img_cate_6.png?1790765513162',
    link: '/products?category=H%E1%BA%A1t',
  },
]

export const HomePage: React.FC = () => {
  // Start on index 1 (Bánh Biscotti Ăn Kiêng) matching the user's reference
  const [currentSlide, setCurrentSlide] = useState(1)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addItem } = useCart()
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({})

  // Auto-play hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection('next')
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setDirection('next')
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  const prevSlide = () => {
    setDirection('prev')
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  // Live backend connection to Spring Boot /api/products
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-bestseller'],
    queryFn: () => productApi.getProducts({ page: 0, size: 8, activeOnly: true }),
    staleTime: 5 * 60 * 1000,
  })

  const bestSellerProducts = productData?.content || []

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    await addItem(product, 1)
    setAddedIds((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }))
    }, 1500)
  }

  const slide = HERO_SLIDES[currentSlide]

  return (
    <div className="w-full pb-16 font-text bg-[#FAF7F2] text-[#2A2725]">
      {/* ================= SECTION 1: mew_mobile_slide (HERO CAROUSEL) ================= */}
      <section className="mew_slide relative w-full pt-6 sm:pt-8 md:pt-12 pb-12 sm:pb-16 overflow-hidden select-none">
        <div className="max-w-[1240px] mx-auto px-4 relative">
          <div className="relative min-h-[460px] sm:min-h-[520px] md:min-h-[580px] flex items-center justify-center">
            
            {/* Ambient Concentric Circle Animation */}
            <div className="circle_animation absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Soft warm shadow disc directly behind bowl */}
              <span className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-[#E0CDBE]/25 blur-md" />

              {/* Floating ambient rings */}
              {slide.isOdd ? (
                <>
                  <span className="absolute -left-4 sm:left-12 bottom-12 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full bg-gradient-to-b from-[#E0CDBE]/30 to-transparent -rotate-12 transition-all duration-700" />
                  <span className="absolute left-16 sm:left-28 bottom-20 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full border-[18px] border-[#E2F4E0]/70 transition-all duration-700" />
                  <span className="absolute right-16 sm:right-28 top-12 w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] rounded-full border border-[#E0CDBE]/60 transition-all duration-700" />
                  <span className="absolute -right-4 sm:right-8 top-8 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-full bg-gradient-to-b from-[#EDCA82]/25 to-transparent rotate-45 transition-all duration-700" />
                </>
              ) : (
                <>
                  <span className="absolute -left-4 sm:left-8 bottom-16 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full bg-gradient-to-b from-[#EDCA82]/25 to-transparent -rotate-45 transition-all duration-700" />
                  <span className="absolute left-12 sm:left-24 bottom-28 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full border-[18px] border-[#E2F4E0]/70 transition-all duration-700" />
                  <span className="absolute right-12 sm:right-24 top-20 w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] rounded-full border border-[#E0CDBE]/60 transition-all duration-700" />
                  <span className="absolute -right-4 sm:right-12 top-12 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-full bg-gradient-to-b from-[#E0CDBE]/30 to-transparent rotate-12 transition-all duration-700" />
                </>
              )}
            </div>

            {/* Decorative Floating Leaves with organic scale & fade */}
            <div className="leaf_animation absolute inset-0 pointer-events-none overflow-hidden">
              {slide.leaves.map((leaf, i) => (
                <img
                  key={`${slide.id}-leaf-${i}`}
                  src={leaf.src}
                  alt="leaf"
                  className={`absolute pointer-events-none hebe-leaf-active ${leaf.className}`}
                />
              ))}
            </div>

            {/* Active Slide Bowl & Typography */}
            <div className="relative z-10 text-center max-w-lg mx-auto flex flex-col items-center">
              <Link
                to={slide.link}
                className="block group relative cursor-pointer"
                title={slide.title}
              >
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[350px] md:h-[350px] mx-auto flex items-center justify-center">
                  <img
                    key={`${slide.id}-${direction}`}
                    src={slide.image}
                    alt={slide.title}
                    className={`slide_bowl_img w-full h-full object-contain ${
                      direction === 'next' ? 'hebe-slide-in-next' : 'hebe-slide-in-prev'
                    }`}
                  />
                </div>
              </Link>

              {/* Slide Title & "Mua ngay >" Action */}
              <div className="ani_text text-center mt-3 sm:mt-5">
                <h2 className="title_slide text-xl sm:text-2xl md:text-[28px] font-display font-bold uppercase tracking-tight text-[#2A2725]">
                  {slide.title}
                </h2>
                <Link
                  to={slide.link}
                  className="sup_slide inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#c8983d] hover:text-[#91350a] mt-1 transition-colors group"
                >
                  <span>Mua ngay</span>
                  <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">
                    &gt;
                  </span>
                </Link>
              </div>
            </div>

            {/* Carousel Navigation Arrows - Positioned inward ~18-20% framing the bowl */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide trước"
              className="absolute left-[5%] sm:left-[12%] md:left-[18%] lg:left-[20%] z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-[#E5E2DF]/60 shadow-[0_4px_16px_rgba(0,80,76,0.12)] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-[#2A2725]" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Slide tiếp theo"
              className="absolute right-[5%] sm:right-[12%] md:right-[18%] lg:right-[20%] z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-[#E5E2DF]/60 shadow-[0_4px_16px_rgba(0,80,76,0.12)] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-[#2A2725]" />
            </button>
          </div>

          {/* 5 Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-6">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setDirection(idx > currentSlide ? 'next' : 'prev')
                  setCurrentSlide(idx)
                }}
                aria-label={`Chuyển tới slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-7 h-2 bg-[#006561]'
                    : 'w-2 h-2 bg-[#E5E2DF] hover:bg-[#9A938C]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: mew_about (VỀ HEBEKERY STORY - FULL BLEED) ================= */}
      <section className="mew_about module-component w-full">
        {/* Full-bleed Wide Panorama Image: 4 Biscotti Jars */}
        <div className="about_media w-full overflow-hidden">
          <img
            src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/about_img_pc.jpg?1790765513162"
            alt="Về HeBekery"
            className="w-full h-auto object-cover aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9]"
          />
        </div>

        {/* Story Content Block */}
        <div className="about_story max-w-[800px] mx-auto px-4 py-12 sm:py-16 text-center flex flex-col items-center gap-4">
          <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#B23A2A]">
            Về Hebekery
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-display font-normal text-[#2A2725] leading-tight">
            Chọn nguyên liệu kỹ, <b className="font-bold">làm chỉn chu</b>
          </h2>

          <span className="rule w-10 h-[1.5px] bg-[#B23A2A] mx-auto block my-1" aria-hidden="true" />

          <p className="summary text-sm sm:text-base text-[#6B6661] leading-relaxed max-w-2xl font-text">
            Chúng tôi là những bạn trẻ yêu lối sống lành mạnh và đam mê tạo nên những sản phẩm
            ngon thật, lành thật, dễ dùng cho người Việt Nam. Để không phải ăn ít hơn, mà là ăn đúng
            hơn — chính là kim chỉ nam Hebekery luôn nỗ lực hướng đến.
          </p>

          <Link
            to="/about"
            className="btn btn-heritage mt-2 inline-flex items-center justify-center bg-[#91350a] hover:bg-[#782c08] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            TÌM HIỂU HEBEKERY
          </Link>
        </div>
      </section>

      {/* ================= SECTION 3: m_policy (4 CAM KẾT TIÊU CHUẨN) ================= */}
      <section className="m_policy w-full py-10 sm:py-14">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="policy-wrap grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {POLICIES.map((p) => (
              <div
                key={p.title}
                className="align-items-center flex flex-col items-center text-center gap-3.5"
              >
                <div className="poli-icon w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                  <img
                    src={p.icon}
                    alt={p.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="policy-content flex flex-col items-center gap-1.5 max-w-[220px]">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-[#2A2725] uppercase tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6B6661] font-text leading-snug">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: mew_cate (DÒNG SẢN PHẨM SỐNG LÀNH) ================= */}
      <section className="mew_cate module-component w-full py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8 sm:space-y-10">
          <div className="cate_title text-center space-y-2 max-w-md mx-auto">
            <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#B23A2A]">
              Dòng sản phẩm
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-normal text-[#2A2725]">
              Mời bạn <b className="font-bold">sống lành</b> cùng Hebekery
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {PRODUCT_LINES.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="cate-card group flex flex-col bg-white rounded-xl border border-[#E5E2DF]/70 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FEFBF4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="cate-body p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-[#2A2725] group-hover:text-[#006561] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#6B6661] mt-1 line-clamp-2 leading-relaxed font-text">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#006561] group-hover:underline transition-all">
                    Khám phá dòng sản phẩm
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: mew_bestseller (MUA NHIỀU NHẤT) ================= */}
      <section className="mew_bestseller module-component w-full py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8 sm:space-y-10">
          <div className="cate_title text-center space-y-2 max-w-lg mx-auto">
            <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#B23A2A]">
              Best-seller tháng này
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-[#2A2725] uppercase tracking-tight">
              MUA NHIỀU NHẤT
            </h2>
            <p className="summary sub text-xs sm:text-sm text-[#6B6661] font-text">
              8 sản phẩm được khách Hebekery chọn lại nhiều nhất.
            </p>
          </div>

          {/* Product Grid from Backend */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-[#E5E2DF] p-4 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-[#FEFBF4] rounded-lg" />
                  <div className="space-y-2 mt-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : bestSellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {bestSellerProducts.map((product) => {
                const originalPrice = Math.round((product.price * 1.18) / 1000) * 1000
                const isAdded = !!addedIds[product.id]

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = `/products/${product.id}`
                      }
                    }}
                    className="bg-white card-items h-full overflow-hidden position-relative product-item rounded-xl border border-[#E5E2DF]/70 hover:border-[#006561] transition-all cursor-pointer flex flex-col justify-between p-3 sm:p-4 group shadow-xs hover:shadow-md"
                  >
                    <div>
                      {/* Image & Top Badges */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F2] rounded-lg">
                        <img
                          src={optimizeCloudinaryUrl(product.imageUrl, 500)}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-[#B23A2A] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            HOT
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-xs text-[#006561] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E2DF]">
                          ★ 4.9+ (1.2k)
                        </div>
                      </div>

                      {/* Title & Price */}
                      <div className="mt-3 space-y-1.5">
                        <h3 className="font-display text-xs sm:text-sm font-semibold text-[#2A2725] group-hover:text-[#006561] transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="font-display text-sm sm:text-base font-bold text-[#2A2725]">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="font-mono text-xs text-[#9A938C] line-through">
                            {formatCurrency(originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: THÊM VÀO GIỎ */}
                    <div className="mt-4 pt-1">
                      <button
                        type="button"
                        aria-label={isAdded ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`w-full py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-full border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? 'bg-[#006561] text-white border-[#006561]'
                            : 'border-[#006561] text-[#006561] hover:bg-[#006561] hover:text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>ĐÃ THÊM</span>
                          </>
                        ) : (
                          <span>THÊM VÀO GIỎ</span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E5E2DF]">
              <p className="text-sm text-[#6B6661]">Đang tải dữ liệu sản phẩm từ bếp HeBekery...</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= SECTION 6: mew_tool (CÔNG CỤ HEBEKERY) ================= */}
      <section className="mew_tool module-component w-full py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8 sm:space-y-10">
          <div className="tool_title text-center space-y-2 max-w-md mx-auto">
            <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#B23A2A]">
              Công cụ Hebekery
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-normal text-[#2A2725]">
              Hiểu cơ thể để <b className="font-bold">ăn đúng nhu cầu</b>
            </h2>
            <p className="summary sub text-xs sm:text-sm text-[#6B6661] font-text">
              3 phép tính nhanh — biết cơ thể bạn cần gì trước khi chọn bữa.
            </p>
          </div>

          <div className="tool-box grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* TDEE Card */}
            <Link
              to="/bmi-tdee"
              className="tool-card bg-white rounded-xl p-7 border border-[#E5E2DF]/70 hover:border-[#c9785c] hover:shadow-lg transition-all flex flex-col justify-between gap-5 group cursor-pointer"
            >
              <div>
                <div className="tool-head flex items-center justify-between">
                  <span className="dot w-2.5 h-2.5 rounded-full bg-[#c9785c]" />
                  <span className="unit font-mono text-xs text-[#6B6661]">kcal · ngày</span>
                </div>
                <div className="tool-acronym text-6xl sm:text-7xl font-display font-bold text-[#2A2725] tracking-tight mt-3">
                  TDEE
                </div>
                <h3 className="tool-title text-base font-bold font-display text-[#2A2725] mt-2 group-hover:text-[#c9785c] transition-colors">
                  Tổng năng lượng tiêu hao mỗi ngày
                </h3>
                <p className="tool-desc text-xs text-[#6B6661] mt-2 leading-relaxed font-text">
                  Tính tổng calo cơ thể đốt trong 24h dựa trên hoạt động — biết nên ăn bao nhiêu để
                  giữ, giảm hay tăng cân.
                </p>
              </div>
              <span className="tool-cta inline-flex items-center gap-1.5 text-xs font-bold text-[#2A2725] group-hover:text-[#c9785c] transition-colors">
                <span>Tính ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* BMI Card */}
            <Link
              to="/bmi-tdee"
              className="tool-card bg-white rounded-xl p-7 border border-[#E5E2DF]/70 hover:border-[#006561] hover:shadow-lg transition-all flex flex-col justify-between gap-5 group cursor-pointer"
            >
              <div>
                <div className="tool-head flex items-center justify-between">
                  <span className="dot w-2.5 h-2.5 rounded-full bg-[#006561]" />
                  <span className="unit font-mono text-xs text-[#6B6661]">kg ÷ m²</span>
                </div>
                <div className="tool-acronym text-6xl sm:text-7xl font-display font-bold text-[#2A2725] tracking-tight mt-3">
                  BMI
                </div>
                <h3 className="tool-title text-base font-bold font-display text-[#2A2725] mt-2 group-hover:text-[#006561] transition-colors">
                  Chỉ số khối cơ thể
                </h3>
                <p className="tool-desc text-xs text-[#6B6661] mt-2 leading-relaxed font-text">
                  Đối chiếu cân nặng với chiều cao — tham khảo nhanh cơ thể bạn đang ở vùng nào:
                  thiếu, lý tưởng hay dư.
                </p>
              </div>
              <span className="tool-cta inline-flex items-center gap-1.5 text-xs font-bold text-[#2A2725] group-hover:text-[#006561] transition-colors">
                <span>Tính ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* BMR Card */}
            <Link
              to="/bmi-tdee"
              className="tool-card bg-white rounded-xl p-7 border border-[#E5E2DF]/70 hover:border-[#7B9461] hover:shadow-lg transition-all flex flex-col justify-between gap-5 group cursor-pointer"
            >
              <div>
                <div className="tool-head flex items-center justify-between">
                  <span className="dot w-2.5 h-2.5 rounded-full bg-[#7B9461]" />
                  <span className="unit font-mono text-xs text-[#6B6661]">kcal · nghỉ</span>
                </div>
                <div className="tool-acronym text-6xl sm:text-7xl font-display font-bold text-[#2A2725] tracking-tight mt-3">
                  BMR
                </div>
                <h3 className="tool-title text-base font-bold font-display text-[#2A2725] mt-2 group-hover:text-[#7B9461] transition-colors">
                  Tỷ lệ trao đổi chất cơ bản
                </h3>
                <p className="tool-desc text-xs text-[#6B6661] mt-2 leading-relaxed font-text">
                  Lượng calo cơ thể đốt khi nghỉ hoàn toàn — nền tảng để hiểu nhu cầu năng lượng
                  tối thiểu của bạn.
                </p>
              </div>
              <span className="tool-cta inline-flex items-center gap-1.5 text-xs font-bold text-[#2A2725] group-hover:text-[#7B9461] transition-colors">
                <span>Tính ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Medical Disclaimer */}
          <div className="text-center pt-2">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#9A938C] font-mono">
              KẾT QUẢ MANG TÍNH THAM KHẢO, KHÔNG THAY THẾ TƯ VẤN Y KHOA CHUYÊN MÔN.
            </p>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
