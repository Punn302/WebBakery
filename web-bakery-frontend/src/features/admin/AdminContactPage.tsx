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
    <div className="space-y-6 font-text">
      {/* Page Header */}
      <div className="border-b border-[#E5E2DF] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#2A2725]">
          Hộp Thư Liên Hệ &amp; CSKH
        </h1>
        <p className="text-xs text-[#6B6661] mt-1">
          Tiếp nhận câu hỏi, yêu cầu đặt bánh tiệc sự kiện và phản hồi khách hàng
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B6661] uppercase tracking-wider block">
            Tổng Lời Nhắn
          </span>
          <div className="font-display text-2xl font-bold text-[#2A2725]">{messages.length}</div>
        </div>

        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#C9785C] uppercase tracking-wider block">
            Chờ Phản Hồi
          </span>
          <div className="font-display text-2xl font-bold text-[#C9785C]">{newCount}</div>
        </div>

        <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#006561] uppercase tracking-wider block">
            Đã Xử Lý / Phản Hồi
          </span>
          <div className="font-display text-2xl font-bold text-[#006561]">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#E5E2DF] bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
            className={`text-xs rounded-xl cursor-pointer ${statusFilter === 'ALL' ? 'bg-[#006561] text-white hover:bg-[#004e4a]' : 'border-[#E5E2DF]'}`}
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === 'NEW' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('NEW')}
            className={`text-xs rounded-xl cursor-pointer ${statusFilter === 'NEW' ? 'bg-[#006561] text-white hover:bg-[#004e4a]' : 'border-[#E5E2DF]'}`}
          >
            Chờ xử lý ({newCount})
          </Button>
          <Button
            variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('RESOLVED')}
            className={`text-xs rounded-xl cursor-pointer ${statusFilter === 'RESOLVED' ? 'bg-[#006561] text-white hover:bg-[#004e4a]' : 'border-[#E5E2DF]'}`}
          >
            Đã phản hồi ({resolvedCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6661]" />
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
            }}
            placeholder="Tìm theo tên hoặc email..."
            className="pl-9 text-xs rounded-xl border-[#E5E2DF] h-9.5"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-2xl border border-[#E5E2DF] bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E2DF] bg-[#FAF7F2] text-[#6B6661] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Người gửi</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Tiêu đề &amp; Nội dung</th>
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E2DF]/50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#6B6661]">
                  Đang nạp danh sách tin nhắn...
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#6B6661]">
                  Không có tin nhắn liên hệ nào.
                </td>
              </tr>
            ) : (
              filteredMessages.map((m) => (
                <tr key={m.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#2A2725]">{m.name}</div>
                    <div className="text-[11px] text-[#6B6661]">{m.email}</div>
                  </td>
                  <td className="py-3 px-4 text-[#6B6661]">{m.phone || 'Không có'}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-[#2A2725] truncate">
                      {m.subject || 'Liên hệ từ khách hàng'}
                    </div>
                    <div className="text-[11px] text-[#6B6661] truncate">{m.message}</div>
                  </td>
                  <td className="py-3 px-4 text-[#6B6661] whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    {m.status === 'NEW' ? (
                      <Badge variant="accent" className="rounded-lg">Mới tiếp nhận</Badge>
                    ) : (
                      <Badge variant="success" className="rounded-lg">Đã phản hồi</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2.5 rounded-lg border-[#E5E2DF] cursor-pointer"
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
          <div className="p-3 border-t border-[#E5E2DF] flex items-center justify-between text-xs text-[#6B6661]">
            <div>
              Trang {page + 1} / {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border-[#E5E2DF]"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border-[#E5E2DF]"
              >
                Tiếp theo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent onClose={() => setSelectedMessage(null)} className="max-w-lg p-6 space-y-4 rounded-3xl border border-[#E5E2DF]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[#2A2725]">Chi Tiết Lời Nhắn Từ Khách Hàng</DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661]">
              Gửi ngày {selectedMessage ? formatDate(selectedMessage.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAF7F2] border border-[#E5E2DF] rounded-2xl">
                <div>
                  <span className="text-[10px] text-[#6B6661] uppercase font-bold block">
                    Họ tên khách
                  </span>
                  <strong className="text-[#2A2725]">{selectedMessage.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6661] uppercase font-bold block">
                    Số điện thoại
                  </span>
                  <strong className="text-[#2A2725]">
                    {selectedMessage.phone || 'Chưa cập nhật'}
                  </strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#6B6661] uppercase font-bold block">
                    Email liên hệ
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Phản hồi từ Tiệm Bánh Hebekery`}
                    className="text-[#006561] font-semibold underline flex items-center gap-1"
                  >
                    <span>{selectedMessage.email}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#2A2725] block mb-1">Tiêu đề:</span>
                <p className="font-semibold text-[#6B6661]">
                  {selectedMessage.subject || 'Liên hệ từ khách hàng'}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#2A2725] block mb-1">Nội dung tin nhắn:</span>
                <div className="border border-[#E5E2DF] rounded-2xl p-3.5 bg-white leading-relaxed text-[#2A2725]">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div>
              {selectedMessage && selectedMessage.status === 'NEW' && (
                <Button
                  variant="default"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  className="bg-[#006561] hover:bg-[#004e4a] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
                  onClick={() =>
                    updateStatusMutation.mutate({ id: selectedMessage.id, status: 'RESOLVED' })
                  }
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Đánh Dấu Đã Phản Hồi
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)} className="rounded-xl text-xs border-[#E5E2DF] cursor-pointer">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
