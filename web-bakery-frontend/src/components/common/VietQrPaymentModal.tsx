import React, { useState, useEffect, useRef } from 'react'
import {
  QrCode,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Download,
  X,
  CreditCard,
  Building2,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/format'
import { paymentApi } from '@/api'
import { toast } from 'sonner'
import type { Order } from '@/types'

interface VietQrPaymentModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const BANK_ID = 'MB' // MBBank (Ngân hàng TMCP Quân Đội)
const BANK_NAME = 'MBBank (Ngân Hàng Quân Đội)'
const ACCOUNT_NO = '0979764185'
const ACCOUNT_NAME = 'TIEM BANH HEBEKERY'
const QR_EXPIRE_SECONDS = 900 // 15 minutes = 900 seconds

export const VietQrPaymentModal: React.FC<VietQrPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [timeLeft, setTimeLeft] = useState(QR_EXPIRE_SECONDS)
  const [isPaid, setIsPaid] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const pollingRef = useRef<number | null>(null)

  const orderCode = order?.orderCode || order?.id || ''
  const transferContent = `HBK${orderCode.replace(/^HBK-?/i, '')}`
  const amount = order?.total || 0

  // QuickLink API from VietQR Napas 247
  const qrImageUrl = order
    ? `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${Math.round(
        amount
      )}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(
        ACCOUNT_NAME
      )}`
    : ''

  // Countdown Timer
  useEffect(() => {
    if (!isOpen || isPaid || isExpired || !order) return

    setTimeLeft(QR_EXPIRE_SECONDS)
    setIsExpired(false)
    setIsPaid(order.paymentStatus === 'PAID')

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsExpired(true)
          toast.error('Đơn hàng đã hết hạn thanh toán (quá 15 phút)')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, order, isPaid, isExpired])

  // Polling Payment Status (Every 2.5 seconds)
  useEffect(() => {
    if (!isOpen || !order || isPaid || isExpired) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }

    const checkStatus = async () => {
      try {
        const res = await paymentApi.getOrderPaymentStatus(order.id)
        if (res && (res.isPaid || res.paymentStatus === 'PAID')) {
          setIsPaid(true)
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          toast.success('Hệ thống SePay đã ghi nhận thanh toán thành công!')
          if (onSuccess) {
            setTimeout(onSuccess, 1800)
          }
        }
      } catch {
        // Continue polling
      }
    }

    checkStatus()
    pollingRef.current = window.setInterval(checkStatus, 2500)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [isOpen, order, isPaid, isExpired, onSuccess])

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép ${fieldName}`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="max-w-lg p-6 sm:p-7 space-y-5 rounded-3xl border border-[#E5E2DF] bg-white font-text"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#006561]/10 flex items-center justify-center text-[#006561]">
                <QrCode className="w-4 h-4" />
              </div>
              <DialogTitle className="font-display text-lg sm:text-xl text-[#2A2725]">
                Quét Mã VietQR Napas 247
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-[#6B6661] text-left">
            Đơn hàng <strong>#{orderCode}</strong> • Tự động xác nhận giao dịch qua SePay Webhook
          </DialogDescription>
        </DialogHeader>

        {/* 1. Countdown Header */}
        {!isPaid && !isExpired && (
          <div className="p-3 bg-[#FAF7F2] border border-[#E5E2DF] rounded-2xl space-y-1.5">
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
                style={{ width: `${(timeLeft / QR_EXPIRE_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 2. Success State */}
        {isPaid && (
          <div className="p-6 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] rounded-2xl space-y-3 text-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-14 h-14 mx-auto text-[#16a34a] animate-bounce" />
            <h3 className="font-display text-xl font-bold">Thanh Toán Thành Công!</h3>
            <p className="text-xs text-[#166534] leading-relaxed max-w-sm mx-auto">
              Hệ thống đã nhận được số tiền <strong>{formatCurrency(amount)}</strong>. Bếp bánh HeBekery đang chuẩn bị mẻ bánh tươi ngon nhất cho bạn!
            </p>
            <div className="pt-2">
              <Button
                onClick={onClose}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Hoàn tất &amp; Xem đơn hàng
              </Button>
            </div>
          </div>
        )}

        {/* 3. Expired State */}
        {isExpired && !isPaid && (
          <div className="p-6 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-2xl space-y-3 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-[#dc2626]" />
            <h3 className="font-display text-lg font-bold">Đơn Hàng Đã Hết Hạn Thanh Toán</h3>
            <p className="text-xs text-[#991b1b] leading-relaxed">
              Mã QR VietQR đã hết hiệu lực 15 phút. Quý khách vui lòng đặt lại đơn mới hoặc liên hệ hotline HeBekery để được hỗ trợ.
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full border-[#dc2626] text-[#dc2626] text-xs font-bold cursor-pointer"
            >
              Đóng hộp thoại
            </Button>
          </div>
        )}

        {/* 4. Active QR Code & Bank Transfer Details */}
        {!isPaid && !isExpired && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#FAF7F2]/60 p-4 rounded-2xl border border-[#E5E2DF]">
              {/* QR Image (5 cols) */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <div className="p-2 bg-white rounded-2xl border border-[#E5E2DF] shadow-xs">
                  <img
                    src={qrImageUrl}
                    alt="VietQR Napas 247 HeBekery"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <span className="text-[10px] text-[#6B6661] mt-1.5 font-medium">
                  Quét bằng App Ngân Hàng bất kỳ
                </span>
              </div>

              {/* Bank Details Table (7 cols) */}
              <div className="sm:col-span-7 space-y-2 text-xs text-left">
                {/* Bank Name */}
                <div className="p-2 rounded-xl bg-white border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-[#2A2725]">{BANK_NAME}</span>
                </div>

                {/* Account Number */}
                <div className="p-2 rounded-xl bg-white border border-[#E5E2DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#6B6661] block">Số tài khoản:</span>
                    <span className="font-mono font-bold text-sm text-[#006561]">{ACCOUNT_NO}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ACCOUNT_NO, 'Số tài khoản')}
                    className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#6B6661] hover:text-[#006561] transition-colors cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'Số tài khoản' ? (
                      <Check className="w-4 h-4 text-[#16a34a]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Account Holder */}
                <div className="p-2 rounded-xl bg-white border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Chủ tài khoản:</span>
                  <span className="font-bold text-[#2A2725]">{ACCOUNT_NAME}</span>
                </div>

                {/* Amount */}
                <div className="p-2 rounded-xl bg-white border border-[#E5E2DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#6B6661] block">Số tiền chính xác:</span>
                    <span className="font-display font-bold text-base text-[#B23A2A]">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(Math.round(amount).toString(), 'Số tiền')}
                    className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#6B6661] hover:text-[#006561] transition-colors cursor-pointer"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'Số tiền' ? (
                      <Check className="w-4 h-4 text-[#16a34a]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Transfer Content */}
                <div className="p-2 rounded-xl bg-white border border-[#006561]/40 flex items-center justify-between bg-[#006561]/5">
                  <div>
                    <span className="text-[10px] text-[#006561] font-semibold block">Nội dung chuyển khoản (Bắt buộc):</span>
                    <span className="font-mono font-bold text-sm text-[#006561]">
                      {transferContent}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                    className="p-1.5 rounded-lg bg-[#006561] text-white hover:bg-[#004e4a] transition-colors cursor-pointer"
                    title="Sao chép nội dung"
                  >
                    {copiedField === 'Nội dung chuyển khoản' ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Auto status notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#006561] bg-[#006561]/8 p-2.5 rounded-xl border border-[#006561]/20">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#006561]" />
              <span>Hệ thống tự động nhận diện thanh toán qua SePay Webhook...</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-full py-2.5 text-xs font-bold text-[#6B6661] border-[#E5E2DF] cursor-pointer"
              >
                Để Tôi Chuyển Khoản Sau
              </Button>
              <Button
                onClick={() => {
                  toast.info('Hệ thống đang đối soát tự động từ ngân hàng, vui lòng đợi vài giây...')
                }}
                className="flex-1 bg-[#006561] hover:bg-[#004e4a] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Tôi Đã Chuyển Khoản Xong
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
