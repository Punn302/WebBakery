import React, { useState } from 'react'
import { Search, Package, Clock, Truck, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react'
import { orderApi } from '@/api'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

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
        return 3
      case 'DELIVERED':
      case 'RECEIVED':
        return 4
      case 'CANCELLED':
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return 0
      default:
        return 1
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="text-center space-y-2 border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Tra Cứu Đơn Hàng Công Khai
        </h1>
        <p className="text-xs text-[#78716c] max-w-lg mx-auto">
          Nhập mã đơn hàng (ví dụ: HBK...) hoặc số điện thoại đặt hàng để theo dõi tiến độ nướng bánh và vận chuyển tức thì.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập mã đơn hàng hoặc SĐT đặt hàng..."
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" size="default" disabled={isSearching} className="shrink-0 flex items-center gap-1.5">
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Đang tìm...' : 'Tra cứu'}</span>
          </Button>
        </form>
      </div>

      {/* Results Section */}
      {searchedOrders !== null && (
        <div className="space-y-6 pt-4">
          {searchedOrders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#e7e5e4] bg-white p-6 space-y-2">
              <Package className="w-10 h-10 text-[#a8a29e] mx-auto" />
              <p className="font-semibold text-sm text-[#1c1917]">
                Không tìm thấy đơn hàng nào với thông tin "{searchTerm}"
              </p>
              <p className="text-xs text-[#78716c]">
                Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại đã sử dụng khi thanh toán.
              </p>
            </div>
          ) : (
            searchedOrders.map((order) => {
              const currentStep = getStatusStep(order.orderStatus)
              const isCancelled = order.orderStatus === 'CANCELLED'

              const steps = [
                { step: 1, label: 'Chờ tiếp nhận', icon: Clock },
                { step: 2, label: 'Đang làm bánh', icon: Package },
                { step: 3, label: 'Đang giao hàng', icon: Truck },
                { step: 4, label: 'Đã nhận bánh', icon: CheckCircle2 },
              ]

              return (
                <div
                  key={order.id}
                  className="border border-[#e7e5e4] bg-white p-6 space-y-6 shadow-xs"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5f5f4] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-extrabold text-base text-[#1c1917]">
                          #{order.orderCode}
                        </h2>
                        <Badge
                          variant={
                            order.paymentStatus === 'PAID' ? 'success' : 'secondary'
                          }
                        >
                          {order.paymentStatus === 'PAID'
                            ? 'Đã thanh toán'
                            : 'Thanh toán COD'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#78716c] mt-0.5">
                        Ngày đặt: {formatDate(order.createdAt)} • Người nhận:{' '}
                        <strong>{order.customerName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#78716c] block">Tổng tiền đơn</span>
                      <span className="text-base font-black text-[#47654c]">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Timeline / Stepper */}
                  {!isCancelled ? (
                    <div className="py-2">
                      <div className="grid grid-cols-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e7e5e4] -z-0" />
                        <div
                          className="absolute top-4 left-6 h-0.5 bg-[#47654c] -z-0 transition-all duration-500"
                          style={{
                            width: `${Math.max(0, (currentStep - 1) / 3) * 100}%`,
                          }}
                        />

                        {steps.map((st) => {
                          const Icon = st.icon
                          const isDone = currentStep >= st.step
                          const isCurrent = currentStep === st.step

                          return (
                            <div key={st.step} className="flex flex-col items-center text-center relative z-10">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-none flex items-center justify-center transition-colors',
                                  isDone
                                    ? 'bg-[#47654c] text-white'
                                    : 'bg-[#f5f5f4] text-[#a8a29e] border border-[#e7e5e4]',
                                  isCurrent && 'ring-2 ring-[#47654c] ring-offset-2'
                                )}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={cn(
                                  'text-[11px] mt-2 font-medium',
                                  isDone ? 'text-[#1c1917] font-semibold' : 'text-[#78716c]'
                                )}
                              >
                                {st.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Đơn hàng này đã bị hủy.</span>
                    </div>
                  )}

                  {/* Shipping & Carrier Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf8f5] p-4 border border-[#e7e5e4] text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-[#1c1917] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#47654c]" />
                        <span>Địa chỉ nhận bánh:</span>
                      </span>
                      <p className="text-[#57534e] pl-5 leading-relaxed">{order.address}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-[#1c1917] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#47654c]" />
                        <span>Thông tin vận chuyển:</span>
                      </span>
                      <p className="text-[#57534e] pl-5">
                        Đơn vị vận chuyển:{' '}
                        <strong>{order.shippingCarrier || 'Đang điều phối shipper'}</strong>
                      </p>
                      {order.trackingCode && (
                        <p className="text-[#57534e] pl-5">
                          Mã vận đơn: <strong className="font-mono text-[#d97724]">{order.trackingCode}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                      Danh Sách Bánh Trong Đơn:
                    </span>
                    <div className="divide-y divide-[#f5f5f4] border border-[#f5f5f4]">
                      {order.items?.map((it) => (
                        <div key={it.id || it.productId} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={optimizeCloudinaryUrl(it.imageUrl, 100)}
                              alt={it.productName}
                              className="w-10 h-10 object-cover border border-[#e7e5e4]"
                            />
                            <div>
                              <p className="font-semibold text-[#1c1917]">{it.productName}</p>
                              <p className="text-[#78716c]">
                                {formatCurrency(it.price)} x {it.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[#1c1917]">
                            {formatCurrency(it.total)}
                          </span>
                        </div>
                      ))}
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
