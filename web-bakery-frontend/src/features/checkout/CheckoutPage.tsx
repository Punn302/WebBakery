import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, QrCode, CheckCircle2, ArrowRight, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { orderApi, paymentApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import type { Order, Address } from '@/types'
import { AddressSelector } from '@/components/common/AddressSelector'

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Họ tên người nhận phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn hoặc nhập Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng nhập Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng nhập Phường/Xã'),
  address: z.string().min(5, 'Vui lòng nhập số nhà, tên đường cụ thể'),
  paymentMethod: z.enum(['COD', 'VIETQR']),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const QR_COUNTDOWN_SECONDS = 900 // 15 minutes = 900 seconds

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Address Selector state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isManualAddress, setIsManualAddress] = useState(false)

  // VietQR Countdown & Polling state
  const [timeLeft, setTimeLeft] = useState(QR_COUNTDOWN_SECONDS)
  const [isPaidSuccess, setIsPaidSuccess] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const pollingRef = useRef<number | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || '',
      phone: user?.phone || '',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      address: '',
      paymentMethod: 'COD',
      note: '',
    },
  })

  const selectedPaymentMethod = watch('paymentMethod')

  const handleSelectSavedAddress = useCallback((addr: Address) => {
    setSelectedAddressId(addr.id)
    setIsManualAddress(false)
    setValue('customerName', addr.receiverName, { shouldValidate: true })
    setValue('phone', addr.phone, { shouldValidate: true })
    setValue('province', addr.province || 'TP. Hồ Chí Minh', { shouldValidate: true })
    setValue('district', addr.district || 'Quận 1', { shouldValidate: true })
    setValue('ward', addr.ward || 'Phường Bến Nghé', { shouldValidate: true })
    setValue('address', addr.addressLine || addr.fullAddress, { shouldValidate: true })
  }, [setValue])

  const handleSelectManualAddress = useCallback(() => {
    setSelectedAddressId(null)
    setIsManualAddress(true)
  }, [])

  // 15-minute Countdown Timer Effect
  useEffect(() => {
    if (!showQrModal || isPaidSuccess || isExpired) return

    setTimeLeft(QR_COUNTDOWN_SECONDS)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsExpired(true)
          toast.error('Đơn hàng đã hết hạn thanh toán (quá 15 phút).')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showQrModal, isPaidSuccess, isExpired])

  // Polling Payment Status Effect (Every 3 seconds)
  useEffect(() => {
    if (!showQrModal || !createdOrder || isPaidSuccess || isExpired) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }

    const checkStatus = async () => {
      try {
        const res = await paymentApi.getOrderPaymentStatus(createdOrder.id)
        if (res?.isPaid || res?.paymentStatus === 'PAID') {
          setIsPaidSuccess(true)
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          toast.success('Ngân hàng đã xác nhận thanh toán thành công!')
          setTimeout(() => {
            setShowQrModal(false)
            navigate('/orders')
          }, 2000)
        }
      } catch {
        // Silently continue polling on intermittent network errors
      }
    }

    // Run immediately once, then set interval
    checkStatus()
    pollingRef.current = window.setInterval(checkStatus, 3000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [showQrModal, createdOrder, isPaidSuccess, isExpired, navigate])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống!')
      return
    }

    try {
      setIsSubmitting(true)
      const fullAddress = `${data.address}, ${data.ward}, ${data.district}, ${data.province}`
      const order = await orderApi.createOrder({
        customerName: data.customerName,
        phone: data.phone,
        address: fullAddress,
        paymentMethod: data.paymentMethod,
        note: data.note,
      })

      setCreatedOrder(order)
      await clearCart()

      if (data.paymentMethod === 'VIETQR') {
        setIsPaidSuccess(false)
        setIsExpired(false)
        setTimeLeft(QR_COUNTDOWN_SECONDS)
        setShowQrModal(true)
      } else {
        toast.success('Đặt hàng thành công!')
        navigate('/orders')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đặt hàng thất bại!'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-[#78716c]">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
        <Button onClick={() => navigate('/products')}>Khám phá thực đơn</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Thanh Toán Đơn Hàng
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Hoàn tất thông tin giao hàng và chọn phương thức thanh toán thuận tiện nhất
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Address */}
          <div className="border border-[#e7e5e4] bg-white p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
              1. Địa Chỉ Nhận Hàng
            </h2>

            {/* Address Selector for authenticated users */}
            {isAuthenticated && (
              <AddressSelector
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectSavedAddress}
                onSelectManual={handleSelectManualAddress}
                isManualSelected={isManualAddress}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Họ và tên người nhận *
                </label>
                <Input {...register('customerName')} placeholder="Nguyễn Văn A" />
                {errors.customerName && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Số điện thoại *
                </label>
                <Input {...register('phone')} placeholder="0912345678" />
                {errors.phone && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">Tỉnh / Thành *</label>
                <Input {...register('province')} />
                {errors.province && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.province.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">Quận / Huyện *</label>
                <Input {...register('district')} />
                {errors.district && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.district.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">Phường / Xã *</label>
                <Input {...register('ward')} />
                {errors.ward && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.ward.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Địa chỉ chi tiết (Số nhà, tên đường) *
              </label>
              <Input {...register('address')} placeholder="Số 123 Đường Bánh Mì" />
              {errors.address && (
                <p className="text-[11px] text-[#dc2626] mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Ghi chú cho tiệm bánh (tùy chọn)
              </label>
              <Input {...register('note')} placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến..." />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="border border-[#e7e5e4] bg-white p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
              2. Phương Thức Thanh Toán
            </h2>

            <div className="space-y-3">
              {/* COD Option */}
              <label
                onClick={() => setValue('paymentMethod', 'COD')}
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'COD'
                    ? 'border-[#47654c] bg-[#47654c]/5'
                    : 'border-[#e7e5e4] hover:bg-[#faf8f5]'
                }`}
              >
                <input
                  type="radio"
                  value="COD"
                  {...register('paymentMethod')}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1c1917]">
                    <Banknote className="w-4 h-4 text-[#47654c]" />
                    <span>Thanh toán tiền mặt khi nhận bánh (COD)</span>
                  </div>
                  <p className="text-[11px] text-[#78716c]">
                    Kiểm tra bánh tươi đúng khẩu vị trước khi thanh toán cho shipper.
                  </p>
                </div>
              </label>

              {/* VietQR Option */}
              <label
                onClick={() => setValue('paymentMethod', 'VIETQR')}
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'VIETQR'
                    ? 'border-[#47654c] bg-[#47654c]/5'
                    : 'border-[#e7e5e4] hover:bg-[#faf8f5]'
                }`}
              >
                <input
                  type="radio"
                  value="VIETQR"
                  {...register('paymentMethod')}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1c1917]">
                    <QrCode className="w-4 h-4 text-[#d97724]" />
                    <span>Chuyển khoản VietQR tự động (SePay)</span>
                  </div>
                  <p className="text-[11px] text-[#78716c]">
                    Quét mã QR từ ứng dụng ngân hàng, hệ thống xác nhận thanh toán tự động trong 5 giây.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="border border-[#e7e5e4] bg-white p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
              Tóm Tắt Đơn Hàng
            </h2>

            <div className="divide-y divide-[#f5f5f4] max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                      alt={item.productName}
                      className="w-10 h-10 object-cover border border-[#e7e5e4] shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-[#1c1917] truncate">{item.productName}</p>
                      <p className="text-[#78716c]">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#1c1917] shrink-0">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e7e5e4] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#78716c]">
                <span>Tạm tính:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#78716c]">
                <span>Phí vận chuyển:</span>
                <span className="text-[#15803d] font-semibold">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#f5f5f4]">
                <span className="font-bold text-[#1c1917]">Tổng cộng:</span>
                <span className="text-lg font-black text-[#47654c]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* VietQR Dynamic Modal with 15:00 Countdown & Automatic Polling */}
      {createdOrder && (
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent onClose={() => navigate('/orders')} className="max-w-md text-center p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-[#47654c]" />
                <span>Quét Mã VietQR Để Thanh Toán</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716c]">
                Đơn hàng #{createdOrder.orderCode} • Tổng tiền: {formatCurrency(createdOrder.total)}
              </DialogDescription>
            </DialogHeader>

            {/* Countdown Timer Bar */}
            {!isPaidSuccess && !isExpired && (
              <div className="space-y-1.5 p-2.5 bg-[#faf8f5] border border-[#e7e5e4]">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[#57534e]">
                    <Clock className="w-3.5 h-3.5 text-[#d97724] animate-spin" />
                    <span>Thời gian giữ đơn hàng:</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-[#d97724]">
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#e7e5e4] overflow-hidden">
                  <div
                    className="h-full bg-[#d97724] transition-all duration-1000"
                    style={{ width: `${(timeLeft / QR_COUNTDOWN_SECONDS) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Expired State */}
            {isExpired && (
              <div className="p-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto" />
                <p className="font-bold text-sm">Đơn hàng đã hết hạn thanh toán (quá 15 phút)</p>
                <p className="text-xs text-[#991b1b]">
                  Kiện hàng đã được hoàn kho để phục vụ khách hàng khác. Vui lòng đặt lại đơn mới.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowQrModal(false)
                    navigate('/products')
                  }}
                  className="mt-2"
                >
                  Về thực đơn
                </Button>
              </div>
            )}

            {/* Success State */}
            {isPaidSuccess && (
              <div className="p-6 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] space-y-3 animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#16a34a] animate-bounce" />
                <p className="font-extrabold text-base">Thanh Toán Thành Công!</p>
                <p className="text-xs text-[#166534]">
                  Hệ thống ngân hàng SePay đã đối soát thành công. Tiệm bánh Hebekery đang bắt đầu làm bánh tươi cho bạn!
                </p>
                <p className="text-[11px] text-[#78716c]">Tự động chuyển trang sau 2 giây...</p>
              </div>
            )}

            {/* Normal QR Display */}
            {!isPaidSuccess && !isExpired && (
              <>
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#e7e5e4] relative">
                  {/* VietQR QuickLink image API */}
                  <img
                    src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${createdOrder.total}&addInfo=${encodeURIComponent(
                      createdOrder.orderCode
                    )}&accountName=${encodeURIComponent('TIEM BANH HEBEKERY')}`}
                    alt="VietQR Payment"
                    className="w-60 h-60 object-contain"
                  />
                  <div className="text-xs text-[#78716c] space-y-1 mt-3">
                    <p>Ngân hàng: <strong>MBBank</strong></p>
                    <p>Số tài khoản: <strong>0987654321</strong></p>
                    <p>Chủ TK: <strong>TIEM BANH HEBEKERY</strong></p>
                    <p>Nội dung CK: <strong className="text-[#d97724] font-mono text-sm">{createdOrder.orderCode}</strong></p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[#47654c] bg-[#47654c]/5 p-2 border border-[#47654c]/20">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Hệ thống đang tự động nhận diện thanh toán qua SePay Webhook...</span>
                </div>

                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setShowQrModal(false)
                    navigate('/orders')
                  }}
                >
                  Tôi Đã Chuyển Khoản • Xem Đơn Hàng
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
