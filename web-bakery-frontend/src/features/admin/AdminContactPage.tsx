import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Filter,
} from 'lucide-react'
import { adminContactApi } from '@/api'
import type { ContactMessage } from '@/types'
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

export const AdminContactPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'RESOLVED'>('ALL')
  const [page, setPage] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  // Query contacts
  const { data: contactData, isLoading } = useQuery({
    queryKey: ['admin-contacts', keyword, page],
    queryFn: () => adminContactApi.getContacts({ keyword: keyword.trim() || undefined, page, size: 20 }),
  })

  const messages = contactData?.content || []
  const totalPages = contactData?.totalPages || 1

  // Client-side status filter
  const filteredMessages =
    statusFilter === 'ALL'
      ? messages
      : messages.filter((m) => m.status === statusFilter)

  // Mutation to update message status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'RESOLVED' | 'SPAM' }) =>
      adminContactApi.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] })
      toast.success(
        updated.status === 'RESOLVED'
          ? 'Đã đánh dấu tin nhắn liên hệ đã được phản hồi!'
          : 'Đã đánh dấu thư rác'
      )
      if (selectedMessage?.id === updated.id) {
        setSelectedMessage(updated)
      }
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái tin nhắn')
    },
  })

  const newCount = messages.filter((m) => m.status === 'NEW').length
  const resolvedCount = messages.filter((m) => m.status === 'RESOLVED').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#e7e5e4] pb-5">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Hộp Thư Liên Hệ & CSKH
        </h1>
        <p className="text-xs text-[#78716c] mt-0.5">
          Tiếp nhận câu hỏi, yêu cầu đặt bánh tiệc sự kiện và phản hồi khách hàng
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
            Tổng Lời Nhắn
          </span>
          <div className="text-2xl font-black text-[#1c1917]">{messages.length}</div>
        </div>

        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#d97724] uppercase tracking-wider block">
            Chờ Phản Hồi
          </span>
          <div className="text-2xl font-black text-[#d97724]">{newCount}</div>
        </div>

        <div className="border border-[#e7e5e4] bg-white p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-wider block">
            Đã Xử Lý / Phản Hồi
          </span>
          <div className="text-2xl font-black text-[#15803d]">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="border border-[#e7e5e4] bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
            className="text-xs"
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === 'NEW' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('NEW')}
            className="text-xs"
          >
            Chờ xử lý ({newCount})
          </Button>
          <Button
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('RESOLVED')}
            className="text-xs"
          >
            Đã phản hồi ({resolvedCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            placeholder="Tìm theo tên hoặc email..."
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="border border-[#e7e5e4] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#e7e5e4] bg-[#faf8f5] text-[#57534e] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Người gửi</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Tiêu đề & Nội dung</th>
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f4]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#78716c]">
                  Đang nạp danh sách tin nhắn...
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#78716c]">
                  Không có tin nhắn liên hệ nào.
                </td>
              </tr>
            ) : (
              filteredMessages.map((m) => (
                <tr key={m.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1c1917]">{m.name}</div>
                    <div className="text-[11px] text-[#78716c]">{m.email}</div>
                  </td>
                  <td className="py-3 px-4 text-[#57534e]">{m.phone || 'Không có'}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-[#1c1917] truncate">
                      {m.subject || 'Liên hệ từ khách hàng'}
                    </div>
                    <div className="text-[11px] text-[#78716c] truncate">{m.message}</div>
                  </td>
                  <td className="py-3 px-4 text-[#78716c] whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    {m.status === 'NEW' ? (
                      <Badge variant="accent">Mới tiếp nhận</Badge>
                    ) : (
                      <Badge variant="success">Đã phản hồi</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2.5"
                      onClick={() => setSelectedMessage(m)}
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#e7e5e4] flex items-center justify-between text-xs text-[#78716c]">
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
      </div>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent onClose={() => setSelectedMessage(null)} className="max-w-lg p-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Chi Tiết Lời Nhắn Từ Khách Hàng</DialogTitle>
            <DialogDescription className="text-xs text-[#78716c]">
              Gửi ngày {selectedMessage ? formatDate(selectedMessage.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#faf8f5] border border-[#e7e5e4]">
                <div>
                  <span className="text-[10px] text-[#78716c] uppercase font-bold block">
                    Họ tên khách
                  </span>
                  <strong className="text-[#1c1917]">{selectedMessage.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#78716c] uppercase font-bold block">
                    Số điện thoại
                  </span>
                  <strong className="text-[#1c1917]">
                    {selectedMessage.phone || 'Chưa cập nhật'}
                  </strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#78716c] uppercase font-bold block">
                    Email liên hệ
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Phản hồi từ Tiệm Bánh Hebekery`}
                    className="text-[#47654c] font-semibold underline flex items-center gap-1"
                  >
                    <span>{selectedMessage.email}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#1c1917] block mb-1">Tiêu đề:</span>
                <p className="font-semibold text-[#57534e]">
                  {selectedMessage.subject || 'Liên hệ từ khách hàng'}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#1c1917] block mb-1">Nội dung tin nhắn:</span>
                <div className="border border-[#e7e5e4] p-3 bg-white leading-relaxed text-[#1c1917]">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {selectedMessage && selectedMessage.status === 'NEW' && (
                <Button
                  variant="default"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  onClick={() =>
                    updateStatusMutation.mutate({ id: selectedMessage.id, status: 'RESOLVED' })
                  }
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Đánh Dấu Đã Phản Hồi
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
