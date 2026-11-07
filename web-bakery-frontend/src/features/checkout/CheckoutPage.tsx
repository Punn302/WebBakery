import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, QrCode, CheckCircle2, ArrowRight, Clock, AlertTriangle, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react'
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
      <div className="py-24 text-center space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#f5f0e9] border border-[#eadbce] flex items-center justify-center mx-auto text-[#4a3728]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-[#2e1e12]">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-[#7c6856] leading-relaxed">
          Hãy khám phá các món bánh mì nguyên cám, ngũ cốc Granola và bánh quy Biscotti thơm lành nướng mới sáng nay.
        </p>
        <Button
          onClick={() => navigate('/products')}
          className="btn-tactile bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full px-6 py-2.5 text-xs font-semibold"
        >
          Khám phá thực đơn bánh tươi
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="border-b border-[#eadbce] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Đặt bánh thủ công tươi mới</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#2e1e12] tracking-tight">
          Thanh Toán Đơn Hàng
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6856] mt-1.5">
          Hoàn tất thông tin nhận bánh và chọn phương thức thanh toán an toàn, bảo mật
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Address */}
          <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-5">
            <h2 className="font-headline text-base font-bold text-[#2e1e12] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4a3728] text-white text-xs flex items-center justify-center font-sans">1</span>
              <span>Địa Chỉ Giao Bánh Tận Nơi</span>
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
                <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                  Họ và tên người nhận <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  {...register('customerName')}
                  placeholder="Nguyễn Văn A"
                  className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
                />
                {errors.customerName && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                  Số điện thoại người nhận <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  {...register('phone')}
                  placeholder="0912345678"
                  className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
                />
                {errors.phone && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                  Tỉnh / Thành phố <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  {...register('province')}
                  className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
                />
                {errors.province && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.province.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                  Quận / Huyện <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  {...register('district')}
                  className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
                />
                {errors.district && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.district.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                  Phường / Xã <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  {...register('ward')}
                  className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
                />
                {errors.ward && (
                  <p className="text-[11px] text-[#dc2626] mt-1">{errors.ward.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                Địa chỉ chi tiết (Số nhà, ngõ, tên đường) <span className="text-[#d97724]">*</span>
              </label>
              <Input
                {...register('address')}
                placeholder="Số 123 Đường Bánh Mì"
                className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
              />
              {errors.address && (
                <p className="text-[11px] text-[#dc2626] mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2e1e12] mb-1.5">
                Ghi chú cho bếp bánh (tùy chọn)
              </label>
              <Input
                {...register('note')}
                placeholder="Ví dụ: Giao vào buổi sáng trước 11h, gọi trước khi đến..."
                className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c]"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-4">
            <h2 className="font-headline text-base font-bold text-[#2e1e12] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4a3728] text-white text-xs flex items-center justify-center font-sans">2</span>
              <span>Phương Thức Thanh Toán</span>
            </h2>

            <div className="space-y-3 pt-1">
              {/* COD Option */}
              <label
                onClick={() => setValue('paymentMethod', 'COD')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'COD'
                    ? 'border-[#47654c] bg-[#47654c]/5 ring-1 ring-[#47654c]'
                    : 'border-[#eadbce] hover:border-[#4a3728]/30 hover:bg-[#faf8f5]'
                }`}
              >
                <input
                  type="radio"
                  value="COD"
                  {...register('paymentMethod')}
                  className="mt-1 accent-[#47654c]"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#2e1e12]">
                    <Banknote className="w-4 h-4 text-[#47654c]" />
                    <span>Thanh toán tiền mặt khi nhận bánh (COD)</span>
                  </div>
                  <p className="text-[11px] text-[#7c6856]">
                    Kiểm tra bánh tươi đúng khẩu vị trước khi gửi tiền cho shipper.
                  </p>
                </div>
              </label>

              {/* VietQR Option */}
              <label
                onClick={() => setValue('paymentMethod', 'VIETQR')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'VIETQR'
                    ? 'border-[#d97724] bg-[#d97724]/5 ring-1 ring-[#d97724]'
                    : 'border-[#eadbce] hover:border-[#4a3728]/30 hover:bg-[#faf8f5]'
                }`}
              >
                <input
                  type="radio"
                  value="VIETQR"
                  {...register('paymentMethod')}
                  className="mt-1 accent-[#d97724]"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#2e1e12]">
                    <QrCode className="w-4 h-4 text-[#d97724]" />
                    <span>Chuyển khoản VietQR tự động (SePay Webhook)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d97724]/10 text-[#d97724] font-bold">Khuyên dùng</span>
                  </div>
                  <p className="text-[11px] text-[#7c6856]">
                    Quét mã QR từ mọi app ngân hàng, hệ thống xác nhận thanh toán tự động trong 3 giây.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 space-y-5 sticky top-24">
            <h2 className="font-headline text-base font-bold text-[#2e1e12] border-b border-[#eadbce] pb-3">
              Tóm Tắt Đơn Bánh
            </h2>

            <div className="divide-y divide-[#f5f0e9] max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#eadbce] shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-[#2e1e12] truncate">{item.productName}</p>
                      <p className="text-[#7c6856] text-[11px]">Số lượng: x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#2e1e12] shrink-0">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#eadbce] pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#7c6856]">
                <span>Tạm tính tiền bánh:</span>
                <span className="font-medium text-[#2e1e12]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#7c6856]">
                <span>Phí vận chuyển bảo quản tươi:</span>
                <span className="text-[#47654c] font-semibold bg-[#47654c]/10 px-2 py-0.5 rounded-full text-[11px]">
                  Miễn phí
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-[#f5f0e9]">
                <span className="font-bold text-[#2e1e12]">Tổng thanh toán:</span>
                <span className="text-xl font-bold font-headline text-[#4a3728]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="btn-tactile w-full bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full py-3 flex items-center justify-center gap-2 mt-4 text-xs font-semibold"
            >
              <span>{isSubmitting ? 'Bếp đang xử lý...' : 'Xác Nhận Đặt Bánh'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7c6856] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#47654c]" />
              <span>Cam kết 100% không đường tinh luyện</span>
            </div>
          </div>
        </div>
      </form>

      {/* VietQR Dynamic Modal with 15:00 Countdown & Automatic Polling */}
      {createdOrder && (
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent onClose={() => navigate('/orders')} className="max-w-md text-center p-6 sm:p-7 space-y-5 rounded-2xl border border-[#eadbce]">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-[#2e1e12] flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-[#d97724]" />
                <span>Quét Mã VietQR Chuyển Khoản</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#7c6856]">
                Đơn hàng #{createdOrder.orderCode} • Tổng tiền: {formatCurrency(createdOrder.total)}
              </DialogDescription>
            </DialogHeader>

            {/* Countdown Timer Bar */}
            {!isPaidSuccess && !isExpired && (
              <div className="space-y-1.5 p-3 bg-[#faf8f5] border border-[#eadbce] rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#7c6856]">
                    <Clock className="w-3.5 h-3.5 text-[#d97724] animate-spin" />
                    <span>Thời gian giữ đơn bánh:</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-[#d97724]">
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#eadbce] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d97724] transition-all duration-1000 rounded-full"
                    style={{ width: `${(timeLeft / QR_COUNTDOWN_SECONDS) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Expired State */}
            {isExpired && (
              <div className="p-5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto" />
                <p className="font-bold text-sm">Đơn hàng đã hết hạn thanh toán (quá 15 phút)</p>
                <p className="text-xs text-[#991b1b] leading-relaxed">
                  Mẻ bánh tươi đã được hoàn lại kho. Quý khách vui lòng đặt lại đơn mới.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowQrModal(false)
                    navigate('/products')
                  }}
                  className="mt-2 rounded-full border-[#dc2626] text-[#dc2626]"
                >
                  Về thực đơn bánh
                </Button>
              </div>
            )}

            {/* Success State */}
            {isPaidSuccess && (
              <div className="p-6 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] rounded-xl space-y-3 animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#16a34a] animate-bounce" />
                <p className="font-headline text-lg font-bold">Thanh Toán Thành Công!</p>
                <p className="text-xs text-[#166534] leading-relaxed">
                  Hệ thống ngân hàng SePay đã đối soát thành công. Bếp bánh Hebekery đang nướng mẻ bánh tươi cho bạn!
                </p>
                <p className="text-[11px] text-[#7c6856]">Tự động chuyển trang sau 2 giây...</p>
              </div>
            )}

            {/* Normal QR Display */}
            {!isPaidSuccess && !isExpired && (
              <>
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#eadbce] rounded-xl shadow-xs">
                  {/* VietQR QuickLink image API */}
                  <img
                    src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${createdOrder.total}&addInfo=${encodeURIComponent(
                      createdOrder.orderCode
                    )}&accountName=${encodeURIComponent('TIEM BANH HEBEKERY')}`}
                    alt="VietQR Payment"
                    className="w-56 h-56 object-contain"
                  />
                  <div className="text-xs text-[#7c6856] space-y-1 mt-3">
                    <p>Ngân hàng: <strong className="text-[#2e1e12]">MBBank (Quân Đội)</strong></p>
                    <p>Số tài khoản: <strong className="text-[#2e1e12]">0987654321</strong></p>
                    <p>Chủ TK: <strong className="text-[#2e1e12]">TIEM BANH HEBEKERY</strong></p>
                    <p>Nội dung CK: <strong className="text-[#d97724] font-mono text-sm">{createdOrder.orderCode}</strong></p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[#47654c] bg-[#47654c]/5 p-2.5 rounded-xl border border-[#47654c]/20">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Hệ thống tự động nhận diện thanh toán qua SePay Webhook...</span>
                </div>

                <Button
                  className="btn-tactile w-full bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full py-2.5 text-xs font-semibold"
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
