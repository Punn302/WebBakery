import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star,
  Search,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  ThumbsUp,
  Package,
} from 'lucide-react'
import { adminReviewApi } from '@/api'
import { formatDate } from '@/utils/format'
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

interface ReviewItem {
  id: string
  productId: string
  productName: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export const AdminReviewPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRating, setSelectedRating] = useState<number | 'ALL'>('ALL')
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null)

  const { data: reviews = [], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ['admin-reviews'],
    queryFn: adminReviewApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminReviewApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Đã xóa đánh giá thành công')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Không thể xóa đánh giá này')
    },
  })

  // Calculations
  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0'
  const count5 = reviews.filter((r) => r.rating === 5).length
  const count4 = reviews.filter((r) => r.rating === 4).length
  const countLow = reviews.filter((r) => r.rating <= 3).length

  // Filtered List
  const filteredReviews = reviews.filter((item) => {
    const matchRating = selectedRating === 'ALL' || item.rating === selectedRating
    const query = searchQuery.toLowerCase()
    const matchSearch =
      item.userName?.toLowerCase().includes(query) ||
      item.productName?.toLowerCase().includes(query) ||
      item.comment?.toLowerCase().includes(query)
    return matchRating && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#2A2725]">
            Quản Lý &amp; Kiểm Duyệt Đánh Giá Khách Hàng
          </h1>
          <p className="text-xs text-[#6B6661] mt-1">
            Theo dõi ý kiến phản hồi về chất lượng bánh nướng mộc và kiểm duyệt các bình luận vi phạm
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] space-y-1">
          <span className="text-[11px] font-semibold text-[#6B6661] uppercase tracking-wider">
            Tổng Số Đánh Giá
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[#2A2725]">{totalReviews}</span>
            <span className="text-xs text-[#6B6661]">nhận xét</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] space-y-1">
          <span className="text-[11px] font-semibold text-[#6B6661] uppercase tracking-wider">
            Điểm Đánh Giá Trung Bình
          </span>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-[#006561]">{avgRating}</span>
            <div className="flex items-center text-[#eab308]">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs text-[#6B6661]">/ 5.0</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] space-y-1">
          <span className="text-[11px] font-semibold text-[#6B6661] uppercase tracking-wider">
            Đánh Giá 5 Sao Xuất Sắc
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[#16a34a]">{count5}</span>
            <span className="text-xs text-[#6B6661]">
              ({totalReviews > 0 ? Math.round((count5 / totalReviews) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] space-y-1">
          <span className="text-[11px] font-semibold text-[#6B6661] uppercase tracking-wider">
            Cần Cải Thiện (≤ 3 Sao)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[#C9785C]">{countLow}</span>
            <span className="text-xs text-[#6B6661]">nhận xét</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E2DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B6661] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo khách, bánh, nội dung..."
            className="pl-9 text-xs rounded-xl border-[#E5E2DF] h-9.5"
          />
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'Tất cả sao' },
            { id: 5, label: '5 ★' },
            { id: 4, label: '4 ★' },
            { id: 3, label: '3 ★' },
            { id: 2, label: '2 ★' },
            { id: 1, label: '1 ★' },
          ].map((item) => (
            <button
              key={item.id.toString()}
              onClick={() => setSelectedRating(item.id as number | 'ALL')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap',
                selectedRating === item.id
                  ? 'bg-[#006561] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6B6661] hover:text-[#006561] hover:bg-[#FAF7F2]/80'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#6B6661]">Đang tải danh sách đánh giá...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-[#6B6661] mx-auto" />
            <p className="text-xs font-semibold text-[#2A2725]">Không có đánh giá nào phù hợp</p>
            <p className="text-[11px] text-[#6B6661]">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E5E2DF] text-[#2A2725] font-bold">
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Sản phẩm đánh giá</th>
                  <th className="p-4">Điểm sao</th>
                  <th className="p-4 min-w-[280px]">Nội dung nhận xét</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DF] text-[#6B6661]">
                {filteredReviews.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-[#2A2725]">{item.userName || 'Khách hàng'}</div>
                      <div className="text-[10px] text-[#6B6661]">Mã KH: {item.userId}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#2A2725] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#006561] shrink-0" />
                        <span className="truncate max-w-[200px]">{item.productName}</span>
                      </div>
                      <div className="text-[10px] text-[#6B6661]">SKU: {item.productId}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[#eab308]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3.5 h-3.5',
                              i < item.rating ? 'fill-current text-[#eab308]' : 'text-[#E5E2DF]'
                            )}
                          />
                        ))}
                        <span className="ml-1 text-[11px] font-bold text-[#2A2725]">
                          {item.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-[#2A2725] leading-relaxed line-clamp-3">
                        {item.comment || <span className="italic text-[#6B6661]">(Không để lại lời nhắn)</span>}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-[11px]">
                      {item.createdAt ? formatDate(item.createdAt) : 'Vừa xong'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(item)}
                        className="text-[#B23A2A] hover:bg-[#B23A2A]/10 h-8 w-8 p-0 rounded-lg cursor-pointer"
                        title="Xóa đánh giá này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#B23A2A]/10 text-[#B23A2A] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-center font-display text-base font-bold text-[#2A2725]">
              Xác Nhận Xóa Đánh Giá?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-[#6B6661] leading-relaxed">
              Bạn có chắc chắn muốn xóa đánh giá của <strong>{deleteTarget?.userName}</strong> cho sản phẩm{' '}
              <strong>"{deleteTarget?.productName}"</strong>? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2 pt-4">
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
