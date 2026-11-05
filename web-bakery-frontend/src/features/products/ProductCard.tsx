import React from 'react'
import { motion } from 'motion/react'
import { Plus, Flame, Check } from 'lucide-react'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'

interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addItem } = useCart()
  const [isAdded, setIsAdded] = React.useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await addItem(product, 1)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1200)
  }

  const isOutOfStock = product.stock <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect?.(product)}
      className="group relative border border-[#e7e5e4] bg-white flex flex-col justify-between hover:border-[#47654c] transition-all cursor-pointer select-none"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#faf8f5] border-b border-[#e7e5e4]">
          <img
            src={optimizeCloudinaryUrl(product.imageUrl, 500)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {product.category && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-[10px] bg-white/90 backdrop-blur-xs">
                {product.category.name}
              </Badge>
            </div>
          )}
          {product.calories && product.calories > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 backdrop-blur-xs">
              <Flame className="w-3 h-3 text-[#d97724]" />
              <span>{product.calories} kcal</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider px-3 py-1">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <h3 className="font-semibold text-sm text-[#1c1917] group-hover:text-[#47654c] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#78716c] line-clamp-2 leading-relaxed">
            {product.description || 'Sản phẩm dinh dưỡng chế biến thủ công từ nguyên liệu tự nhiên.'}
          </p>
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-[#f5f5f4] mt-2">
        <div>
          <span className="text-sm font-bold text-[#47654c]">
            {formatCurrency(product.price)}
          </span>
          <span className="block text-[10px] text-[#a8a29e]">
            {product.stock > 0 ? `Còn ${product.stock} phần` : 'Hết hàng'}
          </span>
        </div>

        <Button
          size="sm"
          variant={isAdded ? 'secondary' : 'default'}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="h-8 px-3 text-xs flex items-center gap-1"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#47654c]" />
              <span>Đã thêm</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
