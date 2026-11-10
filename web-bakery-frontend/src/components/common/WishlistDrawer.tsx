import React from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  X,
  ShoppingBag,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addItem, setIsCartOpen } = useCart()

  const handleAddToCart = async (product: any) => {
    await addItem(product, 1)
    setIsCartOpen(true)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-text">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E5E2DF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#B23A2A]/10 text-[#B23A2A] flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm sm:text-base text-[#2A2725]">
                      Món Bánh Bạn Yêu Thích
                    </h2>
                    <p className="text-[11px] text-[#6B6661]">
                      {wishlist.length} sản phẩm đã lưu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#6B6661] hover:text-[#2A2725] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {wishlist.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5E2DF] flex items-center justify-center mx-auto text-[#B23A2A]">
                      <Heart className="w-8 h-8 text-[#9A938C]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-base font-bold text-[#2A2725]">
                        Chưa Có Bánh Nào Được Lưu
                      </h3>
                      <p className="text-xs text-[#6B6661] max-w-xs mx-auto">
                        Hãy nhấn vào biểu tượng trái tim ở từng món bánh để lưu lại và gom đơn đủ 299k Freeship nhé!
                      </p>
                    </div>
                    <Button
                      onClick={onClose}
                      className="bg-[#006561] hover:bg-[#004e4a] text-white text-xs font-bold uppercase tracking-wider h-10 px-5 rounded-xl cursor-pointer"
                    >
                      <span>Khám Phá Menu Bánh</span>
                    </Button>
                  </div>
                ) : (
                  wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#FAF7F2] border border-[#E5E2DF] rounded-2xl flex items-center gap-3 transition-all hover:border-[#006561]/40"
                    >
                      <img
                        src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-[#E5E2DF] shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          to={`/products/${item.id}`}
                          onClick={onClose}
                          className="font-semibold text-xs text-[#2A2725] hover:text-[#006561] line-clamp-1 block transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="text-xs font-bold text-[#006561]">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="bg-[#006561] hover:bg-[#004e4a] text-white text-[11px] font-bold h-7 px-2.5 rounded-lg cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            <span>Thêm Giỏ</span>
                          </Button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-[#6B6661] hover:text-[#B23A2A] text-[11px] p-1 transition-colors cursor-pointer"
                            title="Xóa khỏi yêu thích"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {wishlist.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-[#E5E2DF] bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B6661]">Tổng số món yêu thích:</span>
                    <span className="font-bold text-[#2A2725]">{wishlist.length} món</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearWishlist}
                      className="border-[#E5E2DF] text-xs text-[#6B6661] hover:text-[#B23A2A] h-10 rounded-xl cursor-pointer"
                    >
                      Xóa tất cả
                    </Button>
                    <Link
                      to="/products"
                      onClick={onClose}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#006561] hover:bg-[#004e4a] text-white text-xs font-bold uppercase tracking-wider h-10 rounded-xl transition-all cursor-pointer"
                    >
                      <span>Xem Thêm Bánh Khác</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
