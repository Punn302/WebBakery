import React from 'react'
import { motion } from 'motion/react'
import { Plus, Flame, Check, Sparkles } from 'lucide-react'
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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect?.(product)}
      className="group relative border border-[#eadbce] bg-white rounded-2xl overflow-hidden flex flex-col justify-between tactile-card hover:border-[#4a3728] transition-all cursor-pointer select-none"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#faf8f5] border-b border-[#eadbce]/60">
          <img
            src={optimizeCloudinaryUrl(product.imageUrl, 500)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {product.category && (
            <div className="absolute top-2.5 left-2.5">
              <span className="text-[10px] font-semibold tracking-wide bg-white/95 text-[#4a3728] border border-[#eadbce] px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
                {product.category.name}
              </span>
            </div>
          )}
          {product.calories && product.calories > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#4a3728]/90 text-[#faf8f5] text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
              <Flame className="w-3 h-3 text-[#d97724]" />
              <span>{product.calories} kcal</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <h3 className="font-headline text-base font-semibold text-[#4a3728] group-hover:text-[#2e1e12] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#78716c] line-clamp-2 leading-relaxed">
            {product.description || 'Bánh nướng ngũ cốc nguyên cám lên men tự nhiên, không đường tinh luyện.'}
          </p>

          {/* Nutritional Macro mini-chips if available */}
          {(product.protein || product.carbs || product.fat) && (
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[#47654c] font-medium flex-wrap">
              {product.protein ? (
                <span className="bg-[#47654c]/10 px-2 py-0.5 rounded-full">
                  Protein: {product.protein}g
                </span>
              ) : null}
              {product.carbs ? (
                <span className="bg-[#d97724]/10 text-[#d97724] px-2 py-0.5 rounded-full">
                  Carbs: {product.carbs}g
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-[#f4efea] mt-2">
        <div>
          <span className="text-sm font-bold text-[#4a3728]">
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
          className={`h-8 px-3 text-xs rounded-full flex items-center gap-1 transition-all cursor-pointer ${
            isAdded
              ? 'bg-[#47654c]/20 text-[#47654c]'
              : 'bg-[#d97724] hover:bg-[#c2651b] text-white shadow-xs'
          }`}
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
