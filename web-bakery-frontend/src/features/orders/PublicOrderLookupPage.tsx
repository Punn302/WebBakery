import React, { useState } from 'react'
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Phone,
  Flame,
} from 'lucide-react'
import { orderApi } from '@/api'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'

export const PublicOrderLookupPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchedOrders, setSearchedOrders] = useState<Order[] | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchTerm.trim()
    if (!query) {
      toast.error('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại')
      return
    }

    try {
      setIsSearching(true)
      // Determine if query is phone or orderId/orderCode
      const isPhone = /^[0-9+]{8,15}$/.test(query)
      const params = isPhone ? { phone: query } : { orderId: query }
      const results = await orderApi.trackOrders(params)
      setSearchedOrders(results)

      if (results.length === 0) {
        toast.info('Không tìm thấy đơn hàng phù hợp')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tra cứu đơn hàng'
      toast.error(msg)
      setSearchedOrders([])
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusStep = (status: Order['orderStatus']): number => {
    switch (status) {
      case 'PENDING':
        return 1
      case 'PROCESSING':
        return 2
      case 'SHIPPING':
      case 'DELIVERED':
        return 3
      case 'RECEIVED':
        return 4
      case 'CANCELLED':
        return -1
      default:
        return 1
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 pb-16">
      {/* ================= Hero Search Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#eadbce] p-8 sm:p-10 tactile-card text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
          <span>Theo Dõi Hành Trình Mẻ Bánh Tươi</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#4a3728]">
          Tra Cứu Đơn Hàng Công Khai
        </h1>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-xl mx-auto leading-relaxed">
          Theo dõi hành trình mẻ bánh từ lúc nhào bột, nướng mới tại lò đến khi shipper giao tận tay bạn còn thơm nóng.
        </p>

        {/* Quick Search Form */}
        <div className="max-w-lg mx-auto pt-2">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716c]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập mã đơn hàng hoặc SĐT đặt hàng..."
                className="pl-10 h-11 bg-[#faf8f5] border-[#eadbce] rounded-full text-xs placeholder:text-[#a8a29e] focus-visible:ring-[#4a3728]"
              />
            </div>
            <Button
              type="submit"
              size="default"
              disabled={isSearching}
              className="h-11 px-6 bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold text-xs rounded-full shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm btn-tactile"
            >
              <Search className="w-4 h-4 text-[#d97724]" />
              <span>{isSearching ? 'Đang tìm...' : 'Tra cứu'}</span>
            </Button>
          </form>
        </div>
      </div>

      {/* ================= Results Section ================= */}
      {searchedOrders !== null && (
        <div className="space-y-8">
          {searchedOrders.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-dashed border-[#eadbce] bg-white p-8 space-y-2">
              <Package className="w-10 h-10 text-[#a8a29e] mx-auto" />
              <p className="font-headline text-base font-bold text-[#4a3728]">
                Không tìm thấy đơn hàng nào với thông tin &ldquo;{searchTerm}&rdquo;
              </p>
              <p className="text-xs text-[#78716c]">
                Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại đã sử dụng khi đặt bánh.
              </p>
            </div>
          ) : (
            searchedOrders.map((order) => {
              const currentStep = getStatusStep(order.orderStatus)
              const isCancelled = order.orderStatus === 'CANCELLED'

              const steps = [
                { step: 1, label: 'Đã tiếp nhận', icon: Clock },
                { step: 2, label: 'Đang làm bánh', icon: Flame },
                { step: 3, label: 'Đang giao hỏa tốc', icon: Truck },
                { step: 4, label: 'Giao thành công', icon: CheckCircle2 },
              ]

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#eadbce] p-6 sm:p-8 space-y-6 tactile-card"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadbce] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline text-xl font-bold text-[#4a3728]">
                          #{order.orderCode}
                        </h2>
                        <span
                          className={`text-xs font-semibold px-3 py-0.5 rounded-full ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-[#47654c]/10 text-[#47654c]'
                              : 'bg-[#d97724]/10 text-[#d97724]'
                          }`}
                        >
                          {order.paymentStatus === 'PAID'
                            ? 'Đã thanh toán (VietQR)'
                            : 'Thanh toán COD khi nhận bánh'}
                        </span>
                      </div>
                      <p className="text-xs text-[#78716c] mt-1">
                        Ngày đặt bánh: {formatDate(order.createdAt)} • Người nhận:{' '}
                        <strong>{order.customerName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#78716c]">Tổng thanh toán:</span>
                      <p className="font-headline text-2xl font-bold text-[#4a3728]">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Visual 4-Step Bakery Progress Timeline */}
                  {!isCancelled ? (
                    <div className="py-4">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#eadbce] -z-0" />
                        <div
                          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#47654c] -z-0 transition-all duration-500"
                          style={{
                            width: `${((Math.max(currentStep, 1) - 1) / (steps.length - 1)) * 90}%`,
                          }}
                        />

                        {/* Step Nodes */}
                        {steps.map((st) => {
                          const isDone = currentStep >= st.step
                          const isCurrent = currentStep === st.step
                          const IconComp = st.icon

                          return (
                            <div
                              key={st.step}
                              className="relative z-10 flex flex-col items-center gap-2 bg-white px-2"
                            >
                              <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isCurrent
                                    ? 'bg-[#4a3728] text-white ring-4 ring-[#eadbce] scale-110 shadow-sm'
                                    : isDone
                                    ? 'bg-[#47654c] text-white'
                                    : 'bg-[#faf8f5] text-[#a8a29e] border border-[#eadbce]'
                                }`}
                              >
                                <IconComp className="w-5 h-5" />
                              </div>
                              <span
                                className={`text-xs font-medium text-center whitespace-nowrap ${
                                  isCurrent
                                    ? 'text-[#4a3728] font-bold'
                                    : isDone
                                    ? 'text-[#47654c]'
                                    : 'text-[#a8a29e]'
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="font-bold">Đơn hàng này đã bị hủy</p>
                        <p className="text-[11px] text-[#991b1b]">
                          Nếu quý khách có bất kỳ thắc mắc nào, vui lòng liên hệ hotline 1900 6828 để
                          được hỗ trợ hoàn tiền hoặc đặt lại bánh mới.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2-Column Details Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#eadbce]">
                    {/* Items List */}
                    <div className="space-y-3">
                      <h3 className="font-headline text-sm font-bold text-[#4a3728]">
                        Chi Tiết Món Bánh Trong Kiện
                      </h3>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#eadbce] text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              {item.imageUrl && (
                                <img
                                  src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                                  alt={item.productName}
                                  className="w-10 h-10 object-cover rounded-lg border border-[#eadbce]"
                                />
                              )}
                              <div>
                                <span className="font-semibold text-[#4a3728] block">
                                  {item.productName}
                                </span>
                                <span className="text-[11px] text-[#78716c]">
                                  Số lượng: x{item.quantity}
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-[#4a3728]">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Reassurance */}
                    <div className="space-y-3">
                      <h3 className="font-headline text-sm font-bold text-[#4a3728]">
                        Thông Tin Giao Nhận &amp; Bếp Nướng
                      </h3>
                      <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#eadbce] space-y-2.5 text-xs text-[#78716c]">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#4a3728] shrink-0 mt-0.5" />
                          <span>
                            Địa chỉ: <strong>{order.address}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#4a3728] shrink-0" />
                          <span>
                            Số điện thoại: <strong>{order.phone}</strong>
                          </span>
                        </div>
                        <div className="pt-2 border-t border-[#eadbce] flex items-center justify-between">
                          <span className="text-[#47654c] font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Đổi trả 1-1 trong 24h
                          </span>
                          <span className="text-[11px] text-[#78716c]">Hotline: 1900 6828</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
