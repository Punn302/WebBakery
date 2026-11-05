import React, { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Cảm ơn bạn đã gửi lời nhắn! Hebekery sẽ phản hồi trong 24 giờ.')
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Liên Hệ Hebekery
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Đóng góp ý kiến hoặc liên hệ đặt bánh số lượng lớn cho sự kiện, tiệc teabreak
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info */}
        <div className="border border-[#e7e5e4] bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
            Thông Tin Tiệm Bánh
          </h2>
          <div className="space-y-3 text-xs text-[#57534e]">
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-[#e7e5e4] bg-white p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917]">
            Gửi Lời Nhắn Trực Tiếp
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1">Họ tên của bạn *</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1">Email liên hệ *</label>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1">Nội dung tin nhắn *</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-[#d6d3d1] p-2.5 text-xs focus:outline-none focus:border-[#47654c]"
              placeholder="Bạn muốn hỏi về sản phẩm hoặc đặt bánh số lượng lớn..."
            />
          </div>

          <Button type="submit" size="sm" className="w-full flex items-center justify-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Gửi Tin Nhắn</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
