import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  Package,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  Flame,
  Layers,
  ArrowUpDown,
} from 'lucide-react'
import { productApi, categoryApi, queryKeys } from '@/api'
import type { Product } from '@/types'
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
import { ImageUploader } from '@/components/common/ImageUploader'
import { formatCurrency, optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [stockStatus, setStockStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL')
  const [page, setPage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0)
  }, [keyword, selectedCategory, stockStatus])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 1,
    price: 50000,
    stock: 20,
    lowStockThreshold: 5,
    imageUrl: '',
    description: '',
    badge: 'Mới ra lò',
    tag: 'Eat Clean',
    calories: 250,
    protein: 8,
    fat: 5,
    carbs: 35,
    active: true,
  })

  // Queries
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-products', keyword, page],
    queryFn: () =>
      productApi.getProducts({
        keyword: keyword.trim() || undefined,
        page,
        size: 50,
      }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: categoryApi.getCategories,
  })

  const rawProducts = productData?.content || []

  // Client-side category & stock filters
  const filteredProducts = rawProducts.filter((p) => {
    // Category match
    if (selectedCategory !== 'ALL') {
      const catId =
        typeof p.category === 'object' && p.category !== null ? p.category.id : p.categoryId
      if (catId?.toString() !== selectedCategory) return false
    }

    // Stock status match
    const stock = p.stockQuantity ?? p.stock ?? 0
    const threshold = p.lowStockThreshold || 10
    if (stockStatus === 'OUT_OF_STOCK' && stock > 0) return false
    if (stockStatus === 'LOW_STOCK' && (stock <= 0 || stock > threshold)) return false
    if (stockStatus === 'IN_STOCK' && stock <= threshold) return false

    return true
  })

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const selectedCat = categories.find((c) => c.id === Number(formData.categoryId))
      const payload: Partial<Product> = {
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        stockQuantity: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        imageUrl: formData.imageUrl,
        description: formData.description.trim(),
        badge: formData.badge,
        tag: formData.tag,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        fat: Number(formData.fat),
        carbs: Number(formData.carbs),
        category: selectedCat || (editingProduct ? editingProduct.category : undefined),
        categoryId: Number(formData.categoryId),
        active: formData.active,
      }

      if (editingProduct) {
        return productApi.updateProduct(editingProduct.id, payload)
      } else {
        return productApi.createProduct(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.admin.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm mới thành công!')
      setIsModalOpen(false)
      setEditingProduct(null)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Lưu sản phẩm thất bại'
      toast.error(msg)
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.admin.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success('Đã xóa sản phẩm thành công')
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
      badge: 'Mới ra lò',
      tag: 'Eat Clean',
      calories: 220,
      protein: 7,
      fat: 4,
      carbs: 32,
      active: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    const currentStock = product.stockQuantity ?? product.stock ?? 0
    let resolvedCategoryId = product.categoryId
    if (!resolvedCategoryId) {
      if (
        typeof product.category === 'object' &&
        product.category !== null &&
        'id' in product.category &&
        product.category.id
      ) {
        resolvedCategoryId = product.category.id
      } else if (typeof product.category === 'string') {
        const found = categories.find(
          (c) =>
            c.name.toLowerCase() === (product.category as string).toLowerCase() ||
            c.slug === product.category
        )
        if (found) resolvedCategoryId = found.id
      }
    }
    setFormData({
      name: product.name,
      categoryId: resolvedCategoryId || categories[0]?.id || 1,
      price: product.price,
      stock: currentStock,
      lowStockThreshold: product.lowStockThreshold || 5,
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      badge: (product as any).badge || 'Món Bán Chạy',
      tag: (product as any).tag || 'Eat Clean',
      calories: product.calories || 220,
      protein: product.protein || 7,
      fat: product.fat || 4,
      carbs: product.carbs || 32,
      active: product.active ?? true,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 font-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-semibold tracking-wider uppercase mb-1.5">
            <Package className="w-3.5 h-3.5 text-[#C9785C]" />
            <span>Thực đơn &amp; Bánh nướng dinh dưỡng</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
            Quản Lý Sản Phẩm Bánh
          </h1>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Danh sách bánh tươi, cấu hình giá bán, quản trị tồn kho và tải ảnh qua Cloudinary
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E2DF] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6661]" />
          <Input
            placeholder="Tìm theo tên bánh, mã SKU hoặc phân loại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 text-xs rounded-xl border-[#E5E2DF] h-10 w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
          >
            <option value="ALL">Tất cả danh mục bánh</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as any)}
            className="h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái kho</option>
            <option value="IN_STOCK">Tồn kho an toàn</option>
            <option value="LOW_STOCK">Sắp hết hàng (≤ ngưỡng)</option>
            <option value="OUT_OF_STOCK">Đã hết hàng (0)</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-[#E5E2DF] text-[#2A2725] font-bold">
              <tr>
                <th className="py-3.5 px-4 w-16">Ảnh</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tên Bánh &amp; SKU</th>
                <th className="py-3.5 px-4 min-w-[150px]">Danh Mục</th>
                <th className="py-3.5 px-4 min-w-[120px]">Giá Niêm Yết</th>
                <th className="py-3.5 px-4 min-w-[120px]">Tồn Khả Dụng</th>
                <th className="py-3.5 px-4 min-w-[130px]">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right min-w-[120px]">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DF] text-[#6B6661]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#6B6661]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#006561]" />
                    <span>Đang nạp danh sách sản phẩm...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center space-y-2">
                    <Package className="w-8 h-8 text-[#6B6661] mx-auto opacity-50" />
                    <p className="font-semibold text-xs text-[#2A2725]">Không tìm thấy sản phẩm nào</p>
                    <p className="text-[11px] text-[#6B6661]">Bấm "Thêm Sản Phẩm Mới" để bổ sung món bánh vào thực đơn</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const currentStock = product.stockQuantity ?? product.stock ?? 0
                  const threshold = product.lowStockThreshold || 10
                  const isOutOfStock = currentStock <= 0
                  const isLowStock = currentStock > 0 && currentStock <= threshold

                  const categoryLabel =
                    typeof product.category === 'object' && product.category !== null
                      ? product.category.name
                      : typeof product.category === 'string'
                      ? product.category
                      : 'Chung'

                  const tag = (product as any).tag || (product as any).badge || 'Ăn kiêng'

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      {/* Image */}
                      <td className="py-3.5 px-4">
                        <img
                          src={optimizeCloudinaryUrl(product.imageUrl, 90)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-[#E5E2DF] bg-stone-50"
                        />
                      </td>

                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#2A2725] text-xs leading-snug">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] bg-[#FAF7F2] border border-[#E5E2DF] px-1.5 py-0.5 rounded text-[#006561]">
                              #{product.id}
                            </span>
                            {tag && (
                              <span className="text-[10px] font-semibold text-[#C9785C] bg-[#C9785C]/10 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2A2725] bg-[#FAF7F2] border border-[#E5E2DF] px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3 text-[#006561]" />
                          <span>{categoryLabel}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#006561]">
                        {formatCurrency(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={cn(
                              'font-mono font-bold text-xs',
                              isOutOfStock
                                ? 'text-[#B23A2A]'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-[#2A2725]'
                            )}
                          >
                            {currentStock} hũ/gói
                          </span>
                          {isOutOfStock ? (
                            <span className="block text-[10px] text-[#B23A2A] font-bold">
                              Hết hàng
                            </span>
                          ) : isLowStock ? (
                            <span className="block text-[10px] text-amber-600 font-semibold">
                              Cận ngưỡng ({threshold})
                            </span>
                          ) : (
                            <span className="block text-[10px] text-emerald-600 font-medium">
                              Sẵn sàng bán
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        {product.active !== false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Đang bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                            <XCircle className="w-3 h-3" /> Tạm ẩn
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(product)}
                            className="h-8 w-8 p-0 rounded-lg text-[#006561] hover:bg-[#006561]/8 cursor-pointer"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa sản phẩm "${product.name}"?`)) {
                                deleteMutation.mutate(product.id)
                              }
                            }}
                            className="h-8 w-8 p-0 rounded-lg text-[#B23A2A] hover:bg-[#B23A2A]/8 cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E5E2DF] px-4 py-3 bg-white text-xs">
          <div className="text-[#6B6661]">
            Hiển thị <strong className="text-[#2A2725]">{filteredProducts.length}</strong> / {rawProducts.length} món bánh
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 text-xs border-[#E5E2DF] rounded-xl cursor-pointer"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={productData ? page >= productData.totalPages - 1 : true}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 text-xs border-[#E5E2DF] rounded-xl cursor-pointer"
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Thêm / Sửa Sản Phẩm (Sticky Header & Sticky Footer) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          onClose={() => setIsModalOpen(false)}
          className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-3xl overflow-hidden font-text"
        >
          {/* Sticky Header */}
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E2DF] shrink-0 bg-white space-y-1">
            <DialogTitle className="font-display text-lg font-bold text-[#2A2725]">
              {editingProduct ? 'Chỉnh Sửa Sản Phẩm Bánh' : 'Thêm Sản Phẩm Bánh Mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Cấu hình giá bán, phân loại dinh dưỡng và tải ảnh sản phẩm lên Cloudinary CDN
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4.5 text-xs">
            {/* Ảnh sản phẩm (Cloudinary) */}
            <div>
              <label className="block font-semibold text-[#2A2725] mb-1.5">
                Ảnh đại diện sản phẩm (Tải lên Cloudinary) <span className="text-[#B23A2A]">*</span>
              </label>
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">
                  Tên sản phẩm bánh <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Bánh Mì Đen Nguyên Cám Hạt Lanh"
                  className="rounded-xl border-[#E5E2DF] h-10 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">
                  Danh mục phân loại <span className="text-[#B23A2A]">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: +e.target.value })}
                  className="w-full h-10 border border-[#E5E2DF] bg-white rounded-xl px-3 text-xs text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price, Stock, Threshold */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">
                  Giá bán (VNĐ) <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                  className="rounded-xl border-[#E5E2DF] h-10 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">
                  Số lượng tồn kho <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: +e.target.value })}
                  className="rounded-xl border-[#E5E2DF] h-10 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">
                  Ngưỡng báo sắp hết
                </label>
                <Input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: +e.target.value })}
                  className="rounded-xl border-[#E5E2DF] h-10 text-xs font-mono"
                />
              </div>
            </div>

            {/* Tags & Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">Huy hiệu (Badge)</label>
                <Input
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="VD: Best Seller, Mới ra lò, Healthy"
                  className="rounded-xl border-[#E5E2DF] h-10 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2A2725] mb-1">Thẻ phân loại (Tag)</label>
                <Input
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="VD: Eat Clean, Không đường, Keto"
                  className="rounded-xl border-[#E5E2DF] h-10 text-xs"
                />
              </div>
            </div>

            {/* Macro & Nutrition Info (Fixed alignment) */}
            <div className="border border-[#E5E2DF] p-4 bg-[#FAF7F2] rounded-2xl space-y-2.5">
              <span className="font-semibold text-[#2A2725] flex items-center gap-1.5 text-xs">
                <Flame className="w-3.5 h-3.5 text-[#C9785C]" />
                <span>Chỉ Số Dinh Dưỡng Mỗi Khẩu Phần (Ước tính / 100g):</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6661] mb-1 truncate">
                    Calo (kcal)
                  </label>
                  <Input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: +e.target.value })}
                    className="rounded-xl border-[#E5E2DF] bg-white h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6661] mb-1 truncate">
                    Protein (g)
                  </label>
                  <Input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: +e.target.value })}
                    className="rounded-xl border-[#E5E2DF] bg-white h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6661] mb-1 truncate">
                    Chất béo (g)
                  </label>
                  <Input
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: +e.target.value })}
                    className="rounded-xl border-[#E5E2DF] bg-white h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6661] mb-1 truncate">
                    Carbs (g)
                  </label>
                  <Input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: +e.target.value })}
                    className="rounded-xl border-[#E5E2DF] bg-white h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-[#2A2725] mb-1">Mô tả sản phẩm bánh</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-[#E5E2DF] rounded-xl p-3 text-xs bg-white text-[#2A2725] focus:outline-hidden focus:ring-2 focus:ring-[#006561]/20"
                placeholder="Nguyên liệu hạt hữu cơ, bột nguyên cám không đường tinh luyện..."
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <DialogFooter className="p-4 sm:p-5 border-t border-[#E5E2DF] bg-[#FAF7F2] shrink-0 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border-[#E5E2DF] text-xs font-medium cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saveMutation.isPending || !formData.name.trim()}
              onClick={() => saveMutation.mutate()}
              className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AdminProductsPage
