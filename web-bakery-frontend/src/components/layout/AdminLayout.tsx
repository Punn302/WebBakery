import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  FileBarChart,
  Mail,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Truck,
  Sparkles,
  Ticket,
  Star,
  FolderTree,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()

  const allNavItems = [
    {
      label: 'Tổng quan bếp & kinh doanh',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN'],
    },
    {
      label: 'Sản phẩm & Thực đơn',
      path: '/admin/products',
      icon: Package,
      roles: ['ADMIN'],
    },
    {
      label: 'Danh mục sản phẩm',
      path: '/admin/categories',
      icon: FolderTree,
      roles: ['ADMIN'],
    },
    {
      label: 'Đơn hàng khách đặt',
      path: '/admin/orders',
      icon: ShoppingBag,
      roles: ['ADMIN', 'STAFF_SALES'],
    },
    {
      label: 'Kho nguyên liệu & Nhập kho',
      path: '/admin/inventory',
      icon: Warehouse,
      roles: ['ADMIN', 'STAFF_WAREHOUSE'],
    },
    {
      label: 'Quản lý tài khoản',
      path: '/admin/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      label: 'Mã giảm giá & Voucher',
      path: '/admin/vouchers',
      icon: Ticket,
      roles: ['ADMIN'],
    },
    {
      label: 'Báo cáo doanh thu',
      path: '/admin/reports',
      icon: FileBarChart,
      roles: ['ADMIN'],
    },
    {
      label: 'Hộp thư tư vấn & liên hệ',
      path: '/admin/contacts',
      icon: Mail,
      roles: ['ADMIN', 'STAFF_SALES'],
    },
    {
      label: 'Đánh giá & Nhận xét',
      path: '/admin/reviews',
      icon: Star,
      roles: ['ADMIN', 'STAFF_SALES'],
    },
  ]

  const userRole = user?.role || 'ADMIN'
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole))

  const getRoleLabel = () => {
    switch (userRole) {
      case 'ADMIN':
        return { label: 'Chủ tiệm (Admin)', icon: ShieldCheck, color: 'text-[#006561]' }
      case 'STAFF_SALES':
        return { label: 'Nhân viên Bán hàng & CSKH', icon: UserCheck, color: 'text-[#0284c7]' }
      case 'STAFF_WAREHOUSE':
        return { label: 'Thủ kho & Bếp bánh', icon: Truck, color: 'text-[#C9785C]' }
      default:
        return { label: 'Quản trị viên', icon: ShieldCheck, color: 'text-[#006561]' }
    }
  }

  const roleInfo = getRoleLabel()
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] text-[#2A2725] font-text">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E2DF] flex flex-col shrink-0">
        {/* Brand Header: Clean logo + ADMIN PORTAL badge without redundant text */}
        <div className="p-4 sm:p-5 border-b border-[#E5E2DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" title="Về trang chủ Hebekery" className="shrink-0">
              <img
                src="/logo.webp"
                alt="Hebekery"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#006561] uppercase bg-[#006561]/8 px-2 py-0.5 rounded-md w-fit">
                ADMIN PORTAL
              </span>
              <span className={cn('text-[11px] font-medium flex items-center gap-1 mt-1 truncate', roleInfo.color)}>
                <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{roleInfo.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 text-xs rounded-xl transition-all select-none',
                  isActive
                    ? 'bg-[#006561] text-white shadow-xs font-semibold'
                    : 'text-[#6B6661] hover:bg-[#FAF7F2] hover:text-[#006561] font-medium'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-[#6B6661]')} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Return to shop */}
        <div className="p-4 border-t border-[#E5E2DF]">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-[#6B6661] hover:text-[#006561] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về cửa hàng bánh</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[#E5E2DF] bg-white/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-[#6B6661]">
            <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
            <span className="hidden sm:inline font-medium">Hệ thống Quản trị Bếp Bánh &amp; Vận Hành Chuỗi Cung Ứng Hebekery</span>
            <span className="sm:hidden font-medium">Hebekery Admin</span>
          </div>
          <div className="text-xs font-semibold text-[#2A2725] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span>{user?.name || user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
