import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Zap,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Building2,
  Hash,
  DollarSign,
  FileText,
} from 'lucide-react'
import { orderApi, paymentApi } from '@/api'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

export const AdminSepaySimulatorPage: React.FC = () => {
  const queryClient = useQueryClient()

  // Selected Order & Form State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderCode, setOrderCode] = useState('')
  const [amount, setAmount] = useState<number>(299000)
  const [gateway, setGateway] = useState('MBBank')
  const [accountNumber, setAccountNumber] = useState('0979764185')
  const [content, setContent] = useState('HBK-SAMPLE thanh toan')
  const [referenceCode, setReferenceCode] = useState(() => `SIM-${Date.now().toString().slice(-6)}`)

  // Log Terminal Output
  const [logs, setLogs] = useState<Array<{ time: string; type: 'info' | 'success' | 'error'; message: string }>>([
    {
      time: new Date().toLocaleTimeString('vi-VN'),
      type: 'info',
      message: 'Khởi tạo SePay Webhook Simulator sẵn sàng...',
    },
  ])

  // Fetch pending orders for quick select
  const { data: pageData, isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-unpaid-orders'],
    queryFn: () => orderApi.adminSearchOrders({ size: 10 }),
  })

  const orders = pageData?.content || []
  const pendingOrders = orders.filter(
    (o) => o.paymentStatus === 'PENDING' || o.orderStatus === 'PENDING'
  )

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
    const code = order.orderCode || order.id
    setOrderCode(code)
    setAmount(order.total)
    setContent(`HBK${code.replace(/^HBK-?/i, '')} thanh toan don hang`)
    setReferenceCode(`SIM-${Date.now().toString().slice(-6)}`)
    toast.info(`Đã chọn đơn #${code}`)
  }

  // Mutation to trigger SePay Webhook
  const webhookMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        gateway,
        accountNumber,
        transferAmount: amount,
        transferType: 'in',
        content,
        referenceCode,
        transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }

      const timestamp = new Date().toLocaleTimeString('vi-VN')
      setLogs((prev) => [
        {
          time: timestamp,
          type: 'info',
          message: `Gửi POST /api/payment/sepay/webhook với mã đơn: ${content} (Số tiền: ${formatCurrency(amount)})`,
        },
        ...prev,
      ])

      return await paymentApi.simulateSepayWebhook(payload)
    },
    onSuccess: (data) => {
      const timestamp = new Date().toLocaleTimeString('vi-VN')
      setLogs((prev) => [
        {
          time: timestamp,
          type: 'success',
          message: `Webhook phản hồi thành công (200 OK)! Đơn hàng đã được đối soát và chuyển trạng thái sang PAID.`,
        },
        ...prev,
      ])
      toast.success('Bắn Webhook SePay thành công! Đơn hàng đã chuyển sang PAID')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-unpaid-orders'] })
      setReferenceCode(`SIM-${Date.now().toString().slice(-6)}`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi gọi Webhook'
      const timestamp = new Date().toLocaleTimeString('vi-VN')
      setLogs((prev) => [
        {
          time: timestamp,
          type: 'error',
          message: `Thất bại: ${msg}`,
        },
        ...prev,
      ])
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6 font-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Developer &amp; QA Tool</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2A2725]">
            Trình Giả Lập Bắn Webhook SePay (Ting Ting)
          </h1>
          <p className="text-xs text-[#6B6661] mt-1 max-w-2xl">
            Công cụ nội bộ giả lập sự kiện ngân hàng SePay gửi tín hiệu tiền vào tài khoản để kiểm tra tự động đối soát thanh toán chuyển sang <span className="font-bold text-[#16a34a]">PAID</span> mà không cần chuyển tiền thật.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetchOrders()}
          className="text-xs font-bold text-[#006561] border-[#006561]/30 hover:bg-[#006561]/5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Làm mới danh sách</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Webhook Trigger (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="border-b border-[#E5E2DF] pb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#2A2725] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#006561]" />
              <span>Cấu Hình Thông Tin Chuyển Khoản Ngân Hàng</span>
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono text-[#006561] border-[#006561]/30 bg-[#006561]/5">
              POST /api/payment/sepay/webhook
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Quick Pick Info */}
            {selectedOrder && (
              <div className="p-3.5 bg-[#FAF7F2] border border-[#006561]/30 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#6B6661] block text-[11px]">Đang chọn đơn hàng:</span>
                  <strong className="text-[#006561] font-mono text-sm">#{selectedOrder.orderCode || selectedOrder.id}</strong>
                  <span className="text-[#6B6661] ml-2">({selectedOrder.customerName} - {formatCurrency(selectedOrder.total)})</span>
                </div>
                <Badge className={selectedOrder.paymentStatus === 'PAID' ? 'bg-[#16a34a]' : 'bg-[#eab308]'}>
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            )}

            {/* Content (Crucial field) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2A2725] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#006561]" />
                <span>Nội dung chuyển khoản (Content)</span>
                <span className="text-[#B23A2A]">*</span>
              </label>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ví dụ: HBK1001 thanh toan"
                className="font-mono text-xs rounded-xl border-[#E5E2DF]"
              />
              <p className="text-[11px] text-[#6B6661]">
                Backend sẽ regex tìm mã dạng <code className="bg-[#FAF7F2] px-1 py-0.5 rounded text-[#006561] font-bold">HBK...</code> để tự động khớp với đơn hàng.
              </p>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#006561]" />
                  <span>Số tiền chuyển khoản (VNĐ)</span>
                  <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="299000"
                  className="font-mono text-xs rounded-xl border-[#E5E2DF]"
                />
              </div>

              {/* Reference Code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#006561]" />
                  <span>Mã giao dịch ngân hàng (Reference)</span>
                </label>
                <Input
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="SIM-XXXXX"
                  className="font-mono text-xs rounded-xl border-[#E5E2DF]"
                />
              </div>
            </div>

            {/* Gateway & Account Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#006561]" />
                  <span>Cổng thanh toán / Ngân hàng</span>
                </label>
                <Input
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  placeholder="MBBank"
                  className="text-xs rounded-xl border-[#E5E2DF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#006561]" />
                  <span>Số tài khoản nhận</span>
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0979764185"
                  className="font-mono text-xs rounded-xl border-[#E5E2DF]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                onClick={() => webhookMutation.mutate()}
                disabled={webhookMutation.isPending || !content.trim() || amount <= 0}
                className="w-full h-11 bg-[#006561] hover:bg-[#004e4a] text-white rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {webhookMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang gửi Webhook tới Backend...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#C9785C]" />
                    <span>Bắn Webhook SePay Giả Lập (Ting Ting)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Orders Selector & Live Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Unpaid Orders Selector */}
          <div className="bg-white rounded-3xl border border-[#E5E2DF] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-2.5">
              <h3 className="font-display text-sm font-bold text-[#2A2725] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#006561]" />
                <span>Đơn Chờ Thanh Toán Gần Đây</span>
              </h3>
              <span className="text-[11px] text-[#6B6661] font-mono">
                {pendingOrders.length} đơn
              </span>
            </div>

            {isLoadingOrders ? (
              <p className="text-xs text-[#6B6661] text-center py-4">Đang tải danh sách đơn...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="text-xs text-[#6B6661] text-center py-4">Không có đơn hàng nào chờ thanh toán</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                      selectedOrder?.id === order.id
                        ? 'border-[#006561] bg-[#006561]/5 font-semibold text-[#006561]'
                        : 'border-[#E5E2DF] hover:border-[#006561]/40 bg-[#FAF7F2]/40'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold">#{order.orderCode || order.id}</span>
                        <span className="text-[10px] text-[#6B6661]">({order.paymentMethod})</span>
                      </div>
                      <span className="text-[11px] text-[#6B6661] block">{order.customerName}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#B23A2A] block">{formatCurrency(order.total)}</span>
                      <span className="text-[10px] text-[#006561] hover:underline flex items-center justify-end gap-0.5">
                        <span>Chọn</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Simulator Terminal */}
          <div className="bg-[#1e1e1e] text-[#d4d4d4] rounded-3xl p-5 space-y-3 font-mono text-xs shadow-md">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2 text-[11px]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#16a34a]" />
                <span className="font-bold text-white">Live Simulator Log</span>
              </div>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-gray-400 hover:text-white text-[10px] cursor-pointer"
              >
                Xóa log
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {logs.map((log, index) => (
                <div key={index} className="space-y-0.5">
                  <span className="text-gray-500 text-[10px]">[{log.time}]</span>
                  <p
                    className={cn(
                      'break-words text-[11px]',
                      log.type === 'success'
                        ? 'text-[#4ade80]'
                        : log.type === 'error'
                        ? 'text-[#f87171]'
                        : 'text-gray-300'
                    )}
                  >
                    {log.type === 'success' && '✓ '}
                    {log.type === 'error' && '✗ '}
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
