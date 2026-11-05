import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { orderApi, reviewApi } from '@/api'
import type { Order, OrderItem, ProductReviewRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

export const OrderTrackingPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [actionType, setActionType] = useState<'CANCEL' | 'RETURN' | null>(null)
  const [reason, setReason] = useState('')

  // Review modal state
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể hủy đơn'
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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể gửi yêu cầu'
      toast.error(msg)
    },
  })

  const confirmReceivedMutation = useMutation({
    mutationFn: (id: string) => orderApi.confirmReceived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Xác nhận đã nhận hàng thành công! Hãy để lại nhận xét cho tiệm bánh nhé.')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xác nhận nhận hàng'
      toast.error(msg)
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: ProductReviewRequest }) =>
      reviewApi.submitReview(productId, data),
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!')
      setReviewingItem(null)
      setComment('')
      setRating(5)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể gửi đánh giá'
      toast.error(msg)
    },
  })

  const handleOpenReviewModal = (item: OrderItem) => {
    setReviewingItem(item)
    setRating(5)
    setHoverRating(0)
    setComment('')
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingItem) return
    if (!comment.trim()) {
      toast.error('Vui lòng viết cảm nhận của bạn về sản phẩm')
      return
    }

    reviewMutation.mutate({
      productId: reviewingItem.productId,
      data: {
        rating,
        comment: comment.trim(),
      },
    })
  }

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ tiếp nhận</Badge>
      case 'PROCESSING':
        return <Badge variant="accent">Đang làm bánh</Badge>
      case 'SHIPPING':
        return <Badge variant="default">Đang giao hàng</Badge>
      case 'DELIVERED':
        return <Badge variant="default">Shipper đã giao</Badge>
      case 'RECEIVED':
        return <Badge variant="success">Đã nhận hàng</Badge>
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
          Theo dõi tiến độ nướng bánh, vận chuyển, xác nhận nhận hàng và đánh giá chất lượng
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#78716c]">Đang nạp danh sách đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-[#e7e5e4] bg-white p-8 space-y-3">
          <Package className="w-10 h-10 text-[#a8a29e] mx-auto" />
          <p className="font-semibold text-sm text-[#1c1917]">Bạn chưa có đơn hàng nào</p>
          <p className="text-xs text-[#78716c]">
            Hãy đặt thử một chiếc bánh nguyên cám thanh ngọt từ Hebekery nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const canConfirmReceived =
              order.orderStatus === 'SHIPPING' || order.orderStatus === 'DELIVERED'
            const isReceived = order.orderStatus === 'RECEIVED'

            return (
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
                      <strong
                        className={
                          order.paymentStatus === 'PAID' ? 'text-[#15803d]' : 'text-[#d97724]'
                        }
                      >
                        {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </strong>
                    </span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#f5f5f4]">
                  {order.items?.map((item) => (
                    <div
                      key={item.id || item.productId}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                          alt={item.productName}
                          className="w-12 h-12 object-cover border border-[#e7e5e4] shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-[#1c1917] truncate">
                            {item.productName}
                          </p>
                          <p className="text-[#78716c]">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-[#1c1917]">
                          {formatCurrency(item.total)}
                        </span>

                        {/* Review Button for RECEIVED orders */}
                        {isReceived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewModal(item)}
                            className="h-7 px-2.5 text-[11px] flex items-center gap-1 border-[#d97724] text-[#d97724] hover:bg-[#d97724]/10"
                          >
                            <Star className="w-3 h-3 fill-[#d97724]" />
                            <span>Đánh giá bánh</span>
                          </Button>
                        )}
                      </div>
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
                    {/* Confirm Received Button */}
                    {canConfirmReceived && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={confirmReceivedMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              'Bạn xác nhận đã nhận được kiện bánh tươi ngon và đúng đơn đặt hàng?'
                            )
                          ) {
                            confirmReceivedMutation.mutate(order.id)
                          }
                        }}
                        className="bg-[#15803d] hover:bg-[#166534] flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã nhận được hàng</span>
                      </Button>
                    )}

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

                    {isReceived && !order.returnStatus && (
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
            )
          })}
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

      {/* Product Review Modal */}
      <Dialog open={!!reviewingItem} onOpenChange={() => setReviewingItem(null)}>
        <DialogContent onClose={() => setReviewingItem(null)} className="max-w-md">
          {reviewingItem && (
            <form onSubmit={handleReviewSubmit}>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#d97724] fill-[#d97724]" />
                  <span>Đánh Giá Bánh Dinh Dưỡng</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-[#78716c]">
                  Chia sẻ cảm nhận chân thực của bạn để giúp cộng đồng ăn sạch sống khỏe chọn bánh ngon hơn
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* Product Summary */}
                <div className="flex items-center gap-3 p-2.5 bg-[#faf8f5] border border-[#e7e5e4]">
                  <img
                    src={optimizeCloudinaryUrl(reviewingItem.imageUrl, 100)}
                    alt={reviewingItem.productName}
                    className="w-12 h-12 object-cover border border-[#e7e5e4]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#1c1917]">
                      {reviewingItem.productName}
                    </h4>
                    <p className="text-[11px] text-[#78716c]">
                      Đã mua với giá: {formatCurrency(reviewingItem.price)}
                    </p>
                  </div>
                </div>

                {/* Star Rating Selector */}
                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-semibold text-[#1c1917]">
                    Mức độ hài lòng của bạn:
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || rating)
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110 select-none"
                        >
                          <Star
                            className={cn(
                              'w-7 h-7 transition-colors',
                              isFilled
                                ? 'text-[#d97724] fill-[#d97724]'
                                : 'text-[#d6d3d1] fill-none'
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-xs font-bold text-[#d97724]">
                    {rating === 5 && '⭐ Tuyệt vời! Rất hợp khẩu vị'}
                    {rating === 4 && '⭐ Bánh ngon, vừa miệng'}
                    {rating === 3 && '⭐ Bình thường, tạm ổn'}
                    {rating === 2 && '⭐ Chưa thực sự hài lòng'}
                    {rating === 1 && '⭐ Kém, không hài lòng'}
                  </span>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1c1917]">
                    Nhận xét chi tiết *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ví dụ: Bánh thơm ngậy mùi hạnh nhân, độ ngọt thanh tự nhiên từ mật ong, rất thích hợp ăn sáng trước khi tập gym..."
                    className="w-full border border-[#d6d3d1] bg-white p-2.5 text-xs text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#47654c]"
                    required
                  />
                  <span className="text-[10px] text-[#78716c] block text-right">
                    {comment.length} ký tự
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewingItem(null)}
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" size="sm" disabled={reviewMutation.isPending || !comment.trim()}>
                  {reviewMutation.isPending ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
