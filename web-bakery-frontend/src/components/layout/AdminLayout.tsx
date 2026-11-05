import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  FileBarChart,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export const AdminLayout: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { label: 'Tổng quan', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Sản phẩm', path: '/admin/products', icon: Package },
    { label: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Kho hàng & Nhập kho', path: '/admin/inventory', icon: Warehouse },
    { label: 'Khách hàng', path: '/admin/users', icon: Users },
    { label: 'Báo cáo doanh thu', path: '/admin/reports', icon: FileBarChart },
  ]

  return (
    <div className="min-h-screen flex bg-[#f7f5f0] text-[#1c1917]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e7e5e4] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#47654c] text-white flex items-center justify-center font-bold text-sm">
              HB
            </div>
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#1c1917]">
                Hebekery Admin
              </h2>
              <span className="text-[10px] text-[#47654c] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Quản trị viên
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-none transition-colors select-none',
                  isActive
                    ? 'bg-[#47654c] text-white shadow-xs'
                    : 'text-[#57534e] hover:bg-[#faf8f5] hover:text-[#1c1917]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#e7e5e4]">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-[#78716c] hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về cửa hàng chính</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[#e7e5e4] bg-white px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="text-xs text-[#78716c]">
            Hệ thống Quản trị Bán hàng & Chuỗi Cung ứng Hebekery
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
