import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2 } from 'lucide-react'
import { productApi, categoryApi } from '@/api'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ImageUploader } from '@/components/common/ImageUploader'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 1,
    price: 50000,
    stock: 20,
    lowStockThreshold: 5,
    imageUrl: '',
    description: '',
    calories: 250,
    protein: 8,
    fat: 5,
    carbs: 35,
  })

  // Queries
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-products', keyword],
    queryFn: () => productApi.getProducts({ keyword: keyword.trim() || undefined, size: 50 }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const products = productData?.content || []

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Partial<Product> = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        imageUrl: formData.imageUrl,
        description: formData.description,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        fat: Number(formData.fat),
        carbs: Number(formData.carbs),
        category: categories.find((c) => c.id === Number(formData.categoryId)),
        active: true,
      }

      if (editingProduct) {
        return productApi.updateProduct(editingProduct.id, payload)
      } else {
        return productApi.createProduct(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm mới thành công!')
      setIsModalOpen(false)
      setEditingProduct(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lưu sản phẩm thất bại'
      toast.error(msg)
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Đã xóa sản phẩm')
    },
    onError: () => {
      toast.error('Không thể xóa sản phẩm này')
    },
  })

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 1,
      price: 65000,
      stock: 30,
      lowStockThreshold: 5,
      imageUrl: '',
      description: '',
      calories: 220,
      protein: 7,
      fat: 4,
      carbs: 32,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      categoryId: product.category?.id || categories[0]?.id || 1,
      price: product.price,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      imageUrl: product.imageUrl,
      description: product.description || '',
      calories: product.calories || 0,
      protein: product.protein || 0,
      fat: product.fat || 0,
      carbs: product.carbs || 0,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e5e4] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs text-[#78716c] mt-0.5">
            Danh sách bánh tươi, cấu hình giá bán, quản trị tồn kho và tải ảnh qua Cloudinary
          </p>
        </div>

        <Button onClick={openCreateModal} className="flex items-center gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 border border-[#e7e5e4]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#a8a29e]" />
          <Input
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#faf8f5] border-b border-[#e7e5e4] text-[#78716c] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Ảnh</th>
              <th className="py-3 px-4">Tên Sản Phẩm</th>
              <th className="py-3 px-4">Danh Mục</th>
              <th className="py-3 px-4">Giá Bán</th>
              <th className="py-3 px-4">Tồn Kho</th>
              <th className="py-3 px-4">Calo</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f4]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#78716c]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#47654c]" />
                  Đang nạp danh sách sản phẩm...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#78716c]">
                  Không tìm thấy sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isLowStock = product.stock <= (product.lowStockThreshold || 10)
                return (
                  <tr key={product.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={optimizeCloudinaryUrl(product.imageUrl, 80)}
                        alt={product.name}
                        className="w-10 h-10 object-cover border border-[#e7e5e4]"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#1c1917]">{product.name}</p>
                      <p className="text-[10px] text-[#a8a29e]">#{product.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{product.category?.name || 'Chung'}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#47654c]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${isLowStock ? 'text-[#dc2626]' : 'text-[#1c1917]'}`}>
                        {product.stock}
                      </span>
                      {isLowStock && (
                        <span className="block text-[10px] text-[#dc2626] font-medium">
                          Sắp hết hàng
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{product.calories || 0} kcal</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(product)}
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4 text-[#57534e]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa sản phẩm "${product.name}"?`)) {
                              deleteMutation.mutate(product.id)
                            }
                          }}
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-[#dc2626]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa Sản Phẩm */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Điền thông tin và tải ảnh sản phẩm lên Cloudinary CDN
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Ảnh sản phẩm (Cloudinary) */}
            <div>
              <label className="block font-semibold text-[#1c1917] mb-1">
                Ảnh sản phẩm (Tải lên Cloudinary) *
              </label>
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">Tên sản phẩm *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Bánh Mì Đen Nguyên Cám"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">Danh mục *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: +e.target.value })}
                  className="w-full h-10 border border-[#d6d3d1] bg-white px-3 text-xs text-[#1c1917]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">Giá bán (VND) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">Số lượng tồn kho *</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: +e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">Ngưỡng báo sắp hết</label>
                <Input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: +e.target.value })}
                />
              </div>
            </div>

            {/* Macro info */}
            <div className="border border-[#e7e5e4] p-3 bg-[#faf8f5] space-y-2">
              <span className="font-bold text-[#1c1917] block">Chỉ Số Dinh Dưỡng Mỗi Khẩu Phần:</span>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-[#78716c] mb-1">Calories (kcal)</label>
                  <Input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: +e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#78716c] mb-1">Đạm Protein (g)</label>
                  <Input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: +e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#78716c] mb-1">Chất béo Fat (g)</label>
                  <Input
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: +e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#78716c] mb-1">Tinh bột Carbs (g)</label>
                  <Input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: +e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1c1917] mb-1">Mô tả sản phẩm</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-[#d6d3d1] p-3 text-xs focus:outline-none focus:border-[#47654c]"
                placeholder="Nguyên liệu hạt hữu cơ, không đường tinh luyện..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={saveMutation.isPending || !formData.name.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
