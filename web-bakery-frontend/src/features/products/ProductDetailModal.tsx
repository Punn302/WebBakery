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
  Wheat,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { reviewApi } from '@/api'
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

  if (!product) return null

  const handleAddToCart = async () => {
    await addItem(product, quantity)
    setQuantity(1)
    onClose()
  }

  const reviews = reviewSummary?.reviews || []
  const avgRating = reviewSummary?.averageRating || 0
  const reviewCount = reviewSummary?.reviewCount || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl p-0 max-h-[90vh] overflow-y-auto rounded-3xl border border-[#eadbce] shadow-2xl">
        {/* Top Product Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-[#faf8f5] border-b md:border-b-0 md:border-r border-[#eadbce]">
            <img
              src={optimizeCloudinaryUrl(product.imageUrl, 600)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.category && (
              <div className="absolute top-3.5 left-3.5">
                <span className="text-[10px] font-semibold tracking-wide bg-white/95 text-[#4a3728] border border-[#eadbce] px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl font-bold text-[#4a3728]">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#78716c] pt-0.5">
                  Mã SP: {product.id} •{' '}
                  {product.stock > 0 ? `Còn hàng (${product.stock} phần)` : 'Tạm hết'}
                </DialogDescription>
              </DialogHeader>

              {/* Rating Summary Pill */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-[#d97724]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-3.5 h-3.5',
                        star <= Math.round(avgRating)
                          ? 'fill-[#d97724] text-[#d97724]'
                          : 'fill-none text-[#d6d3d1]'
                      )}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#1c1917]">
                  {avgRating > 0 ? avgRating.toFixed(1) : '5.0'} / 5.0
                </span>
                <span className="text-[#78716c]">({reviewCount} lượt đánh giá)</span>
              </div>

              <div className="text-2xl font-bold text-[#4a3728]">
                {formatCurrency(product.price)}
              </div>

              <p className="text-xs text-[#78716c] leading-relaxed">
                {product.description ||
                  'Sản phẩm bánh dinh dưỡng ngũ cốc nguyên cám, lên men chậm không phụ gia hóa học.'}
              </p>

              {/* Nutritional Macro Info Accordion / Box */}
              <div className="border border-[#eadbce] rounded-2xl p-3.5 bg-[#faf8f5] space-y-2">
                <div className="text-xs font-bold text-[#4a3728] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#47654c]" />
                  <span>Bảng Dinh Dưỡng / Khẩu Phần</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-1 text-xs">
                  <div className="bg-white p-2 rounded-xl border border-[#eadbce]">
                    <div className="text-[10px] text-[#78716c]">Năng lượng</div>
                    <div className="font-bold text-[#d97724]">{product.calories || 0} kcal</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#eadbce]">
                    <div className="text-[10px] text-[#78716c]">Đạm</div>
                    <div className="font-bold text-[#47654c]">{product.protein || 0}g</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#eadbce]">
                    <div className="text-[10px] text-[#78716c]">Chất béo</div>
                    <div className="font-bold text-[#1c1917]">{product.fat || 0}g</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#eadbce]">
                    <div className="text-[10px] text-[#78716c]">Net Carb</div>
                    <div className="font-bold text-[#1c1917]">{product.carbs || 0}g</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#f4efea] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4a3728]">Chọn số lượng:</span>
                <div className="flex items-center border border-[#eadbce] rounded-full overflow-hidden bg-white">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#4a3728]">{quantity}</span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] rounded-full py-3 font-semibold shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#d97724]" />
                <span>Thêm Vào Giỏ • {formatCurrency(product.price * quantity)}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-[#eadbce] p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4a3728] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#47654c]" />
              <span>Đánh Giá Từ Khách Hàng Thân Thiết</span>
            </h3>
            <span className="text-xs text-[#78716c]">{reviews.length} nhận xét</span>
          </div>

          {isLoadingReviews ? (
            <div className="py-6 text-center text-xs text-[#78716c]">Đang nạp nhận xét...</div>
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[#eadbce] rounded-2xl bg-[#faf8f5] p-5 space-y-1">
              <p className="text-xs font-semibold text-[#4a3728]">
                Chưa có đánh giá nào cho sản phẩm này
              </p>
              <p className="text-[11px] text-[#78716c]">
                Hãy đặt bánh và trở thành người đầu tiên chia sẻ cảm nhận vị giác của bạn!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#f4efea]">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#47654c] text-white flex items-center justify-center font-bold text-[10px]">
                        {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'K'}
                      </div>
                      <span className="font-bold text-[#1c1917]">{rev.userName}</span>
                      <span className="text-[10px] text-[#47654c] font-semibold flex items-center gap-0.5">
                        <UserCheck className="w-3 h-3" /> Đã mua hàng
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-[#d97724]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              'w-3 h-3',
                              s <= rev.rating
                                ? 'fill-[#d97724] text-[#d97724]'
                                : 'fill-none text-[#d6d3d1]'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#78716c]">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#57534e] leading-relaxed pl-8">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
