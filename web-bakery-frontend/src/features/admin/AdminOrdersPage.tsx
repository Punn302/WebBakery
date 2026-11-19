import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Truck,
  Check,
  X,
  RotateCcw,
  Loader2,
  Eye,
  Package,
  Ticket,
  Printer,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Copy,
  Phone,
  User,
  Calendar,
  CreditCard,
  MapPin,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { orderApi } from '@/api'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/utils/format'
import { toast } from 'sonner'
import { OrderInvoicePrintModal } from '@/features/orders/OrderInvoicePrintModal'
import { cn } from '@/utils/cn'

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [page, setPage] = useState(0)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailedOrder, setDetailedOrder] = useState<Order | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [modalType, setModalType] = useState<'STATUS' | 'RETURN' | 'DETAIL' | null>(null)
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0)
  }, [keyword, statusFilter, paymentMethodFilter, paymentStatusFilter])

  // Status Update Form State
  const [targetStatus, setTargetStatus] = useState('SHIPPING')
  const [carrier, setCarrier] = useState('GiaoHangNhanh')
  const [trackingCode, setTrackingCode] = useState('')

  // Return Review State
  const [returnDecision, setReturnDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [adminNote, setAdminNote] = useState('')

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['admin-orders', keyword, statusFilter, paymentMethodFilter, page],
    queryFn: () =>
      orderApi.adminSearchOrders({
        keyword: keyword.trim() || undefined,
        status: statusFilter || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        page,
        size: 20,
      }),
  })

  const rawOrders = orderData?.content || []
  const orders = paymentStatusFilter
    ? rawOrders.filter((o) => o.paymentStatus === paymentStatusFilter)
    : rawOrders

  // Load detailed order when opening DETAIL modal
  const handleOpenDetail = async (order: Order) => {
    setSelectedOrder(order)
    setDetailedOrder(order)
    setModalType('DETAIL')
    setIsLoadingDetail(true)
    try {
      const full = await orderApi.adminGetOrderById(order.id)
      if (full) {
        setDetailedOrder(full)
      }
    } catch {
      // Keep selected order as fallback
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: () => {
      if (!selectedOrder) throw new Error('No order')
      return orderApi.adminUpdateStatus(selectedOrder.id, targetStatus, carrier, trackingCode)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-unpaid-orders'] })
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      setModalType(null)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Thao tác thất bại'
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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Thao tác thất bại'
      toast.error(msg)
    },
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    toast.success(`Đã sao chép: ${code}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Chờ xử lý</span>
          </span>
        )
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#006561]/10 text-[#006561] border border-[#006561]/20">
            <Package className="w-3 h-3 text-[#006561]" />
            <span>Đang làm bánh</span>
          </span>
        )
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <Truck className="w-3 h-3 text-sky-600" />
            <span>Đang giao hàng</span>
          </span>
        )
      case 'DELIVERED':
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Hoàn thành</span>
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
            <span>Đã hủy</span>
          </span>
        )
      case 'RETURN_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span>Yêu cầu đổi trả</span>
          </span>
        )
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <RotateCcw className="w-3 h-3 text-stone-500" />
            <span>Đã đổi trả</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-50 text-stone-700 border border-stone-200">
            {status}
          </span>
        )
    }
  }

  // Quick Stats
  const totalOrdersCount = orderData?.totalElements ?? rawOrders.length
  const pendingCount = rawOrders.filter((o) => o.orderStatus === 'PENDING').length
  const shippingCount = rawOrders.filter((o) => o.orderStatus === 'SHIPPING').length
  const paidRevenue = rawOrders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="space-y-6 font-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-semibold tracking-wider uppercase mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#C9785C]" />
            <span>Điều hành &amp; Vận hành chuỗi đơn bánh</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
            Quản Lý Đơn Hàng Khách Đặt
          </h1>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Theo dõi vòng đời đơn hàng, xác nhận giao hàng, duyệt yêu cầu đổi trả và đối soát tự động
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tổng Đơn Đang Xem</span>
            <ShoppingBag className="w-4 h-4 text-[#006561]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2A2725]">
            {totalOrdersCount}
          </div>
          <p className="text-[11px] text-[#6B6661]">Đơn hàng trong hệ thống</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Chờ Bếp Nướng</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-600">
            {pendingCount}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Cần chuẩn bị và ra lò</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Đang Vận Chuyển</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-sky-700">
            {shippingCount}
          </div>
          <p className="text-[11px] text-[#6B6661]">Đang trên đường giao</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Doanh Thu Quyết Toán</span>
            <DollarSign className="w-4 h-4 text-[#16a34a]" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#16a34a] truncate">
            {formatCurrency(paidRevenue)}
          </div>
          <p className="text-[11px] text-[#16a34a] font-medium">Đã thu qua VietQR &amp; COD</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E2DF] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6661]" />
          <Input
            placeholder="Tìm theo mã đơn, tên khách hàng hoặc số điện thoại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 text-xs rounded-xl border-[#E5E2DF] h-10 w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
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

          {/* Payment Method Filter */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
          >
            <option value="">Tất cả phương thức</option>
            <option value="VIETQR">Chuyển khoản VietQR</option>
            <option value="COD">Tiền mặt (COD)</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="PENDING">Chờ thanh toán (PENDING)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-[#E5E2DF] text-[#2A2725] font-bold">
              <tr>
                <th className="py-3.5 px-4 w-40">Mã Đơn Hàng</th>
                <th className="py-3.5 px-4 min-w-[180px]">Khách Hàng</th>
                <th className="py-3.5 px-4 min-w-[130px]">Thời Gian Đặt</th>
                <th className="py-3.5 px-4 min-w-[150px]">Thanh Toán</th>
                <th className="py-3.5 px-4 min-w-[140px]">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right min-w-[120px]">Tổng Tiền</th>
                <th className="py-3.5 px-4 text-right min-w-[200px]">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DF] text-[#6B6661]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#6B6661]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#006561]" />
                    <span>Đang nạp danh sách đơn hàng...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center space-y-2">
                    <ShoppingBag className="w-8 h-8 text-[#6B6661] mx-auto opacity-50" />
                    <p className="font-semibold text-xs text-[#2A2725]">Không tìm thấy đơn hàng nào</p>
                    <p className="text-[11px] text-[#6B6661]">Thử thay đổi từ khóa hoặc bộ lọc trạng thái</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const displayCode = order.orderCode || order.id
                  const isLongUuid = displayCode.length > 18
                  const shortCode = isLongUuid
                    ? `${displayCode.slice(0, 10)}...${displayCode.slice(-4)}`
                    : displayCode

                  const isPaid = order.paymentStatus === 'PAID'
                  const customerName = order.customerName || 'Khách vãng lai'
                  const orderDate = order.createdAt || (order as any).date

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono font-bold text-[#006561] text-xs"
                            title={displayCode}
                          >
                            #{shortCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(displayCode)}
                            className="p-1 text-[#6B6661] hover:text-[#006561] hover:bg-[#FAF7F2] rounded cursor-pointer"
                            title="Sao chép mã đơn"
                          >
                            {copiedId === displayCode ? (
                              <Check className="w-3 h-3 text-[#16a34a]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#2A2725] text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-[#006561] shrink-0" />
                            <span className="truncate max-w-[160px]">{customerName}</span>
                          </p>
                          {order.phone && (
                            <p className="text-[11px] text-[#6B6661] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#C9785C] shrink-0" />
                              <span>{order.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#6B6661]">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-[#6B6661] shrink-0" />
                          <span>{orderDate ? formatDate(orderDate) : 'Vừa xong'}</span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-medium text-[#2A2725]">
                            {order.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Tiền mặt (COD)'}
                          </span>
                          <div>
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Đã thanh toán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-2.5 h-2.5" /> Chờ thanh toán
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(order.orderStatus)}</td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-[#2A2725]">
                          {formatCurrency(order.total)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(order)}
                            className="h-8 px-2.5 text-xs text-[#006561] border-[#E5E2DF] hover:bg-[#006561]/8 rounded-lg cursor-pointer"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Chi tiết</span>
                          </Button>

                          {/* Print */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPrintOrder(order)
                              setIsPrintOpen(true)
                            }}
                            className="h-8 px-2.5 text-xs text-[#2A2725] hover:text-[#006561] hover:bg-[#FAF7F2] rounded-lg cursor-pointer"
                            title="In phiếu giao hàng A5 / K80"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#006561]" />
                          </Button>

                          {/* Status Change / Return */}
                          {order.orderStatus === 'RETURN_REQUESTED' ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setModalType('RETURN')
                              }}
                              className="h-8 px-2.5 text-xs font-semibold bg-[#C9785C] hover:bg-[#b06349] text-white rounded-lg cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              <span>Duyệt trả</span>
                            </Button>
                          ) : (
                            <Button
                              type="button"
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
                              className="h-8 px-2.5 text-xs font-semibold bg-[#006561] hover:bg-[#004e4a] text-white rounded-lg cursor-pointer"
                              title="Chuyển trạng thái đơn"
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              <span>Đổi trạng thái</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E5E2DF] px-4 py-3 bg-white text-xs">
          <div className="text-[#6B6661]">
            Trang <strong className="text-[#2A2725]">{orderData?.number !== undefined ? orderData.number + 1 : 1}</strong> / {orderData?.totalPages || 1} (Tổng {totalOrdersCount} đơn)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 text-xs border-[#E5E2DF] rounded-xl cursor-pointer"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={orderData ? page >= orderData.totalPages - 1 : true}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 text-xs border-[#E5E2DF] rounded-xl cursor-pointer"
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Chuyển Trạng Thái */}
      <Dialog open={modalType === 'STATUS'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-lg font-bold text-[#2A2725]">
              Cập Nhật Trạng Thái Đơn Hàng
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Đơn hàng #{selectedOrder?.orderCode || selectedOrder?.id} • Hiện tại:{' '}
              <strong className="text-[#006561]">{selectedOrder?.orderStatus}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-[#2A2725] mb-1.5">
                Trạng thái tiếp theo <span className="text-[#B23A2A]">*</span>
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
              >
                <option value="PROCESSING">PROCESSING - Đang làm bánh tại bếp</option>
                <option value="SHIPPING">SHIPPING - Bàn giao đơn vị vận chuyển</option>
                <option value="DELIVERED">DELIVERED - Đã giao hàng thành công (Tự động trừ kho)</option>
                <option value="CANCELLED">CANCELLED - Hủy đơn hàng</option>
              </select>
            </div>

            {targetStatus === 'SHIPPING' && (
              <div className="grid grid-cols-2 gap-3 border border-[#E5E2DF] p-3.5 bg-[#FAF7F2] rounded-2xl">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2A2725] mb-1">
                    Đơn vị vận chuyển
                  </label>
                  <Input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="h-9 text-xs rounded-xl border-[#E5E2DF]"
                    placeholder="VD: GiaoHangNhanh"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#2A2725] mb-1">
                    Mã vận đơn
                  </label>
                  <Input
                    placeholder="VD: GHN-12345"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="h-9 text-xs rounded-xl border-[#E5E2DF]"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalType(null)}
              className="rounded-xl border-[#E5E2DF] text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              disabled={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate()}
              className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-semibold"
            >
              {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Xác Nhận Đổi Trạng Thái'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Duyệt Đổi Trả */}
      <Dialog open={modalType === 'RETURN'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-lg font-bold text-[#2A2725]">
              Xét Duyệt Yêu Cầu Đổi Trả Hàng
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Đơn hàng #{selectedOrder?.orderCode || selectedOrder?.id} • Lý do khách:{' '}
              <span className="italic font-medium text-[#2A2725]">"{selectedOrder?.returnReason || 'Không rõ'}"</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-[#2A2725] mb-1.5">Quyết định xử lý *</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={returnDecision === 'APPROVED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReturnDecision('APPROVED')}
                  className={cn(
                    'rounded-xl text-xs font-semibold',
                    returnDecision === 'APPROVED'
                      ? 'bg-[#006561] text-white'
                      : 'border-[#E5E2DF] text-[#6B6661]'
                  )}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Đồng ý (Hoàn kho bánh)
                </Button>
                <Button
                  type="button"
                  variant={returnDecision === 'REJECTED' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setReturnDecision('REJECTED')}
                  className="rounded-xl text-xs font-semibold"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Từ chối đổi trả
                </Button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2A2725] mb-1">Ghi chú phản hồi cho khách</label>
              <Input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ví dụ: Đã kiểm tra kiện bánh và hoàn tiền/gửi mẻ mới..."
                className="text-xs rounded-xl border-[#E5E2DF]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalType(null)}
              className="rounded-xl border-[#E5E2DF] text-xs"
            >
              Đóng
            </Button>
            <Button
              size="sm"
              disabled={reviewReturnMutation.isPending}
              onClick={() => reviewReturnMutation.mutate()}
              className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-semibold"
            >
              {reviewReturnMutation.isPending ? 'Đang duyệt...' : 'Hoàn Tất Xét Duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chi Tiết Đơn Hàng */}
      <Dialog open={modalType === 'DETAIL'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[88vh] overflow-y-auto rounded-3xl p-6 sm:p-7 font-text">
          <DialogHeader className="pb-3 border-b border-[#E5E2DF] space-y-2">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="font-display text-lg font-bold text-[#2A2725]">
                Chi Tiết Đơn Hàng #{detailedOrder?.orderCode || detailedOrder?.id}
              </DialogTitle>
              {detailedOrder && getStatusBadge(detailedOrder.orderStatus)}
            </div>
            <DialogDescription className="text-xs text-[#6B6661] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Khách: <strong className="text-[#2A2725]">{detailedOrder?.customerName || 'Khách vãng lai'}</strong></span>
              <span>•</span>
              <span>SĐT: <strong className="text-[#2A2725]">{detailedOrder?.phone || 'Chưa cập nhật'}</strong></span>
              <span>•</span>
              <span>Ngày: {detailedOrder && formatDate(detailedOrder.createdAt || (detailedOrder as any).date)}</span>
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 text-center text-[#6B6661] text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#006561]" />
              <span>Đang tải thông tin chi tiết đơn hàng...</span>
            </div>
          ) : detailedOrder ? (
            <div className="space-y-5 py-3 text-xs">
              {/* Shipping Address */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E2DF] space-y-1">
                <p className="font-semibold text-[#2A2725] flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#006561]" />
                  <span>Địa chỉ giao hàng:</span>
                </p>
                <p className="text-[#6B6661] pl-5">{detailedOrder.address || 'Giao tại tiệm Hebekery'}</p>
                {detailedOrder.trackingCode && (
                  <p className="text-[#006561] font-semibold pt-1 pl-5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Đơn vị: {detailedOrder.shippingCarrier || 'GHN'} • Mã vận đơn: {detailedOrder.trackingCode}</span>
                  </p>
                )}
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-[#2A2725] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#006561]" />
                    <span>Danh sách sản phẩm bánh ({detailedOrder.items?.length || 0})</span>
                  </p>
                </div>

                {(!detailedOrder.items || detailedOrder.items.length === 0) ? (
                  <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] text-center text-[#6B6661]">
                    Không có thông tin chi tiết mặt hàng
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E2DF] border border-[#E5E2DF] rounded-2xl overflow-hidden bg-white">
                    {detailedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              it.imageUrl ||
                              'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/placeholder_1x1.png'
                            }
                            alt={it.productName}
                            className="w-11 h-11 rounded-xl object-cover border border-[#E5E2DF]"
                          />
                          <div>
                            <p className="font-semibold text-[#2A2725] text-xs">{it.productName}</p>
                            <p className="text-[11px] text-[#6B6661]">
                              Số lượng: x<strong>{it.quantity}</strong> • Đơn giá:{' '}
                              {formatCurrency(it.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#2A2725] text-xs">
                          {formatCurrency(it.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing & Voucher Summary */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E2DF] space-y-2">
                <div className="flex justify-between text-[#6B6661]">
                  <span>Tạm tính tiền bánh (Subtotal):</span>
                  <span className="font-mono font-medium text-[#2A2725]">
                    {formatCurrency(detailedOrder.subtotal || detailedOrder.total)}
                  </span>
                </div>
                {detailedOrder.voucherCode && (
                  <div className="flex justify-between text-[#006561] font-medium">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      Mã giảm giá ({detailedOrder.voucherCode}):
                    </span>
                    <span className="font-mono">-{formatCurrency(detailedOrder.discountAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B6661]">
                  <span>Phí vận chuyển giao hàng:</span>
                  <span className="font-medium text-[#006561]">
                    {detailedOrder.shippingFee && detailedOrder.shippingFee > 0
                      ? formatCurrency(detailedOrder.shippingFee)
                      : 'Miễn phí'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#006561] pt-2 border-t border-[#E5E2DF]">
                  <span>Tổng thanh toán thực tế:</span>
                  <span className="font-mono text-base">{formatCurrency(detailedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 text-[#6B6661]">
                  <span>Hình thức thanh toán:</span>
                  <span className="font-semibold text-[#2A2725]">
                    {detailedOrder.paymentMethod === 'VIETQR'
                      ? 'Chuyển khoản VietQR'
                      : 'Thanh toán tiền mặt khi nhận bánh (COD)'}{' '}
                    ({detailedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'})
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#E5E2DF] pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (detailedOrder) {
                  setPrintOrder(detailedOrder)
                  setIsPrintOpen(true)
                }
              }}
              className="border-[#006561] text-[#006561] hover:bg-[#006561]/8 rounded-xl text-xs font-semibold cursor-pointer w-full sm:w-auto"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>In Phiếu Giao Hàng A5</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setModalType(null)}
              className="bg-[#2A2725] hover:bg-[#1a1816] text-white rounded-xl text-xs font-medium cursor-pointer w-full sm:w-auto"
            >
              Đóng cửa sổ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable Invoice Modal */}
      <OrderInvoicePrintModal
        order={printOrder}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false)
          setPrintOrder(null)
        }}
      />
    </div>
  )
}
export default AdminOrdersPage
