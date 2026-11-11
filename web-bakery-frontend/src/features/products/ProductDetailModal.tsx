import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Minus,
  ShoppingBag,
  Activity,
  Star,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  Flame,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { reviewApi, batchApi } from '@/api'
import { formatCurrency, formatDate, optimizeCloudinaryUrl } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  open,
  onClose,
}) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const { data: reviewSummary, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => (product ? reviewApi.getProductReviews(product.id) : null),
    enabled: !!product && open,
  })

  const { data: flashSaleDeals = [] } = useQuery({
    queryKey: ['flash-sale-deals'],
    queryFn: batchApi.getFlashSaleDeals,
    enabled: open,
    staleTime: 60 * 1000,
  })

  if (!product) return null

  const flashSaleDeal = flashSaleDeals.find((d) => String(d.productId) === String(product.id))
  const hasDeal = !!flashSaleDeal && flashSaleDeal.discountPercent > 0
  const effectivePrice = hasDeal
    ? Math.round((product.price * (1 - flashSaleDeal.discountPercent / 100)) / 1000) * 1000
    : product.price
  const originalPrice = hasDeal ? product.price : Math.round((product.price * 1.18) / 1000) * 1000

  const handleAddToCart = async () => {
    const productToAdd = hasDeal
      ? { ...product, price: effectivePrice, name: `${product.name} [Cứu Bánh -${flashSaleDeal.discountPercent}%]` }
      : product
    await addItem(productToAdd, quantity)
    setQuantity(1)
    onClose()
  }

  const reviews = reviewSummary?.reviews || []
  const avgRating = reviewSummary?.averageRating || 0
  const reviewCount = reviewSummary?.reviewCount || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl p-0 max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E5E2DF] shadow-2xl bg-[#FEFBF4]">
        {/* Top Product Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-[#F8F6F5] border-b md:border-b-0 md:border-r border-[#E5E2DF]">
            <img
              src={optimizeCloudinaryUrl(product.imageUrl, 600)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.category && (
              <div className="absolute top-3.5 left-3.5">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/95 text-[#2A2725] border border-[#E5E2DF] px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                  {product.category.name}
                </span>
              </div>
            )}
            <div className="absolute top-3.5 right-3.5">
              {hasDeal ? (
                <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white text-white" />
                  -{flashSaleDeal.discountPercent}%
                </span>
              ) : (
                <span className="bg-[#FFE6DC] text-[#B23A2A] font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
                  -15%
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6B6661] pt-0.5">
                  Mã SP: <span className="font-mono">{product.id}</span> •{' '}
                  {product.stock > 0 ? (
                    <span className="text-[#006561] font-semibold">Còn hàng ({product.stock} phần)</span>
                  ) : (
                    <span className="text-[#B23A2A] font-semibold">Tạm hết</span>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Rating Summary Pill */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-[#c8983d]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-3.5 h-3.5',
                        star <= Math.round(avgRating)
                          ? 'fill-[#c8983d] text-[#c8983d]'
                          : 'fill-none text-[#E5E2DF]'
                      )}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#2A2725] font-mono">
                  {avgRating > 0 ? avgRating.toFixed(1) : '5.0'} / 5.0
                </span>
                <span className="text-[#6B6661]">({reviewCount} đánh giá)</span>
              </div>

              {/* Price Block */}
              {hasDeal && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold border border-red-200">
                  <Flame className="w-3.5 h-3.5 fill-red-700 text-red-700" />
                  Cứu Bánh Lành Cận Date: Giảm {flashSaleDeal.discountPercent}% (còn {flashSaleDeal.daysRemaining} ngày)
                </div>
              )}
              <div className="flex items-baseline gap-2.5">
                <span className={`text-2xl font-bold font-display ${hasDeal ? 'text-red-700' : 'text-[#006561]'}`}>
                  {formatCurrency(effectivePrice)}
                </span>
                <span className="text-sm text-[#9A938C] line-through font-mono">
                  {formatCurrency(originalPrice)}
                </span>
              </div>

              <p className="text-xs text-[#6B6661] leading-relaxed">
                {product.description ||
                  'Sản phẩm bánh dinh dưỡng ngũ cốc nguyên cám, lên men chậm không phụ gia hóa học.'}
              </p>

              {/* Nutritional Macro Box */}
              <div className="border border-[#E5E2DF] rounded-2xl p-3 bg-white space-y-2">
                <div className="text-xs font-bold text-[#2A2725] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#006561]" />
                    <span>Dinh dưỡng / Khẩu phần</span>
                  </div>
                  <span className="text-[10px] text-[#7B9461] font-semibold">100% Tự nhiên</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-0.5 text-xs">
                  <div className="bg-[#F8F6F5] p-2 rounded-xl border border-[#E5E2DF]">
                    <div className="text-[10px] text-[#6B6661]">Năng lượng</div>
                    <div className="font-bold text-[#006561] font-mono">{product.calories || 112} kcal</div>
                  </div>
                  <div className="bg-[#F8F6F5] p-2 rounded-xl border border-[#E5E2DF]">
                    <div className="text-[10px] text-[#6B6661]">Đạm</div>
                    <div className="font-bold text-[#2A2725] font-mono">{product.protein || 4.5}g</div>
                  </div>
                  <div className="bg-[#F8F6F5] p-2 rounded-xl border border-[#E5E2DF]">
                    <div className="text-[10px] text-[#6B6661]">Chất béo</div>
                    <div className="font-bold text-[#2A2725] font-mono">{product.fat || 3.2}g</div>
                  </div>
                  <div className="bg-[#F8F6F5] p-2 rounded-xl border border-[#E5E2DF]">
                    <div className="text-[10px] text-[#6B6661]">Carbs</div>
                    <div className="font-bold text-[#2A2725] font-mono">{product.carbs || 14.8}g</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#E5E2DF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2A2725]">Chọn số lượng:</span>
                <div className="flex items-center border border-[#E5E2DF] rounded-full overflow-hidden bg-white">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer text-[#2A2725]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold font-mono text-[#2A2725]">{quantity}</span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer text-[#2A2725]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] rounded-full py-3 font-semibold shadow-md cursor-pointer transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-[#FEFBF4]" />
                <span>THÊM VÀO GIỎ • {formatCurrency(product.price * quantity)}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-[#E5E2DF] p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2725] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#006561]" />
              <span>Đánh Giá Từ Khách Hàng ({reviews.length})</span>
            </h3>
            <span className="text-[11px] text-[#7B9461] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Khách mua thật
            </span>
          </div>

          {isLoadingReviews ? (
            <div className="py-6 text-center text-xs text-[#6B6661]">Đang tải đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-[#E5E2DF] rounded-2xl bg-[#F8F6F5] p-5 space-y-1">
              <p className="text-xs font-semibold text-[#2A2725]">
                Chưa có nhận xét cho sản phẩm này
              </p>
              <p className="text-[11px] text-[#6B6661]">
                Hãy đặt bánh và là người đầu tiên chia sẻ cảm nhận vị giác của bạn!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#E5E2DF]">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-3 first:pt-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#006561] text-white flex items-center justify-center font-bold text-[10px]">
                        {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'K'}
                      </div>
                      <span className="font-bold text-[#2A2725]">{rev.userName}</span>
                      <span className="text-[10px] text-[#7B9461] font-semibold flex items-center gap-0.5">
                        <UserCheck className="w-3 h-3" /> Đã mua
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-[#c8983d]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              'w-3 h-3',
                              s <= rev.rating
                                ? 'fill-[#c8983d] text-[#c8983d]'
                                : 'fill-none text-[#E5E2DF]'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#9A938C] font-mono">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#6B6661] leading-relaxed pl-8">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
