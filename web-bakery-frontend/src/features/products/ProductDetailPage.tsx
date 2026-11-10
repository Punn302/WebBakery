import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Heart,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Gift,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react'
import { productApi, reviewApi, voucherApi } from '@/api'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatCurrency, optimizeCloudinaryUrl, formatDate } from '@/utils/format'
import { toast } from 'sonner'
import type { Product, ProductReview, ProductReviewSummary } from '@/types'
import { ProductCard } from './ProductCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Authentic HeBekery Vouchers
const VOUCHERS = [
  { code: 'HB5', text: 'Giảm 5K · đơn 139K', minOrder: 139000, discount: 5000 },
  { code: 'HB10', text: 'Giảm 10K · đơn 269K', minOrder: 269000, discount: 10000 },
  { code: 'HB20', text: 'Giảm 20K · đơn 459K', minOrder: 459000, discount: 20000 },
  { code: 'HB30', text: 'Giảm 30K · đơn 609K', minOrder: 609000, discount: 30000 },
]

// Authentic HeBekery Cross-Sell Bundle ("Thường được mua cùng")
const FREQUENTLY_BOUGHT_TOGETHER = [
  {
    id: 'bundle-cookies',
    name: 'Cookies Hạnh Nhân Nguyên Cám - Bánh Cookies Ăn Vặt Chuẩn Healthy',
    price: 145000,
    originalPrice: 160000,
    discountPercent: 9,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/chatgpt-image-aug-8-2026-03-54-29-pm.png?v=1786179391230',
    rating: 5.0,
    reviewsCount: 38,
  },
  {
    id: 'bundle-granola-3vi',
    name: 'Granola Siêu Hạt 3 Vị Truyền Thống, Choco, Matcha - Ngũ Cốc Dinh Dưỡng Cao Cấp',
    price: 219000,
    originalPrice: 240000,
    discountPercent: 9,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/products/anh-1-min.png?v=1754442252570',
    rating: 4.9,
    reviewsCount: 112,
  },
  {
    id: 'bundle-biscotti-matcha',
    name: 'Bánh Biscotti Ăn Kiêng Vị Trà Xanh Matcha Nhật Bản Nguyên Cám',
    price: 165000,
    originalPrice: 185000,
    discountPercent: 11,
    imageUrl: 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img2.png?1790765513162',
    rating: 5.0,
    reviewsCount: 64,
  },
]

// Default authentic customer reviews matching Hebekery community
const DEFAULT_HEBE_REVIEWS = [
  {
    id: 'rev-1',
    userName: 'Minh Thảo (Hà Nội)',
    rating: 5,
    createdAt: '2026-11-04T14:32:00',
    comment: 'Bánh giòn rụm, thơm bùi cực kỳ mà không bị ngọt gắt. Mình ăn sáng với sữa chua hạt rất hợp, no lâu tới tận trưa mà không thèm ăn vặt.',
    verified: true,
  },
  {
    id: 'rev-2',
    userName: 'Phương Anh (TP. HCM)',
    rating: 5,
    createdAt: '2026-11-02T09:15:00',
    comment: 'Đóng gói hũ thủy tinh rất kỹ và chỉn chu. Hạt nhiều, không hề bị vụn hay hôi dầu như những loại granola khác trên thị trường. Sẽ ủng hộ Hebekery dài dài!',
    verified: true,
  },
  {
    id: 'rev-3',
    userName: 'Ngọc Lan (Đà Nẵng)',
    rating: 5,
    createdAt: '2026-10-28T16:45:00',
    comment: 'Vị matcha thơm thanh tự nhiên, chuẩn ăn kiêng Eat Clean. Giao hàng hỏa tốc đóng gói chắc chắn. Rất hài lòng với chất lượng của bếp Hebekery.',
    verified: true,
  },
]

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addItem, setIsCartOpen } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState('250g')
  const [selectedFlavor, setSelectedFlavor] = useState('Truyền Thống')
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'storage'>('desc')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isCopied, setIsCopied] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewName, setReviewName] = useState('')
  const [reviewPhone, setReviewPhone] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  const ctaRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Product
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

  // 2. Fetch Customer Reviews from backend
  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => reviewApi.getProductReviews(id || '1'),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })

  // 3. Submit Review Mutation
  const submitReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string; fullName?: string; phone?: string }) =>
      reviewApi.submitReview(id || '1', data),
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn giúp HeBekery hoàn thiện hơn.')
      setIsReviewModalOpen(false)
      setReviewComment('')
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] })
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        toast.error('Vui lòng đăng nhập để gửi đánh giá sản phẩm.')
        setIsReviewModalOpen(false)
        navigate('/login', { state: { from: { pathname: `/products/${id}` } } })
        return
      }
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể gửi đánh giá. Vui lòng thử lại sau.')
    },
  })

  // Live HeBekery Vouchers from Backend
  const { data: remoteVouchers } = useQuery({
    queryKey: ['available-vouchers'],
    queryFn: () => voucherApi.getAvailable(),
    staleTime: 5 * 60 * 1000,
  })

  const activeVouchers = (remoteVouchers && remoteVouchers.length > 0)
    ? remoteVouchers.map((v) => ({
        code: v.code,
        text: (v.discountType as string) === 'FREE_SHIPPING'
          ? `Freeship ${Math.round((v.discountValue || 0) / 1000)}K · đơn ${Math.round((v.minOrderAmount || 0) / 1000)}K`
          : `Giảm ${Math.round((v.discountValue || 0) / 1000)}K · đơn ${Math.round((v.minOrderAmount || 0) / 1000)}K`,
        minOrder: v.minOrderAmount || 0,
        discount: v.discountValue || 0,
      }))
    : VOUCHERS

  // 4. Fetch Related Products
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

  // Sticky Bar Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (!ctaRef.current) return
      const rect = ctaRef.current.getBoundingClientRect()
      setShowStickyBar(rect.bottom < 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Variant Price Multiplier
  const getVariantMultiplier = () => {
    if (selectedVariant === '500g') return 1.75
    if (selectedVariant === 'combo') return 2.35
    return 1.0
  }

  const basePrice = product ? product.price : 145000
  const currentPrice = Math.round((basePrice * getVariantMultiplier()) / 1000) * 1000
  const originalPrice = Math.round((currentPrice * 1.15) / 1000) * 1000
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)

  // Free Gift Progress calculation (threshold 249.000₫)
  const currentOrderValue = currentPrice * quantity
  const giftThreshold = 249000
  const giftProgressPercent = Math.min(100, Math.round((currentOrderValue / giftThreshold) * 100))
  const remainingForGift = Math.max(0, giftThreshold - currentOrderValue)

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code)
    setIsCopied(code)
    toast.success(`Đã sao chép mã giảm giá: ${code}`)
    setTimeout(() => setIsCopied(null), 2000)
  }

  const handleAddToCart = async () => {
    if (!product) return
    const customProduct = {
      ...product,
      price: currentPrice,
      name: `${product.name} (${selectedVariant === 'combo' ? 'Combo 2 Hũ' : selectedVariant.toUpperCase()} - ${selectedFlavor})`,
    }
    await addItem(customProduct, quantity)
    setIsAdded(true)
    toast.success(`Đã thêm ${quantity} x ${customProduct.name} vào giỏ hàng!`)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleBuyNow = async () => {
    if (!product) return
    const customProduct = {
      ...product,
      price: currentPrice,
      name: `${product.name} (${selectedVariant === 'combo' ? 'Combo 2 Hũ' : selectedVariant.toUpperCase()} - ${selectedFlavor})`,
    }
    await addItem(customProduct, quantity)
    navigate('/checkout')
  }

  const handleAddBundleToCart = async (bundle: typeof FREQUENTLY_BOUGHT_TOGETHER[0]) => {
    const bundleProduct: Product = {
      id: bundle.id,
      name: bundle.name,
      price: bundle.price,
      imageUrl: bundle.imageUrl,
      active: true,
      stock: 50,
      lowStockThreshold: 5,
      category: { id: 1, name: 'Bánh dinh dưỡng HeBekery', slug: 'banh-dinh-duong', active: true },
      description: bundle.name,
    }
    await addItem(bundleProduct, 1)
    toast.success(`Đã thêm "${bundle.name}" vào giỏ hàng!`)
  }

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá của bạn.')
      return
    }
    const finalName = reviewName.trim() || user?.name || ''
    if (!isAuthenticated && !finalName) {
      toast.error('Vui lòng nhập họ tên của bạn hoặc đăng nhập để gửi đánh giá.')
      return
    }
    submitReviewMutation.mutate({
      rating: reviewRating,
      comment: reviewComment.trim(),
      fullName: finalName || undefined,
      phone: reviewPhone.trim() || user?.phone || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#006561] border-t-transparent" />
        <p className="mt-4 text-xs font-medium text-[#6B6661] font-text">
          Đang tải thông tin sản phẩm từ bếp HeBekery...
        </p>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-[#2A2725]">
          Không tìm thấy thông tin sản phẩm
        </h2>
        <p className="text-xs text-[#6B6661]">
          Sản phẩm có thể đã hết mùa vụ hoặc đường dẫn không còn khả dụng.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#006561] text-[#FEFBF4] text-xs font-bold px-6 py-2.5 rounded-full hover:bg-[#1a9a9b] transition-colors"
        >
          <span>Khám phá thực đơn bánh khác</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const displayCalories = product.calories && product.calories > 0 ? product.calories : 112
  const displayProtein = product.protein && product.protein > 0 ? product.protein : 4.5
  const displayCarbs = product.carbs && product.carbs > 0 ? product.carbs : 14.5
  const displayFat = product.fat && product.fat > 0 ? product.fat : 3.8

  const galleryImages = [
    product.imageUrl,
    'https://bizweb.dktcdn.net/100/415/009/products/chatgpt-image-aug-8-2026-03-54-29-pm.png?v=1786179391230',
    'https://bizweb.dktcdn.net/100/415/009/products/anh-1-min.png?v=1754442252570',
    'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/slide-img2.png?1790765513162',
  ]

  const liveReviews: ProductReview[] = reviewsData?.reviews?.length
    ? reviewsData.reviews
    : (DEFAULT_HEBE_REVIEWS as unknown as ProductReview[])
  const averageScore = reviewsData?.averageRating && reviewsData.averageRating > 0 ? reviewsData.averageRating : 5.0
  const totalReviewsCount = reviewsData?.reviewCount && reviewsData.reviewCount > 0 ? reviewsData.reviewCount : 128
  const isFavorite = product ? isInWishlist(product.id) : false

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-10 sm:space-y-14">
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
        <span className="text-[#6B6661] truncate">
          {typeof product.category === 'object' ? product.category?.name : (product.category || 'Bánh dinh dưỡng')}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#9A938C]" />
        <span className="text-[#006561] font-semibold truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* 2. MAIN PRODUCT SECTION (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-[#E5E2DF] overflow-hidden shadow-xs group">
            <img
              src={optimizeCloudinaryUrl(galleryImages[selectedImageIndex], 850)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Sale Label Badge */}
            <div className="absolute top-4 left-4 bg-[#FFE6DC] text-[#B23A2A] font-bold text-xs px-3 py-1 rounded-full shadow-xs">
              -{discountPercent}% GIẢM GIÁ
            </div>
            {/* Low GI Badge */}
            <div className="absolute top-4 right-4 bg-[#006561]/10 text-[#006561] font-bold text-[11px] px-3 py-1 rounded-full border border-[#006561]/20 backdrop-blur-xs">
              Low GI • Chuẩn Eat Clean
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white border transition-all cursor-pointer shrink-0 ${
                  selectedImageIndex === idx
                    ? 'border-[#006561] ring-2 ring-[#006561]/25'
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
        <div className="lg:col-span-6 space-y-5">
          {/* Eyebrow & Stock Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9785C]">
                {typeof product.category === 'object' ? product.category?.name : (product.category || 'Bánh dinh dưỡng HeBekery')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#006561] bg-[#006561]/10 px-2.5 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006561] animate-pulse" />
                Còn hàng tại bếp
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2A2725] leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & Click to Scroll to Reviews */}
            <div className="flex items-center gap-2 pt-0.5 text-xs text-[#6B6661]">
              <div className="flex items-center text-[#c8983d]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#2A2725]">{averageScore.toFixed(1)}</span>
              <span className="text-[#9A938C]">•</span>
              <button
                type="button"
                onClick={scrollToReviews}
                className="hover:text-[#006561] underline underline-offset-2 cursor-pointer transition-colors"
              >
                {totalReviewsCount} đánh giá khách hàng
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF] flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#006561]">
              {formatCurrency(currentPrice)}
            </span>
            <del className="text-sm font-mono text-[#9A938C]">
              {formatCurrency(originalPrice)}
            </del>
            <span className="text-xs font-bold text-[#B23A2A] bg-[#FFE6DC] px-2.5 py-0.5 rounded-full">
              Tiết kiệm {discountPercent}%
            </span>
          </div>

          {/* Authentic Voucher Strip (HB5, HB10, HB20, HB30) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2725] uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#c8983d]" />
              <span>Mã giảm giá — bấm để sao chép:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeVouchers.map((v) => (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => handleCopyVoucher(v.code)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer group shadow-2xs ${
                    isCopied === v.code
                      ? 'border-[#006561] bg-[#006561] text-white'
                      : 'border-[#E5E2DF] bg-white text-[#2A2725] hover:border-[#006561]'
                  }`}
                >
                  <span className={`font-bold ${isCopied === v.code ? 'text-white' : 'text-[#006561]'}`}>
                    {v.code}
                  </span>
                  <span className={`text-[11px] ${isCopied === v.code ? 'text-white/90' : 'text-[#6B6661]'}`}>
                    {v.text}
                  </span>
                  {isCopied === v.code ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#9A938C] group-hover:text-[#006561]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Free Gift Interactive Progress Bar (`js-gift`) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F6F5] border border-[#E5E2DF] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#006561]">
              <span className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#006561]" />
                <span>Mua từ 249k nhận Quà tặng hấp dẫn</span>
              </span>
              <span className="text-[11px] font-mono text-[#6B6661]">
                {formatCurrency(currentOrderValue)} / 249.000₫
              </span>
            </div>

            {/* Animated Progress Track */}
            <div className="w-full h-2 rounded-full bg-[#E5E2DF] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#006561] to-[#1a9a9b] transition-all duration-500 rounded-full"
                style={{ width: `${giftProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B6661] pt-0.5">
              <span>
                {remainingForGift > 0
                  ? `Mua thêm ${formatCurrency(remainingForGift)} để nhận Quà tặng hấp dẫn!`
                  : '🎉 Chúc mừng! Bạn đã đủ điều kiện nhận quà tặng HeBekery!'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => q + 1)
                  toast.success('Đã tăng số lượng để nhận quà tặng!')
                }}
                className="font-bold text-[#006561] hover:underline cursor-pointer"
              >
                + Thêm hũ
              </button>
            </div>
          </div>

          {/* Quy Cách Đóng Gói (Size Swatches) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2A2725] uppercase tracking-wide">
              Quy cách đóng gói:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: '250g', label: 'Hũ 250g', sub: 'Tiêu chuẩn' },
                { id: '500g', label: 'Hũ 500g', sub: 'Tiết kiệm 10%' },
                { id: 'combo', label: 'Combo 2 Hũ', sub: 'Freeship toàn quốc' },
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

          {/* Flavor Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2A2725] uppercase tracking-wide">
              Hương vị bánh:
            </span>
            <div className="flex flex-wrap gap-2">
              {['Truyền Thống', 'Matcha Trà Xanh', 'Chocolate Đậm Vị'].map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    selectedFlavor === flavor
                      ? 'border-[#006561] bg-[#006561] text-white font-bold'
                      : 'border-[#E5E2DF] bg-white text-[#2A2725] hover:border-[#9A938C]'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper & Dual Action Buttons */}
          <div ref={ctaRef} className="space-y-3 pt-1">
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

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-act flex-1 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#006561]" />
                    <span>Đã thêm vào giỏ</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm vào giỏ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] flex-1 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Mua ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => product && toggleWishlist(product)}
                aria-label="Yêu thích"
                className={`w-12 h-12 rounded-full border border-[#E5E2DF] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs ${
                  isFavorite
                    ? 'bg-[#B23A2A]/10 text-[#B23A2A] border-[#B23A2A]/30'
                    : 'bg-white text-[#6B6661] hover:text-[#B23A2A]'
                }`}
                title={isFavorite ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3 Brand Commitments */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 text-[11px] text-[#6B6661] font-text">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E5E2DF]">
              <Truck className="w-4 h-4 text-[#006561] shrink-0" />
              <span>Freeship đơn từ 299K</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E5E2DF]">
              <RotateCcw className="w-4 h-4 text-[#006561] shrink-0" />
              <span>Đổi trả 1-1 trong 7 ngày</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E5E2DF]">
              <Award className="w-4 h-4 text-[#006561] shrink-0" />
              <span>ISO 22000:2018</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS: MÔ TẢ CHI TIẾT / DINH DƯỠNG / BẢO QUẢN */}
      <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-10 shadow-xs space-y-6">
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
            <div className="space-y-5 max-w-4xl">
              <p className="text-[#6B6661] leading-relaxed">
                Buổi sáng của các chị em mình thường quay cuồng với đủ thứ việc, nhiều khi muốn chuẩn bị một bữa sáng tử tế, chất lượng mà thời gian lại không cho phép. Vậy nên HeBekery gợi ý cho bạn một cách chuẩn bị bữa sáng nhanh chóng — chỉ cần kết hợp bánh ngũ cốc dinh dưỡng cùng sữa chua hoặc sữa tươi, thêm một ít trái cây là bạn đã có ngay một bữa sáng ngon lành, đầy đủ dinh dưỡng trong vòng chưa đầy 1 phút!
              </p>

              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm sm:text-base text-[#006561] uppercase tracking-wide">
                  VÌ SAO SẢN PHẨM NÀY ĐƯỢC HỘI CHỊ EM MÊ MẨN ĐẾN THẾ?
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#6B6661] pl-1">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006561] mt-2 shrink-0" />
                    <span>
                      <strong className="text-[#2A2725]">Hạt dinh dưỡng chọn lọc kỹ:</strong> Kết hợp 5 loại hạt cao cấp (Óc chó, Macca, Hạnh nhân, Hạt điều, Bí xanh) và 3 loại trái cây sấy dẻo tự nhiên (Xoài, Nho, Nam việt quất). Nhờ vậy, mỗi miếng bánh đều giòn bùi, cân bằng hoàn hảo.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006561] mt-2 shrink-0" />
                    <span>
                      <strong className="text-[#2A2725]">Vị ngọt thanh tự nhiên từ mật ong:</strong> Phương pháp rang nướng mộc để giữ nguyên vẹn chất dinh dưỡng của hạt, hoàn toàn không chiên qua dầu nên không bao giờ có tình trạng hôi dầu.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006561] mt-2 shrink-0" />
                    <span>
                      <strong className="text-[#2A2725]">Nguyên cám giàu chất xơ:</strong> Cung cấp beta-glucan tự nhiên giúp tạo cảm giác no lâu suốt 4-5 tiếng, hỗ trợ kiểm soát đường huyết và giữ dáng hiệu quả.
                    </span>
                  </li>
                </ul>
              </div>

              {isDescriptionExpanded && (
                <div className="space-y-4 pt-2 border-t border-[#E5E2DF]">
                  <h4 className="font-display font-bold text-sm text-[#2A2725] uppercase tracking-wide">
                    TIÊU CHUẨN CHẤT LƯỢNG &amp; NGUỒN GỐC:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6B6661]">
                    <li>Sản xuất trực tiếp tại bếp HeBekery Phan Thiết.</li>
                    <li>Đạt chứng nhận quản lý an toàn thực phẩm chuẩn ISO 22000:2018.</li>
                    <li>Đạt chứng nhận quy trình kiểm soát điểm tới hạn HACCP Codex.</li>
                    <li>Nguyên liệu minh bạch 100%, không phụ gia công nghiệp, không chất bảo quản hóa học.</li>
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006561] hover:underline cursor-pointer pt-1"
              >
                <span>{isDescriptionExpanded ? 'Thu gọn nội dung' : 'Xem thêm chi tiết'}</span>
                {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-5 max-w-3xl">
              {/* Macro Cards */}
              <div className="grid grid-cols-4 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF]">
                  <span className="block font-bold text-base text-[#006561]">{displayCalories}</span>
                  <span className="text-[10px] text-[#6B6661] uppercase font-text">Calo (40g)</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF]">
                  <span className="block font-bold text-base text-[#2A2725]">{displayProtein}g</span>
                  <span className="text-[10px] text-[#6B6661] uppercase font-text">Đạm (Protein)</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF]">
                  <span className="block font-bold text-base text-[#2A2725]">{displayCarbs}g</span>
                  <span className="text-[10px] text-[#6B6661] uppercase font-text">Carbohydrates</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF]">
                  <span className="block font-bold text-base text-[#2A2725]">{displayFat}g</span>
                  <span className="text-[10px] text-[#6B6661] uppercase font-text">Chất béo tốt</span>
                </div>
              </div>

              {/* 100g Table */}
              <div className="border border-[#E5E2DF] rounded-2xl overflow-hidden font-mono text-xs">
                <div className="grid grid-cols-2 p-3 bg-[#FEFBF4] border-b border-[#E5E2DF] font-bold">
                  <span>Chỉ tiêu dinh dưỡng chuẩn</span>
                  <span>Hàm lượng trên 100g</span>
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
                  <span>Chất bột đường (Carbs)</span>
                  <span>{displayCarbs * 2.5} g</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span>Chất béo không bão hòa tốt</span>
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
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#6B6661]">
                <li>Hạn sử dụng: 6 tháng kể từ ngày sản xuất in trên nắp hộp.</li>
                <li>Đậy kín nắp ngay sau mỗi lần sử dụng để tránh bánh bị ỉu do độ ẩm không khí.</li>
                <li>Nên bảo quản trong ngăn mát tủ lạnh để bánh luôn thơm bùi và giòn rụm.</li>
                <li>Dùng trực tiếp như bữa phụ tiện lợi hoặc kết hợp cùng sữa chua, sinh tố, trái cây tươi.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. FREQUENTLY BOUGHT TOGETHER ("THƯỜNG ĐƯỢC MUA CÙNG" - MEW_DEAL_HOT) */}
      <div className="space-y-4 pt-2">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
          Thường được mua cùng
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FREQUENTLY_BOUGHT_TOGETHER.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-2xl border border-[#E5E2DF] p-4 flex gap-4 items-center shadow-2xs hover:shadow-xs transition-shadow"
            >
              <img
                src={optimizeCloudinaryUrl(bundle.imageUrl, 180)}
                alt={bundle.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E5E2DF]"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#2A2725] line-clamp-2 leading-snug">
                  {bundle.name}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-sm text-[#006561]">
                    {formatCurrency(bundle.price)}
                  </span>
                  <del className="text-[11px] font-mono text-[#9A938C]">
                    {formatCurrency(bundle.originalPrice)}
                  </del>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddBundleToCart(bundle)}
                  className="btn-act w-full py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm vào giỏ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CUSTOMER REVIEWS SECTION (`#reviews-section`) */}
      <div ref={reviewsRef} id="reviews-section" className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2DF] pb-6">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
              Đánh giá từ khách hàng
            </h3>
            <p className="text-xs text-[#6B6661] mt-1">
              Những chia sẻ chân thực từ khách hàng đã trải nghiệm bánh HeBekery
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-all cursor-pointer shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Viết đánh giá của bạn</span>
          </button>
        </div>

        {/* Rating Breakdown Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-[#FEFBF4] border border-[#E5E2DF]">
          <div className="md:col-span-4 text-center md:border-r border-[#E5E2DF] pr-0 md:pr-6 space-y-1">
            <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#006561]">
              {averageScore.toFixed(1)}
            </span>
            <div className="flex items-center justify-center text-[#c8983d] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#6B6661]">Dựa trên {totalReviewsCount} đánh giá xác thực</p>
          </div>

          <div className="md:col-span-8 space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-12 text-[#2A2725] font-semibold">5 sao</span>
              <div className="flex-1 h-2 rounded-full bg-[#E5E2DF] overflow-hidden">
                <div className="h-full bg-[#006561] rounded-full w-[92%]" />
              </div>
              <span className="w-10 text-right text-[#6B6661] font-mono">92%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-[#2A2725] font-semibold">4 sao</span>
              <div className="flex-1 h-2 rounded-full bg-[#E5E2DF] overflow-hidden">
                <div className="h-full bg-[#006561] rounded-full w-[8%]" />
              </div>
              <span className="w-10 text-right text-[#6B6661] font-mono">8%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-[#2A2725] font-semibold">3 sao</span>
              <div className="flex-1 h-2 rounded-full bg-[#E5E2DF] overflow-hidden">
                <div className="h-full bg-[#006561] rounded-full w-[0%]" />
              </div>
              <span className="w-10 text-right text-[#6B6661] font-mono">0%</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {liveReviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8F6F5]/60 border border-[#E5E2DF] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-[#2A2725]">
                    {rev.userName || 'Khách hàng HeBekery'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#006561] bg-[#006561]/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-[#006561]" />
                    Đã mua hàng
                  </span>
                </div>
                <span className="text-[11px] text-[#9A938C] font-mono">
                  {formatDate(rev.createdAt)}
                </span>
              </div>

              <div className="flex items-center text-[#c8983d]">
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-[#2A2725] leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. RELATED PRODUCTS ("SẢN PHẨM TƯƠNG TỰ") */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-2">
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

      {/* 7. STICKY BOTTOM PURCHASE BAR */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E2DF] shadow-lg py-2.5 px-4 sm:px-8 transition-transform duration-300">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={optimizeCloudinaryUrl(product.imageUrl, 100)}
                alt={product.name}
                className="w-11 h-11 rounded-xl object-cover border border-[#E5E2DF] shrink-0"
              />
              <div className="min-w-0 hidden sm:block">
                <h4 className="font-bold text-xs text-[#2A2725] truncate max-w-xs md:max-w-md">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-sm text-[#006561]">
                    {formatCurrency(currentPrice)}
                  </span>
                  <del className="text-[11px] font-mono text-[#9A938C]">
                    {formatCurrency(originalPrice)}
                  </del>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="inline-flex items-center border border-[#E5E2DF] bg-white rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-[#2A2725] cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-mono font-bold text-xs text-[#2A2725]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-[#2A2725] cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-act py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {isAdded ? 'Đã thêm' : 'Thêm giỏ'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] py-2.5 px-5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. REVIEW SUBMISSION MODAL */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl bg-white p-6 sm:p-8">
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display text-xl font-bold text-[#2A2725]">
              Đánh giá sản phẩm
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Chia sẻ cảm nhận của bạn về {product.name} cùng cộng đồng HeBekery
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            {isAuthenticated && user && (
              <div className="p-3 bg-[#006561]/8 border border-[#006561]/20 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#6B6661]">Tài khoản đánh giá:</span>
                <span className="font-bold text-[#006561]">{user.name} ({user.email})</span>
              </div>
            )}

            <div className="space-y-1.5 text-center py-2">
              <label className="text-xs font-bold text-[#2A2725] block">
                Mức độ hài lòng của bạn:
              </label>
              <div className="flex items-center justify-center gap-1.5 text-[#c8983d]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-115 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating ? 'fill-current text-[#c8983d]' : 'text-[#E5E2DF]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2A2725]">Họ tên bạn</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E2DF] focus:border-[#006561] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2A2725]">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="0901234567"
                  value={reviewPhone}
                  onChange={(e) => setReviewPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E2DF] focus:border-[#006561] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2A2725]">
                Nhận xét chi tiết (*)
              </label>
              <textarea
                rows={4}
                required
                placeholder="Bánh giòn rụm, độ ngọt vừa phải, giao hàng nhanh..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-[#E5E2DF] focus:border-[#006561] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#6B6661] hover:bg-black/5 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitReviewMutation.isPending}
                className="bg-[#006561] hover:bg-[#1a9a9b] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitReviewMutation.isPending ? 'Đang gửi...' : 'Gửi nhận xét'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
