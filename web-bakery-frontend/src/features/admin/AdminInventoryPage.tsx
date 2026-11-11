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
  Clock,
  Sparkles,
  Flame,
  Tag,
  ShieldCheck,
  Layers,
} from 'lucide-react'
import { adminInventoryApi, productApi, adminBatchApi } from '@/api'
import type { Product, PurchaseReceipt, PurchaseReceiptBatchRequest, ProductBatch, ProductBatchRequest, BatchFlashSaleRequest, BatchStats } from '@/types'
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
  const [activeTab, setActiveTab] = useState<'STOCK' | 'RECEIPTS' | 'BATCHES'>('STOCK')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)

  // Batch & Shelf-Life States
  const [batchProductId, setBatchProductId] = useState<string>('')
  const [batchStatus, setBatchStatus] = useState<string>('ALL')
  const [batchPage, setBatchPage] = useState<number>(0)
  const [createBatchModalOpen, setCreateBatchModalOpen] = useState(false)
  const [batchForm, setBatchForm] = useState<ProductBatchRequest>({
    productId: '',
    batchCode: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    initialQuantity: 50,
    note: '',
  })
  const [flashSaleBatch, setFlashSaleBatch] = useState<ProductBatch | null>(null)
  const [flashSalePercent, setFlashSalePercent] = useState<number>(30)
  const [flashSaleNote, setFlashSaleNote] = useState<string>('')

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

  const { data: batchesData, isLoading: isBatchesLoading } = useQuery({
    queryKey: ['admin-batches', batchProductId, batchStatus, batchPage],
    queryFn: () => adminBatchApi.getBatches({
      productId: batchProductId || undefined,
      status: batchStatus || undefined,
      page: batchPage,
      size: 15,
    }),
    enabled: activeTab === 'BATCHES',
  })

  const { data: batchStats } = useQuery({
    queryKey: ['admin-batch-stats'],
    queryFn: adminBatchApi.getStats,
    enabled: activeTab === 'BATCHES',
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
  const batches = batchesData?.content || []
  const totalPages =
    activeTab === 'STOCK'
      ? inventoryData?.totalPages || 1
      : activeTab === 'RECEIPTS'
      ? receiptsData?.totalPages || 1
      : batchesData?.totalPages || 1

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

  // Batch Mutations
  const createBatchMutation = useMutation({
    mutationFn: (data: ProductBatchRequest) => adminBatchApi.createBatch(data),
    onSuccess: () => {
      toast.success('Đã tạo mẻ bánh mới thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] })
      queryClient.invalidateQueries({ queryKey: ['admin-batch-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
      setCreateBatchModalOpen(false)
      setBatchForm({
        productId: '',
        batchCode: '',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        initialQuantity: 50,
        note: '',
      })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể tạo mẻ bánh'
      toast.error(msg)
    },
  })

  const flashSaleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BatchFlashSaleRequest }) =>
      adminBatchApi.updateFlashSale(id, data),
    onSuccess: () => {
      toast.success('Cập nhật Flash Sale xả hàng cận date thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] })
      queryClient.invalidateQueries({ queryKey: ['admin-batch-stats'] })
      setFlashSaleBatch(null)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể cập nhật Flash Sale'
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
          <Button
            variant={activeTab === 'BATCHES' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('BATCHES')
              setBatchPage(0)
            }}
            className="text-xs flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#006561]" />
            <span>Quản Lý Lô Bánh & HSD (FEFO)</span>
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

      {/* Tab 3: Production Batches & Shelf-Life (FEFO) Table */}
      {activeTab === 'BATCHES' && (
        <div className="space-y-4">
          {/* Batch Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="border border-[#e7e5e4] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#006561]" />
                <span>Tổng Số Lô Bánh</span>
              </span>
              <div className="text-xl font-black text-[#1c1917]">{batchStats?.totalBatches || 0}</div>
            </div>

            <div className="border border-[#e7e5e4] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#15803d]" />
                <span>An Toàn (&gt; 60 ngày)</span>
              </span>
              <div className="text-xl font-black text-[#15803d]">{batchStats?.activeBatches || 0}</div>
            </div>

            <div className="border border-[#e7e5e4] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Cận Date (&le; 30 ngày)</span>
              </span>
              <div className="text-xl font-black text-amber-600">{batchStats?.nearExpiryBatches || 0}</div>
            </div>

            <div className="border border-[#e7e5e4] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Hết Hạn (&lt; 15 ngày)</span>
              </span>
              <div className="text-xl font-black text-rose-600">{batchStats?.expiredBatches || 0}</div>
            </div>

            <div className="border border-[#e7e5e4] bg-white p-3.5 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>Flash Sale Cận Date</span>
              </span>
              <div className="text-xl font-black text-orange-600">{batchStats?.flashSaleBatches || 0}</div>
            </div>
          </div>

          {/* Batch Filters & Add Button */}
          <div className="border border-[#e7e5e4] bg-white p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={batchProductId}
                onChange={(e) => {
                  setBatchProductId(e.target.value)
                  setBatchPage(0)
                }}
                className="h-8 border border-[#d6d3d1] bg-white px-2.5 text-xs text-[#1c1917] rounded-md focus:outline-none focus:border-[#006561]"
              >
                <option value="">-- Tất cả sản phẩm bánh --</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={batchStatus}
                onChange={(e) => {
                  setBatchStatus(e.target.value)
                  setBatchPage(0)
                }}
                className="h-8 border border-[#d6d3d1] bg-white px-2.5 text-xs text-[#1c1917] rounded-md focus:outline-none focus:border-[#006561]"
              >
                <option value="ALL">-- Tất cả trạng thái --</option>
                <option value="ACTIVE">Còn hạn an toàn (ACTIVE)</option>
                <option value="NEAR_EXPIRY">Cận date &le; 30 ngày (NEAR_EXPIRY)</option>
                <option value="EXPIRED">Hết hạn &lt; 15 ngày (EXPIRED)</option>
                <option value="SOLD_OUT">Đã xuất bán hết (SOLD_OUT)</option>
              </select>
            </div>

            <Button
              onClick={() => setCreateBatchModalOpen(true)}
              className="bg-[#006561] hover:bg-[#004e4a] text-white text-xs flex items-center gap-1.5 h-8 px-3 shrink-0 self-end sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Lô Sản Xuất Mới</span>
            </Button>
          </div>

          {/* Batches Table */}
          <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e7e5e4] bg-[#faf8f5] text-[#57534e] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã Lô Nướng</th>
                  <th className="py-3 px-4">Sản Phẩm Bánh</th>
                  <th className="py-3 px-4">Ngày Sản Xuất (NSX)</th>
                  <th className="py-3 px-4">Hạn Sử Dụng (HSD)</th>
                  <th className="py-3 px-4 text-center">Tồn Kho Lô (FEFO)</th>
                  <th className="py-3 px-4 text-center">Trạng Thái HSD</th>
                  <th className="py-3 px-4 text-center">Xả Hàng Cận Date</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {isBatchesLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#78716c]">
                      Đang tải danh sách lô bánh...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#78716c]">
                      Chưa có lô sản xuất nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => {
                    const isWarning = b.alertLevel === 'WARNING'
                    const isDanger = b.alertLevel === 'DANGER'
                    const percentRemaining = Math.round((b.currentQuantity / Math.max(1, b.initialQuantity)) * 100)

                    return (
                      <tr key={b.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#006561] whitespace-nowrap">
                          {b.batchCode}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {b.productImageUrl ? (
                              <img
                                src={b.productImageUrl}
                                alt={b.productName}
                                className="w-8 h-8 rounded-lg object-cover border border-[#e7e5e4]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-stone-100 border border-[#e7e5e4] flex items-center justify-center">
                                <Package className="w-4 h-4 text-stone-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-[#1c1917] max-w-[200px] truncate">{b.productName || b.productId}</div>
                              <div className="text-[10px] font-mono text-[#78716c]">{b.productId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#57534e] whitespace-nowrap">
                          {formatDate(b.manufactureDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-[#1c1917] font-semibold">{formatDate(b.expiryDate)}</div>
                          <div className="text-[10px] text-[#78716c]">
                            {b.daysRemaining > 0 ? `Còn ${b.daysRemaining} ngày` : 'Đã hết hạn'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-mono font-bold text-xs text-[#1c1917]">
                            {b.currentQuantity} / {b.initialQuantity}
                          </div>
                          <div className="w-20 mx-auto bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-[#006561] h-full rounded-full"
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isDanger ? (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              Hết hạn / Khóa bán
                            </Badge>
                          ) : isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Cận Date ({b.daysRemaining}d)</span>
                            </span>
                          ) : (
                            <Badge variant="success" className="text-[10px] font-bold">
                              An toàn ({b.daysRemaining}d)
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {b.discountPercent > 0 ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                                <Flame className="w-3 h-3 text-orange-600" />
                                <span>Giảm {b.discountPercent}%</span>
                              </span>
                              {b.discountedPrice && b.originalPrice && (
                                <div className="text-[10px]">
                                  <span className="line-through text-stone-400 mr-1">{formatCurrency(b.originalPrice)}</span>
                                  <span className="font-bold text-[#006561]">{formatCurrency(b.discountedPrice)}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#78716c] italic">Bán giá chuẩn</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2.5 flex items-center gap-1 ml-auto cursor-pointer"
                            onClick={() => {
                              setFlashSaleBatch(b)
                              setFlashSalePercent(b.discountPercent > 0 ? b.discountPercent : 30)
                              setFlashSaleNote(b.note || '')
                            }}
                          >
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span>{b.discountPercent > 0 ? 'Sửa Flash Sale' : 'Xả Cận Date'}</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3 border border-[#e7e5e4] bg-white flex items-center justify-between text-xs text-[#78716c]">
          <div>
            Trang {(activeTab === 'BATCHES' ? batchPage : page) + 1} / {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={(activeTab === 'BATCHES' ? batchPage : page) === 0}
              onClick={() => {
                if (activeTab === 'BATCHES') {
                  setBatchPage((p) => Math.max(0, p - 1))
                } else {
                  setPage((p) => Math.max(0, p - 1))
                }
              }}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(activeTab === 'BATCHES' ? batchPage : page) >= totalPages - 1}
              onClick={() => {
                if (activeTab === 'BATCHES') {
                  setBatchPage((p) => p + 1)
                } else {
                  setPage((p) => p + 1)
                }
              }}
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

      {/* Modal: Create Production Batch */}
      <Dialog open={createBatchModalOpen} onOpenChange={setCreateBatchModalOpen}>
        <DialogContent onClose={() => setCreateBatchModalOpen(false)} className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#006561]" />
              <span>Tạo Lô Sản Xuất Bánh Mới</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Ghi nhận ngày nướng và hạn sử dụng để kiểm soát xuất kho theo chuẩn FEFO
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!batchForm.productId) {
                toast.error('Vui lòng chọn sản phẩm bánh')
                return
              }
              createBatchMutation.mutate(batchForm)
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Sản phẩm bánh *
              </label>
              <select
                value={batchForm.productId}
                onChange={(e) => setBatchForm((prev) => ({ ...prev, productId: e.target.value }))}
                required
                className="w-full h-9 border border-[#d6d3d1] bg-white px-3 text-xs rounded-md focus:outline-none focus:border-[#006561]"
              >
                <option value="">-- Chọn sản phẩm bánh --</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Mã lô nướng (Batch Code)
              </label>
              <Input
                placeholder="Để trống để hệ thống tự tạo (vd: LOT-202611-...)"
                value={batchForm.batchCode || ''}
                onChange={(e) => setBatchForm((prev) => ({ ...prev, batchCode: e.target.value.toUpperCase() }))}
                className="text-xs font-mono h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Ngày sản xuất (NSX) *
                </label>
                <Input
                  type="date"
                  required
                  value={batchForm.manufactureDate}
                  onChange={(e) => setBatchForm((prev) => ({ ...prev, manufactureDate: e.target.value }))}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Hạn sử dụng (HSD) *
                </label>
                <Input
                  type="date"
                  required
                  value={batchForm.expiryDate}
                  onChange={(e) => setBatchForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Quick Expiry Date Preset Buttons */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-[#78716c]">Gợi ý HSD:</span>
              {[
                { label: '+30 ngày', days: 30 },
                { label: '+60 ngày', days: 60 },
                { label: '+90 ngày (3 tháng)', days: 90 },
                { label: '+180 ngày (6 tháng)', days: 180 },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.days}
                  onClick={() => {
                    const mDate = batchForm.manufactureDate ? new Date(batchForm.manufactureDate) : new Date()
                    const exp = new Date(mDate.getTime() + preset.days * 24 * 60 * 60 * 1000)
                    setBatchForm((prev) => ({ ...prev, expiryDate: exp.toISOString().split('T')[0] }))
                  }}
                  className="px-2 py-0.5 rounded-sm bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Số lượng bánh mẻ này (Hũ/Gói) *
              </label>
              <Input
                type="number"
                min={1}
                required
                value={batchForm.initialQuantity}
                onChange={(e) => setBatchForm((prev) => ({ ...prev, initialQuantity: Number(e.target.value) }))}
                className="text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Ghi chú mẻ bánh
              </label>
              <Input
                placeholder="Ví dụ: Nướng mẻ sáng, nhiệt độ 160 độ C, bánh nở đều thơm..."
                value={batchForm.note || ''}
                onChange={(e) => setBatchForm((prev) => ({ ...prev, note: e.target.value }))}
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateBatchModalOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={createBatchMutation.isPending}
                className="bg-[#006561] hover:bg-[#004e4a] text-white"
              >
                {createBatchMutation.isPending ? 'Đang tạo...' : 'Tạo Lô Sản Xuất'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Flash Sale Near-Expiry */}
      <Dialog open={!!flashSaleBatch} onOpenChange={() => setFlashSaleBatch(null)}>
        <DialogContent onClose={() => setFlashSaleBatch(null)} className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Chiến Dịch "Cứu Bánh Lành" Cận Date</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Áp dụng mức giảm giá ưu đãi cho lô bánh sắp hết hạn để đẩy nhanh tốc độ xoay vòng kho
            </DialogDescription>
          </DialogHeader>

          {flashSaleBatch && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1c1917]">{flashSaleBatch.productName || flashSaleBatch.productId}</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {flashSaleBatch.batchCode}
                  </Badge>
                </div>
                <div className="flex justify-between text-[11px] text-[#78716c]">
                  <span>HSD: <b>{formatDate(flashSaleBatch.expiryDate)}</b></span>
                  <span className="font-semibold text-amber-700">
                    {flashSaleBatch.daysRemaining > 0 ? `Còn ${flashSaleBatch.daysRemaining} ngày` : 'Đã hết hạn'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#1c1917]">
                    Tỷ lệ giảm giá (%):
                  </label>
                  <span className="font-mono font-bold text-base text-orange-600">
                    {flashSalePercent}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={70}
                    step={5}
                    value={flashSalePercent}
                    onChange={(e) => setFlashSalePercent(Number(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={70}
                    value={flashSalePercent}
                    onChange={(e) => setFlashSalePercent(Number(e.target.value))}
                    className="w-16 h-8 text-xs text-center font-bold"
                  />
                </div>
              </div>

              {/* Price Preview */}
              {flashSaleBatch.originalPrice && (
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <span className="text-stone-600">Giá bán sau khi giảm:</span>
                  <div className="text-right">
                    <span className="line-through text-stone-400 text-[11px] mr-2">
                      {formatCurrency(flashSaleBatch.originalPrice)}
                    </span>
                    <span className="font-bold text-base text-[#006561]">
                      {formatCurrency(flashSaleBatch.originalPrice * (1 - flashSalePercent / 100))}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Ghi chú chiến dịch xả hàng
                </label>
                <Input
                  placeholder="Ví dụ: Lô nướng mộc đợt trước - Giảm 35% tiết kiệm"
                  value={flashSaleNote}
                  onChange={(e) => setFlashSaleNote(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                {flashSaleBatch.discountPercent > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-stone-600 border-stone-300"
                    disabled={flashSaleMutation.isPending}
                    onClick={() => {
                      flashSaleMutation.mutate({
                        id: flashSaleBatch.id,
                        data: { discountPercent: 0, note: '' },
                      })
                    }}
                  >
                    Tắt Flash Sale (0%)
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFlashSaleBatch(null)}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={flashSaleMutation.isPending}
                    onClick={() => {
                      flashSaleMutation.mutate({
                        id: flashSaleBatch.id,
                        data: { discountPercent: flashSalePercent, note: flashSaleNote },
                      })
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {flashSaleMutation.isPending ? 'Đang lưu...' : 'Áp Dụng Flash Sale'}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
