import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Banknote,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Ticket,
  Truck,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { orderApi, paymentApi, voucherApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import type { Order, Address, VoucherCalculation } from '@/types'
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
const FREESHIP_THRESHOLD = 299000 // 299,000đ freeship policy

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

  // Voucher state
  const [voucherCodeInput, setVoucherCodeInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherCalculation | null>(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)

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

  // Shipping & Discount Calculations
  const isFreeShipping = subtotal >= FREESHIP_THRESHOLD || (appliedVoucher?.valid && appliedVoucher.code.toUpperCase().includes('FREESHIP'))
  const shippingFee = isFreeShipping ? 0 : 30000
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount)

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

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    try {
      setIsApplyingVoucher(true)
      const res = await voucherApi.applyVoucher({
        code: voucherCodeInput.trim(),
        orderAmount: subtotal,
      })
      if (res && res.valid) {
        setAppliedVoucher(res)
        toast.success(res.message || 'Áp dụng mã giảm giá thành công!')
      } else {
        toast.error(res?.message || 'Mã giảm giá không hợp lệ hoặc chưa đạt đơn tối thiểu')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể áp dụng mã giảm giá'
      toast.error(msg)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCodeInput('')
    toast.info('Đã gỡ bỏ mã giảm giá')
  }

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
            navigate(createdOrder ? `/order-success/${createdOrder.id}` : '/orders')
          }, 1500)
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
        voucherCode: appliedVoucher?.code,
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
        navigate(`/order-success/${order.id}`)
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
        <div className="w-16 h-16 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center mx-auto text-[#006561] shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#2A2725]">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-[#6B6661] leading-relaxed">
          Hãy khám phá các món bánh mì nguyên cám, ngũ cốc Granola và bánh quy Biscotti thơm lành nướng mới sáng nay.
        </p>
        <Button
          onClick={() => navigate('/products')}
          className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-full px-6 py-2.5 text-xs font-semibold cursor-pointer"
        >
          Khám phá thực đơn bánh tươi
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-text text-[#2A2725]">
      {/* Header Banner */}
      <div className="border-b border-[#E5E2DF] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/8 text-[#006561] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
          <span>Đặt bánh thủ công tươi mới</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2A2725] tracking-tight">
          Thanh Toán Đơn Hàng
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6661] mt-1.5">
          Hoàn tất thông tin nhận bánh và chọn phương thức thanh toán an toàn, bảo mật
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Address */}
          <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
            <h2 className="font-display text-base font-bold text-[#2A2725] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#006561] text-white text-xs flex items-center justify-center font-mono">1</span>
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
                <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                  Họ tên người nhận <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  {...register('customerName')}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="text-xs rounded-xl border-[#E5E2DF]"
                />
                {errors.customerName && (
                  <p className="text-[11px] text-[#B23A2A] mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                  Số điện thoại nhận bánh <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  {...register('phone')}
                  placeholder="Ví dụ: 0987654321"
                  className="text-xs rounded-xl border-[#E5E2DF]"
                />
                {errors.phone && (
                  <p className="text-[11px] text-[#B23A2A] mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                  Tỉnh / Thành phố <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  {...register('province')}
                  placeholder="TP. Hồ Chí Minh"
                  className="text-xs rounded-xl border-[#E5E2DF]"
                />
                {errors.province && (
                  <p className="text-[11px] text-[#B23A2A] mt-1">{errors.province.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                  Quận / Huyện <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  {...register('district')}
                  placeholder="Quận 1"
                  className="text-xs rounded-xl border-[#E5E2DF]"
                />
                {errors.district && (
                  <p className="text-[11px] text-[#B23A2A] mt-1">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                  Phường / Xã <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  {...register('ward')}
                  placeholder="Phường Bến Nghé"
                  className="text-xs rounded-xl border-[#E5E2DF]"
                />
                {errors.ward && (
                  <p className="text-[11px] text-[#B23A2A] mt-1">{errors.ward.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                Số nhà, tên đường cụ thể <span className="text-[#B23A2A]">*</span>
              </label>
              <Input
                {...register('address')}
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Căn hộ 4B"
                className="text-xs rounded-xl border-[#E5E2DF]"
              />
              {errors.address && (
                <p className="text-[11px] text-[#B23A2A] mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-1.5">
                Ghi chú cho bếp bánh (tùy chọn)
              </label>
              <Input
                {...register('note')}
                placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến 15 phút..."
                className="text-xs rounded-xl border-[#E5E2DF]"
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="font-display text-base font-bold text-[#2A2725] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#006561] text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>Phương Thức Thanh Toán</span>
            </h2>

            <div className="space-y-3 pt-1">
              {/* COD Option */}
              <label
                onClick={() => setValue('paymentMethod', 'COD')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'COD'
                    ? 'border-[#006561] bg-[#006561]/5 ring-1 ring-[#006561]'
                    : 'border-[#E5E2DF] hover:border-[#006561]/40 hover:bg-[#FAF7F2]'
                }`}
              >
                <input
                  type="radio"
                  value="COD"
                  {...register('paymentMethod')}
                  className="mt-1 accent-[#006561]"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#2A2725]">
                    <Banknote className="w-4 h-4 text-[#006561]" />
                    <span>Thanh toán tiền mặt khi nhận bánh (COD)</span>
                  </div>
                  <p className="text-[11px] text-[#6B6661]">
                    Kiểm tra bánh tươi đúng khẩu vị trước khi gửi tiền cho shipper.
                  </p>
                </div>
              </label>

              {/* VietQR Option */}
              <label
                onClick={() => setValue('paymentMethod', 'VIETQR')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'VIETQR'
                    ? 'border-[#C9785C] bg-[#C9785C]/5 ring-1 ring-[#C9785C]'
                    : 'border-[#E5E2DF] hover:border-[#C9785C]/40 hover:bg-[#FAF7F2]'
                }`}
              >
                <input
                  type="radio"
                  value="VIETQR"
                  {...register('paymentMethod')}
                  className="mt-1 accent-[#C9785C]"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#2A2725]">
                    <QrCode className="w-4 h-4 text-[#C9785C]" />
                    <span>Chuyển khoản VietQR tự động (SePay Webhook)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9785C]/10 text-[#C9785C] font-bold">Khuyên dùng</span>
                  </div>
                  <p className="text-[11px] text-[#6B6661]">
                    Quét mã QR từ mọi app ngân hàng, hệ thống xác nhận thanh toán tự động trong 3 giây.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Voucher Card & Order Summary */}
        <div className="space-y-6">
          {/* Voucher Input Card */}
          <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2A2725] uppercase tracking-wider">
              <Ticket className="w-4 h-4 text-[#C9785C]" />
              <span>Mã Giảm Giá &amp; Voucher</span>
            </div>

            {appliedVoucher ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#006561]/8 border border-[#006561]/25">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006561] shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-xs text-[#006561] uppercase tracking-wider">
                      {appliedVoucher.code}
                    </span>
                    <p className="text-[11px] text-[#006561] font-medium">
                      Đã giảm {formatCurrency(appliedVoucher.discountAmount)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-xs font-semibold text-[#B23A2A] hover:underline cursor-pointer"
                >
                  Gỡ bỏ
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã (vd: HB10, FREESHIP)..."
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  className="text-xs uppercase font-mono tracking-wider rounded-xl border-[#E5E2DF] h-10"
                />
                <Button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={isApplyingVoucher || !voucherCodeInput.trim()}
                  className="bg-[#006561] hover:bg-[#004e4a] text-white text-xs font-bold uppercase tracking-wider px-4 h-10 rounded-xl cursor-pointer shrink-0"
                >
                  {isApplyingVoucher ? 'Kiểm tra...' : 'Áp dụng'}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 space-y-5 sticky top-24 shadow-xs">
            <h2 className="font-display text-base font-bold text-[#2A2725] border-b border-[#E5E2DF] pb-3">
              Tóm Tắt Đơn Bánh
            </h2>

            <div className="divide-y divide-[#E5E2DF]/60 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E5E2DF] shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-[#2A2725] truncate">{item.productName}</p>
                      <p className="text-[#6B6661] text-[11px]">Số lượng: x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#2A2725] shrink-0 font-display">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E2DF] pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#6B6661]">
                <span>Tạm tính tiền bánh:</span>
                <span className="font-medium text-[#2A2725]">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#6B6661] items-center">
                <span>Phí vận chuyển:</span>
                {shippingFee === 0 ? (
                  <span className="text-[#006561] font-semibold bg-[#006561]/8 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>Miễn phí (Đơn &ge; 299K)</span>
                  </span>
                ) : (
                  <span className="font-medium text-[#2A2725]">{formatCurrency(shippingFee)}</span>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#006561] font-semibold">
                  <span>Giảm giá ({appliedVoucher?.code}):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-3 border-t border-[#E5E2DF]">
                <span className="font-bold text-[#2A2725]">Tổng thanh toán:</span>
                <span className="text-xl font-bold font-display text-[#006561]">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-[#006561] hover:bg-[#004e4a] text-white rounded-full py-3 flex items-center justify-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <span>{isSubmitting ? 'Bếp đang xử lý...' : 'Xác Nhận Đặt Bánh'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B6661] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006561]" />
              <span>Cam kết 100% không đường tinh luyện</span>
            </div>
          </div>
        </div>
      </form>

      {/* VietQR Dynamic Modal with 15:00 Countdown & Automatic Polling */}
      {createdOrder && (
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent onClose={() => navigate('/orders')} className="max-w-md text-center p-6 sm:p-7 space-y-5 rounded-2xl border border-[#E5E2DF] bg-white">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-[#2A2725] flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-[#C9785C]" />
                <span>Quét Mã VietQR Chuyển Khoản</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6B6661]">
                Đơn hàng #{createdOrder.orderCode} • Tổng tiền: {formatCurrency(createdOrder.total)}
              </DialogDescription>
            </DialogHeader>

            {/* Countdown Timer Bar */}
            {!isPaidSuccess && !isExpired && (
              <div className="space-y-1.5 p-3 bg-[#FAF7F2] border border-[#E5E2DF] rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#6B6661]">
                    <Clock className="w-3.5 h-3.5 text-[#C9785C] animate-spin" />
                    <span>Thời gian giữ đơn bánh:</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-[#C9785C]">
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E2DF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9785C] transition-all duration-1000 rounded-full"
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
                  className="mt-2 rounded-full border-[#dc2626] text-[#dc2626] cursor-pointer"
                >
                  Về thực đơn bánh
                </Button>
              </div>
            )}

            {/* Success State */}
            {isPaidSuccess && (
              <div className="p-6 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] rounded-xl space-y-3 animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#16a34a] animate-bounce" />
                <p className="font-display text-lg font-bold">Thanh Toán Thành Công!</p>
                <p className="text-xs text-[#166534] leading-relaxed">
                  Hệ thống ngân hàng SePay đã đối soát thành công. Bếp bánh Hebekery đang nướng mẻ bánh tươi cho bạn!
                </p>
                <p className="text-[11px] text-[#6B6661]">Tự động chuyển trang sau 2 giây...</p>
              </div>
            )}

            {/* Normal QR Display */}
            {!isPaidSuccess && !isExpired && (
              <>
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#E5E2DF] rounded-xl shadow-xs">
                  {/* VietQR QuickLink image API */}
                  <img
                    src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${createdOrder.total}&addInfo=${encodeURIComponent(
                      createdOrder.orderCode
                    )}&accountName=${encodeURIComponent('TIEM BANH HEBEKERY')}`}
                    alt="VietQR Payment"
                    className="w-56 h-56 object-contain"
                  />
                  <div className="text-xs text-[#6B6661] space-y-1 mt-3 text-left w-full px-2">
                    <p>Ngân hàng: <strong className="text-[#2A2725]">MBBank (Quân Đội)</strong></p>
                    <p>Số tài khoản: <strong className="text-[#2A2725]">0987654321</strong></p>
                    <p>Chủ TK: <strong className="text-[#2A2725]">TIEM BANH HEBEKERY</strong></p>
                    <p>Nội dung CK: <strong className="text-[#006561] font-mono text-sm">{createdOrder.orderCode}</strong></p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[#006561] bg-[#006561]/8 p-2.5 rounded-xl border border-[#006561]/20">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Hệ thống tự động nhận diện thanh toán qua SePay Webhook...</span>
                </div>

                <Button
                  className="w-full bg-[#006561] hover:bg-[#004e4a] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
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
