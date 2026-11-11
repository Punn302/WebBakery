import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
} from 'lucide-react'
import { categoryApi } from '@/api'
import type { Category } from '@/types'
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

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-categories', keyword, page],
    queryFn: () => categoryApi.adminGetCategories({ keyword, page, size: 10 }),
  })

  const categories = pageData?.content || []
  const totalPages = pageData?.totalPages || 1

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Tên danh mục không được để trống')
      if (editingCategory) {
        return await categoryApi.adminUpdateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          active,
        })
      } else {
        return await categoryApi.adminCreateCategory({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          active,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(editingCategory ? 'Cập nhật danh mục thành công' : 'Tạo danh mục mới thành công')
      handleCloseModal()
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Lỗi khi lưu danh mục'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.adminDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Đã xóa danh mục')
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa danh mục này (có thể do vẫn còn sản phẩm liên kết)'
      toast.error(msg)
    },
  })

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setActive(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setSlug(cat.slug || '')
    setDescription(cat.description || '')
    setActive(cat.active)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingCategory(null)
  }

  const generateSlugFromName = (val: string) => {
    setName(val)
    if (!editingCategory) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setSlug(autoSlug)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#2A2725]">
            Quản Lý Danh Mục Bánh Dinh Dưỡng
          </h1>
          <p className="text-xs text-[#6B6661] mt-1">
            Phân loại thực đơn bánh dinh dưỡng, ngũ cốc granola và bánh ăn kiêng keto HeBekery
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#006561] hover:bg-[#004e4a] text-white text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-xl cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Thêm Danh Mục Mới</span>
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B6661] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            placeholder="Tìm theo tên hoặc slug danh mục..."
            className="pl-9 text-xs rounded-xl border-[#E5E2DF] h-9.5"
          />
        </div>
        <div className="text-xs text-[#6B6661] hidden sm:block">
          Tổng cộng: <strong className="text-[#2A2725]">{pageData?.totalElements || categories.length}</strong> danh mục
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#6B6661]">Đang tải danh mục...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderTree className="w-8 h-8 text-[#6B6661] mx-auto" />
            <p className="text-xs font-semibold text-[#2A2725]">Không tìm thấy danh mục nào</p>
            <p className="text-[11px] text-[#6B6661]">Bấm "Thêm Danh Mục Mới" để tạo phân loại bánh đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E5E2DF] text-[#2A2725] font-bold">
                  <th className="p-4 w-16">ID</th>
                  <th className="p-4">Tên danh mục</th>
                  <th className="p-4">Đường dẫn (Slug)</th>
                  <th className="p-4 min-w-[200px]">Mô tả</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DF] text-[#6B6661]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                    <td className="p-4 font-mono font-semibold text-[#2A2725]">#{cat.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-xs text-[#2A2725] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#006561]" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[11px] bg-[#FAF7F2] border border-[#E5E2DF] px-2 py-0.5 rounded text-[#006561]">
                        {cat.slug || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#6B6661] max-w-xs truncate">
                      {cat.description || <span className="italic text-[#9A938C]">(Không có mô tả)</span>}
                    </td>
                    <td className="p-4 text-center">
                      {cat.active ? (
                        <Badge className="bg-[#16a34a] text-white border-0 text-[10px] font-bold">
                          Đang hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[#6B6661] border-[#E5E2DF] text-[10px]">
                          Tạm ẩn
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(cat)}
                        className="text-[#006561] hover:bg-[#006561]/10 h-8 w-8 p-0 rounded-lg cursor-pointer"
                        title="Chỉnh sửa danh mục"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(cat)}
                        className="text-[#B23A2A] hover:bg-[#B23A2A]/10 h-8 w-8 p-0 rounded-lg cursor-pointer"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E2DF] flex items-center justify-between text-xs">
            <span className="text-[#6B6661]">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-8 text-xs border-[#E5E2DF]"
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 text-xs border-[#E5E2DF]"
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="rounded-2xl max-w-md p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-lg font-bold text-[#2A2725]">
              {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Điền thông tin danh mục bánh để phân loại hiển thị trên website
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
            className="space-y-4 pt-3"
          >
            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-1">
                Tên danh mục <span className="text-[#B23A2A]">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => generateSlugFromName(e.target.value)}
                placeholder="Ví dụ: Bánh Biscotti Ăn Kiêng"
                className="text-xs rounded-xl border-[#E5E2DF] h-10"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-1">
                Đường dẫn (Slug)
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="banh-biscotti-an-kieng"
                className="text-xs rounded-xl border-[#E5E2DF] font-mono h-10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-1">
                Mô tả ngắn
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Bánh nguyên cám nướng 2 lần, không đường tinh luyện"
                className="text-xs rounded-xl border-[#E5E2DF] h-10"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="cat-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-[#006561] rounded cursor-pointer"
              />
              <label htmlFor="cat-active" className="text-xs font-medium text-[#2A2725] cursor-pointer">
                Kích hoạt hiển thị trên menu cửa hàng
              </label>
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1 rounded-xl text-xs h-10 border-[#E5E2DF] cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || !name.trim()}
                className="flex-1 rounded-xl text-xs h-10 bg-[#006561] hover:bg-[#004e4a] text-white font-bold cursor-pointer"
              >
                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Danh Mục'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#B23A2A]/10 text-[#B23A2A] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-center font-display text-base font-bold text-[#2A2725]">
              Xác Nhận Xóa Danh Mục?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-[#6B6661] leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục <strong>"{deleteTarget?.name}"</strong>? Lưu ý chỉ có thể xóa danh mục khi không còn sản phẩm nào thuộc danh mục này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 rounded-xl text-xs h-10 border-[#E5E2DF] cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl text-xs h-10 bg-[#B23A2A] hover:bg-[#8F3D1F] text-white cursor-pointer"
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
