import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle2 } from 'lucide-react'
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
      toast.success('Cảm ơn bạn đã gửi lời nhắn! Bếp Hebekery sẽ phản hồi trong 24 giờ.')
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
      subject: subject.trim() || 'Hỏi đáp & Liên hệ tư vấn bánh dinh dưỡng',
      message: message.trim(),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="border-b border-[#eadbce] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hỗ trợ & Lắng nghe</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#2e1e12] tracking-tight">
          Liên Hệ Hebekery
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6856] mt-1.5">
          Tư vấn thực đơn dinh dưỡng & liên hệ đặt bánh teabreak
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bakery Information */}
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-6">
          <h2 className="font-headline text-lg font-bold text-[#2e1e12]">
            Thông Tin Tiệm Bánh
          </h2>

          <div className="space-y-4 text-xs text-[#5c4a3a]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#47654c] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#2e1e12]">Địa chỉ tiệm & Bếp chính</p>
                <p className="text-[#7c6856]">123 Đường Bánh Mì, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#47654c] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#2e1e12]">Hotline đặt bánh & CSKH</p>
                <p className="text-[#7c6856]">1900 6828 • 0912 345 678</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#47654c] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#2e1e12]">Email hỗ trợ khách hàng</p>
                <p className="text-[#7c6856]">contact@hebekery.vn</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#eadbce] flex items-center justify-center text-[#47654c] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#2e1e12]">Giờ mở cửa phục vụ</p>
                <p className="text-[#7c6856]">07:30 - 21:00 (Mỗi ngày, kể cả Thứ 7 & CN)</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#eadbce] space-y-2">
            <h3 className="font-headline text-xs font-bold text-[#2e1e12] uppercase tracking-wide">
              Đơn hàng tiệc trà Doanh nghiệp / Teabreak
            </h3>
            <p className="text-[11px] text-[#7c6856] leading-relaxed">
              Hebekery nhận cung cấp set bánh ngọt thanh, không đường tinh luyện cho các buổi hội thảo, workshop và tiệc công ty với chiết khấu hấp dẫn.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 sm:p-7 space-y-4">
          <h2 className="font-headline text-lg font-bold text-[#2e1e12]">
            Gửi Lời Nhắn Đến Bếp Bánh
          </h2>

          {isSuccess && (
            <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16a34a]" />
              <span>Lời nhắn của bạn đã được gửi thành công. Hebekery sẽ liên hệ sớm nhất!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#2e1e12] mb-1">
              Họ và tên của bạn <span className="text-[#d97724]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="rounded-xl border-[#eadbce] text-xs h-9"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#2e1e12] mb-1">
                Địa chỉ Email <span className="text-[#d97724]">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="rounded-xl border-[#eadbce] text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2e1e12] mb-1">
                Số điện thoại <span className="text-[#d97724]">*</span>
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="rounded-xl border-[#eadbce] text-xs h-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2e1e12] mb-1">
              Chủ đề liên hệ
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ví dụ: Tư vấn set bánh Eat Clean / Đặt tiệc trà"
              className="rounded-xl border-[#eadbce] text-xs h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2e1e12] mb-1">
              Nội dung lời nhắn <span className="text-[#d97724]">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Chia sẻ với Hebekery về nhu cầu của bạn..."
              className="w-full rounded-xl border border-[#eadbce] p-3 text-xs text-[#2e1e12] focus:border-[#47654c] focus:outline-none focus:ring-1 focus:ring-[#47654c]"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="btn-tactile w-full bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mt-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitMutation.isPending ? 'Đang gửi...' : 'Gửi Lời Nhắn'}</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
