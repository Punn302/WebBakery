import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileBarChart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Download,
  Calendar,
  Award,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { adminReportApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/utils/format'
import { toast } from 'sonner'

export const AdminReportsPage: React.FC = () => {
  // Date filter state (default 30 days)
  const defaultTo = new Date().toISOString().split('T')[0]
  const defaultFrom = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false)

  // Query Financial Revenue Report
  const { data: report, isLoading } = useQuery({
    queryKey: ['admin-revenue-report', from, to],
    queryFn: () => adminReportApi.getRevenueReport({ from, to }),
  })

  // Quick Preset Handlers
  const handlePreset = (days: number) => {
    const today = new Date().toISOString().split('T')[0]
    const past = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    setFrom(past)
    setTo(today)
  }

  // File Download Handlers
  const handleDownloadCsv = async () => {
    try {
      setIsDownloadingCsv(true)
      const csvData = await adminReportApi.downloadCsv(from, to)
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `hebekery-report-${from}-to-${to}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Đã tải xuống báo cáo CSV thành công')
    } catch {
      toast.error('Không thể tải file CSV')
    } finally {
      setIsDownloadingCsv(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true)
      const blob = await adminReportApi.downloadPdf(from, to)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `hebekery-report-${from}-to-${to}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Đã tải xuống báo cáo PDF thành công')
    } catch {
      toast.error('Không thể xuất file PDF')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const revenue = report?.revenueTotal || 0
  const cogs = report?.importCostTotal || 0
  const profit = report?.profitTotal || 0
  const marginPercent = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const orderCount = report?.revenueOrderCount || 0
  const cancelledCount = report?.cancelledOrderCount || 0
  const topProducts = report?.topSellingProducts || []
  const trend = report?.revenueTrend || []

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="border-b border-[#e7e5e4] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
            Báo Cáo Tài Chính & Doanh Thu P&L
          </h1>
          <p className="text-xs text-[#78716c] mt-0.5">
            Tổng hợp kết quả kinh doanh, giá vốn hàng bán (COGS), tỷ suất lợi nhuận gộp và xuất file kế toán
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={isDownloadingCsv}
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#15803d]" />
            <span>{isDownloadingCsv ? 'Đang tải...' : 'Tải Excel (CSV)'}</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={isDownloadingPdf}
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>{isDownloadingPdf ? 'Đang xuất...' : 'Xuất Báo Cáo PDF'}</span>
          </Button>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="border border-[#e7e5e4] bg-white p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#1c1917] flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#47654c]" /> Khoảng ngày:
          </span>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 text-xs w-36"
            />
            <span className="text-[#78716c]">đến</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 text-xs w-36"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset(1)}
            className="h-8 text-[11px]"
          >
            Hôm nay
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset(7)}
            className="h-8 text-[11px]"
          >
            7 ngày qua
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset(30)}
            className="h-8 text-[11px]"
          >
            30 ngày qua
          </Button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Doanh Thu Thuần</span>
            <DollarSign className="w-4 h-4 text-[#47654c]" />
          </div>
          <div className="text-2xl font-black text-[#1c1917]">
            {isLoading ? '...' : formatCurrency(revenue)}
          </div>
          <div className="text-[11px] text-[#15803d] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Ghi nhận từ các đơn giao thành công
          </div>
        </div>

        {/* COGS (Giá vốn hàng bán) */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Giá Vốn (COGS)</span>
            <TrendingDown className="w-4 h-4 text-[#d97724]" />
          </div>
          <div className="text-2xl font-black text-[#d97724]">
            {isLoading ? '...' : formatCurrency(cogs)}
          </div>
          <div className="text-[11px] text-[#78716c]">Chi phí nhập nguyên liệu & làm bánh</div>
        </div>

        {/* Gross Profit */}
        <div className="border border-[#47654c] bg-[#47654c]/5 p-5 space-y-2">
          <div className="flex items-center justify-between text-[#47654c]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lợi Nhuận Gộp</span>
            <TrendingUp className="w-4 h-4 text-[#47654c]" />
          </div>
          <div className="text-2xl font-black text-[#47654c]">
            {isLoading ? '...' : formatCurrency(profit)}
          </div>
          <div className="text-[11px] text-[#47654c] font-bold">
            Tỷ suất lợi nhuận: {marginPercent}%
          </div>
        </div>

        {/* Orders Count */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Số Đơn Hàng</span>
            <ShoppingBag className="w-4 h-4 text-[#1c1917]" />
          </div>
          <div className="text-2xl font-black text-[#1c1917]">
            {isLoading ? '...' : orderCount}
          </div>
          <div className="text-[11px] text-[#78716c]">
            Đã hoàn thành • <span className="text-[#dc2626] font-semibold">{cancelledCount} đơn hủy</span>
          </div>
        </div>
      </div>

      {/* Grid: Daily Trend & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Trend */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-[#47654c]" />
            <span>Diễn Biến Doanh Thu Theo Ngày</span>
          </h2>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#78716c]">Đang tải dữ liệu biểu đồ...</div>
          ) : trend.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#78716c]">
              Chưa có dữ liệu doanh thu trong khoảng thời gian này.
            </div>
          ) : (
            <div className="space-y-2 divide-y divide-[#f5f5f4] max-h-80 overflow-y-auto text-xs">
              {trend.map((item) => (
                <div key={item.date} className="pt-2 flex items-center justify-between">
                  <div className="font-semibold text-[#1c1917]">{item.date}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#78716c]">{item.orderCount} đơn</span>
                    <span className="font-bold text-[#47654c]">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 5 Best Selling Products */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#d97724]" />
            <span>Top Sản Phẩm Bán Chạy Nhất</span>
          </h2>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#78716c]">Đang tải bảng xếp hạng...</div>
          ) : topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#78716c]">
              Chưa có đơn hàng nào phát sinh doanh thu.
            </div>
          ) : (
            <div className="border border-[#e7e5e4] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e7e5e4] bg-[#faf8f5] text-[#57534e] font-bold text-[11px] uppercase">
                    <th className="py-2.5 px-3 text-center">Hạng</th>
                    <th className="py-2.5 px-3">Tên bánh healthy</th>
                    <th className="py-2.5 px-3 text-center">Đã bán</th>
                    <th className="py-2.5 px-3 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f4]">
                  {topProducts.map((p, index) => (
                    <tr key={p.productId || index} className="hover:bg-[#faf8f5]">
                      <td className="py-2.5 px-3 text-center font-bold text-[#d97724]">
                        #{index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1c1917]">
                        {p.productName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1c1917]">
                        {p.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-[#47654c]">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
