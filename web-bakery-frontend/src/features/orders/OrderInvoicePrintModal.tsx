import React from 'react'
import {
  Printer,
  X,
  Building2,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Heart,
  QrCode,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types'

interface OrderInvoicePrintModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export const OrderInvoicePrintModal: React.FC<OrderInvoicePrintModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null

  const isPaid = order.paymentStatus === 'PAID'
  const isFreeShip = order.shippingFee === 0 || (order.subtotal ?? 0) >= 299000
  const codAmountToCollect = isPaid ? 0 : order.total
  const orderCode = order.orderCode || order.id

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-8 rounded-3xl border border-[#E5E2DF] bg-white font-text"
      >
        <DialogHeader className="print:hidden flex flex-row items-center justify-between pb-3 border-b border-[#E5E2DF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#006561]/10 flex items-center justify-center text-[#006561]">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-[#2A2725]">
                Phiếu Giao Hàng &amp; Hóa Đơn Bánh
              </DialogTitle>
              <p className="text-xs text-[#6B6661]">
                Đơn hàng #{orderCode} • Sẵn sàng in khổ A5 / A4
              </p>
            </div>
          </div>

          <Button
            onClick={handlePrint}
            className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu Ngay</span>
          </Button>
        </DialogHeader>

        {/* PRINTABLE CONTAINER (Targeted by @media print) */}
        <div id="hebekery-print-invoice" className="p-2 sm:p-4 text-[#2A2725] text-xs space-y-5">
          {/* 1. Header Tiệm Bánh HeBekery */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#2A2725] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-[#006561]">
                  HeBekery
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B23A2A] bg-[#FFE6DC] px-2 py-0.5 rounded">
                  Bánh Dinh Dưỡng
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#2A2725]">
                CÔNG TY TNHH HEALTH &amp; BEAUTY FOODS
              </p>
              <p className="text-[11px] text-[#6B6661] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#006561] shrink-0" />
                <span>Lò bánh: 2D Hồ Ngọc Cẩn, P. Tân Thành, Q. Tân Phú, TP. Hồ Chí Minh</span>
              </p>
              <p className="text-[11px] text-[#6B6661] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#006561] shrink-0" />
                <span>Hotline đặt bánh: <strong>097 97 64 185</strong> • Website: hebekery.vn</span>
              </p>
            </div>

            <div className="text-right sm:self-center shrink-0">
              <h2 className="font-display text-base font-bold uppercase tracking-wider text-[#2A2725]">
                PHIẾU ĐÓNG GÓI
              </h2>
              <p className="font-mono text-sm font-bold text-[#006561]">#{orderCode}</p>
              <p className="text-[10px] text-[#6B6661]">
                Ngày tạo: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
              </p>
            </div>
          </div>

          {/* 2. Customer & Shipping Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B6661] uppercase tracking-wider block">
                Người Nhận Bánh:
              </span>
              <p className="font-bold text-sm text-[#2A2725]">{order.customerName}</p>
              <p className="font-mono text-xs font-semibold text-[#006561]">{order.phone}</p>
              <p className="text-xs text-[#2A2725] leading-relaxed mt-1">
                {order.address}
              </p>
              {order.note && (
                <p className="text-[11px] text-[#B23A2A] italic mt-1 bg-white p-2 rounded-lg border border-[#E5E2DF]">
                  * Ghi chú khách: {order.note}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-[#E5E2DF] sm:pl-4">
              <span className="text-[10px] font-bold text-[#6B6661] uppercase tracking-wider block">
                Thông Tin Vận Chuyển &amp; Thu Tiền:
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6661]">Hình thức thanh toán:</span>
                <strong className="text-[#2A2725]">{order.paymentMethod}</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6661]">Trạng thái thanh toán:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isPaid ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fef9c3] text-[#854d0e]'
                }`}>
                  {isPaid ? 'ĐÃ THANH TOÁN (PAID)' : 'CHƯA THANH TOÁN'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B6661]">Đơn vị vận chuyển:</span>
                <span className="font-semibold">{order.shippingCarrier || 'GHTK Toàn Quốc'}</span>
              </div>
              {order.trackingCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B6661]">Mã vận đơn bưu tá:</span>
                  <span className="font-mono font-bold text-[#006561]">{order.trackingCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Items Table */}
          <div className="border border-[#E5E2DF] rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E5E2DF] text-[11px] font-bold uppercase text-[#6B6661]">
                  <th className="py-2.5 px-3 w-8 text-center">STT</th>
                  <th className="py-2.5 px-3">Tên Món Bánh Dinh Dưỡng</th>
                  <th className="py-2.5 px-3 text-center">SL</th>
                  <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                  <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DF] text-xs">
                {order.items?.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-center text-[#6B6661] font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#2A2725]">
                      <span>{item.productName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#006561]">
                      x{item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#6B6661] font-mono">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#2A2725] font-mono">
                      {formatCurrency(item.total || item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:max-w-xs space-y-1.5 text-xs text-[#6B6661]">
              <p className="font-semibold text-[#2A2725] flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#B23A2A]" />
                <span>Bảo Quản Bánh Lành:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Bánh nướng mộc tự nhiên không chất bảo quản. Vui lòng bảo quản nơi khô ráo, thoáng mát hoặc ngăn mát tủ lạnh sau khi mở seal nắp.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="flex justify-between text-[#6B6661]">
                <span>Tạm tính bánh:</span>
                <span className="font-mono text-[#2A2725]">{formatCurrency(order.subtotal || order.total)}</span>
              </div>

              {order.voucherCode && (
                <div className="flex justify-between text-[#16a34a]">
                  <span>Voucher ({order.voucherCode}):</span>
                  <span className="font-mono font-semibold">-{formatCurrency(order.discountAmount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6B6661]">
                <span>Phí vận chuyển:</span>
                <span className="font-mono text-[#2A2725]">
                  {isFreeShip ? '0đ (Freeship)' : formatCurrency(order.shippingFee || 30000)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E5E2DF] flex justify-between items-baseline">
                <span className="font-bold text-sm text-[#2A2725]">TỔNG THU (COD):</span>
                <span className="font-display font-bold text-lg text-[#B23A2A] font-mono">
                  {formatCurrency(codAmountToCollect)}
                </span>
              </div>
              {isPaid && (
                <p className="text-[10px] text-[#16a34a] font-bold">
                  (Đã thanh toán đủ qua VietQR SePay - Thu COD 0đ)
                </p>
              )}
            </div>
          </div>

          {/* 5. Signature Footer */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs text-[#6B6661] border-t border-[#E5E2DF]">
            <div className="space-y-12">
              <p className="font-bold text-[#2A2725]">Người Lập Phiếu / Đóng Gói</p>
              <p className="italic text-[10px]">(Ký &amp; Ghi rõ họ tên)</p>
            </div>
            <div className="space-y-12">
              <p className="font-bold text-[#2A2725]">Người Nhận Hàng</p>
              <p className="italic text-[10px]">(Ký nhận bánh nguyên vẹn)</p>
            </div>
          </div>
        </div>

        {/* Global Print Stylesheet injected into DOM */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #hebekery-print-invoice, #hebekery-print-invoice * {
                visibility: visible;
              }
              #hebekery-print-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 12px;
                background: white !important;
                color: #2A2725 !important;
              }
              header, nav, button, .print\\:hidden {
                display: none !important;
              }
            }
          `
        }} />
      </DialogContent>
    </Dialog>
  )
}
