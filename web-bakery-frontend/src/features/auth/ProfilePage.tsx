import React from 'react'
import { Link } from 'react-router-dom'
import { User, Phone, Mail, Shield, ShoppingBag, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Hồ Sơ Của Bạn
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Thông tin tài khoản và quản lý đơn hàng cá nhân tại Hebekery
        </p>
      </div>

      <div className="border border-[#e7e5e4] bg-white p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#47654c] text-white flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1c1917]">{user.name}</h2>
              <Badge variant={user.role === 'ADMIN' ? 'accent' : 'secondary'}>
                {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng thân thiết'}
              </Badge>
            </div>
            <p className="text-xs text-[#78716c] mt-0.5">Mã thành viên: #{user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#f5f5f4] pt-4 text-xs">
          <div className="flex items-center gap-2 text-[#57534e]">
            <Mail className="w-4 h-4 text-[#47654c]" />
            <span>Email: <strong>{user.email}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[#57534e]">
            <Phone className="w-4 h-4 text-[#47654c]" />
            <span>SĐT: <strong>{user.phone || 'Chưa cập nhật'}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#f5f5f4]">
          <Link to="/orders">
            <Button variant="default" size="sm" className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Xem lịch sử đơn hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
}
