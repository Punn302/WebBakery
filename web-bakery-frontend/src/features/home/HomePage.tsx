import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Truck, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/api'
import { ProductCard } from '@/features/products/ProductCard'
import { ProductDetailModal } from '@/features/products/ProductDetailModal'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { useTranslation } from 'react-i18next'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: productData } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => productApi.getProducts({ page: 0, size: 8, activeOnly: true }),
    staleTime: 5 * 60 * 1000,
  })

  const featuredProducts = productData?.content || []

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative border border-[#e7e5e4] bg-[#f4efe6] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#47654c]/10 text-[#47654c] text-xs font-bold tracking-wide uppercase select-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1c1917] leading-tight"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm sm:text-base text-[#57534e] max-w-xl leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <Button
                size="lg"
                variant="default"
                className="flex items-center gap-2"
                onClick={() => navigate('/products')}
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/about')}
              >
                {t('hero.ctaSecondary')}
              </Button>
            </motion.div>

            {/* Micro Badges / Value points */}
            <div className="pt-4 border-t border-[#e7e5e4] flex flex-wrap items-center gap-6 text-xs text-[#57534e]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#47654c]" />
                <span className="font-semibold">100% Bột nguyên cám</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#47654c]" />
                <span className="font-semibold">0g Đường tinh luyện</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#47654c]" />
                <span className="font-semibold">Nướng mới mỗi sáng</span>
              </div>
            </div>
          </div>

          {/* Right Hero Banner Image */}
          <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[380px] p-6 sm:p-8 lg:p-10 flex items-center justify-center">
            <div className="relative w-full h-full max-h-[360px] overflow-hidden border-2 border-[#47654c]/20 shadow-xl group">
              <img
                src="https://res.cloudinary.com/dw41xzins/image/upload/v1793895327/hebekery_hero_banner.jpg"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/images/hero-banner.jpg') {
                    target.src = '/images/hero-banner.jpg';
                  }
                }}
                alt="Tiệm bánh Hebekery Healthy Artisan Bread"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                  Thủ Công Tinh Tuyển
                </span>
                <span className="text-base sm:text-lg font-extrabold uppercase">
                  Bánh Mì & Ngũ Cốc Eat Clean
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-6 text-[#47654c]/5 font-black text-8xl md:text-9xl select-none pointer-events-none uppercase">
          HEBEKERY
        </div>
      </section>

      {/* Value Propositions: 4 Cards with Embedded Images */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: ShieldCheck,
            title: '100% Nguyên Liệu Sạch',
            desc: 'Nguyên cám hữu cơ, hạt dinh dưỡng chọn lọc chuẩn VietGAP.',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895346/hebekery_feature_clean_ingredients.jpg',
            fallback: '/images/feature-clean-ingredients.jpg',
          },
          {
            icon: HeartHandshake,
            title: 'Không Đường Tinh Luyện',
            desc: 'Vị ngọt thanh dịu nhẹ tự nhiên từ mật hoa và quả khô.',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895347/hebekery_feature_no_sugar.jpg',
            fallback: '/images/feature-no-sugar.jpg',
          },
          {
            icon: Truck,
            title: 'Giao Bánh Tươi Trong Ngày',
            desc: 'Nướng mẻ mới mỗi sớm, đóng gói kín giữ trọn giòn tan.',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895348/hebekery_feature_fresh_daily.jpg',
            fallback: '/images/feature-fresh-daily.jpg',
          },
          {
            icon: Activity,
            title: 'Kiểm Soát Calo Từng Bánh',
            desc: 'Minh bạch lượng đạm, chất béo và calo trên từng khẩu phần.',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895349/hebekery_feature_calorie_control.jpg',
            fallback: '/images/feature-calorie-control.jpg',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group border border-[#e7e5e4] bg-white overflow-hidden hover:border-[#47654c] hover:shadow-md transition-all flex flex-col"
            >
              {/* Card Image */}
              <div className="relative h-40 w-full overflow-hidden bg-[#f4efe6]">
                <img
                  src={item.image}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== item.fallback) {
                      target.src = item.fallback;
                    }
                  }}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 w-8 h-8 bg-white/95 backdrop-blur-sm text-[#47654c] flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Card Text Content */}
              <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1c1917] group-hover:text-[#47654c] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#78716c] leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#e7e5e4] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
              Sản Phẩm Bán Chạy Nhất
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              Được yêu thích nhất bởi cộng đồng eat clean và chăm sóc vóc dáng
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#47654c] hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Tool Banner: BMI & TDEE */}
      <section className="border border-[#47654c]/30 bg-[#47654c] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Chưa Rõ Chế Độ Ăn Phù Hợp Với Mục Tiêu Của Bạn?
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Sử dụng công cụ tính chỉ số TDEE & Macro hoàn toàn miễn phí của Hebekery để biết chính xác lượng Calo cần nạp mỗi ngày giúp giảm mỡ, giữ dáng hiệu quả.
          </p>
        </div>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate('/bmi-tdee')}
          className="shrink-0"
        >
          Tính TDEE & Macro Ngay
        </Button>
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
