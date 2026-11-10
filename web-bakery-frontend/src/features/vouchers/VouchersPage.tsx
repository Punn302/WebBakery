import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Ticket,
  Sparkles,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  ArrowRight,
  Info,
  Truck,
  Percent,
  Tag,
} from 'lucide-react'
import { voucherApi } from '@/api'
import type { Voucher } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const VouchersPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['available-vouchers'],
    queryFn: voucherApi.getAvailable,
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Đã sao chép mã [${code}]! Hãy dán vào ô voucher khi thanh toán.`)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <div className="bg-[#FAF7F2] min-h-[calc(100vh-80px)] py-10 sm:py-14 font-text">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đặc Quyền Khách Hàng Hebekery</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2A2725]">
            Kho Mã Giảm Giá &amp; Ưu Đãi Độc Quyền
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] max-w-xl mx-auto">
            Sao chép mã ưu đãi để thưởng thức bánh dinh dưỡng, bánh ăn kiêng và ngũ cốc nguyên cám với giá tốt nhất hôm nay.
          </p>
        </div>

        {/* Freeship Hero Card */}
        <div className="bg-gradient-to-r from-[#006561] to-[#004e4a] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Truck className="w-8 h-8 text-[#FAF7F2]" />
            </div>
            <div className="space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF7F2]/20 text-[11px] font-bold uppercase tracking-wider">
                Chính Sách Toàn Quốc
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Tự Động Miễn Phí Vận Chuyển Cho Đơn Từ 299.000đ
              </h2>
              <p className="text-xs text-white/80 max-w-lg leading-relaxed">
                Không cần nhập mã! Giỏ hàng của bạn sẽ tự động được miễn 100% phí vận chuyển khi đạt từ 299k.
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#006561] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF7F2] transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Mua Sắm Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Vouchers Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#006561]" />
              <span>Mã Ưu Đãi Đang Hoạt Động</span>
            </h2>
            <span className="text-xs text-[#6B6661]">
              {vouchers.length} mã khả dụng
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#6B6661]">
              Đang tải danh sách voucher từ hệ thống...
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#E5E2DF] p-6 space-y-2">
              <Tag className="w-8 h-8 text-[#6B6661] mx-auto" />
              <p className="text-xs font-semibold text-[#2A2725]">Hiện chưa có mã giảm giá mới</p>
              <p className="text-[11px] text-[#6B6661]">Vui lòng quay lại sau hoặc theo dõi fanpage Hebekery nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vouchers.map((voucher) => {
                const isCopied = copiedCode === voucher.code
                const isPercent = voucher.discountType === 'PERCENTAGE'
                const isFreeship = voucher.discountType === 'FREE_SHIPPING'

                return (
                  <div
                    key={voucher.id || voucher.code}
                    className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden shadow-xs hover:border-[#006561] transition-all flex flex-col justify-between relative group"
                  >
                    {/* Top Section */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={
                            isFreeship
                              ? 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20 text-[10px] font-bold'
                              : isPercent
                              ? 'bg-[#006561]/10 text-[#006561] border-[#006561]/20 text-[10px] font-bold'
                              : 'bg-[#C9785C]/10 text-[#C9785C] border-[#C9785C]/20 text-[10px] font-bold'
                          }
                        >
                          {isFreeship ? 'FREESHIP' : isPercent ? `GIẢM ${voucher.discountValue}%` : 'GIẢM TIỀN MẶT'}
                        </Badge>
                        <span className="text-[10px] text-[#6B6661] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>HSD: {voucher.endDate ? formatDate(voucher.endDate) : 'Vô thời hạn'}</span>
                        </span>
                      </div>

                      {/* Value & Description */}
                      <div className="space-y-1">
                        <h3 className="font-display text-lg font-bold text-[#2A2725]">
                          {isFreeship
                            ? 'Miễn phí giao hàng 30.000đ'
                            : isPercent
                            ? `Giảm ${voucher.discountValue}% tối đa ${formatCurrency(voucher.maxDiscountAmount || 0)}`
                            : `Giảm ${formatCurrency(voucher.discountValue)}`}
                        </h3>
                        <p className="text-xs text-[#6B6661]">
                          Đơn tối thiểu từ{' '}
                          <span className="font-semibold text-[#2A2725]">
                            {formatCurrency(voucher.minOrderAmount || 0)}
                          </span>
                        </p>
                      </div>

                      {/* Usage Progress */}
                      {(voucher.usageLimit || 0) > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-[#6B6661]">
                            <span>Lượt dùng</span>
                            <span>
                              {voucher.usedCount || 0} / {voucher.usageLimit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5E2DF]">
                            <div
                              className="h-full bg-[#006561] rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((voucher.usedCount || 0) / (voucher.usageLimit || 1)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Ticket Code & Action */}
                    <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E5E2DF] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-[#006561] bg-white px-2.5 py-1 rounded-lg border border-[#E5E2DF] tracking-wider uppercase">
                          {voucher.code}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => copyCode(voucher.code)}
                        className={
                          isCopied
                            ? 'bg-[#16a34a] hover:bg-[#15803d] text-white text-[11px] font-bold h-8 px-3 rounded-lg cursor-pointer'
                            : 'bg-[#006561] hover:bg-[#004e4a] text-white text-[11px] font-bold h-8 px-3 rounded-lg cursor-pointer'
                        }
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            <span>Đã Chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            <span>Sao Chép</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3 Steps Guide to use Voucher */}
        <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="font-display text-base font-bold text-[#2A2725] text-center">
            Cách Sử Dụng Mã Giảm Giá HeBekery Chỉ Với 3 Bước:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] space-y-1.5">
              <span className="w-7 h-7 rounded-full bg-[#006561] text-white font-bold text-xs flex items-center justify-center mx-auto">
                1
              </span>
              <h3 className="font-bold text-xs text-[#2A2725]">Sao chép mã</h3>
              <p className="text-[11px] text-[#6B6661]">
                Bấm nút "Sao chép" ở voucher bạn muốn dùng bên trên.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] space-y-1.5">
              <span className="w-7 h-7 rounded-full bg-[#006561] text-white font-bold text-xs flex items-center justify-center mx-auto">
                2
              </span>
              <h3 className="font-bold text-xs text-[#2A2725]">Chọn bánh vào giỏ</h3>
              <p className="text-[11px] text-[#6B6661]">
                Thêm các món bánh Biscotti, Granola hoặc Bánh ngói đạt đủ đơn tối thiểu.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] space-y-1.5">
              <span className="w-7 h-7 rounded-full bg-[#006561] text-white font-bold text-xs flex items-center justify-center mx-auto">
                3
              </span>
              <h3 className="font-bold text-xs text-[#2A2725]">Dán mã thanh toán</h3>
              <p className="text-[11px] text-[#6B6661]">
                Dán mã tại ô "Mã Giảm Giá" ở trang Checkout và xem số tiền giảm ngay lập tức!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
