import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  Phone,
  Mail,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Star,
  Check,
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
      defaultAddress: addr.defaultAddress,
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
      toast.error('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ cụ thể')
      return
    }

    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleSetDefault = (addr: Address) => {
    if (addr.defaultAddress) return
    updateMutation.mutate({
      id: addr.id,
      data: {
        receiverName: addr.receiverName,
        phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        addressLine: addr.addressLine,
        defaultAddress: true,
      },
    })
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Hồ Sơ Của Bạn
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Thông tin tài khoản, sổ địa chỉ nhận hàng và quản lý đơn hàng cá nhân tại Hebekery
        </p>
      </div>

      {/* Account Info Card */}
      <div className="border border-[#e7e5e4] bg-white p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#47654c] text-white flex items-center justify-center font-bold text-2xl select-none">
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
            <span>
              Email: <strong>{user.email}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#57534e]">
            <Phone className="w-4 h-4 text-[#47654c]" />
            <span>
              SĐT: <strong>{user.phone || 'Chưa cập nhật'}</strong>
            </span>
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

      {/* Address Book Section */}
      <div className="border border-[#e7e5e4] bg-white p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#f5f5f4]">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#47654c]" />
              <span>Sổ Địa Chỉ Giao Hàng Của Tôi</span>
            </h2>
            <p className="text-xs text-[#78716c]">
              Lưu các địa chỉ nhận hàng quen thuộc để thanh toán nhanh hơn khi đặt bánh
            </p>
          </div>
          <Button size="sm" onClick={openCreateDialog} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Thêm địa chỉ mới</span>
          </Button>
        </div>

        {isLoadingAddresses ? (
          <div className="py-8 text-center text-xs text-[#78716c]">Đang nạp sổ địa chỉ...</div>
        ) : addresses.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#e7e5e4] p-6 space-y-2">
            <MapPin className="w-8 h-8 text-[#a8a29e] mx-auto" />
            <p className="font-semibold text-xs text-[#1c1917]">Bạn chưa lưu địa chỉ nhận hàng nào</p>
            <p className="text-[11px] text-[#78716c]">
              Hãy thêm địa chỉ nhà riêng hoặc văn phòng để việc giao bánh được nhanh chóng.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={cn(
                  'p-4 border bg-white flex flex-col justify-between space-y-3 transition-colors',
                  addr.defaultAddress ? 'border-[#47654c] bg-[#47654c]/5' : 'border-[#e7e5e4]'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#1c1917]">{addr.receiverName}</span>
                    {addr.defaultAddress ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#d97724] text-white">
                        <Star className="w-2.5 h-2.5 fill-current" /> Mặc định
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        className="text-[11px] text-[#78716c] hover:text-[#47654c] underline cursor-pointer"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-[#57534e]">
                    <span>SĐT: {addr.phone}</span>
                  </div>
                  <p className="text-xs text-[#78716c] leading-relaxed">
                    {addr.fullAddress ||
                      `${addr.addressLine}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || ''}`}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f5f5f4]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(addr)}
                    className="h-7 px-2 text-xs flex items-center gap-1"
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
                    className="h-7 px-2 text-xs text-[#dc2626] hover:bg-[#dc2626]/10 flex items-center gap-1"
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
        <DialogContent onClose={closeDialog} className="max-w-md">
          <form onSubmit={handleSaveAddress}>
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716c]">
                Địa chỉ này sẽ được lưu vào sổ địa chỉ để sử dụng khi thanh toán
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Họ tên người nhận *
                </label>
                <Input
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Số điện thoại *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ví dụ: 0912345678"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">Tỉnh / Thành</label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">Quận / Huyện</label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Quận 1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1917] mb-1">Phường / Xã</label>
                  <Input
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="P. Bến Nghé"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Địa chỉ cụ thể (Số nhà, tên đường) *
                </label>
                <Input
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Số 123 Đường Bánh Mì"
                  required
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.defaultAddress}
                  onChange={(e) => setFormData({ ...formData, defaultAddress: e.target.checked })}
                  className="rounded-none border-[#d6d3d1] text-[#47654c] focus:ring-0"
                />
                <span className="text-xs font-medium text-[#1c1917]">
                  Đặt làm địa chỉ nhận hàng mặc định
                </span>
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={closeDialog}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
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
