import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Zap, Check, Flame } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'

interface ProductCardProps {
  product: Product
  dealBadge?: { discountPercent: number; daysRemaining: number }
  onSelect?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, dealBadge, onSelect }) => {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [isAdded, setIsAdded] = useState(false)
  const isFavorite = isInWishlist(product.id)

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product)
    } else {
      navigate(`/products/${product.id}`)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.stock <= 0) return
    const productToAdd = hasDeal
      ? {
          ...product,
          price: effectivePrice,
          name: `${product.name} [Cứu Bánh -${dealBadge.discountPercent}%]`,
        }
      : product
    await addItem(productToAdd, 1)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1400)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  const isOutOfStock = product.stock <= 0
  const hasDeal = !!dealBadge && dealBadge.discountPercent > 0
  const effectivePrice = hasDeal
    ? Math.round((product.price * (1 - dealBadge.discountPercent / 100)) / 1000) * 1000
    : product.price
  const originalPrice = hasDeal ? product.price : Math.round((product.price * 1.18) / 1000) * 1000
  const displayCalories = product.calories && product.calories > 0 ? product.calories : 112
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as { name: string }).name
      : typeof product.category === 'string'
      ? product.category
      : 'Bánh ăn kiêng'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="group relative border border-[#E5E2DF] bg-white rounded-2xl overflow-hidden flex flex-col justify-between tactile-card hover:border-[#006561] transition-all cursor-pointer select-none"
    >
      <div>
        {/* Product Image (1:1 Ratio with smooth hover zoom) */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F8F6F5]">
          <img
            src={optimizeCloudinaryUrl(product.imageUrl, 500)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Sale or Near-Expiry Deal Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
            {hasDeal ? (
              <span className="bg-orange-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-200" />
                <span>Cứu Bánh -{dealBadge?.discountPercent}%</span>
              </span>
            ) : (
              <span className="bg-[#FFE6DC] text-[#B23A2A] font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
                -15%
              </span>
            )}
            {hasDeal && dealBadge && dealBadge.daysRemaining > 0 && (
              <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded-xs font-semibold">
                HSD: {dealBadge.daysRemaining} ngày
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            aria-label="Yêu thích"
            onClick={handleToggleFavorite}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:text-[#B23A2A] transition-colors shadow-xs"
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isFavorite ? 'fill-[#B23A2A] text-[#B23A2A]' : 'text-[#6B6661]'
              }`}
            />
          </button>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#FEFBF4]/90 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="bg-[#B23A2A] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Tạm hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {/* Category Tag & Calo Badge Row */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#6B6661] truncate max-w-[60%]">
              {categoryName}
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] font-semibold text-[#006561] bg-[#006561]/8 px-2 py-0.5 rounded-full shrink-0">
              <Zap className="w-3 h-3 text-[#C9785C]" />
              <span>{displayCalories} kcal</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-display text-sm sm:text-[15px] font-bold text-[#2A2725] group-hover:text-[#006561] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Price Block: Current price in #006561 + strike-through old price in #9A938C */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="font-display text-base font-bold text-[#006561]">
              {formatCurrency(effectivePrice)}
            </span>
            <span className="font-mono text-xs text-[#9A938C] line-through">
              {formatCurrency(originalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Button: .btn-act outline MUA NGAY button */}
      <div className="p-3.5 sm:p-4 pt-0">
        <button
          type="button"
          aria-label={isAdded ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng - MUA NGAY'}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`btn-act w-full py-2 px-3 text-xs font-semibold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
            isAdded
              ? 'bg-[#006561] text-[#FEFBF4] border-[#006561]'
              : 'border-[#2A2725] text-[#2A2725] hover:bg-[#2A2725] hover:text-white'
          } ${isOutOfStock ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-[#2A2725]' : ''}`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>ĐÃ THÊM</span>
            </>
          ) : isOutOfStock ? (
            <span>HẾT HÀNG</span>
          ) : (
            <span>MUA NGAY</span>
          )}
        </button>
      </div>
    </motion.div>
  )
}
