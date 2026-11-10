import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Percent,
  Truck,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react'
import { adminVoucherApi } from '@/api'
import type { Voucher } from '@/types'
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
import { formatCurrency } from '@/utils/format'

export const AdminVoucherPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState<{
    code: string
    name: string
    description: string
    discountType: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING'
    discountValue: number
    minOrderAmount: number
    maxDiscountAmount: number
    usageLimit: number
    active: boolean
  }>({
    code: '',
    name: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: 10000,
    minOrderAmount: 200000,
    maxDiscountAmount: 0,
    usageLimit: 500,
    active: true,
  })

  // Queries
  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: adminVoucherApi.getAll,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Voucher>) => adminVoucherApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['available-vouchers'] })
      toast.success('Tạo mã giảm giá mới thành công!')
      closeDialog()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể tạo mã giảm giá')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Voucher> }) =>
      adminVoucherApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['available-vouchers'] })
      toast.success('Cập nhật mã giảm giá thành công!')
      closeDialog()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể cập nhật mã giảm giá')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => adminVoucherApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['available-vouchers'] })
      toast.success('Đã xóa mã giảm giá')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể xóa mã giảm giá')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number | string) => adminVoucherApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['available-vouchers'] })
      toast.success('Thay đổi trạng thái voucher thành công')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể thay đổi trạng thái')
    },
  })

  // Handlers
  const openCreateDialog = () => {
    setEditingVoucher(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'FIXED_AMOUNT',
      discountValue: 10000,
      minOrderAmount: 200000,
      maxDiscountAmount: 0,
      usageLimit: 500,
      active: true,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (v: Voucher) => {
    setEditingVoucher(v)
    setFormData({
      code: v.code,
      name: v.name || '',
      description: v.description || '',
      discountType: (v.discountType as any) || 'FIXED_AMOUNT',
      discountValue: v.discountValue || 0,
      minOrderAmount: v.minOrderAmount || 0,
      maxDiscountAmount: v.maxDiscountAmount || 0,
      usageLimit: v.usageLimit || 500,
      active: v.active,
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingVoucher(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim()) {
      toast.error('Mã voucher không được để trống')
      return
    }

    const payload: Partial<Voucher> = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim() || formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount) || undefined,
      maxDiscountAmount:
        formData.discountType === 'PERCENTAGE' && formData.maxDiscountAmount > 0
          ? Number(formData.maxDiscountAmount)
          : undefined,
      usageLimit: Number(formData.usageLimit) || undefined,
      active: formData.active,
    }

    if (editingVoucher) {
      updateMutation.mutate({ id: editingVoucher.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Đã sao chép mã: ${code}`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Filtered Vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase()))
    if (!matchSearch) return false

    if (statusFilter === 'ACTIVE') return v.active
    if (statusFilter === 'INACTIVE') return !v.active
    return true
  })

  // Summary Metrics
  const activeCount = vouchers.filter((v) => v.active).length
  const totalUses = vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
            <span>Chương trình khuyến mãi &amp; Giảm giá</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
            Quản Lý Mã Giảm Giá (Vouchers)
          </h1>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Cấu hình các voucher giảm tiền mặt, phần trăm và freeship áp dụng tại giỏ hàng và thanh toán
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
          className="btn-act rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã giảm giá mới</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng số Voucher</span>
            <Ticket className="w-4 h-4 text-[#006561]" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#2A2725]">{vouchers.length}</p>
          <p className="text-[11px] text-[#6B6661]">Các chiến dịch khuyến mãi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Đang hoạt động</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-3xl font-bold text-emerald-700">{activeCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Khách có thể sử dụng ngay</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#6B6661]">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng lượt áp dụng</span>
            <Percent className="w-4 h-4 text-[#C9785C]" />
          </div>
          <p className="font-mono text-3xl font-bold text-[#006561]">{totalUses}</p>
          <p className="text-[11px] text-[#6B6661]">Đơn hàng đã hưởng ưu đãi</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E2DF] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã hoặc tên voucher..."
            className="pl-10 text-xs rounded-xl border-[#E5E2DF] h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ACTIVE', label: 'Đang bật' },
            { id: 'INACTIVE', label: 'Tạm tắt' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#006561] text-white font-bold'
                  : 'bg-stone-50 text-[#6B6661] hover:bg-stone-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DF] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#6B6661]">Đang nạp danh sách mã giảm giá...</div>
        ) : filteredVouchers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="w-10 h-10 text-[#C9785C] mx-auto opacity-70" />
            <p className="font-display font-bold text-base text-[#2A2725]">Chưa có mã giảm giá nào</p>
            <p className="text-xs text-[#6B6661]">Bấm vào nút "Tạo mã giảm giá mới" ở góc trên để thêm voucher đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#6B6661] uppercase tracking-wider font-bold border-b border-[#E5E2DF]">
                <tr>
                  <th className="py-3 px-4">Mã Voucher</th>
                  <th className="py-3 px-4">Tên chương trình</th>
                  <th className="py-3 px-4">Hình thức giảm</th>
                  <th className="py-3 px-4">Giá trị ưu đãi</th>
                  <th className="py-3 px-4">Đơn tối thiểu</th>
                  <th className="py-3 px-4">Đã dùng / Giới hạn</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DF]">
                {filteredVouchers.map((v) => {
                  const isCopied = copiedCode === v.code
                  const typeLabel =
                    (v.discountType as string) === 'FREE_SHIPPING'
                      ? 'Freeship vận chuyển'
                      : v.discountType === 'PERCENTAGE'
                      ? 'Giảm theo %'
                      : 'Giảm số tiền'

                  const typeColor =
                    (v.discountType as string) === 'FREE_SHIPPING'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : v.discountType === 'PERCENTAGE'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'

                  return (
                    <tr key={v.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-[#006561] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#006561]/20">
                            {v.code}
                          </span>
                          <button
                            onClick={() => handleCopy(v.code)}
                            className="text-stone-400 hover:text-[#006561] transition-colors"
                            title="Sao chép mã"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Name & Desc */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#2A2725]">{v.name || v.code}</p>
                        {v.description && <p className="text-[11px] text-[#6B6661] line-clamp-1">{v.description}</p>}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2A2725]">
                        {v.discountType === 'PERCENTAGE'
                          ? `${v.discountValue}% ${v.maxDiscountAmount ? `(Tối đa ${formatCurrency(v.maxDiscountAmount)})` : ''}`
                          : formatCurrency(v.discountValue)}
                      </td>

                      {/* Min Order */}
                      <td className="py-3.5 px-4 font-mono text-[#6B6661]">
                        {v.minOrderAmount ? formatCurrency(v.minOrderAmount) : 'Không yêu cầu'}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-[#2A2725]">
                            {v.usedCount || 0} / {v.usageLimit ? v.usageLimit : '∞'}
                          </span>
                          {v.usageLimit && (
                            <div className="w-20 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#006561] h-full"
                                style={{ width: `${Math.min(100, Math.round(((v.usedCount || 0) / v.usageLimit) * 100))}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleMutation.mutate(v.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                            v.active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {v.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Bật
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Tắt
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(v)}
                            className="h-8 px-2 text-[#6B6661] hover:text-[#006561]"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa voucher ${v.code}?`)) {
                                deleteMutation.mutate(v.id)
                              }
                            }}
                            className="h-8 px-2 text-[#6B6661] hover:text-red-600"
                            title="Xóa voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Voucher Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl bg-white p-6 sm:p-8">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-xl font-bold text-[#2A2725]">
              {editingVoucher ? `Chỉnh sửa Voucher: ${editingVoucher.code}` : 'Tạo mã giảm giá mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Thiết lập thông số chiết khấu cho khách hàng khi mua bánh dinh dưỡng tại Hebekery
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Mã Voucher <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ví dụ: HB50, FREESHIP"
                  required
                  className="rounded-xl border-[#E5E2DF] font-mono font-bold uppercase text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Loại chiết khấu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full h-9 rounded-xl border border-[#E5E2DF] bg-white px-3 text-xs font-medium focus:border-[#006561]"
                >
                  <option value="FIXED_AMOUNT">Giảm tiền mặt (VNĐ)</option>
                  <option value="FREE_SHIPPING">Miễn phí vận chuyển (Freeship)</option>
                  <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                Tên chương trình ưu đãi
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Giảm 20K đơn từ 459K mừng sinh nhật"
                className="rounded-xl border-[#E5E2DF] text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                Mô tả chi tiết
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Áp dụng cho toàn bộ các dòng bánh Biscotti & Granola..."
                className="rounded-xl border-[#E5E2DF] text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  {formData.discountType === 'PERCENTAGE' ? 'Tỷ lệ giảm (%)' : 'Giá trị giảm (VNĐ)'} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: +e.target.value })}
                  min={1}
                  required
                  className="rounded-xl border-[#E5E2DF] font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Đơn hàng tối thiểu (VNĐ)
                </label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: +e.target.value })}
                  min={0}
                  step={1000}
                  className="rounded-xl border-[#E5E2DF] font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Giới hạn số lượt dùng
                </label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: +e.target.value })}
                  min={1}
                  className="rounded-xl border-[#E5E2DF] font-mono text-xs"
                />
              </div>

              {formData.discountType === 'PERCENTAGE' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Giảm tối đa (VNĐ)
                  </label>
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: +e.target.value })}
                    min={0}
                    step={1000}
                    className="rounded-xl border-[#E5E2DF] font-mono text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="voucherActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-[#006561] focus:ring-[#006561] cursor-pointer"
              />
              <label htmlFor="voucherActive" className="text-xs text-[#2A2725] font-semibold cursor-pointer select-none">
                Kích hoạt ngay (khách hàng có thể sử dụng mã này)
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-[#E5E2DF]">
              <Button type="button" variant="outline" onClick={closeDialog} className="rounded-full text-xs">
                Hủy
              </Button>
              <Button type="submit" className="btn-act rounded-full px-6 text-xs font-bold">
                {editingVoucher ? 'Cập nhật' : 'Tạo voucher'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AdminVoucherPage
