import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingBag, AlertTriangle, ArrowRight, DollarSign, TrendingUp, Sparkles, ChefHat } from 'lucide-react'
import { orderApi, productApi } from '@/api'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/button'

export const AdminDashboardPage: React.FC = () => {
  const { data: orderData } = useQuery({
    queryKey: ['admin-orders-summary'],
    queryFn: () => orderApi.adminSearchOrders({ page: 0, size: 50 }),
  })

  const { data: productData } = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: () => productApi.getProducts({ page: 0, size: 50 }),
  })

  const orders = orderData?.content || []
  const products = productData?.content || []

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0)

  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING').length
  const lowStockProducts = products.filter((p) => p.stock <= (p.lowStockThreshold || 10)).length

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title Header */}
      <div className="border-b border-[#eadbce] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <ChefHat className="w-3.5 h-3.5" />
          <span>Bếp bánh & Trung tâm điều hành</span>
        </div>
        <h1 className="font-headline text-3xl font-bold text-[#2e1e12] tracking-tight">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6856] mt-1">
          Tổng quan chỉ số kinh doanh, mẻ bánh cần nướng và lượng tồn kho nguyên liệu hôm nay
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Revenue */}
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-3">
          <div className="flex items-center justify-between text-[#7c6856]">
            <span className="text-xs font-medium uppercase tracking-wider">Doanh Thu Thu Được</span>
            <div className="w-8 h-8 rounded-full bg-[#47654c]/10 text-[#47654c] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline text-2xl sm:text-3xl font-bold text-[#2e1e12]">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-[#15803d] flex items-center gap-1 font-medium bg-[#15803d]/5 py-1 px-2 rounded-lg w-fit">
            <TrendingUp className="w-3 h-3" /> Đã quyết toán qua SePay & COD
          </div>
        </div>

        {/* Metric 2: Pending Orders */}
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-3">
          <div className="flex items-center justify-between text-[#7c6856]">
            <span className="text-xs font-medium uppercase tracking-wider">Đơn Chờ Bếp Nướng</span>
            <div className="w-8 h-8 rounded-full bg-[#d97724]/10 text-[#d97724] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline text-2xl sm:text-3xl font-bold text-[#d97724]">
            {pendingOrders}
          </div>
          <div className="text-[11px] text-[#7c6856]">Đang chờ xác nhận công thức & ra lò</div>
        </div>

        {/* Metric 3: Active Menu Items */}
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-3">
          <div className="flex items-center justify-between text-[#7c6856]">
            <span className="text-xs font-medium uppercase tracking-wider">Món Đang Bán</span>
            <div className="w-8 h-8 rounded-full bg-[#4a3728]/10 text-[#4a3728] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline text-2xl sm:text-3xl font-bold text-[#2e1e12]">
            {products.length}
          </div>
          <div className="text-[11px] text-[#7c6856]">Sourdough, Granola & Biscotti</div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-3">
          <div className="flex items-center justify-between text-[#7c6856]">
            <span className="text-xs font-medium uppercase tracking-wider">Cảnh Báo Tồn Kho</span>
            <div className="w-8 h-8 rounded-full bg-[#dc2626]/10 text-[#dc2626] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline text-2xl sm:text-3xl font-bold text-[#dc2626]">
            {lowStockProducts}
          </div>
          <div className="text-[11px] text-[#dc2626] font-medium">Nguyên liệu cần nhập thêm</div>
        </div>
      </div>

      {/* Quick Access Operations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d97724]/10 text-[#d97724] text-[10px] font-bold uppercase">
            <ShoppingBag className="w-3 h-3" />
            <span>Khu vực ra lò</span>
          </div>
          <h2 className="font-headline text-lg font-bold text-[#2e1e12]">
            Điều Phối Đơn Hàng & Đóng Gói
          </h2>
          <p className="text-xs text-[#7c6856] leading-relaxed">
            Xem danh sách các đơn bánh mới phát sinh trong ngày, kiểm tra tình trạng thanh toán VietQR / COD, in phiếu và bàn giao cho đơn vị vận chuyển bánh nóng.
          </p>
          <Link to="/admin/orders">
            <Button className="btn-tactile bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full px-5 py-2 text-xs font-semibold flex items-center gap-2">
              <span>Đến trang Đơn Hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[10px] font-bold uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Thực đơn & Kho ảnh</span>
          </div>
          <h2 className="font-headline text-lg font-bold text-[#2e1e12]">
            Quản Lý Danh Mục Bánh & Cloudinary
          </h2>
          <p className="text-xs text-[#7c6856] leading-relaxed">
            Thêm sản phẩm bánh mì và ngũ cốc ăn kiêng mới, cập nhật bảng thành phần dinh dưỡng (Calories, Protein, Carbs, Fat) và hình ảnh độ nét cao.
          </p>
          <Link to="/admin/products">
            <Button
              variant="outline"
              className="rounded-full border-[#eadbce] text-[#2e1e12] hover:bg-[#faf8f5] px-5 py-2 text-xs font-semibold flex items-center gap-2"
            >
              <span>Đến trang Sản Phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
