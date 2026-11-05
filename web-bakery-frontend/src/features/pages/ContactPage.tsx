import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactApi } from '@/api'
import type { ContactSubmitRequest } from '@/types'
import { toast } from 'sonner'

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const submitMutation = useMutation({
    mutationFn: (data: ContactSubmitRequest) => contactApi.submitContact(data),
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã gửi lời nhắn! Hebekery sẽ phản hồi trong 24 giờ.')
      setIsSuccess(true)
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể gửi lời nhắn. Vui lòng kiểm tra lại thông tin.'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc')
      return
    }

    submitMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim() || 'Hỏi đáp & Liên hệ tư vấn bánh',
      message: message.trim(),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Liên Hệ Hebekery
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Đóng góp ý kiến hoặc liên hệ đặt bánh số lượng lớn cho sự kiện, tiệc teabreak
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info */}
        <div className="border border-[#e7e5e4] bg-white p-6 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
            Thông Tin Tiệm Bánh
          </h2>
          <div className="space-y-3.5 text-xs text-[#57534e]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#47654c] shrink-0 mt-0.5" />
              <span>123 Đường Bánh Mì, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#47654c] shrink-0" />
              <span>0912 345 678</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#47654c] shrink-0" />
              <span>contact@hebekery.vn</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#47654c] shrink-0" />
              <span>07:30 - 21:00 (Từ Thứ Hai đến Chủ Nhật)</span>
            </div>
          </div>

          <div className="p-4 bg-[#faf8f5] border border-[#e7e5e4] space-y-2">
            <h3 className="text-xs font-bold text-[#1c1917] uppercase tracking-wide">
              Đơn hàng doanh nghiệp / Sự kiện
            </h3>
            <p className="text-[11px] text-[#78716c] leading-relaxed">
              Hebekery cung cấp set bánh ngọt thanh, không đường công nghiệp cho các buổi hội thảo, workshop và tiệc công ty với chiết khấu hấp dẫn.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-[#e7e5e4] bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
            Gửi Lời Nhắn Trực Tiếp
          </h2>

          {isSuccess && (
            <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Đã gửi tin nhắn thành công! Tiệm bánh sẽ phản hồi sớm nhất qua email hoặc điện thoại.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Họ tên của bạn *
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Số điện thoại *
              </label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1">
              Email liên hệ *
            </label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1">
              Chủ đề liên hệ
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Hỏi về sản phẩm, đặt bánh sự kiện..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1">
              Nội dung tin nhắn *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-[#d6d3d1] p-2.5 text-xs focus:outline-none focus:border-[#47654c]"
              placeholder="Nhập nội dung chi tiết bạn muốn trao đổi cùng Hebekery..."
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={submitMutation.isPending}
            className="w-full flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitMutation.isPending ? 'Đang gửi...' : 'Gửi Tin Nhắn Cho Hebekery'}</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
