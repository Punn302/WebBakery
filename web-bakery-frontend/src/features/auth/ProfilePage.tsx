import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Phone,
  Mail,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Star,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { addressApi } from '@/api'
import type { Address, AddressRequest } from '@/types'
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
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  // Address dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressRequest>({
    receiverName: '',
    phone: '',
    province: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    addressLine: '',
    defaultAddress: false,
  })

  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: addressApi.getAddresses,
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: (data: AddressRequest) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      toast.success('Đã thêm địa chỉ mới vào sổ')
      closeDialog()
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể lưu địa chỉ'
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressRequest }) =>
      addressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      toast.success('Cập nhật địa chỉ thành công')
      closeDialog()
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể cập nhật địa chỉ'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      toast.success('Đã xóa địa chỉ khỏi sổ')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa địa chỉ'
      toast.error(msg)
    },
  })

  const openCreateDialog = () => {
    setEditingAddress(null)
    setFormData({
      receiverName: user?.name || '',
      phone: user?.phone || '',
      province: 'TP. Hồ Chí Minh',
      district: '',
      ward: '',
      addressLine: '',
      defaultAddress: addresses.length === 0,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr)
    setFormData({
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province || 'TP. Hồ Chí Minh',
      district: addr.district || '',
      ward: addr.ward || '',
      addressLine: addr.addressLine || '',
      defaultAddress: !!addr.defaultAddress,
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.receiverName.trim() || !formData.phone.trim() || !formData.addressLine.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleSetDefault = (addr: Address) => {
    updateMutation.mutate({
      id: addr.id,
      data: {
        receiverName: addr.receiverName,
        phone: addr.phone,
        province: addr.province || 'TP. Hồ Chí Minh',
        district: addr.district || '',
        ward: addr.ward || '',
        addressLine: addr.addressLine || '',
        defaultAddress: true,
      },
    })
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#eadbce] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tài khoản cá nhân</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#2e1e12] tracking-tight">
          Hồ Sơ Của Bạn
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6856] mt-1.5">
          Quản lý thông tin tài khoản, sổ địa chỉ nhận bánh và đơn hàng cá nhân tại Hebekery
        </p>
      </div>

      {/* Account Info Card */}
      <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#4a3728] text-white flex items-center justify-center font-headline font-bold text-2xl select-none ring-4 ring-[#faf8f5] shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline text-xl font-bold text-[#2e1e12]">{user.name}</h2>
              <Badge
                variant={user.role === 'ADMIN' ? 'accent' : 'secondary'}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              >
                {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng thân thiết'}
              </Badge>
            </div>
            <p className="text-xs text-[#7c6856]">Mã thành viên: #{user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#f5f0e9] pt-5 text-xs">
          <div className="flex items-center gap-2.5 text-[#5c4a3a]">
            <div className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#47654c]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#7c6856]">Email liên hệ</p>
              <p className="font-medium text-[#2e1e12]">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[#5c4a3a]">
            <div className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#47654c]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#7c6856]">Số điện thoại</p>
              <p className="font-medium text-[#2e1e12]">{user.phone || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#f5f0e9]">
          <Link to="/orders">
            <Button
              className="btn-tactile bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full px-5 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Xem lịch sử đơn bánh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="rounded-full border-[#eadbce] text-[#7c6856] hover:text-[#dc2626] hover:border-[#fecaca] text-xs px-4"
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Address Book Section */}
      <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f5f0e9]">
          <div className="space-y-1">
            <h2 className="font-headline text-lg font-bold text-[#2e1e12] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#47654c]" />
              <span>Sổ Địa Chỉ Giao Hàng</span>
            </h2>
            <p className="text-xs text-[#7c6856]">
              Lưu địa chỉ quen thuộc để thanh toán nhanh hơn khi đặt bánh mỗi sáng
            </p>
          </div>
          <Button
            size="sm"
            onClick={openCreateDialog}
            className="btn-tactile bg-[#47654c] hover:bg-[#38513d] text-white rounded-full px-4 text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm địa chỉ mới</span>
          </Button>
        </div>

        {isLoadingAddresses ? (
          <div className="py-10 text-center text-xs text-[#7c6856]">Đang nạp sổ địa chỉ...</div>
        ) : addresses.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#eadbce] rounded-xl p-6 space-y-2">
            <MapPin className="w-8 h-8 text-[#eadbce] mx-auto" />
            <p className="font-semibold text-xs text-[#2e1e12]">Bạn chưa lưu địa chỉ nhận hàng nào</p>
            <p className="text-[11px] text-[#7c6856]">
              Hãy thêm địa chỉ nhà riêng hoặc văn phòng để việc giao bánh được nhanh chóng.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={cn(
                  'p-4 rounded-xl border bg-white flex flex-col justify-between space-y-3 transition-all',
                  addr.defaultAddress
                    ? 'border-[#47654c] bg-[#47654c]/5 ring-1 ring-[#47654c]'
                    : 'border-[#eadbce] hover:border-[#4a3728]/30'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#2e1e12]">{addr.receiverName}</span>
                    {addr.defaultAddress ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#d97724] text-white">
                        <Star className="w-2.5 h-2.5 fill-current" /> Mặc định
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        className="text-[11px] text-[#7c6856] hover:text-[#47654c] underline cursor-pointer"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-[#7c6856]">
                    <span>SĐT: {addr.phone}</span>
                  </div>
                  <p className="text-xs text-[#5c4a3a] leading-relaxed">
                    {addr.fullAddress ||
                      `${addr.addressLine}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || ''}`}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f5f0e9]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(addr)}
                    className="h-7 px-2.5 text-xs text-[#5c4a3a] hover:bg-[#faf8f5] flex items-center gap-1 rounded-full"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Sửa</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
                        deleteMutation.mutate(addr.id)
                      }
                    }}
                    className="h-7 px-2.5 text-xs text-[#dc2626] hover:bg-[#fef2f2] flex items-center gap-1 rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={closeDialog} className="max-w-md rounded-2xl border border-[#eadbce] p-6 space-y-4">
          <form onSubmit={handleSaveAddress}>
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-[#2e1e12]">
                {editingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#7c6856]">
                Địa chỉ này sẽ được lưu vào sổ địa chỉ để sử dụng khi thanh toán bánh
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1">
                  Họ tên người nhận <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="rounded-xl border-[#eadbce] text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1">
                  Số điện thoại <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ví dụ: 0912345678"
                  className="rounded-xl border-[#eadbce] text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#2e1e12] mb-1">Tỉnh / Thành</label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="rounded-xl border-[#eadbce] text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2e1e12] mb-1">Quận / Huyện</label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Quận 1"
                    className="rounded-xl border-[#eadbce] text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2e1e12] mb-1">Phường / Xã</label>
                  <Input
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="P. Bến Nghé"
                    className="rounded-xl border-[#eadbce] text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2e1e12] mb-1">
                  Địa chỉ cụ thể (Số nhà, ngõ, tên đường) <span className="text-[#d97724]">*</span>
                </label>
                <Input
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Số 123 Đường Bánh Mì"
                  className="rounded-xl border-[#eadbce] text-xs h-9"
                  required
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.defaultAddress}
                  onChange={(e) => setFormData({ ...formData, defaultAddress: e.target.checked })}
                  className="rounded border-[#eadbce] text-[#47654c] focus:ring-[#47654c]"
                />
                <span className="text-xs font-medium text-[#2e1e12]">
                  Đặt làm địa chỉ nhận hàng mặc định
                </span>
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={closeDialog} className="rounded-full text-xs">
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-tactile bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full text-xs font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Đang lưu...'
                  : editingAddress
                  ? 'Lưu thay đổi'
                  : 'Thêm địa chỉ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
