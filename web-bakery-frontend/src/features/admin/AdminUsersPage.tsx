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
        return <Badge className="bg-[#006561] text-white rounded-lg">Chủ tiệm (ADMIN)</Badge>
      case 'STAFF_WAREHOUSE':
        return <Badge className="bg-[#C9785C] text-white rounded-lg">Thủ kho (WAREHOUSE)</Badge>
      case 'STAFF_SALES':
        return <Badge className="bg-[#0284c7] text-white rounded-lg">Bán hàng (SALES)</Badge>
      case 'USER':
      default:
        return <Badge variant="secondary" className="rounded-lg">Khách hàng (USER)</Badge>
    }
  }

  // Count stats
  const totalCount = usersData?.totalElements || users.length
  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const warehouseCount = users.filter((u) => u.role === 'STAFF_WAREHOUSE').length
  const salesCount = users.filter((u) => u.role === 'STAFF_SALES').length
  const userCount = users.filter((u) => u.role === 'USER').length

  return (
    <div className="space-y-6 font-text">
      {/* Page Header */}
      <div className="border-b border-[#E5E2DF] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#2A2725]">
          Quản Lý Tài Khoản &amp; Phân Quyền
        </h1>
        <p className="text-xs text-[#6B6661] mt-1">
          Danh sách người dùng, thiết lập quyền hạn 4 vai trò và kiểm soát trạng thái đăng nhập
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B6661] uppercase tracking-wider block">
            Tổng Thành Viên
          </span>
          <div className="font-display text-2xl font-bold text-[#2A2725]">{totalCount}</div>
        </div>
        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#006561] uppercase tracking-wider block">
            Quản Trị Viên
          </span>
          <div className="font-display text-2xl font-bold text-[#006561]">{adminCount}</div>
        </div>
        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#C9785C] uppercase tracking-wider block">
            Thủ Kho &amp; Bếp
          </span>
          <div className="font-display text-2xl font-bold text-[#C9785C]">{warehouseCount}</div>
        </div>
        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block">
            Sales &amp; CSKH
          </span>
          <div className="font-display text-2xl font-bold text-[#0284c7]">{salesCount}</div>
        </div>
        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B6661] uppercase tracking-wider block">
            Khách Mua Hàng
          </span>
          <div className="font-display text-2xl font-bold text-[#2A2725]">{userCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6661]" />
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            placeholder="Tìm theo họ tên hoặc email..."
            className="pl-9 text-xs rounded-xl border-[#E5E2DF] h-9.5"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6B6661] whitespace-nowrap">Lọc vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9.5 rounded-xl border border-[#E5E2DF] bg-white px-3 text-xs text-[#2A2725] focus:outline-none focus:border-[#006561]"
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
      <div className="rounded-2xl border border-[#E5E2DF] bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E2DF] bg-[#FAF7F2] text-[#6B6661] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Thành viên</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E2DF]/50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#6B6661]">
                  Đang nạp dữ liệu danh sách người dùng...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#6B6661]">
                  Không tìm thấy tài khoản người dùng nào.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#006561]/10 text-[#006561] font-bold flex items-center justify-center shrink-0">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-[#2A2725]">{u.name}</div>
                        <div className="text-[11px] text-[#6B6661]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#6B6661]">
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
                        className="h-7 text-[11px] px-2.5 rounded-lg border-[#E5E2DF] text-[#2A2725] hover:bg-[#FAF7F2] cursor-pointer"
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
                        className="h-7 text-[11px] px-2 text-[#6B6661] hover:text-[#2A2725] rounded-lg cursor-pointer"
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
                        className={`h-7 text-[11px] px-2 rounded-lg cursor-pointer ${
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
          <div className="p-3 border-t border-[#E5E2DF] flex items-center justify-between text-xs text-[#6B6661]">
            <div>
              Trang {page + 1} / {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border-[#E5E2DF]"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border-[#E5E2DF]"
              >
                Tiếp theo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent onClose={() => setRoleModalOpen(false)} className="max-w-md p-6 space-y-4 rounded-3xl border border-[#E5E2DF]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[#2A2725]">Thay Đổi Vai Trò Người Dùng</DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Thiết lập quyền truy cập cho tài khoản: <strong className="text-[#2A2725]">{selectedUser?.name}</strong> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="block font-semibold text-[#2A2725]">
              Chọn vai trò phân quyền mới:
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setNewRole('ADMIN')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  newRole === 'ADMIN' ? 'border-[#006561] bg-[#006561]/5' : 'border-[#E5E2DF]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#006561] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A2725]">ADMIN (Chủ tiệm / Quản trị viên)</div>
                  <div className="text-[11px] text-[#6B6661]">Toàn quyền truy cập tất cả phân hệ tài chính, nhân sự, kho và sản phẩm.</div>
                </div>
              </label>

              <label
                onClick={() => setNewRole('STAFF_WAREHOUSE')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  newRole === 'STAFF_WAREHOUSE' ? 'border-[#C9785C] bg-[#C9785C]/5' : 'border-[#E5E2DF]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#C9785C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A2725]">STAFF_WAREHOUSE (Thủ kho / Bếp bánh)</div>
                  <div className="text-[11px] text-[#6B6661]">Quản lý tồn kho, tạo phiếu nhập hàng, quản lý số lô và hạn sử dụng bánh.</div>
                </div>
              </label>

              <label
                onClick={() => setNewRole('STAFF_SALES')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  newRole === 'STAFF_SALES' ? 'border-[#0284c7] bg-[#0284c7]/5' : 'border-[#E5E2DF]'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A2725]">STAFF_SALES (Bán hàng &amp; CSKH)</div>
                  <div className="text-[11px] text-[#6B6661]">Xác nhận đơn hàng, gán mã vận đơn, tiếp nhận yêu cầu đổi trả và tin nhắn liên hệ.</div>
                </div>
              </label>

              <label
                onClick={() => setNewRole('USER')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  newRole === 'USER' ? 'border-[#6B6661] bg-[#6B6661]/5' : 'border-[#E5E2DF]'
                }`}
              >
                <Users className="w-4 h-4 text-[#6B6661] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A2725]">USER (Khách hàng thành viên)</div>
                  <div className="text-[11px] text-[#6B6661]">Mua hàng, thanh toán VietQR, tích điểm thưởng và theo dõi đơn hàng cá nhân.</div>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)} className="rounded-xl text-xs cursor-pointer">
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={updateRoleMutation.isPending || newRole === selectedUser?.role}
              className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
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
        <DialogContent onClose={() => setPasswordModalOpen(false)} className="max-w-md p-6 space-y-4 rounded-3xl border border-[#E5E2DF]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[#2A2725]">Đặt Lại Mật Khẩu</DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Khôi phục quyền truy cập cho tài khoản <strong className="text-[#2A2725]">{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-[#6B6661]">
              Nếu để trống, mật khẩu sẽ tự động được reset về mặc định: <strong className="text-[#006561]">123456</strong>
            </p>
            <div>
              <label className="block font-semibold text-[#2A2725] mb-1">
                Mật khẩu mới (tùy chọn)
              </label>
              <Input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới hoặc để trống để dùng 123456"
                className="rounded-xl border-[#E5E2DF] text-xs h-9.5"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setPasswordModalOpen(false)} className="rounded-xl text-xs cursor-pointer">
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={resetPasswordMutation.isPending}
              className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
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
