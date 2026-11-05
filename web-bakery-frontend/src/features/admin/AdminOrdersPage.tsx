import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Truck, Check, X, RotateCcw, Loader2 } from 'lucide-react'
import { orderApi } from '@/api'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/utils/format'
import { toast } from 'sonner'

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalType, setModalType] = useState<'STATUS' | 'RETURN' | null>(null)

  // Status Update Form State
  const [targetStatus, setTargetStatus] = useState('SHIPPING')
  const [carrier, setCarrier] = useState('GiaoHangNhanh')
  const [trackingCode, setTrackingCode] = useState('')

  // Return Review State
  const [returnDecision, setReturnDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [adminNote, setAdminNote] = useState('')

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['admin-orders', keyword, statusFilter],
    queryFn: () =>
      orderApi.adminSearchOrders({
        keyword: keyword.trim() || undefined,
        status: statusFilter || undefined,
        size: 50,
      }),
  })

  const orders = orderData?.content || []

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: () => {
      if (!selectedOrder) throw new Error('No order')
      return orderApi.adminUpdateStatus(selectedOrder.id, targetStatus, carrier, trackingCode)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      setModalType(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Thao tác thất bại'
      toast.error(msg)
    },
  })

  // Review Return Mutation
  const reviewReturnMutation = useMutation({
    mutationFn: () => {
      if (!selectedOrder) throw new Error('No order')
      return orderApi.adminReviewReturn(selectedOrder.id, returnDecision, adminNote)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success(
        returnDecision === 'APPROVED'
          ? 'Đã duyệt đổi trả và tự động hoàn kho sản phẩm thành công!'
          : 'Đã từ chối yêu cầu đổi trả'
      )
      setModalType(null)
      setAdminNote('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Thao tác thất bại'
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
    <div className="space-y-6">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-xs text-[#78716c] mt-0.5">
          Theo dõi vòng đời đơn hàng, xác nhận giao hàng, duyệt yêu cầu đổi trả và đối soát tự động
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-[#e7e5e4]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#a8a29e]" />
          <Input
            placeholder="Tìm theo mã đơn, tên khách hàng hoặc SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56 h-10 border border-[#d6d3d1] bg-white px-3 text-xs text-[#1c1917]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="PROCESSING">Đang làm bánh</option>
          <option value="SHIPPING">Đang giao</option>
          <option value="DELIVERED">Đã giao hàng</option>
          <option value="RECEIVED">Đã nhận hàng</option>
          <option value="RETURN_REQUESTED">Yêu cầu đổi trả</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#faf8f5] border-b border-[#e7e5e4] text-[#78716c] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Mã Đơn</th>
              <th className="py-3 px-4">Khách Hàng</th>
              <th className="py-3 px-4">Ngày Đặt</th>
              <th className="py-3 px-4">Thanh Toán</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4">Tổng Tiền</th>
              <th className="py-3 px-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f4]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#78716c]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#47654c]" />
                  Đang nạp danh sách đơn hàng...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#78716c]">
                  Không tìm thấy đơn hàng nào
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#1c1917]">#{order.orderCode}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#1c1917]">{order.customerName}</p>
                    <p className="text-[11px] text-[#78716c]">{order.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-[#78716c]">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className="block font-medium">
                      {order.paymentMethod === 'VIETQR' ? 'VietQR' : 'COD'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        order.paymentStatus === 'PAID' ? 'text-[#15803d]' : 'text-[#d97724]'
                      }`}
                    >
                      {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(order.orderStatus)}</td>
                  <td className="py-3 px-4 font-bold text-[#47654c]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.orderStatus === 'RETURN_REQUESTED' ? (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setModalType('RETURN')
                          }}
                        >
                          Duyệt Đổi Trả
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setTargetStatus(
                              order.orderStatus === 'PENDING'
                                ? 'PROCESSING'
                                : order.orderStatus === 'PROCESSING'
                                ? 'SHIPPING'
                                : 'DELIVERED'
                            )
                            setModalType('STATUS')
                          }}
                        >
                          Chuyển TT
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chuyển Trạng Thái */}
      <Dialog open={modalType === 'STATUS'} onOpenChange={() => setModalType(null)}>
        <DialogContent onClose={() => setModalType(null)}>
          <DialogHeader>
            <DialogTitle>Cập Nhật Trạng Thái Đơn Hàng</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Đơn hàng #{selectedOrder?.orderCode} • Hiện tại: {selectedOrder?.orderStatus}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1917] mb-1">
                Trạng thái tiếp theo *
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full h-10 border border-[#d6d3d1] bg-white px-3 text-xs text-[#1c1917]"
              >
                <option value="PROCESSING">PROCESSING - Đang làm bánh</option>
                <option value="SHIPPING">SHIPPING - Bàn giao vận chuyển</option>
                <option value="DELIVERED">DELIVERED - Đã giao hàng thành công (Tự động trừ kho)</option>
                <option value="CANCELLED">CANCELLED - Hủy đơn</option>
              </select>
            </div>

            {targetStatus === 'SHIPPING' && (
              <div className="grid grid-cols-2 gap-3 border border-[#e7e5e4] p-3 bg-[#faf8f5]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1917] mb-1">
                    Đơn vị vận chuyển
                  </label>
                  <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1917] mb-1">
                    Mã vận đơn
                  </label>
                  <Input
                    placeholder="VD: GHN-12345"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>
              Đóng
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate()}
            >
              {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Xác Nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Duyệt Đổi Trả */}
      <Dialog open={modalType === 'RETURN'} onOpenChange={() => setModalType(null)}>
        <DialogContent onClose={() => setModalType(null)}>
          <DialogHeader>
            <DialogTitle>Xét Duyệt Yêu Cầu Đổi Trả Hàng</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Đơn hàng #{selectedOrder?.orderCode} • Lý do khách đưa ra: "{selectedOrder?.returnReason}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1917] mb-1">Quyết định *</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={returnDecision === 'APPROVED' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setReturnDecision('APPROVED')}
                >
                  Đồng ý (Hoàn kho)
                </Button>
                <Button
                  type="button"
                  variant={returnDecision === 'REJECTED' ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => setReturnDecision('REJECTED')}
                >
                  Từ chối đổi trả
                </Button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1c1917] mb-1">Ghi chú phản hồi khách</label>
              <Input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ví dụ: Đã nhận lại bánh bị lỗi và gửi đơn mới..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setModalType(null)}>
              Đóng
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={reviewReturnMutation.isPending}
              onClick={() => reviewReturnMutation.mutate()}
            >
              {reviewReturnMutation.isPending ? 'Đang duyệt...' : 'Hoàn Tất Duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
