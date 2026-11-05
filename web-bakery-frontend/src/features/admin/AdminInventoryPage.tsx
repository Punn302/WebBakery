import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Warehouse,
  AlertTriangle,
  Package,
  Plus,
  Search,
  Trash2,
  FileText,
  Sliders,
  DollarSign,
  TrendingDown,
  Calendar,
  CheckCircle,
} from 'lucide-react'
import { adminInventoryApi, productApi } from '@/api'
import type { Product, PurchaseReceipt, PurchaseReceiptBatchRequest } from '@/types'
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
import { formatCurrency, formatDate } from '@/utils/format'
import { toast } from 'sonner'

interface DynamicReceiptItem {
  productId: string
  quantity: number
  unitCost: number
}

export const AdminInventoryPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'STOCK' | 'RECEIPTS'>('STOCK')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)

  // Threshold Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newThreshold, setNewThreshold] = useState<number>(5)

  // Create Purchase Receipt Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [note, setNote] = useState('')
  const [receiptItems, setReceiptItems] = useState<DynamicReceiptItem[]>([
    { productId: '', quantity: 10, unitCost: 30000 },
  ])

  // View Receipt Detail Modal
  const [selectedReceiptCode, setSelectedReceiptCode] = useState<string | null>(null)

  // Queries
  const { data: inventoryData, isLoading: isInventoryLoading } = useQuery({
    queryKey: ['admin-inventory', keyword, page],
    queryFn: () => adminInventoryApi.getInventory({ keyword: keyword.trim() || undefined, page, size: 20 }),
  })

  const { data: receiptsData, isLoading: isReceiptsLoading } = useQuery({
    queryKey: ['admin-purchase-receipts', page],
    queryFn: () => adminInventoryApi.getPurchaseReceipts({ page, size: 20 }),
    enabled: activeTab === 'RECEIPTS',
  })

  const { data: allProducts = [] } = useQuery({
    queryKey: ['admin-all-products-for-receipt'],
    queryFn: async () => {
      const res = await productApi.getProducts({ size: 100 })
      return res.content
    },
  })

  const { data: receiptDetails = [] } = useQuery({
    queryKey: ['admin-receipt-details', selectedReceiptCode],
    queryFn: () =>
      selectedReceiptCode
        ? adminInventoryApi.getReceiptDetails(selectedReceiptCode)
        : Promise.resolve([]),
    enabled: !!selectedReceiptCode,
  })

  const products = inventoryData?.content || []
  const receipts = receiptsData?.content || []
  const totalPages =
    activeTab === 'STOCK'
      ? inventoryData?.totalPages || 1
      : receiptsData?.totalPages || 1

  // Mutations
  const updateThresholdMutation = useMutation({
    mutationFn: ({ id, threshold }: { id: string; threshold: number }) =>
      adminInventoryApi.updateThreshold(id, threshold),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
      toast.success(`Đã cập nhật ngưỡng cảnh báo của ${updated.name} thành ${updated.lowStockThreshold}`)
      setEditingProduct(null)
    },
    onError: () => {
      toast.error('Không thể cập nhật ngưỡng cảnh báo')
    },
  })

  const createReceiptMutation = useMutation({
    mutationFn: (data: PurchaseReceiptBatchRequest) =>
      adminInventoryApi.createPurchaseReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
      queryClient.invalidateQueries({ queryKey: ['admin-purchase-receipts'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Tạo phiếu nhập kho thành công! Đã tự động cập nhật số lượng tồn và giá vốn WAC.')
      setCreateModalOpen(false)
      setSupplier('')
      setNote('')
      setReceiptItems([{ productId: '', quantity: 10, unitCost: 30000 }])
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tạo phiếu nhập kho'
      toast.error(msg)
    },
  })

  // Dynamic Array Handlers
  const addReceiptItem = () => {
    setReceiptItems((prev) => [...prev, { productId: '', quantity: 10, unitCost: 30000 }])
  }

  const removeReceiptItem = (index: number) => {
    if (receiptItems.length <= 1) return
    setReceiptItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateReceiptItem = (
    index: number,
    field: keyof DynamicReceiptItem,
    value: string | number
  ) => {
    setReceiptItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const totalReceiptCost = receiptItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0),
    0
  )

  const handleCreateReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplier.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp hoặc bếp bánh')
      return
    }

    const invalidItem = receiptItems.find(
      (item) => !item.productId || item.quantity <= 0 || item.unitCost <= 0
    )
    if (invalidItem) {
      toast.error('Vui lòng chọn sản phẩm, số lượng và giá nhập hợp lệ cho tất cả các dòng')
      return
    }

    const payload: PurchaseReceiptBatchRequest = {
      supplier: supplier.trim(),
      note: note.trim() || undefined,
      productIds: receiptItems.map((i) => i.productId),
      quantities: receiptItems.map((i) => Number(i.quantity)),
      unitCosts: receiptItems.map((i) => Number(i.unitCost)),
    }

    createReceiptMutation.mutate(payload)
  }

  // Summary counts
  const totalStockCount = products.length
  const outOfStockCount = products.filter((p) => p.stock <= 0).length
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)
  ).length
  const safeStockCount = products.filter((p) => p.stock > (p.lowStockThreshold || 5)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#e7e5e4] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
            Quản Trị Kho Hàng & Nhập Kho
          </h1>
          <p className="text-xs text-[#78716c] mt-0.5">
            Theo dõi số lượng tồn khả dụng, tạo phiếu nhập theo mẻ và tính giá vốn bình quân (WAC)
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phiếu Nhập Kho</span>
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
            Mặt Hàng Lưu Kho
          </span>
          <div className="text-2xl font-black text-[#1c1917]">{totalStockCount}</div>
        </div>

        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-wider block">
            Tồn Kho An Toàn
          </span>
          <div className="text-2xl font-black text-[#15803d]">{safeStockCount}</div>
        </div>

        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#d97724] uppercase tracking-wider block">
            Cận Ngưỡng Tối Thiểu
          </span>
          <div className="text-2xl font-black text-[#d97724]">{lowStockCount}</div>
        </div>

        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#dc2626] uppercase tracking-wider block">
            Đã Hết Hàng
          </span>
          <div className="text-2xl font-black text-[#dc2626]">{outOfStockCount}</div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="border border-[#e7e5e4] bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'STOCK' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('STOCK')
              setPage(0)
            }}
            className="text-xs"
          >
            Tồn Kho Hiện Tại
          </Button>
          <Button
            variant={activeTab === 'RECEIPTS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('RECEIPTS')
              setPage(0)
            }}
            className="text-xs"
          >
            Lịch Sử Phiếu Nhập
          </Button>
        </div>

        {activeTab === 'STOCK' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(0)
              }}
              placeholder="Tìm theo tên bánh hoặc SKU..."
              className="pl-9 text-xs h-9"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Current Stock Table */}
      {activeTab === 'STOCK' && (
        <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e7e5e4] bg-[#faf8f5] text-[#57534e] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Sản phẩm bánh healthy</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4 text-center">Tồn khả dụng</th>
                <th className="py-3 px-4 text-center">Ngưỡng cảnh báo</th>
                <th className="py-3 px-4 text-right">Giá vốn (WAC)</th>
                <th className="py-3 px-4">Tình trạng</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f4]">
              {isInventoryLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716c]">
                    Đang nạp dữ liệu tồn kho...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716c]">
                    Không có sản phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isOut = p.stock <= 0
                  const isLow = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)
                  return (
                    <tr key={p.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1c1917]">{p.name}</div>
                        <div className="text-[11px] text-[#78716c]">SKU: {p.id}</div>
                      </td>
                      <td className="py-3 px-4 text-[#57534e]">
                        {p.category?.name || 'Chung'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-black text-sm ${
                            isOut
                              ? 'text-[#dc2626]'
                              : isLow
                              ? 'text-[#d97724]'
                              : 'text-[#1c1917]'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-[#78716c]">
                        {p.lowStockThreshold || 5}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#1c1917]">
                        {formatCurrency(p.averageCost || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <Badge variant="destructive">Hết hàng</Badge>
                        ) : isLow ? (
                          <Badge variant="accent">Cần nhập thêm</Badge>
                        ) : (
                          <Badge variant="success">Đủ bán</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => {
                            setEditingProduct(p)
                            setNewThreshold(p.lowStockThreshold || 5)
                          }}
                        >
                          Chỉnh ngưỡng
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Purchase Receipts Table */}
      {activeTab === 'RECEIPTS' && (
        <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e7e5e4] bg-[#faf8f5] text-[#57534e] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã phiếu</th>
                <th className="py-3 px-4">Mặt hàng nhập</th>
                <th className="py-3 px-4">Nhà cung cấp / Bếp</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4 text-right">Tổng tiền nhập</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f4]">
              {isReceiptsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716c]">
                    Đang nạp danh sách phiếu nhập kho...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716c]">
                    Chưa có phiếu nhập kho nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1c1917]">
                      {r.receiptCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1c1917]">{r.productName}</div>
                      <div className="text-[11px] text-[#78716c]">ID: {r.productId}</div>
                    </td>
                    <td className="py-3 px-4 text-[#57534e]">{r.supplier}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#1c1917]">
                      +{r.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#47654c]">
                      {formatCurrency(r.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-[#78716c]">{formatDate(r.importedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2.5"
                        onClick={() => setSelectedReceiptCode(r.receiptCode)}
                      >
                        Xem mẻ nhập
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3 border border-[#e7e5e4] bg-white flex items-center justify-between text-xs text-[#78716c]">
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

      {/* Modal: Edit Low Stock Threshold */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent onClose={() => setEditingProduct(null)} className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Điều Chỉnh Ngưỡng Cảnh Báo Tồn Kho</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Sản phẩm: <strong>{editingProduct?.name}</strong> (Tồn hiện tại: {editingProduct?.stock})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="block font-semibold text-[#1c1917]">
              Ngưỡng tối thiểu kích hoạt cảnh báo:
            </label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={newThreshold}
              onChange={(e) => setNewThreshold(Number(e.target.value))}
            />
            <p className="text-[11px] text-[#78716c]">
              Khi số lượng tồn kho giảm xuống bằng hoặc dưới ngưỡng này, hệ thống sẽ cảnh báo "Cần nhập thêm" trên bảng điều khiển.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={updateThresholdMutation.isPending}
              onClick={() => {
                if (editingProduct) {
                  updateThresholdMutation.mutate({
                    id: editingProduct.id,
                    threshold: newThreshold,
                  })
                }
              }}
            >
              Lưu Ngưỡng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Create Purchase Receipt (Dynamic Field Array) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent
          onClose={() => setCreateModalOpen(false)}
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5"
        >
          <DialogHeader>
            <DialogTitle>Tạo Phiếu Nhập Kho Theo Mẻ (Batch Purchase Receipt)</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Nhập kho nhiều dòng bánh cùng lúc, hệ thống sẽ tự động cập nhật số lượng tồn và tính lại giá vốn bình quân gia quyền (WAC)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReceiptSubmit} className="space-y-4 text-xs">
            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">
                  Nhà cung cấp / Bếp bánh *
                </label>
                <Input
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ví dụ: Bếp Trung Tâm Hebekery Q1"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1c1917] mb-1">
                  Ghi chú phiếu nhập
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Mẻ bánh ra lò sáng thứ 5"
                />
              </div>
            </div>

            {/* Dynamic Items Field Array */}
            <div className="border border-[#e7e5e4] p-4 bg-[#faf8f5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[#1c1917]">
                  Danh Sách Sản Phẩm Nhập
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReceiptItem}
                  className="h-7 text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm dòng
                </Button>
              </div>

              <div className="space-y-2">
                {receiptItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 border border-[#e7e5e4] items-center"
                  >
                    {/* Select Product */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] text-[#78716c] font-semibold mb-0.5">
                        Sản phẩm *
                      </label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateReceiptItem(index, 'productId', e.target.value)}
                        className="w-full h-8 border border-[#d6d3d1] bg-white px-2 text-xs focus:outline-none focus:border-[#47654c]"
                      >
                        <option value="">-- Chọn loại bánh --</option>
                        {allProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Hiện tồn: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#78716c] font-semibold mb-0.5">
                        Số lượng *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        required
                        className="h-8 text-xs"
                        value={item.quantity}
                        onChange={(e) => updateReceiptItem(index, 'quantity', Number(e.target.value))}
                      />
                    </div>

                    {/* Unit Cost */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-[#78716c] font-semibold mb-0.5">
                        Đơn giá nhập (VNĐ) *
                      </label>
                      <Input
                        type="number"
                        min={1000}
                        step={1000}
                        required
                        className="h-8 text-xs"
                        value={item.unitCost}
                        onChange={(e) => updateReceiptItem(index, 'unitCost', Number(e.target.value))}
                      />
                    </div>

                    {/* Remove button */}
                    <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={receiptItems.length <= 1}
                        onClick={() => removeReceiptItem(index)}
                        className="h-8 w-8 p-0 text-[#dc2626] hover:bg-[#dc2626]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-[#e7e5e4] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#57534e]">Tổng giá trị phiếu nhập:</span>
                <span className="text-base font-black text-[#47654c]">
                  {formatCurrency(totalReceiptCost)}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={createReceiptMutation.isPending}>
                {createReceiptMutation.isPending ? 'Đang tạo...' : 'Lưu Phiếu Nhập Kho'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: View Receipt Details */}
      <Dialog open={!!selectedReceiptCode} onOpenChange={() => setSelectedReceiptCode(null)}>
        <DialogContent onClose={() => setSelectedReceiptCode(null)} className="max-w-lg p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Chi Tiết Phiếu Nhập Kho: {selectedReceiptCode}</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Danh sách các mặt hàng thuộc đợt nhập hàng này
            </DialogDescription>
          </DialogHeader>

          <div className="border border-[#e7e5e4] divide-y divide-[#f5f5f4] text-xs">
            {receiptDetails.map((r) => (
              <div key={r.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1c1917]">{r.productName}</div>
                  <div className="text-[11px] text-[#78716c]">
                    Số lượng: +{r.quantity} • Đơn giá: {formatCurrency(r.unitCost)}
                  </div>
                </div>
                <div className="font-bold text-[#47654c]">{formatCurrency(r.totalCost)}</div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedReceiptCode(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
