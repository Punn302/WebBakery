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
  Sparkles,
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
    setComment('')
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingItem || !comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-[#d97724] text-[#d97724] bg-[#d97724]/5 rounded-full px-2.5 py-0.5">
            <Clock className="w-3 h-3 mr-1" /> Chờ xác nhận
          </Badge>
        )
      case 'CONFIRMED':
        return (
          <Badge variant="secondary" className="bg-[#47654c]/10 text-[#47654c] rounded-full px-2.5 py-0.5">
            <CheckCircle className="w-3 h-3 mr-1" /> Đã xác nhận & Đang nướng
          </Badge>
        )
      case 'SHIPPING':
        return (
          <Badge variant="accent" className="bg-[#d97724] text-white rounded-full px-2.5 py-0.5">
            <Truck className="w-3 h-3 mr-1" /> Đang giao bánh
          </Badge>
        )
      case 'DELIVERED':
        return (
          <Badge variant="default" className="bg-[#15803d] text-white rounded-full px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Đã giao đến nơi
          </Badge>
        )
      case 'RECEIVED':
        return (
          <Badge variant="default" className="bg-[#47654c] text-white rounded-full px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
          </Badge>
        )
      case 'CANCELLED':
        return <Badge variant="destructive" className="rounded-full px-2.5 py-0.5">Đã hủy</Badge>
      case 'RETURN_REQUESTED':
        return <Badge variant="accent" className="rounded-full px-2.5 py-0.5">Yêu cầu đổi trả</Badge>
      case 'RETURNED':
        return <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">Đã đổi trả</Badge>
      default:
        return <Badge variant="outline" className="rounded-full px-2.5 py-0.5">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-text">
      {/* Header */}
      <div className="border-b border-[#E5E2DF] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
          <span>Lịch sử đặt bánh Hebekery</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2A2725] tracking-tight">
          Đơn Hàng Của Bạn
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6661] mt-1.5">
          Theo dõi tiến độ nướng bánh, vận chuyển, xác nhận nhận hàng và đánh giá chất lượng
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#6B6661]">Đang nạp danh sách đơn bánh...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-[#E5E2DF] bg-white rounded-3xl p-8 space-y-3 shadow-xs">
          <Package className="w-10 h-10 text-[#C9785C] mx-auto" />
          <p className="font-display text-base font-bold text-[#2A2725]">Bạn chưa có đơn bánh nào</p>
          <p className="text-xs text-[#6B6661]">
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
                className="rounded-3xl border border-[#E5E2DF] bg-white p-5 sm:p-6 space-y-4 shadow-xs"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2DF]/60 pb-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-[#2A2725] text-sm">#{order.orderCode}</span>
                    <span className="text-[#6B6661] text-[11px]">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-[#6B6661]">
                      {order.paymentMethod === 'VIETQR' ? 'VietQR SePay' : 'COD'} •{' '}
                      <strong
                        className={
                          order.paymentStatus === 'PAID' ? 'text-[#15803d]' : 'text-[#C9785C]'
                        }
                      >
                        {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </strong>
                    </span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#E5E2DF]/50">
                  {order.items?.map((item) => (
                    <div
                      key={item.id || item.productId}
                      className="py-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={optimizeCloudinaryUrl(item.imageUrl, 100)}
                          alt={item.productName}
                          className="w-13 h-13 rounded-2xl object-cover border border-[#E5E2DF] shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-[#2A2725] truncate">
                            {item.productName}
                          </p>
                          <p className="text-[#6B6661] text-[11px] mt-0.5">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-[#2A2725]">
                          {formatCurrency(item.total)}
                        </span>

                        {/* Review Button for RECEIVED orders */}
                        {isReceived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewModal(item)}
                            className="h-7.5 px-3 text-[11px] flex items-center gap-1 border-[#C9785C] text-[#C9785C] hover:bg-[#C9785C]/10 rounded-full cursor-pointer font-medium"
                          >
                            <Star className="w-3 h-3 fill-[#C9785C]" />
                            <span>Đánh giá bánh</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E2DF]/60 text-xs">
                  <div>
                    <span className="text-[#6B6661]">Tổng giá trị đơn bánh: </span>
                    <strong className="font-display text-base font-bold text-[#2A2725]">
                      {formatCurrency(order.total)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Confirm Received Button */}
                    {canConfirmReceived && (
                      <Button
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
                        className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã nhận bánh</span>
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
                        className="rounded-xl border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 text-xs px-3.5 cursor-pointer"
                      >
                        Hủy đơn bánh
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
                        className="rounded-xl text-xs px-3.5 cursor-pointer"
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
        <DialogContent onClose={() => setActionType(null)} className="rounded-3xl border border-[#E5E2DF] p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[#2A2725]">
              {actionType === 'CANCEL' ? 'Xác Nhận Hủy Đơn Hàng' : 'Gửi Yêu Cầu Đổi Trả'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Đơn hàng #{selectedOrder?.orderCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="block text-xs font-medium text-[#2A2725]">
              Lý do {actionType === 'CANCEL' ? 'hủy đơn' : 'đổi trả'} <span className="text-[#C9785C]">*</span>
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              className="rounded-xl border-[#E5E2DF] text-xs h-9.5"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setActionType(null)} className="rounded-xl text-xs cursor-pointer">
              Đóng
            </Button>
            <Button
              variant={actionType === 'CANCEL' ? 'destructive' : 'default'}
              size="sm"
              disabled={!reason.trim()}
              className="rounded-xl text-xs cursor-pointer"
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
        <DialogContent onClose={() => setReviewingItem(null)} className="max-w-md rounded-3xl border border-[#E5E2DF] p-6 space-y-4">
          {reviewingItem && (
            <form onSubmit={handleReviewSubmit}>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-[#2A2725] flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#C9785C] fill-[#C9785C]" />
                  <span>Đánh Giá Bánh Dinh Dưỡng</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6B6661]">
                  Chia sẻ cảm nhận chân thực để giúp cộng đồng ăn sạch chọn bánh ngon hơn
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* Product Summary */}
                <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] border border-[#E5E2DF] rounded-2xl">
                  <img
                    src={optimizeCloudinaryUrl(reviewingItem.imageUrl, 100)}
                    alt={reviewingItem.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E5E2DF]"
                  />
                  <div>
                    <h4 className="font-display font-bold text-xs text-[#2A2725]">
                      {reviewingItem.productName}
                    </h4>
                    <p className="text-[11px] text-[#6B6661] mt-0.5">
                      Đã mua với giá: {formatCurrency(reviewingItem.price)}
                    </p>
                  </div>
                </div>

                {/* Star Rating Selector */}
                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-medium text-[#2A2725]">
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
                                ? 'text-[#C9785C] fill-[#C9785C]'
                                : 'text-[#E5E2DF] fill-none'
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-xs font-semibold text-[#C9785C]">
                    {rating === 5 && '⭐ Tuyệt vời! Rất hợp khẩu vị'}
                    {rating === 4 && '⭐ Bánh ngon, vừa miệng'}
                    {rating === 3 && '⭐ Bình thường, tạm ổn'}
                    {rating === 2 && '⭐ Chưa thực sự hài lòng'}
                    {rating === 1 && '⭐ Kém, không hài lòng'}
                  </span>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#2A2725]">
                    Nhận xét chi tiết <span className="text-[#C9785C]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ví dụ: Bánh thơm ngậy mùi hạnh nhân, độ ngọt thanh tự nhiên từ mật ong, rất thích hợp ăn sáng trước khi tập gym..."
                    className="w-full rounded-2xl border border-[#E5E2DF] bg-white p-3 text-xs text-[#2A2725] placeholder:text-[#6B6661]/60 focus:outline-none focus:border-[#006561]"
                    required
                  />
                  <span className="text-[10px] text-[#6B6661] block text-right">
                    {comment.length} ký tự
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewingItem(null)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={reviewMutation.isPending || !comment.trim()}
                  className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-semibold px-5 cursor-pointer shadow-xs"
                >
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
