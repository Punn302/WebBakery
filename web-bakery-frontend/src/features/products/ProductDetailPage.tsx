import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import {
  Star,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Copy,
  Flame,
  Wheat,
  Share2,
} from 'lucide-react'
import { productApi } from '@/api'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

// Sample vouchers matching HeBekery
const VOUCHERS = [
  { code: 'HB5', text: 'Giảm 5K · đơn 139K', minOrder: 139000 },
  { code: 'HB10', text: 'Giảm 10K · đơn 269K', minOrder: 269000 },
  { code: 'HB20', text: 'Giảm 20K · đơn 459K', minOrder: 459000 },
]

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem, setIsCartOpen } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState('250g')
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'storage'>('desc')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isCopied, setIsCopied] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)

  // Fetch product by ID
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id || '1'),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch related products
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', typeof product?.category === 'object' ? product?.category?.id : product?.category],
    queryFn: () =>
      productApi.getProducts({
        categoryId: typeof product?.category === 'object' ? product?.category?.id : undefined,
        size: 4,
        activeOnly: true,
      }),
    enabled: !!product?.category,
    staleTime: 5 * 60 * 1000,
  })

  const relatedProducts = relatedData?.content || []

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code)
    setIsCopied(code)
    toast.success(`Đã sao chép mã giảm giá: ${code}`)
    setTimeout(() => setIsCopied(null), 2000)
  }

  const handleAddToCart = async () => {
    if (!product) return
    await addItem(product, quantity)
    setIsAdded(true)
    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleBuyNow = async () => {
    if (!product) return
    await addItem(product, quantity)
    setIsCartOpen(true)
  }

  if (isLoading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#006561] border-t-transparent" />
        <p className="mt-4 text-xs font-medium text-[#6B6661] font-text">
          Đang tải thông tin sản phẩm từ bếp HeBekery...
        </p>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-[#2A2725]">
          Không tìm thấy thông tin sản phẩm
        </h2>
        <p className="text-xs text-[#6B6661]">
          Sản phẩm có thể đã hết mùa vụ hoặc đường dẫn không còn khả dụng.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#006561] text-[#FEFBF4] text-xs font-bold px-6 py-2.5 rounded-full"
        >
          <span>Khám phá thực đơn bánh khác</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const originalPrice = Math.round((product.price * 1.18) / 1000) * 1000
  const displayCalories = product.calories && product.calories > 0 ? product.calories : 112
  const displayProtein = product.protein && product.protein > 0 ? product.protein : 4.5
  const displayCarbs = product.carbs && product.carbs > 0 ? product.carbs : 14.5
  const displayFat = product.fat && product.fat > 0 ? product.fat : 3.8

  // Multiple product view gallery images
  const galleryImages = [
    product.imageUrl,
    'https://bizweb.dktcdn.net/100/415/009/products/cookies-combo-3.png?v=1789209251350',
    'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img2.png?1790765513162',
  ]

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 sm:space-y-16">
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-[#6B6661] font-text flex-wrap">
        <Link to="/" className="hover:text-[#006561] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9A938C]" />
        <Link to="/products" className="hover:text-[#006561] transition-colors">
          Sản phẩm Healthy
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9A938C]" />
        <span className="text-[#006561] font-semibold truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* 2. MAIN PRODUCT SECTION (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-[#E5E2DF] overflow-hidden shadow-xs">
            <img
              src={optimizeCloudinaryUrl(galleryImages[selectedImageIndex], 800)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* Sale Label */}
            <div className="absolute top-4 left-4 bg-[#FFE6DC] text-[#B23A2A] font-bold text-xs px-3 py-1 rounded-full shadow-xs">
              -15% GIẢM GIÁ
            </div>
            {/* Low GI Badge */}
            <div className="absolute top-4 right-4 bg-[#006561]/10 text-[#006561] font-bold text-[11px] px-3 py-1 rounded-full border border-[#006561]/20">
              Low GI • Chuẩn Eat Clean
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white border transition-all cursor-pointer shrink-0 ${
                  selectedImageIndex === idx
                    ? 'border-[#006561] ring-2 ring-[#006561]/20'
                    : 'border-[#E5E2DF] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={optimizeCloudinaryUrl(img, 150)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand Tag & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9785C]">
                {typeof product.category === 'object' ? product.category?.name : (product.category || 'Bánh dinh dưỡng HeBekery')}
              </span>
              <span className="text-[#9A938C]">•</span>
              <span className="text-[11px] font-mono text-[#7B9461] bg-[#7B9461]/10 px-2 py-0.5 rounded-full font-semibold">
                Còn hàng tại bếp
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2A2725] leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#6B6661]">
              <div className="flex items-center text-[#c8983d]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#2A2725]">5.0</span>
              <span className="text-[#9A938C]">•</span>
              <span>128 đánh giá khách hàng</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF] flex items-baseline gap-3">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#006561]">
              {formatCurrency(product.price)}
            </span>
            <del className="text-sm font-mono text-[#9A938C]">
              {formatCurrency(originalPrice)}
            </del>
            <span className="text-xs font-bold text-[#B23A2A] bg-[#FFE6DC] px-2.5 py-0.5 rounded-full">
              Tiết kiệm 15%
            </span>
          </div>

          {/* Voucher Coupons Pill Row */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2A2725] uppercase tracking-wide">
              Mã giảm giá HeBekery:
            </span>
            <div className="flex flex-wrap gap-2">
              {VOUCHERS.map((v) => (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => handleCopyVoucher(v.code)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E2DF] bg-white hover:border-[#006561] text-xs font-mono text-[#2A2725] transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="font-bold text-[#006561]">{v.code}</span>
                  <span className="text-[11px] text-[#6B6661]">{v.text}</span>
                  <Copy className="w-3 h-3 text-[#9A938C] group-hover:text-[#006561]" />
                </button>
              ))}
            </div>
          </div>

          {/* Variants: Quy cách đóng gói */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-[#2A2725] uppercase tracking-wide">
              Quy cách đóng gói:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: '250g', label: 'Hũ 250g', sub: 'Tiêu chuẩn' },
                { id: '500g', label: 'Hũ 500g', sub: 'Tiết kiệm 10%' },
                { id: 'combo', label: 'Combo 2 Hũ', sub: 'Freeship' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedVariant(opt.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                    selectedVariant === opt.id
                      ? 'border-[#006561] bg-[#006561]/8 text-[#006561] font-bold shadow-xs'
                      : 'border-[#E5E2DF] bg-white text-[#2A2725] hover:border-[#9A938C]'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] text-[#6B6661]">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Dual Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#2A2725] uppercase tracking-wide">
                Số lượng:
              </span>
              <div className="inline-flex items-center border border-[#E5E2DF] bg-white rounded-full p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#2A2725] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-xs text-[#2A2725]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#2A2725] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-act w-full py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#006561]" />
                    <span>Đã thêm vào giỏ</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm vào giỏ hàng</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] w-full py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Mua ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Macro Nutrition Specs Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E2DF] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#2A2725]">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#C9785C]" />
                <span>Giá trị dinh dưỡng chuẩn trên 1 khẩu phần (40g)</span>
              </span>
              <span className="text-[11px] font-mono text-[#006561]">100% tự nhiên</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
              <div className="p-2 rounded-xl bg-[#FEFBF4] border border-[#E5E2DF]">
                <span className="block font-bold text-sm text-[#006561]">{displayCalories}</span>
                <span className="text-[10px] text-[#6B6661] uppercase font-text">Calo</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FEFBF4] border border-[#E5E2DF]">
                <span className="block font-bold text-sm text-[#2A2725]">{displayProtein}g</span>
                <span className="text-[10px] text-[#6B6661] uppercase font-text">Đạm</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FEFBF4] border border-[#E5E2DF]">
                <span className="block font-bold text-sm text-[#2A2725]">{displayCarbs}g</span>
                <span className="text-[10px] text-[#6B6661] uppercase font-text">Carb</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FEFBF4] border border-[#E5E2DF]">
                <span className="block font-bold text-sm text-[#2A2725]">{displayFat}g</span>
                <span className="text-[10px] text-[#6B6661] uppercase font-text">Chất béo</span>
              </div>
            </div>
          </div>

          {/* 3 Brand Commitments */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 text-[11px] text-[#6B6661] font-text">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E5E2DF]">
              <ShieldCheck className="w-4 h-4 text-[#006561] shrink-0" />
              <span>0g Đường tinh luyện</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E5E2DF]">
              <RotateCcw className="w-4 h-4 text-[#006561] shrink-0" />
              <span>Đổi trả 1-1 7 ngày</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E5E2DF]">
              <Truck className="w-4 h-4 text-[#006561] shrink-0" />
              <span>Giao 2H HCM &amp; HN</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACCORDION / TABS SECTION */}
      <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-10 shadow-xs space-y-6">
        {/* Tab Headers */}
        <div className="flex items-center gap-4 sm:gap-8 border-b border-[#E5E2DF] overflow-x-auto pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`font-display text-sm sm:text-base font-bold pb-2 transition-colors cursor-pointer border-b-2 -mb-[13px] ${
              activeTab === 'desc'
                ? 'border-[#006561] text-[#006561]'
                : 'border-transparent text-[#6B6661] hover:text-[#2A2725]'
            }`}
          >
            Mô tả chi tiết &amp; Câu chuyện
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`font-display text-sm sm:text-base font-bold pb-2 transition-colors cursor-pointer border-b-2 -mb-[13px] ${
              activeTab === 'nutrition'
                ? 'border-[#006561] text-[#006561]'
                : 'border-transparent text-[#6B6661] hover:text-[#2A2725]'
            }`}
          >
            Bảng thành phần dinh dưỡng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`font-display text-sm sm:text-base font-bold pb-2 transition-colors cursor-pointer border-b-2 -mb-[13px] ${
              activeTab === 'storage'
                ? 'border-[#006561] text-[#006561]'
                : 'border-transparent text-[#6B6661] hover:text-[#2A2725]'
            }`}
          >
            Hướng dẫn bảo quản &amp; Dùng
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-2 text-xs sm:text-sm text-[#2A2725] leading-relaxed font-text">
          {activeTab === 'desc' && (
            <div className="space-y-4 max-w-3xl">
              <p>
                {product.description ||
                  'Sản phẩm bánh nướng thủ công nguyên cám dinh dưỡng HeBekery được chọn lọc kỹ lưỡng từ 100% nguyên liệu tự nhiên cao cấp. Hoàn toàn không sử dụng đường cát trắng tinh luyện, vị ngọt thanh bùi tự nhiên từ mật ong hoa nhãn và các loại hạt dinh dưỡng.'}
              </p>
              <div className="p-4 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF] space-y-2">
                <h4 className="font-display font-bold text-sm text-[#006561]">
                  Ưu điểm vượt trội:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#6B6661]">
                  <li>Không phụ gia công nghiệp, không chất bảo quản.</li>
                  <li>Giàu chất xơ hòa tan beta-glucan giúp no lâu suốt 4-5 tiếng.</li>
                  <li>Phù hợp hoàn hảo cho chế độ ăn kiêng Eat Clean, Keto, tập gym &amp; yoga.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4 max-w-3xl">
              <h4 className="font-display font-bold text-sm text-[#2A2725]">
                Bảng thông số chi tiết (trên 100g):
              </h4>
              <div className="border border-[#E5E2DF] rounded-2xl overflow-hidden font-mono text-xs">
                <div className="grid grid-cols-2 p-3 bg-[#FEFBF4] border-b border-[#E5E2DF] font-bold">
                  <span>Chỉ tiêu dinh dưỡng</span>
                  <span>Hàm lượng</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#E5E2DF]">
                  <span>Năng lượng (Calories)</span>
                  <span className="font-bold text-[#006561]">{displayCalories * 2.5} kcal</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#E5E2DF]">
                  <span>Chất đạm (Protein)</span>
                  <span>{displayProtein * 2.5} g</span>
                </div>
                <div className="grid grid-cols-2 p-3 border-b border-[#E5E2DF]">
                  <span>Chất bột đường (Carbohydrates)</span>
                  <span>{displayCarbs * 2.5} g</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span>Chất béo tốt không bão hòa</span>
                  <span>{displayFat * 2.5} g</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4 max-w-3xl">
              <h4 className="font-display font-bold text-sm text-[#2A2725]">
                Bảo quản tốt nhất để giữ trọn độ giòn:
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6B6661]">
                <li>Hạn sử dụng: 6 tháng kể từ ngày sản xuất in trên nắp hộp.</li>
                <li>Đậy kín nắp sau mỗi lần sử dụng để tránh bánh bị ỉu do độ ẩm không khí.</li>
                <li>Nên bảo quản trong ngăn mát tủ lạnh để bánh luôn thơm bùi và giòn rụm.</li>
                <li>Dùng trực tiếp như bữa phụ tiện lợi hoặc kết hợp cùng sữa chua, trái cây tươi.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. RELATED PRODUCTS ("SẢN PHẨM CÙNG DANH MỤC") */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
              Sản phẩm tương tự bạn có thể thích
            </h3>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-[#006561] hover:underline"
            >
              Xem tất cả &gt;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
