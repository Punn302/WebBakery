import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingBag, Users, AlertTriangle, ArrowRight, DollarSign, TrendingUp } from 'lucide-react'
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-xs text-[#78716c] mt-0.5">
          Tổng quan chỉ số kinh doanh, kho hàng và đơn hàng cần xử lý
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-semibold uppercase tracking-wider">Doanh Thu Thu Được</span>
            <DollarSign className="w-4 h-4 text-[#47654c]" />
          </div>
          <div className="text-2xl font-black text-[#1c1917]">{formatCurrency(totalRevenue)}</div>
          <div className="text-[11px] text-[#15803d] flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Đã ghi nhận từ đơn hoàn thành
          </div>
        </div>

        {/* Metric 2 */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-semibold uppercase tracking-wider">Đơn Hàng Mới</span>
            <ShoppingBag className="w-4 h-4 text-[#d97724]" />
          </div>
          <div className="text-2xl font-black text-[#d97724]">{pendingOrders}</div>
          <div className="text-[11px] text-[#78716c]">Đang chờ tiệm xác nhận & làm bánh</div>
        </div>

        {/* Metric 3 */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-semibold uppercase tracking-wider">Mặt Hàng Đang Bán</span>
            <Package className="w-4 h-4 text-[#47654c]" />
          </div>
          <div className="text-2xl font-black text-[#1c1917]">{products.length}</div>
          <div className="text-[11px] text-[#78716c]">Sản phẩm bánh tươi & ngũ cốc</div>
        </div>

        {/* Metric 4 */}
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-semibold uppercase tracking-wider">Cảnh Báo Tồn Kho</span>
            <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
          </div>
          <div className="text-2xl font-black text-[#dc2626]">{lowStockProducts}</div>
          <div className="text-[11px] text-[#78716c]">Sản phẩm chạm hoặc dưới mức tối thiểu</div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[#e7e5e4] bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
            Xử Lý Đơn Hàng Mới
          </h2>
          <p className="text-xs text-[#78716c] leading-relaxed">
            Kiểm tra các đơn đặt hàng mới phát sinh từ khách hàng, cập nhật trạng thái làm bánh, xuất kho và bàn giao đơn vị vận chuyển.
          </p>
          <Link to="/admin/orders">
            <Button variant="default" size="sm" className="flex items-center gap-1.5">
              <span>Đến trang Đơn Hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="border border-[#e7e5e4] bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
            Quản Lý Thực Đơn & Hình Ảnh
          </h2>
          <p className="text-xs text-[#78716c] leading-relaxed">
            Thêm sản phẩm mới, cập nhật giá bán, tải ảnh sản phẩm trực tiếp lên kho đám mây Cloudinary CDN và theo dõi lượng tồn kho.
          </p>
          <Link to="/admin/products">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
              <span>Đến trang Sản Phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
