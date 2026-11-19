import React, { useState, useEffect } from 'react'
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
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Automatically close mobile drawer when navigating
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const navGroups = [
    {
      groupTitle: 'Vận Hành & Đơn Hàng',
      items: [
        {
          label: 'Tổng quan điều hành',
          path: '/admin/dashboard',
          icon: LayoutDashboard,
          roles: ['ADMIN'],
        },
        {
          label: 'Đơn hàng khách đặt',
          path: '/admin/orders',
          icon: ShoppingBag,
          roles: ['ADMIN', 'STAFF_SALES'],
        },
        {
          label: 'Mã giảm giá & Voucher',
          path: '/admin/vouchers',
          icon: Ticket,
          roles: ['ADMIN'],
        },
        {
          label: 'Đánh giá & Nhận xét',
          path: '/admin/reviews',
          icon: Star,
          roles: ['ADMIN', 'STAFF_SALES'],
        },
        {
          label: 'Hộp thư CSKH & Tư vấn',
          path: '/admin/contacts',
          icon: Mail,
          roles: ['ADMIN', 'STAFF_SALES'],
        },
      ],
    },
    {
      groupTitle: 'Bếp Bánh & Tồn Kho',
      items: [
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
          label: 'Kho bánh & Nhập lô FEFO',
          path: '/admin/inventory',
          icon: Warehouse,
          roles: ['ADMIN', 'STAFF_WAREHOUSE'],
        },
      ],
    },
    {
      groupTitle: 'Hệ Thống & Báo Cáo',
      items: [
        {
          label: 'Báo cáo doanh thu P&L',
          path: '/admin/reports',
          icon: FileBarChart,
          roles: ['ADMIN'],
        },
        {
          label: 'Quản lý tài khoản',
          path: '/admin/users',
          icon: Users,
          roles: ['ADMIN'],
        },
        {
          label: 'Kiểm thử thanh toán SePay',
          path: '/admin/sepay-simulator',
          icon: Zap,
          roles: ['ADMIN'],
        },
      ],
    },
  ]

  const userRole = user?.role || 'ADMIN'

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

  const renderSidebarContent = (isDrawer = false) => (
    <>
      {/* Brand Header: Clean logo + ADMIN PORTAL badge without redundant text */}
      <div className="p-4 sm:p-5 border-b border-[#E5E2DF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            title="Về trang chủ Hebekery"
            className="shrink-0"
            onClick={() => setIsMobileOpen(false)}
          >
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
        {isDrawer && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-2 -mr-2 rounded-lg text-[#6B6661] hover:text-[#2A2725] hover:bg-[#FAF7F2] min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(userRole))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.groupTitle} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-[#6B6661] uppercase tracking-wider block">
                {group.groupTitle}
              </span>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2 text-xs rounded-xl transition-all select-none min-h-[40px]',
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
              </div>
            </div>
          )
        })}
      </nav>

      {/* Return to shop */}
      <div className="p-4 border-t border-[#E5E2DF]">
        <Link
          to="/"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-2 text-xs font-medium text-[#6B6661] hover:text-[#006561] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về cửa hàng bánh</span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] text-[#2A2725] font-text">
      {/* Desktop Sidebar (hidden lg:flex) */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#E5E2DF] flex-col shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop (lg:hidden) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-[#E5E2DF] bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#2A2725] hover:bg-[#FAF7F2] min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5 text-[#2A2725]" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#6B6661]">
              <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
              <span className="hidden sm:inline font-medium">Hệ thống Quản trị Bếp Bánh &amp; Vận Hành Chuỗi Cung Ứng Hebekery</span>
              <span className="sm:hidden font-medium">Hebekery Admin</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-[#2A2725] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="truncate max-w-[140px] sm:max-w-none">{user?.name || user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
