import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Shield,
  Truck,
  UserCheck,
  Search,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import { adminUserApi } from '@/api'
import type { User, UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/utils/format'
import { toast } from 'sonner'

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [page, setPage] = useState(0)

  // Modal States
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [newRole, setNewRole] = useState<UserRole>('USER')

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [customPassword, setCustomPassword] = useState('')

  // Query users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', keyword, page],
    queryFn: () => adminUserApi.getUsers({ keyword: keyword.trim() || undefined, page, size: 20 }),
  })

  const users = usersData?.content || []
  const totalPages = usersData?.totalPages || 1

  // Filter by role client-side if selected
  const filteredUsers =
    roleFilter === 'ALL'
      ? users
      : users.filter((u) => u.role === roleFilter)

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      adminUserApi.updateUserRole(id, role),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(`Đã cập nhật vai trò cho ${updatedUser.name} thành công`)
      setRoleModalOpen(false)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể cập nhật vai trò'
      toast.error(msg)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminUserApi.updateUserStatus(id, active),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(
        updatedUser.active
          ? `Đã kích hoạt lại tài khoản ${updatedUser.name}`
          : `Đã khóa tài khoản ${updatedUser.name}`
      )
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể cập nhật trạng thái'
      toast.error(msg)
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword?: string }) =>
      adminUserApi.resetPassword(id, newPassword),
    onSuccess: (updatedUser) => {
      toast.success(`Đã đặt lại mật khẩu cho tài khoản ${updatedUser.email}`)
      setPasswordModalOpen(false)
      setCustomPassword('')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể đặt lại mật khẩu'
      toast.error(msg)
    },
  })

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-[#47654c] text-white">Chủ tiệm (ADMIN)</Badge>
      case 'STAFF_WAREHOUSE':
        return <Badge className="bg-[#d97724] text-white">Thủ kho (WAREHOUSE)</Badge>
      case 'STAFF_SALES':
        return <Badge className="bg-[#0284c7] text-white">Bán hàng (SALES)</Badge>
      case 'USER':
      default:
        return <Badge variant="secondary">Khách hàng (USER)</Badge>
    }
  }

  // Count stats
  const totalCount = usersData?.totalElements || users.length
  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const warehouseCount = users.filter((u) => u.role === 'STAFF_WAREHOUSE').length
  const salesCount = users.filter((u) => u.role === 'STAFF_SALES').length
  const userCount = users.filter((u) => u.role === 'USER').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#e7e5e4] pb-5">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Quản Lý Tài Khoản & Phân Quyền
        </h1>
        <p className="text-xs text-[#78716c] mt-0.5">
          Danh sách người dùng, thiết lập quyền hạn 4 vai trò và kiểm soát trạng thái đăng nhập
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
            Tổng Thành Viên
          </span>
          <div className="text-2xl font-black text-[#1c1917]">{totalCount}</div>
        </div>
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#47654c] uppercase tracking-wider block">
            Quản Trị Viên
          </span>
          <div className="text-2xl font-black text-[#47654c]">{adminCount}</div>
        </div>
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#d97724] uppercase tracking-wider block">
            Thủ Kho & Bếp
          </span>
          <div className="text-2xl font-black text-[#d97724]">{warehouseCount}</div>
        </div>
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block">
            Sales & CSKH
          </span>
          <div className="text-2xl font-black text-[#0284c7]">{salesCount}</div>
        </div>
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#57534e] uppercase tracking-wider block">
            Khách Mua Hàng
          </span>
          <div className="text-2xl font-black text-[#57534e]">{userCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="border border-[#e7e5e4] bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            placeholder="Tìm theo họ tên hoặc email..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#78716c] whitespace-nowrap">Lọc vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 border border-[#d6d3d1] bg-white px-3 text-xs text-[#1c1917] focus:outline-none focus:border-[#47654c]"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">ADMIN (Chủ tiệm)</option>
            <option value="STAFF_WAREHOUSE">STAFF_WAREHOUSE (Thủ kho)</option>
            <option value="STAFF_SALES">STAFF_SALES (Bán hàng)</option>
            <option value="USER">USER (Khách hàng)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#e7e5e4] bg-[#faf8f5] text-[#57534e] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Thành viên</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f4]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#78716c]">
                  Đang nạp dữ liệu danh sách người dùng...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#78716c]">
                  Không tìm thấy tài khoản người dùng nào.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#47654c]/10 text-[#47654c] font-bold flex items-center justify-center shrink-0">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-[#1c1917]">{u.name}</div>
                        <div className="text-[11px] text-[#78716c]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#57534e]">
                    {u.phone || 'Chưa cập nhật'}
                  </td>
                  <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                  <td className="py-3 px-4">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 text-[#15803d] font-semibold text-[11px]">
                        <Check className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#dc2626] font-semibold text-[11px]">
                        <X className="w-3 h-3" /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Change Role Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] px-2.5"
                        onClick={() => {
                          setSelectedUser(u)
                          setNewRole(u.role)
                          setRoleModalOpen(true)
                        }}
                      >
                        Đổi vai trò
                      </Button>

                      {/* Reset Password Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2 text-[#78716c] hover:text-[#1c1917]"
                        title="Đặt lại mật khẩu"
                        onClick={() => {
                          setSelectedUser(u)
                          setCustomPassword('')
                          setPasswordModalOpen(true)
                        }}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>

                      {/* Toggle Active Button */}
                      <Button
                        variant={u.active ? 'ghost' : 'outline'}
                        size="sm"
                        className={`h-7 text-[11px] px-2 ${
                          u.active
                            ? 'text-[#dc2626] hover:bg-[#dc2626]/10'
                            : 'text-[#15803d] hover:bg-[#15803d]/10'
                        }`}
                        title={u.active ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                        onClick={() =>
                          updateStatusMutation.mutate({ id: u.id, active: !u.active })
                        }
                      >
                        {u.active ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#e7e5e4] flex items-center justify-between text-xs text-[#78716c]">
            <div>
              Trang {page + 1} / {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Tiếp theo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent onClose={() => setRoleModalOpen(false)} className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Thay Đổi Vai Trò Người Dùng</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Thiết lập quyền truy cập cho tài khoản: <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="block font-semibold text-[#1c1917]">
              Chọn vai trò phân quyền mới:
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setNewRole('ADMIN')}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  newRole === 'ADMIN' ? 'border-[#47654c] bg-[#47654c]/5' : 'border-[#e7e5e4]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#47654c] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1c1917]">ADMIN (Chủ tiệm / Quản trị viên)</div>
                  <div className="text-[11px] text-[#78716c]">Toàn quyền truy cập tất cả phân hệ tài chính, nhân sự, kho và sản phẩm.</div>
                </div>
              </label>

              <label
                onClick={() => setNewRole('STAFF_WAREHOUSE')}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  newRole === 'STAFF_WAREHOUSE' ? 'border-[#d97724] bg-[#d97724]/5' : 'border-[#e7e5e4]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#d97724] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1c1917]">STAFF_WAREHOUSE (Thủ kho / Bếp bánh)</div>
                  <div className="text-[11px] text-[#78716c]">Quản lý tồn kho, tạo phiếu nhập hàng, quản lý số lô và hạn sử dụng bánh.</div>
                </div>
              </label>

              <label
                onClick={() => setNewRole('STAFF_SALES')}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  newRole === 'STAFF_SALES' ? 'border-[#0284c7] bg-[#0284c7]/5' : 'border-[#e7e5e4]'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1c1917]">STAFF_SALES (Bán hàng & CSKH)</div>
                  <div className="text-[11px] text-[#78716c]">Xác nhận đơn hàng, gán mã vận đơn, tiếp nhận yêu cầu đổi trả và tin nhắn liên hệ.</div>
                </div>
              </label>

              <label
                onClick={() => setNewRole('USER')}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  newRole === 'USER' ? 'border-[#57534e] bg-[#57534e]/5' : 'border-[#e7e5e4]'
                }`}
              >
                <Users className="w-4 h-4 text-[#57534e] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1c1917]">USER (Khách hàng thành viên)</div>
                  <div className="text-[11px] text-[#78716c]">Mua hàng, thanh toán VietQR, tích điểm thưởng và theo dõi đơn hàng cá nhân.</div>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={updateRoleMutation.isPending || newRole === selectedUser?.role}
              onClick={() => {
                if (selectedUser) {
                  updateRoleMutation.mutate({ id: selectedUser.id, role: newRole })
                }
              }}
            >
              {updateRoleMutation.isPending ? 'Đang lưu...' : 'Xác Nhận Đổi Vai Trò'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent onClose={() => setPasswordModalOpen(false)} className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Đặt Lại Mật Khẩu</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Khôi phục quyền truy cập cho tài khoản <strong>{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-[#57534e]">
              Nếu để trống, mật khẩu sẽ tự động được reset về mặc định: <strong>123456</strong>
            </p>
            <div>
              <label className="block font-semibold text-[#1c1917] mb-1">
                Mật khẩu mới (tùy chọn)
              </label>
              <Input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới hoặc để trống để dùng 123456"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setPasswordModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={resetPasswordMutation.isPending}
              onClick={() => {
                if (selectedUser) {
                  resetPasswordMutation.mutate({
                    id: selectedUser.id,
                    newPassword: customPassword.trim() || undefined,
                  })
                }
              }}
            >
              {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Xác Nhận Đặt Lại'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
