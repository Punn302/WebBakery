import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { useTranslation } from 'react-i18next'

export const CartDrawer: React.FC = () => {
  const { items, totalItems, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeItem } =
    useCart()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen} side="right">
      <SheetHeader onClose={() => setIsCartOpen(false)}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#47654c]" />
          <h2 className="font-semibold text-base text-[#1c1917] tracking-tight">
            {t('cart.title')} ({totalItems})
          </h2>
        </div>
      </SheetHeader>

      <SheetContent>
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-[#f4efe6] text-[#78716c] flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 opacity-40" />
            </div>
            <div>
              <p className="font-semibold text-[#1c1917]">{t('cart.empty')}</p>
              <p className="text-xs text-[#78716c] mt-1">
                Hãy lựa chọn những món bánh healthy yêu thích cho ngày hôm nay nhé!
              </p>
            </div>
            <Button
              variant="default"
              onClick={() => {
                setIsCartOpen(false)
                navigate('/products')
              }}
            >
              {t('cart.continueShopping')}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f4]">
            {items.map((item) => (
              <div key={item.productId} className="py-4 flex gap-3 items-center">
                <img
                  src={optimizeCloudinaryUrl(item.imageUrl, 160)}
                  alt={item.productName}
                  className="w-16 h-16 object-cover border border-[#e7e5e4] bg-[#faf8f5] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#1c1917] truncate">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-[#47654c] font-medium mt-0.5">
                    {formatCurrency(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[#d6d3d1]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#78716c] hover:bg-black/5 hover:text-[#1c1917] transition-colors cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#78716c] hover:bg-black/5 hover:text-[#1c1917] transition-colors cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-xs font-bold text-[#1c1917]">
                    {formatCurrency(item.total)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-[#a8a29e] hover:text-[#dc2626] transition-colors p-1 cursor-pointer"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>

      {items.length > 0 && (
        <SheetFooter>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#78716c] font-medium">{t('cart.total')}:</span>
            <span className="text-lg font-bold text-[#47654c]">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Button
            variant="default"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleCheckout}
          >
            <span>{t('cart.checkout')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </SheetFooter>
      )}
    </Sheet>
  )
}
