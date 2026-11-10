import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react'
import { Sheet, SheetHeader, SheetContent, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { useTranslation } from 'react-i18next'

const FREESHIP_THRESHOLD = 299000

export const CartDrawer: React.FC = () => {
  const { items, totalItems, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeItem } =
    useCart()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  const isFreeShip = subtotal >= FREESHIP_THRESHOLD
  const amountNeeded = Math.max(0, FREESHIP_THRESHOLD - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100))

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen} side="right">
      <SheetHeader onClose={() => setIsCartOpen(false)}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#006561]" />
          <h2 className="font-display font-bold text-base text-[#2A2725] tracking-tight">
            Giỏ Hàng Hebekery ({totalItems})
          </h2>
        </div>
      </SheetHeader>

      {/* Freeship Progress Bar (Mốc 299.000đ) */}
      {items.length > 0 && (
        <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E5E2DF] text-xs">
          {isFreeShip ? (
            <div className="flex items-center gap-2 text-[#006561] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#006561] shrink-0" />
              <span>Tuyệt vời! Đơn bánh của bạn được <b>Miễn Phí Vận Chuyển</b> toàn quốc.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[#2A2725]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#C9785C]" />
                  <span>Mua thêm <strong className="text-[#C9785C]">{formatCurrency(amountNeeded)}</strong> để được</span>
                </span>
                <span className="font-bold text-[#006561]">Freeship 0đ</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E2DF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006561] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <SheetContent>
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5E2DF] text-[#006561] flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <div>
              <p className="font-bold text-base text-[#2A2725]">Giỏ hàng của bạn đang trống</p>
              <p className="text-xs text-[#6B6661] mt-1.5 max-w-xs leading-relaxed">
                Hãy lựa chọn những món bánh nướng mộc, không đường tinh luyện chuẩn Eat Clean nhé!
              </p>
            </div>
            <Button
              className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
              onClick={() => {
                setIsCartOpen(false)
                navigate('/products')
              }}
            >
              Xem thực đơn bánh
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E2DF]/60">
            {items.map((item) => (
              <div key={item.productId} className="py-4 flex gap-3 items-center">
                <img
                  src={optimizeCloudinaryUrl(item.imageUrl, 160)}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-xl border border-[#E5E2DF] bg-[#FAF7F2] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#2A2725] truncate">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-[#006561] font-semibold mt-0.5">
                    {formatCurrency(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[#E5E2DF] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#6B6661] hover:bg-black/5 hover:text-[#2A2725] transition-colors cursor-pointer"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-[#2A2725]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#6B6661] hover:bg-black/5 hover:text-[#2A2725] transition-colors cursor-pointer"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs font-bold font-display text-[#2A2725]">
                    {formatCurrency(item.total)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-[#9A938C] hover:text-[#B23A2A] transition-colors p-1 cursor-pointer"
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
          <div className="flex justify-between items-center text-xs w-full pb-1">
            <span className="text-[#6B6661]">Tạm tính tiền bánh:</span>
            <span className="text-base font-bold font-display text-[#006561]">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Button
            size="lg"
            className="w-full bg-[#006561] hover:bg-[#004e4a] text-white rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md transition-all"
            onClick={handleCheckout}
          >
            <span>Tiến hành thanh toán</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </SheetFooter>
      )}
    </Sheet>
  )
}
