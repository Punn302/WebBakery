import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  Flame,
  Star,
  Eye,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import type { Product } from '@/types'

// Authentic Hebekery Hero Slides
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
    title: 'NGUYÊN LIỆU MINH BẠCH',
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
  const navigate = useNavigate()
  // Start on index 1 (Bánh Biscotti Ăn Kiêng) matching the user's reference
  const [currentSlide, setCurrentSlide] = useState(1)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addItem } = useCart()
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({})

  // Carousel refs for smooth horizontal scrolling
  const cateScrollRef = useRef<HTMLDivElement>(null)
  const bestSellerScrollRef = useRef<HTMLDivElement>(null)

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

  const scrollCate = (dir: 'left' | 'right') => {
    if (cateScrollRef.current) {
      const scrollAmount = dir === 'left' ? -320 : 320
      cateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollBestSeller = (dir: 'left' | 'right') => {
    if (bestSellerScrollRef.current) {
      const scrollAmount = dir === 'left' ? -320 : 320
      bestSellerScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
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
      <section className="mew_slide relative w-full pt-6 sm:pt-8 md:pt-12 pb-12 sm:pb-16 overflow-hidden select-none bg-[#FAF7F2]">
        <div className="max-w-[1240px] mx-auto px-4 relative">
          <div className="relative min-h-[440px] sm:min-h-[500px] md:min-h-[560px] flex items-center justify-center">
            
            {/* Pure and Minimal Natural Drop Shadow under Bowl - No colored rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] rounded-full bg-radial from-[#e5dac8]/45 via-[#f5efe5]/25 to-transparent blur-xs pointer-events-none transition-all duration-700" />
            </div>

            {/* Decorative Floating Leaves */}
            <div className="leaf_animation absolute inset-0 pointer-events-none overflow-hidden">
              {slide.leaves.map((leaf, i) => (
                <img
                  key={`${slide.id}-leaf-${i}-${currentSlide}`}
                  src={leaf.src}
                  alt="leaf"
                  className={`absolute pointer-events-none transition-all duration-700 ease-out transform scale-100 opacity-100 ${leaf.className}`}
                />
              ))}
            </div>

            {/* Active Slide Bowl & Typography */}
            <div className="relative z-10 text-center max-w-xl mx-auto flex flex-col items-center">
              <Link
                to={slide.link}
                className="block group relative cursor-pointer"
                title={slide.title}
              >
                <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-[380px] md:h-[380px] mx-auto flex items-center justify-center">
                  <img
                    key={`bowl-${slide.id}-${currentSlide}`}
                    src={slide.image}
                    alt={slide.title}
                    className="slide_bowl_img relative z-10 w-full h-full object-contain transition-all duration-500 ease-out transform hover:scale-105"
                  />
                </div>
              </Link>

              {/* Slide Title & "Mua ngay >" */}
              <div key={`text-${slide.id}-${currentSlide}`} className="ani_text text-center mt-3 sm:mt-5 transition-all duration-500">
                <h2 className="title_slide text-xl sm:text-2xl md:text-[34px] font-display font-bold uppercase tracking-tight text-[#2A2725] leading-tight">
                  {slide.title}
                </h2>
                <Link
                  to={slide.link}
                  className="sup_slide inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-[#a67c52] hover:text-[#006561] mt-2 transition-all group"
                >
                  <span>Mua ngay</span>
                  <span className="text-sm font-bold group-hover:translate-x-1.5 transition-transform">
                    &gt;
                  </span>
                </Link>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide trước"
              className="absolute left-[2%] sm:left-[6%] md:left-[12%] lg:left-[16%] z-20 w-11 h-11 rounded-full bg-white/95 border border-[#E5E2DF] shadow-[0_4px_16px_rgba(0,80,76,0.12)] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-[#2A2725]" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Slide tiếp theo"
              className="absolute right-[2%] sm:right-[6%] md:right-[12%] lg:right-[16%] z-20 w-11 h-11 rounded-full bg-white/95 border border-[#E5E2DF] shadow-[0_4px_16px_rgba(0,80,76,0.12)] flex items-center justify-center text-[#2A2725] hover:text-[#006561] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-[#2A2725]" />
            </button>
          </div>

          {/* Dots Indicator */}
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
                    ? 'w-8 h-2 bg-[#006561]'
                    : 'w-2 h-2 bg-[#E5E2DF] hover:bg-[#9A938C]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: mew_about (4 BISCOTTI JARS PANORAMA - USER ATTACHMENT) ================= */}
      <section className="mew_about module-component w-full">
        {/* Full-bleed Panorama Image of 4 Biscotti Jars */}
        <div className="about_media w-full overflow-hidden shadow-xs">
          <picture className="w-full d-block">
            <source media="(min-width: 768px)" srcSet="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/about_img_pc.jpg?1790765513162" />
            <source media="(max-width: 767px)" srcSet="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/about_img_mb.jpg?1790765513162" />
            <img
              src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/about_img_pc.jpg?1790765513162"
              alt="4 Vị Bánh Biscotti Nguyên Cám HeBekery - Fruity Grains, Dark Choco, Pure Matcha, Salty Cheese"
              className="w-full h-auto object-cover aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9]"
            />
          </picture>
        </div>

        {/* Story Content Block with Cormorant Garamond */}
        <div className="about_story max-w-[840px] mx-auto px-4 py-12 sm:py-16 text-center flex flex-col items-center gap-4">
          <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#B23A2A]">
            Về Hebekery
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-serif font-normal text-[#2A2725] leading-tight">
            Chọn nguyên liệu kỹ, <b className="font-bold">làm chỉn chu</b>
          </h2>

          <span className="rule w-12 h-[2px] bg-[#B23A2A] mx-auto block my-1" aria-hidden="true" />

          <p className="summary text-sm sm:text-base text-[#6B6661] leading-relaxed max-w-2xl font-text">
            Chúng tôi là những bạn trẻ yêu lối sống lành mạnh và đam mê tạo nên những sản phẩm ngon thật,
            lành thật, dễ dùng cho người Việt Nam. Để không phải ăn ít hơn, mà là ăn đúng hơn — chính là kim
            chỉ nam Hebekery luôn nỗ lực hướng đến.
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
      <section className="m_policy w-full py-10 sm:py-14 bg-white/50 border-y border-[#E5E2DF]/60">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="policy-wrap grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {POLICIES.map((p) => (
              <div
                key={p.title}
                className="flex flex-col items-center text-center gap-3.5 group cursor-default"
              >
                <div className="poli-icon w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-2 rounded-2xl bg-white border border-[#E5E2DF]/70 shadow-xs group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={p.icon}
                    alt={p.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="policy-content flex flex-col items-center gap-1 max-w-[220px]">
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

      {/* ================= SECTION 4: mew_cate (DÒNG SẢN PHẨM - SWIPER SLIDER) ================= */}
      <section className="mew_cate module-component w-full py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="cate_title text-center sm:text-left space-y-1.5">
              <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#B23A2A]">
                Dòng sản phẩm
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#2A2725]">
                Mời bạn <b className="font-bold">sống lành</b> cùng Hebekery
              </h2>
            </div>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCate('left')}
                aria-label="Xem dòng sản phẩm trước"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:border-[#006561] hover:text-[#006561] transition-all shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCate('right')}
                aria-label="Xem dòng sản phẩm kế tiếp"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:border-[#006561] hover:text-[#006561] transition-all shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Smooth Scroll Container */}
          <div
            ref={cateScrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PRODUCT_LINES.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="cate-card shrink-0 w-[240px] sm:w-[270px] md:w-[290px] snap-start group flex flex-col bg-white rounded-xl border border-[#E5E2DF]/80 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FEFBF4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="cate-body p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#2A2725] group-hover:text-[#006561] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#6B6661] mt-1.5 line-clamp-2 leading-relaxed font-text">
                      {item.desc}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006561] group-hover:underline">
                    <span>Khám phá dòng sản phẩm</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: mew_bestseller (MUA NHIỀU NHẤT - PRODUCT SLIDER) ================= */}
      <section className="mew_bestseller module-component w-full py-12 sm:py-16 bg-[#F6F2EC]/40 border-y border-[#E5E2DF]/60">
        <div className="max-w-[1240px] mx-auto px-4 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="cate_title text-center sm:text-left space-y-1">
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

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollBestSeller('left')}
                aria-label="Sản phẩm trước"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:border-[#006561] hover:text-[#006561] transition-all shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBestSeller('right')}
                aria-label="Sản phẩm tiếp theo"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:border-[#006561] hover:text-[#006561] transition-all shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Horizontal Swiper */}
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-[260px] sm:w-[280px] shrink-0 bg-white rounded-xl border border-[#E5E2DF] p-4 h-80 animate-pulse flex flex-col justify-between"
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
            <div
              ref={bestSellerScrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {bestSellerProducts.map((product) => {
                const originalPrice = Math.round((product.price * 1.18) / 1000) * 1000
                const isAdded = !!addedIds[product.id]

                return (
                  <div
                    key={product.id}
                    className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-white card-items overflow-hidden rounded-xl border border-[#E5E2DF]/80 hover:border-[#006561] transition-all cursor-pointer flex flex-col justify-between p-3.5 group shadow-xs hover:shadow-md"
                    onClick={() => {
                      navigate(`/products/${product.id}`)
                    }}
                  >
                    <div>
                      {/* Image & Badges */}
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
                        <div className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-xs text-[#006561] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E2DF]">
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

                    {/* Action Button */}
                    <div className="mt-4 pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={isAdded ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-full border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

                      <button
                        type="button"
                        title="Xem nhanh"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(product)
                        }}
                        className="w-9 h-9 rounded-full border border-[#E5E2DF] flex items-center justify-center text-[#6B6661] hover:border-[#006561] hover:text-[#006561] transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* ================= SECTION 6: mew_tool (CÔNG CỤ HEBEKERY: TDEE, BMI, BMR) ================= */}
      <section className="mew_tool module-component w-full py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 space-y-8 sm:space-y-10">
          <div className="tool_title text-center space-y-2 max-w-lg mx-auto">
            <span className="eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#B23A2A]">
              Công cụ Hebekery
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#2A2725]">
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
              className="tool-card bg-white rounded-2xl p-7 border border-[#E5E2DF]/80 hover:border-[#c9785c] hover:shadow-lg transition-all flex flex-col justify-between gap-6 group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="tool-head flex items-center justify-between">
                  <span className="dot w-3 h-3 rounded-full bg-[#c9785c]" />
                  <span className="unit font-mono text-xs text-[#6B6661]">kcal · ngày</span>
                </div>
                <div className="tool-acronym text-6xl sm:text-7xl font-serif font-bold text-[#2A2725] tracking-tight">
                  TDEE
                </div>
                <h3 className="tool-title text-base font-bold font-display text-[#2A2725] group-hover:text-[#c9785c] transition-colors">
                  Tổng năng lượng tiêu hao mỗi ngày
                </h3>
                <p className="tool-desc text-xs text-[#6B6661] leading-relaxed font-text">
                  Tính tổng calo cơ thể đốt trong 24h dựa trên mức độ vận động — biết nên ăn bao nhiêu để giữ, giảm hay tăng cân.
                </p>
              </div>
              <span className="tool-cta inline-flex items-center gap-1.5 text-xs font-bold text-[#2A2725] group-hover:text-[#c9785c] transition-colors pt-2 border-t border-[#E5E2DF]/60">
                <span>Tính ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* BMI Card */}
            <Link
              to="/bmi-tdee"
              className="tool-card bg-white rounded-2xl p-7 border border-[#E5E2DF]/80 hover:border-[#006561] hover:shadow-lg transition-all flex flex-col justify-between gap-6 group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="tool-head flex items-center justify-between">
                  <span className="dot w-3 h-3 rounded-full bg-[#006561]" />
                  <span className="unit font-mono text-xs text-[#6B6661]">kg ÷ m²</span>
                </div>
                <div className="tool-acronym text-6xl sm:text-7xl font-serif font-bold text-[#2A2725] tracking-tight">
                  BMI
                </div>
                <h3 className="tool-title text-base font-bold font-display text-[#2A2725] group-hover:text-[#006561] transition-colors">
                  Chỉ số khối cơ thể
                </h3>
                <p className="tool-desc text-xs text-[#6B6661] leading-relaxed font-text">
                  Đối chiếu cân nặng với chiều cao — tham khảo nhanh cơ thể bạn đang ở vùng nào: thiếu cân, cân đối hay thừa cân.
                </p>
              </div>
              <span className="tool-cta inline-flex items-center gap-1.5 text-xs font-bold text-[#2A2725] group-hover:text-[#006561] transition-colors pt-2 border-t border-[#E5E2DF]/60">
                <span>Tính ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* BMR Card */}
            <Link
              to="/bmi-tdee"
              className="tool-card bg-white rounded-2xl p-7 border border-[#E5E2DF]/80 hover:border-[#7B9461] hover:shadow-lg transition-all flex flex-col justify-between gap-6 group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="tool-head flex items-center justify-between">
                  <span className="dot w-3 h-3 rounded-full bg-[#7B9461]" />
                  <span className="unit font-mono text-xs text-[#6B6661]">kcal · nghỉ</span>
                </div>
                <div className="tool-acronym text-6xl sm:text-7xl font-serif font-bold text-[#2A2725] tracking-tight">
                  BMR
                </div>
                <h3 className="tool-title text-base font-bold font-display text-[#2A2725] group-hover:text-[#7B9461] transition-colors">
                  Tỷ lệ trao đổi chất cơ bản
                </h3>
                <p className="tool-desc text-xs text-[#6B6661] leading-relaxed font-text">
                  Lượng calo cơ thể đốt khi nghỉ ngơi hoàn toàn — nền tảng để hiểu mức năng lượng tối thiểu cơ thể cần nạp.
                </p>
              </div>
              <span className="tool-cta inline-flex items-center gap-1.5 text-xs font-bold text-[#2A2725] group-hover:text-[#7B9461] transition-colors pt-2 border-t border-[#E5E2DF]/60">
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
