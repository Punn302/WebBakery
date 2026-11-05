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
      <section className="relative border border-[#e7e5e4] bg-[#f4efe6] p-8 sm:p-12 md:p-16 overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
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
            className="text-sm sm:text-base text-[#57534e] max-w-2xl leading-relaxed"
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
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-6 text-[#47654c]/5 font-black text-8xl md:text-9xl select-none pointer-events-none uppercase">
          HEBEKERY
        </div>
      </section>

      {/* Value Propositions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: ShieldCheck,
            title: '100% Nguyên Liệu Sạch',
            desc: 'Nguyên cám hữu cơ, hạt dinh dưỡng chọn lọc chuẩn VietGAP.',
          },
          {
            icon: HeartHandshake,
            title: 'Không Đường Tinh Luyện',
            desc: 'Vị ngọt thanh dịu nhẹ tự nhiên từ mật hoa và quả khô.',
          },
          {
            icon: Truck,
            title: 'Giao Bánh Tươi Trong Ngày',
            desc: 'Nướng mẻ mới mỗi sớm, đóng gói kín giữ trọn giòn tan.',
          },
          {
            icon: Activity,
            title: 'Kiểm Soát Calo Từng Bánh',
            desc: 'Minh bạch lượng đạm, chất béo và calo trên từng khẩu phần.',
          },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="p-5 border border-[#e7e5e4] bg-white space-y-2 hover:border-[#47654c] transition-colors"
            >
              <div className="w-8 h-8 bg-[#f4efe6] text-[#47654c] flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#1c1917]">{item.title}</h3>
              <p className="text-xs text-[#78716c] leading-relaxed">{item.desc}</p>
            </div>
          )
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
