import React, { useState } from 'react'
import type { Product } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, ShoppingBag, Flame, Wheat, Activity } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'

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

  if (!product) return null

  const handleAddToCart = async () => {
    await addItem(product, quantity)
    setQuantity(1)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-[#faf8f5] border-b md:border-b-0 md:border-r border-[#e7e5e4]">
            <img
              src={optimizeCloudinaryUrl(product.imageUrl, 600)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.category && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90">
                  {product.category.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl">{product.name}</DialogTitle>
                <DialogDescription className="text-xs text-[#78716c] pt-1">
                  Mã SP: {product.id} • {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Tạm hết'}
                </DialogDescription>
              </DialogHeader>

              <div className="text-xl font-bold text-[#47654c]">
                {formatCurrency(product.price)}
              </div>

              <p className="text-xs text-[#57534e] leading-relaxed">
                {product.description || 'Sản phẩm dinh dưỡng cao cấp, chế biến tươi mới không phụ gia công nghiệp.'}
              </p>

              {/* Nutritional Info */}
              <div className="border border-[#e7e5e4] p-3 bg-[#faf8f5] space-y-2">
                <div className="text-xs font-bold text-[#1c1917] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#47654c]" />
                  <span>Giá Trị Dinh Dưỡng / Khẩu Phần</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-1 text-xs">
                  <div className="bg-white p-1.5 border border-[#e7e5e4]">
                    <div className="text-[10px] text-[#78716c]">Năng lượng</div>
                    <div className="font-bold text-[#d97724]">{product.calories || 0} kcal</div>
                  </div>
                  <div className="bg-white p-1.5 border border-[#e7e5e4]">
                    <div className="text-[10px] text-[#78716c]">Đạm</div>
                    <div className="font-bold text-[#1c1917]">{product.protein || 0}g</div>
                  </div>
                  <div className="bg-white p-1.5 border border-[#e7e5e4]">
                    <div className="text-[10px] text-[#78716c]">Chất béo</div>
                    <div className="font-bold text-[#1c1917]">{product.fat || 0}g</div>
                  </div>
                  <div className="bg-white p-1.5 border border-[#e7e5e4]">
                    <div className="text-[10px] text-[#78716c]">Tinh bột</div>
                    <div className="font-bold text-[#1c1917]">{product.carbs || 0}g</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-[#f5f5f4] space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1c1917]">Số lượng:</span>
                <div className="flex items-center border border-[#d6d3d1]">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold">{quantity}</span>
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
                className="w-full flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm Vào Giỏ • {formatCurrency(product.price * quantity)}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
