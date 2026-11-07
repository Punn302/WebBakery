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
  ]

  const userRole = user?.role || 'ADMIN'
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole))

  const getRoleLabel = () => {
    switch (userRole) {
      case 'ADMIN':
        return { label: 'Chủ tiệm (Admin)', icon: ShieldCheck, color: 'text-[#47654c]' }
      case 'STAFF_SALES':
        return { label: 'Nhân viên Bán hàng & CSKH', icon: UserCheck, color: 'text-[#0284c7]' }
      case 'STAFF_WAREHOUSE':
        return { label: 'Thủ kho & Bếp bánh', icon: Truck, color: 'text-[#d97724]' }
      default:
        return { label: 'Quản trị viên', icon: ShieldCheck, color: 'text-[#47654c]' }
    }
  }

  const roleInfo = getRoleLabel()
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen flex bg-[#faf8f5] text-[#2e1e12]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#eadbce] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#eadbce] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.webp"
              alt="Hebekery"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h2 className="font-headline font-bold text-base text-[#2e1e12]">
                Hebekery Admin
              </h2>
              <span className={cn('text-[10px] font-semibold flex items-center gap-1', roleInfo.color)}>
                <RoleIcon className="w-3 h-3" /> {roleInfo.label}
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
                  'flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all select-none',
                  isActive
                    ? 'bg-[#4a3728] text-white shadow-xs font-semibold'
                    : 'text-[#5c4a3a] hover:bg-[#faf8f5] hover:text-[#2e1e12]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#d97724]' : 'text-[#7c6856]')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Return to shop */}
        <div className="p-4 border-t border-[#eadbce]">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-[#7c6856] hover:text-[#2e1e12] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về cửa hàng bánh</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[#eadbce] bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-[#7c6856]">
            <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
            <span>Hệ thống Quản trị Bếp Bánh & Vận Hành Chuỗi Cung Ứng Hebekery</span>
          </div>
          <div className="text-xs font-semibold text-[#2e1e12] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span>{user?.name || user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
