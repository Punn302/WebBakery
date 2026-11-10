import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Sparkles,
  ChefHat,
  Ticket,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react'
import { orderApi, productApi, adminVoucherApi } from '@/api'
import { formatCurrency, formatDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const AdminDashboardPage: React.FC = () => {
  const { data: orderData } = useQuery({
    queryKey: ['admin-orders-summary'],
    queryFn: () => orderApi.adminSearchOrders({ page: 0, size: 50 }),
  })

  const { data: productData } = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: () => productApi.getProducts({ page: 0, size: 50 }),
  })

  const { data: vouchers = [] } = useQuery({
    queryKey: ['admin-vouchers-summary'],
    queryFn: () => adminVoucherApi.getAll(),
  })

  const orders = orderData?.content || []
  const products = productData?.content || []

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0)

  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING').length
  const lowStockProducts = products.filter((p) => p.stock <= (p.lowStockThreshold || 10)).length
  const activeVouchers = vouchers.filter((v) => v.active).length

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title Header */}
      <div className="border-b border-[#eadbce] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <ChefHat className="w-3.5 h-3.5 text-[#c8983d]" />
          <span>Bếp bánh &amp; Trung tâm điều hành Hebekery</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#2A2725] tracking-tight">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6661] mt-1">
          Tổng quan chỉ số kinh doanh, mẻ bánh cần nướng, tồn kho nguyên liệu và chiến dịch khuyến mãi
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Revenue */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Doanh Thu Quyết Toán</span>
            <div className="w-8 h-8 rounded-full bg-[#006561]/10 text-[#006561] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2A2725]">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold bg-emerald-50 py-1 px-2.5 rounded-lg w-fit">
            <TrendingUp className="w-3 h-3" /> Đã thu qua SePay &amp; COD
          </div>
        </div>

        {/* Metric 2: Pending Orders */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Đơn Chờ Bếp Nướng</span>
            <div className="w-8 h-8 rounded-full bg-[#C9785C]/10 text-[#C9785C] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#C9785C]">
            {pendingOrders}
          </div>
          <div className="text-[11px] text-[#6B6661]">Cần chuẩn bị và ra lò sớm</div>
        </div>

        {/* Metric 3: Active Menu Items */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Món Đang Bán</span>
            <div className="w-8 h-8 rounded-full bg-[#2A2725]/10 text-[#2A2725] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2A2725]">
            {products.length}
          </div>
          <div className="text-[11px] text-[#6B6661]">Granola, Biscotti, Cookies, Thanh Hạt</div>
        </div>

        {/* Metric 4: Active Vouchers */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Mã Giảm Giá Đang Bật</span>
            <div className="w-8 h-8 rounded-full bg-[#c8983d]/15 text-[#c8983d] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#006561]">
            {activeVouchers} <span className="text-sm font-normal text-stone-500">/ {vouchers.length}</span>
          </div>
          <div className="text-[11px] text-[#006561] font-semibold">Ưu đãi kích cầu mua sắm</div>
        </div>
      </div>

      {/* Quick Access Operations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Orders */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9785C]/10 text-[#C9785C] text-[10px] font-bold uppercase">
              <ShoppingBag className="w-3 h-3" />
              <span>Đơn Hàng Khách Đặt</span>
            </div>
            <h2 className="font-display text-lg font-bold text-[#2A2725]">
              Điều Phối &amp; Đóng Gói
            </h2>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Xử lý đơn mới, kiểm tra biên lai VietQR tự động, in phiếu đóng hộp và bàn giao cho đơn vị vận chuyển.
            </p>
          </div>
          <Link to="/admin/orders">
            <Button className="btn-act rounded-full px-5 py-2 text-xs font-bold flex items-center gap-2 w-full justify-center">
              <span>Đến trang Đơn Hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Card 2: Products */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-[10px] font-bold uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Thực Đơn &amp; Giá Cả</span>
            </div>
            <h2 className="font-display text-lg font-bold text-[#2A2725]">
              Quản Lý Danh Mục Bánh
            </h2>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Thêm món bánh mới, cập nhật bảng dinh dưỡng (Calo, Protein, Carbs, Fat) và hình ảnh hũ bánh.
            </p>
          </div>
          <Link to="/admin/products">
            <Button
              variant="outline"
              className="rounded-full border-[#E5E2DF] text-[#2A2725] hover:bg-[#FAF7F2] px-5 py-2 text-xs font-bold flex items-center gap-2 w-full justify-center"
            >
              <span>Đến trang Sản Phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Card 3: Vouchers */}
        <div className="bg-white rounded-2xl border border-[#E5E2DF] p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase">
              <Ticket className="w-3 h-3" />
              <span>Khuyến Mãi &amp; Giảm Giá</span>
            </div>
            <h2 className="font-display text-lg font-bold text-[#2A2725]">
              Mã Giảm Giá &amp; Vouchers
            </h2>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Tạo và quản lý các mã giảm giá tiền mặt (HB5, HB10, HB20, HB30), giảm theo % và miễn phí vận chuyển Freeship.
            </p>
          </div>
          <Link to="/admin/vouchers">
            <Button
              variant="outline"
              className="rounded-full border-[#006561] text-[#006561] hover:bg-[#006561] hover:text-white px-5 py-2 text-xs font-bold flex items-center gap-2 w-full justify-center"
            >
              <span>Quản lý Vouchers ({vouchers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-[#E5E2DF] shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DF]">
          <div>
            <h3 className="font-display text-base font-bold text-[#2A2725]">
              Đơn hàng mới nhất
            </h3>
            <p className="text-xs text-[#6B6661]">
              Theo dõi trực tiếp các đơn đặt bánh vừa phát sinh
            </p>
          </div>
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" className="text-xs text-[#006561] font-bold">
              Xem tất cả ({orders.length}) &rarr;
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B6661]">Chưa có đơn hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#6B6661] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">Mã đơn</th>
                  <th className="py-2.5 px-3">Khách hàng</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DF]">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#006561]">
                      #{ord.id}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#2A2725]">
                      {ord.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-[#6B6661]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-stone-50 text-stone-700 border-stone-200">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2A2725]">
                      {formatCurrency(ord.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
export default AdminDashboardPage
