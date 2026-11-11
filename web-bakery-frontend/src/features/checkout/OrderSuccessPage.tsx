import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Clock,
  Sparkles,
  Copy,
  Check,
  Heart,
  MessageCircle,
  Printer,
  QrCode,
} from 'lucide-react'
import { orderApi } from '@/api'
import { formatCurrency, formatDate, optimizeCloudinaryUrl } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { OrderInvoicePrintModal } from '@/features/orders/OrderInvoicePrintModal'
import { VietQrPaymentModal } from '@/components/common/VietQrPaymentModal'

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = React.useState(false)
  const [isPrintOpen, setIsPrintOpen] = React.useState(false)
  const [isQrOpen, setIsQrOpen] = React.useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-success', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Missing orderId')
      try {
        return await orderApi.getOrderById(orderId)
      } catch {
        // Fallback to tracking if private getOrderById is 401/403 (for guest order)
        const tracked = await orderApi.trackOrders({ orderId })
        return tracked?.[0] || null
      }
    },
    enabled: !!orderId,
  })

  const copyOrderCode = () => {
    if (!orderId) return
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    toast.success('Đã sao chép mã đơn hàng!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#006561] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#6B6661] font-medium">Đang tải thông tin đơn bánh Hebekery...</p>
      </div>
    )
  }

  return (
    <div className="bg-[#FAF7F2] min-h-[calc(100vh-80px)] py-10 sm:py-14 font-text">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Success Banner Card */}
        <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-10 text-center space-y-4 shadow-sm relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#006561]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-full bg-[#006561]/10 text-[#006561] flex items-center justify-center mx-auto shadow-inner relative">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            <Sparkles className="w-5 h-5 text-[#C9785C] absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đặt Bánh Thành Công</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
              Cảm Ơn Bạn Đã Chọn Bánh Lành HeBekery!
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6661] max-w-lg mx-auto leading-relaxed">
              Bếp bánh Hebekery đã nhận được đơn hàng và đang chuẩn bị mẻ bánh nướng mộc thơm lành nhất cho bạn.
            </p>
          </div>

          {/* Order ID Pill with Copy button */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#FAF7F2] border border-[#E5E2DF] rounded-2xl text-xs">
              <span className="text-[#6B6661]">Mã đơn bánh:</span>
              <span className="font-mono font-bold text-[#006561] text-sm tracking-wide">
                #{order?.id || orderId}
              </span>
              <button
                type="button"
                onClick={copyOrderCode}
                className="text-[#6B6661] hover:text-[#006561] transition-colors cursor-pointer p-1 rounded-md"
                title="Sao chép mã đơn"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16a34a]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Delivery notice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E5E2DF]/60 text-left">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E2DF]">
              <Truck className="w-4 h-4 text-[#006561] shrink-0 mt-0.5" />
              <div className="text-[11px] space-y-0.5">
                <span className="font-bold text-[#2A2725] block">Giao hỏa tốc 2H</span>
                <span className="text-[#6B6661]">Nội thành TP.HCM &amp; Hà Nội nhận bánh trong ngày.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E2DF]">
              <Clock className="w-4 h-4 text-[#C9785C] shrink-0 mt-0.5" />
              <div className="text-[11px] space-y-0.5">
                <span className="font-bold text-[#2A2725] block">Bánh mới mỗi ngày</span>
                <span className="text-[#6B6661]">Nướng mộc từ lò, cam kết không chất bảo quản.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E2DF]">
              <Heart className="w-4 h-4 text-[#B23A2A] shrink-0 mt-0.5" />
              <div className="text-[11px] space-y-0.5">
                <span className="font-bold text-[#2A2725] block">Đổi trả 1-1 miễn phí</span>
                <span className="text-[#6B6661]">Bảo hành 7 ngày nếu bánh lỗi, vỡ vụn hoặc ẩm mốc.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Delivery & Payment Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E2DF] p-6 space-y-4 shadow-xs">
              <h2 className="font-display text-sm font-bold text-[#2A2725] flex items-center gap-2 border-b border-[#E5E2DF] pb-3">
                <MapPin className="w-4 h-4 text-[#006561]" />
                <span>Địa Chỉ Nhận Bánh</span>
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6661]">Người nhận:</span>
                  <span className="font-semibold text-[#2A2725]">{order?.customerName || 'Khách hàng Hebekery'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6661]">Số điện thoại:</span>
                  <span className="font-semibold text-[#2A2725]">{order?.phone || 'Chưa cung cấp'}</span>
                </div>
                <div className="pt-1 text-[#6B6661] border-t border-[#E5E2DF]/60">
                  <span className="font-medium text-[#2A2725] block mb-0.5">Địa chỉ giao:</span>
                  <span>{order?.address || 'Tại cửa hàng'}</span>
                </div>
                {order?.note && (
                  <div className="pt-1 text-[#6B6661] border-t border-[#E5E2DF]/60">
                    <span className="font-medium text-[#2A2725] block mb-0.5">Ghi chú cho bếp:</span>
                    <span className="italic">"{order.note}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E2DF] p-6 space-y-4 shadow-xs">
              <h2 className="font-display text-sm font-bold text-[#2A2725] flex items-center gap-2 border-b border-[#E5E2DF] pb-3">
                <CreditCard className="w-4 h-4 text-[#006561]" />
                <span>Phương Thức Thanh Toán</span>
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6661]">Hình thức:</span>
                  <span className="font-semibold text-[#2A2725]">
                    {order?.paymentMethod === 'VIETQR'
                      ? 'Chuyển khoản VietQR tự động'
                      : 'Thanh toán tiền mặt khi nhận bánh (COD)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6661]">Trạng thái:</span>
                  {order?.paymentStatus === 'PAID' ? (
                    <Badge className="bg-[#16a34a] text-white border-0 text-[10px] font-bold">
                      Đã thanh toán thành công
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[#C9785C] border-[#C9785C]/30 bg-[#C9785C]/10 text-[10px] font-bold">
                      {order?.paymentMethod === 'VIETQR' ? 'Chờ xác nhận' : 'Thanh toán khi nhận bánh'}
                    </Badge>
                  )}
                </div>
                {order?.createdAt && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#E5E2DF]/60">
                    <span className="text-[#6B6661]">Thời gian đặt:</span>
                    <span className="text-[#2A2725]">{formatDate(order.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Ordered Items & Bill (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-[#E5E2DF] p-6 space-y-5 shadow-xs">
              <h2 className="font-display text-sm font-bold text-[#2A2725] flex items-center justify-between border-b border-[#E5E2DF] pb-3">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#006561]" />
                  <span>Sản Phẩm Đã Đặt</span>
                </span>
                <span className="text-xs font-normal text-[#6B6661]">
                  {order?.items?.length || 0} sản phẩm
                </span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#E5E2DF]/60 space-y-3">
                {order?.items?.map((item) => (
                  <div key={item.id || item.productId} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={optimizeCloudinaryUrl(item.imageUrl, 80)}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-xl border border-[#E5E2DF] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-[#2A2725] truncate">
                        {item.productName}
                      </h3>
                      <p className="text-[11px] text-[#6B6661] mt-0.5">
                        Số lượng: <span className="font-semibold text-[#2A2725]">x{item.quantity}</span> •{' '}
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-[#006561] shrink-0">
                      {formatCurrency(item.total || item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Summary Breakdown */}
              <div className="pt-4 border-t border-[#E5E2DF] space-y-2 text-xs">
                <div className="flex justify-between text-[#6B6661]">
                  <span>Tạm tính tiền bánh:</span>
                  <span className="font-semibold text-[#2A2725]">
                    {formatCurrency(order?.total ? order.total - (order.shippingFee || 0) + (order.discountAmount || 0) : 0)}
                  </span>
                </div>

                {order?.voucherCode && (
                  <div className="flex justify-between text-[#006561] font-medium">
                    <span className="flex items-center gap-1">
                      <span>Mã giảm giá ({order.voucherCode}):</span>
                    </span>
                    <span>-{formatCurrency(order.discountAmount || 0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6B6661]">
                  <span>Phí giao hàng:</span>
                  <span>
                    {(order?.shippingFee || 0) === 0 ? (
                      <span className="font-semibold text-[#16a34a]">Miễn phí (Freeship 299k)</span>
                    ) : (
                      <span className="font-semibold text-[#2A2725]">{formatCurrency(order?.shippingFee || 30000)}</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#2A2725] pt-2 border-t border-[#E5E2DF]/60">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#006561] text-base font-display">
                    {formatCurrency(order?.total || 0)}
                  </span>
                </div>
              </div>

              {/* VietQR Quick Payment Notice if unpaid */}
              {order?.paymentMethod === 'VIETQR' && order?.paymentStatus !== 'PAID' && (
                <div className="p-4 bg-[#fef9c3]/60 border border-[#fde047] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-5 h-5 text-[#854d0e] shrink-0" />
                    <div>
                      <span className="font-bold text-[#854d0e] block">Đơn hàng đang chờ chuyển khoản VietQR</span>
                      <span className="text-[#a16207] text-[11px]">Quét mã QR Napas 247 để hoàn tất thanh toán tự động</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsQrOpen(true)}
                    className="w-full sm:w-auto bg-[#854d0e] hover:bg-[#713f12] text-white text-xs font-bold uppercase tracking-wider h-9 px-4 rounded-xl cursor-pointer shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    <span>Mở Mã QR Thanh Toán</span>
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5E2DF] flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={() => setIsPrintOpen(true)}
                  variant="outline"
                  className="w-full sm:w-auto border-[#006561]/40 text-[#006561] hover:bg-[#006561]/5 text-xs font-bold uppercase tracking-wider h-11 px-5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Hóa Đơn A5</span>
                </Button>
                <Button
                  onClick={() => navigate('/orders')}
                  className="w-full sm:flex-1 bg-[#006561] hover:bg-[#004e4a] text-white text-xs font-bold uppercase tracking-wider h-11 rounded-xl cursor-pointer"
                >
                  <Package className="w-4 h-4 mr-2" />
                  <span>Theo Dõi Hành Trình Đơn</span>
                </Button>
                <Button
                  onClick={() => navigate('/products')}
                  variant="outline"
                  className="w-full sm:flex-1 border-[#E5E2DF] hover:border-[#006561] text-[#2A2725] hover:text-[#006561] text-xs font-bold uppercase tracking-wider h-11 rounded-xl cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>Tiếp Tục Mua Bánh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Help Banner */}
        <div className="bg-[#FAF7F2] border border-[#E5E2DF] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006561]/10 text-[#006561] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-[#2A2725]">Cần thay đổi thông tin hoặc hỗ trợ đơn gấp?</p>
              <p className="text-[#6B6661] text-[11px]">Đội ngũ Hebekery luôn sẵn sàng lắng nghe từ 08:00 - 21:00 hàng ngày.</p>
            </div>
          </div>
          <a
            href="tel:0979764185"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E2DF] hover:border-[#006561] rounded-xl text-xs font-bold text-[#006561] shadow-2xs transition-colors shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotline: 097 97 64 185</span>
          </a>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      <OrderInvoicePrintModal
        order={order || null}
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />

      {/* VietQR Payment Modal */}
      <VietQrPaymentModal
        order={order || null}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />
    </div>
  )
}
