import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Clock, Truck, CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react'
import { orderApi } from '@/api'
import type { Order } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'

export const OrderTrackingPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [actionType, setActionType] = useState<'CANCEL' | 'RETURN' | null>(null)
  const [reason, setReason] = useState('')

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderApi.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Hủy đơn hàng thành công')
      setActionType(null)
      setReason('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể hủy đơn'
      toast.error(msg)
    },
  })

  const returnMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderApi.requestReturn(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Đã gửi yêu cầu đổi trả cho tiệm bánh')
      setActionType(null)
      setReason('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể gửi yêu cầu'
      toast.error(msg)
    },
  })

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case 'PROCESSING':
        return <Badge variant="accent">Đang làm bánh</Badge>
      case 'SHIPPING':
        return <Badge variant="default">Đang giao</Badge>
      case 'DELIVERED':
      case 'RECEIVED':
        return <Badge variant="success">Hoàn thành</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>
      case 'RETURN_REQUESTED':
        return <Badge variant="accent">Yêu cầu đổi trả</Badge>
      case 'RETURNED':
        return <Badge variant="secondary">Đã đổi trả</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Đơn Hàng Của Bạn
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Theo dõi tiến độ nướng bánh, vận chuyển và quản lý yêu cầu đổi trả
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#78716c]">Đang nạp danh sách đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-[#e7e5e4] bg-white p-8 space-y-3">
          <Package className="w-10 h-10 text-[#a8a29e] mx-auto" />
          <p className="font-semibold text-sm text-[#1c1917]">Bạn chưa có đơn hàng nào</p>
          <p className="text-xs text-[#78716c]">Hãy đặt thử một chiếc bánh nguyên cám thanh ngọt từ Hebekery nhé!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-[#e7e5e4] bg-white p-5 space-y-4 hover:border-[#47654c] transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f5f4] pb-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1c1917]">#{order.orderCode}</span>
                  <span className="text-[#78716c]">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#78716c]">
                    {order.paymentMethod === 'VIETQR' ? 'VietQR' : 'COD'} •{' '}
                    <strong className={order.paymentStatus === 'PAID' ? 'text-[#15803d]' : 'text-[#d97724]'}>
                      {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </strong>
                  </span>
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#f5f5f4]">
                {order.items?.map((item) => (
                  <div key={item.id || item.productId} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                        alt={item.productName}
                        className="w-12 h-12 object-cover border border-[#e7e5e4]"
                      />
                      <div>
                        <p className="font-semibold text-[#1c1917]">{item.productName}</p>
                        <p className="text-[#78716c]">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1c1917]">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f5f5f4] text-xs">
                <div>
                  <span className="text-[#78716c]">Tổng giá trị: </span>
                  <strong className="text-sm font-black text-[#47654c]">
                    {formatCurrency(order.total)}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {order.orderStatus === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setActionType('CANCEL')
                      }}
                      className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10"
                    >
                      Hủy đơn hàng
                    </Button>
                  )}

                  {order.orderStatus === 'RECEIVED' && !order.returnStatus && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setActionType('RETURN')
                      }}
                    >
                      Yêu cầu đổi trả
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel / Return Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent onClose={() => setActionType(null)}>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'CANCEL' ? 'Xác Nhận Hủy Đơn Hàng' : 'Gửi Yêu Cầu Đổi Trả'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Đơn hàng #{selectedOrder?.orderCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold text-[#1c1917]">
              Lý do {actionType === 'CANCEL' ? 'hủy đơn' : 'đổi trả'} *
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setActionType(null)}>
              Đóng
            </Button>
            <Button
              variant={actionType === 'CANCEL' ? 'destructive' : 'default'}
              size="sm"
              disabled={!reason.trim()}
              onClick={() => {
                if (!selectedOrder) return
                if (actionType === 'CANCEL') {
                  cancelMutation.mutate({ id: selectedOrder.id, reason })
                } else {
                  returnMutation.mutate({ id: selectedOrder.id, reason })
                }
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
