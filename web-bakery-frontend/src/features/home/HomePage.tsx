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
      <section className="relative border border-[#e7e5e4] overflow-hidden min-h-[440px] sm:min-h-[480px] md:min-h-[520px] flex items-center shadow-sm">
        {/* Full-width Banner Background Image */}
        <img
          src="https://res.cloudinary.com/dw41xzins/image/upload/v1793895327/hebekery_hero_banner.jpg"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== '/images/hero-banner.jpg') {
              target.src = '/images/hero-banner.jpg';
            }
          }}
          alt="Tiệm bánh Hebekery Healthy Artisan Bread"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />

        {/* Text Layer On Top */}
        <div className="relative z-10 max-w-2xl p-8 sm:p-12 md:p-16 space-y-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md text-amber-300 border border-white/20 text-xs font-bold tracking-wide uppercase select-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md"
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-sm sm:text-base text-stone-200 max-w-xl leading-relaxed"
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
              className="flex items-center gap-2 bg-[#47654c] hover:bg-[#38523c] text-white border-none shadow-lg cursor-pointer font-bold"
              onClick={() => navigate('/products')}
            >
              <span>{t('hero.cta')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/about')}
              className="bg-white/90 hover:bg-white text-[#1c1917] border-none shadow-md cursor-pointer font-bold"
            >
              {t('hero.ctaSecondary')}
            </Button>
          </motion.div>

          {/* Micro Trust Badges */}
          <div className="pt-4 border-t border-white/20 flex flex-wrap items-center gap-6 text-xs text-stone-200 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>100% Bột nguyên cám</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>0g Đường tinh luyện</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Nướng tươi mỗi sáng</span>
            </div>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-6 text-white/5 font-black text-8xl md:text-9xl select-none pointer-events-none uppercase">
          HEBEKERY
        </div>
      </section>

      {/* Value Propositions: 4 Full-Bleed Cards with Overlay Text */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: ShieldCheck,
            title: '100% Nguyên Liệu Sạch',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895346/hebekery_feature_clean_ingredients.jpg',
            fallback: '/images/feature-clean-ingredients.jpg',
          },
          {
            icon: HeartHandshake,
            title: 'Không Đường Tinh Luyện',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895347/hebekery_feature_no_sugar.jpg',
            fallback: '/images/feature-no-sugar.jpg',
          },
          {
            icon: Truck,
            title: 'Giao Bánh Tươi Trong Ngày',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895348/hebekery_feature_fresh_daily.jpg',
            fallback: '/images/feature-fresh-daily.jpg',
          },
          {
            icon: Activity,
            title: 'Kiểm Soát Calo Từng Bánh',
            image: 'https://res.cloudinary.com/dw41xzins/image/upload/v1793895349/hebekery_feature_calorie_control.jpg',
            fallback: '/images/feature-calorie-control.jpg',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group relative h-48 sm:h-56 overflow-hidden border border-[#e7e5e4] shadow-sm hover:shadow-xl hover:border-[#47654c] transition-all cursor-default"
            >
              {/* Full Card Background Image */}
              <img
                src={item.image}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== item.fallback) {
                    target.src = item.fallback;
                  }
                }}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors" />

              {/* Floating Icon badge on top-left */}
              <div className="absolute top-3.5 left-3.5 w-8 h-8 bg-white/90 backdrop-blur-md text-[#47654c] flex items-center justify-center shadow">
                <Icon className="w-4 h-4" />
              </div>

              {/* Text Layer on top (bottom aligned) - Title Only */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                <h3 className="font-extrabold text-base text-white tracking-wide uppercase drop-shadow group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
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
