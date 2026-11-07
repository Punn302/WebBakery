import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  Truck,
  ExternalLink,
  ShieldCheck,
  Gift,
} from 'lucide-react'
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
      toast.success(
        'Cảm ơn bạn đã gửi lời nhắn! Tiệm HeBekery sẽ liên hệ phản hồi trong thời gian sớm nhất.'
      )
      setIsSuccess(true)
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Không thể gửi lời nhắn. Vui lòng kiểm tra lại thông tin.'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)')
      return
    }

    submitMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim() || 'Hỏi đáp & Liên hệ tư vấn bánh dinh dưỡng HeBekery',
      message: message.trim(),
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 py-2 pb-16">
      {/* ================= Header Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#c8983d]" />
            <span>Chăm Sóc Khách Hàng • HeBekery Official</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#006561] font-semibold flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#91350a]" /> Freeship từ 299k
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#006561] font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#91350a]" /> Hỏa tốc 2H HCM &amp; HN
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#006561] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#7B9461]" /> Đổi trả 1-1 miễn phí
            </span>
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#2A2725] tracking-tight">
          Liên Hệ &amp; Hệ Thống Tiệm Bánh HeBekery
        </h1>

        <p className="font-serif italic text-sm sm:text-base text-[#6B6661] max-w-2xl leading-relaxed">
          “Mỗi lời nhắn là một nhịp cầu để HeBekery lắng nghe, đồng hành và phục vụ bạn chu đáo hơn mỗi ngày.”
        </p>
      </div>

      {/* ================= 2-Column Layout ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Official Store Info & Map */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Information Card */}
          <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-display text-lg font-bold text-[#2A2725] border-b border-[#E5E2DF] pb-3">
              Thông Tin Chính Thức HeBekery
            </h2>

            <div className="space-y-4 text-xs">
              {/* Địa chỉ */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#006561]/10 text-[#006561] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2A2725] text-xs uppercase tracking-wide">
                    Địa chỉ tiệm bánh &amp; bếp chính
                  </p>
                  <p className="text-sm font-semibold text-[#2A2725] mt-0.5">
                    2D Hồ Ngọc Cẩn, Phường Tân Thành, Quận Tân Phú, TP HCM
                  </p>
                  <span className="text-[11px] text-[#6B6661]">
                    (Khu vực Tân Phú, giáp Quận Tân Bình &amp; Quận 11)
                  </span>
                </div>
              </div>

              {/* Hotline */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#006561]/10 text-[#006561] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2A2725] text-xs uppercase tracking-wide">
                    Hotline Đặt Bánh &amp; CSKH
                  </p>
                  <a
                    href="tel:0979764185"
                    className="font-mono text-base font-bold text-[#006561] hover:text-[#1a9a9b] transition-colors block mt-0.5"
                  >
                    097 97 64 185
                  </a>
                  <span className="text-[11px] text-[#6B6661]">
                    Hỗ trợ nhanh qua Zalo &amp; cuộc gọi trực tiếp
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#006561]/10 text-[#006561] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2A2725] text-xs uppercase tracking-wide">
                    Hòm Thư Điện Tử
                  </p>
                  <a
                    href="mailto:hebe.healthandbeauty@gmail.com"
                    className="text-xs font-semibold text-[#006561] hover:underline block mt-0.5 break-all"
                  >
                    hebe.healthandbeauty@gmail.com
                  </a>
                  <span className="text-[11px] text-[#6B6661]">
                    Tiếp nhận yêu cầu báo giá doanh nghiệp &amp; đại lý
                  </span>
                </div>
              </div>

              {/* Giờ mở cửa */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#006561]/10 text-[#006561] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2A2725] text-xs uppercase tracking-wide">
                    Thời Gian Phục Vụ
                  </p>
                  <p className="text-xs font-semibold text-[#2A2725] mt-0.5">
                    08:00 - 21:00 hàng ngày
                  </p>
                  <span className="text-[11px] text-[#6B6661]">
                    (Mở cửa xuyên suốt kể cả Thứ 7 &amp; Chủ Nhật)
                  </span>
                </div>
              </div>

              {/* Giao hàng nhanh */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#91350a]/10 text-[#91350a] flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2A2725] text-xs uppercase tracking-wide">
                    Chính Sách Vận Chuyển Hỏa Tốc
                  </p>
                  <p className="text-xs font-semibold text-[#91350a] mt-0.5">
                    Giao hỏa tốc 2H tại TP.HCM &amp; Hà Nội
                  </p>
                  <span className="text-[11px] text-[#6B6661]">
                    Đóng thùng giữ nhiệt xốp khí an toàn tuyệt đối
                  </span>
                </div>
              </div>
            </div>

            {/* Teabreak / B2B Card */}
            <div className="p-4 rounded-2xl bg-[#F8F6F5] border border-[#E5E2DF] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#006561] uppercase tracking-wide">
                <Gift className="w-3.5 h-3.5 text-[#c8983d]" />
                <span>Teabreak &amp; Quà Tặng Doanh Nghiệp</span>
              </div>
              <p className="text-[11px] text-[#6B6661] leading-relaxed">
                HeBekery cung cấp set bánh dinh dưỡng ít ngọt, thanh khiết cho hội thảo, workshop và quà tặng sức khỏe đối tác với chiết khấu tới 20%.
              </p>
            </div>
          </div>

          {/* Google Map Card */}
          <div className="bg-white rounded-3xl border border-[#E5E2DF] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#006561]" />
                <h3 className="font-display text-sm font-bold text-[#2A2725]">
                  Bản Đồ Chỉ Đường Đến Tiệm
                </h3>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=2D+H%E1%BB%93+Ng%E1%BB%8Dc+C%E1%BA%A9n%2C+T%C3%A2n+Th%C3%A0nh%2C+T%C3%A2n+Ph%C3%BA%2C+H%E1%BB%93+Ch%C3%AD+Minh"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#006561] hover:text-[#1a9a9b] inline-flex items-center gap-1"
              >
                <span>Xem bản đồ lớn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full h-64 rounded-2xl overflow-hidden border border-[#E5E2DF] bg-[#F8F6F5]">
              <iframe
                title="Bản đồ Tiệm Bánh HeBekery"
                src="https://maps.google.com/maps?q=2D%20H%E1%BB%93%20Ng%E1%BB%8Dc%20C%E1%BA%A9n,%20T%C3%A2n%20Th%C3%A0nh,%20T%C3%A2n%20Ph%C3%BA,%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="border-b border-[#E5E2DF] pb-3">
              <h2 className="font-display text-xl font-bold text-[#2A2725]">
                Gửi Lời Nhắn Đến Bếp HeBekery
              </h2>
              <p className="text-xs text-[#6B6661] mt-0.5">
                Điền thông tin bên dưới để chuyên viên dinh dưỡng liên hệ hỗ trợ bạn nhanh nhất.
              </p>
            </div>

            {isSuccess && (
              <div className="p-4 bg-[#7B9461]/10 border border-[#7B9461]/30 text-[#7B9461] rounded-2xl text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#7B9461] mt-0.5" />
                <div>
                  <p className="font-bold">Đã gửi tin nhắn thành công!</p>
                  <p className="text-xs text-[#2A2725] mt-0.5">
                    Cảm ơn bạn đã liên hệ. HeBekery sẽ phản hồi bạn qua điện thoại hoặc email trong vòng 2-4 giờ làm việc.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] uppercase tracking-wide mb-1.5">
                Họ và tên của bạn <span className="text-[#B23A2A]">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Thị Mai Phương"
                className="rounded-2xl border-[#E5E2DF] bg-[#F8F6F5] text-xs sm:text-sm h-11"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A2725] uppercase tracking-wide mb-1.5">
                  Số điện thoại <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="097 97 64 185"
                  className="rounded-2xl border-[#E5E2DF] bg-[#F8F6F5] text-xs sm:text-sm h-11"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2725] uppercase tracking-wide mb-1.5">
                  Địa chỉ Email <span className="text-[#B23A2A]">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="rounded-2xl border-[#E5E2DF] bg-[#F8F6F5] text-xs sm:text-sm h-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] uppercase tracking-wide mb-1.5">
                Nhu cầu cần hỗ trợ
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 border border-[#E5E2DF] rounded-2xl bg-[#F8F6F5] px-4 text-xs sm:text-sm text-[#2A2725] focus:outline-none focus:border-[#006561] cursor-pointer"
              >
                <option value="">-- Chọn chủ đề cần tư vấn --</option>
                <option value="Tư vấn combo ăn kiêng & giảm mỡ tự nhiên">
                  Tư vấn combo bánh ăn kiêng &amp; giảm mỡ tự nhiên
                </option>
                <option value="Đặt hàng bánh Teabreak / Hội thảo công ty">
                  Đặt bánh Teabreak / Hội thảo sự kiện công ty
                </option>
                <option value="Hỏi đáp về thành phần dinh dưỡng & bảo quản bánh">
                  Hỏi đáp về thành phần dinh dưỡng &amp; hạn bảo quản bánh
                </option>
                <option value="Tra cứu tiến độ giao hàng & đổi trả">
                  Tra cứu tiến độ giao hàng &amp; chính sách đổi trả
                </option>
                <option value="Hợp tác đại lý phân phối bánh HeBekery">
                  Hợp tác đại lý phân phối bánh HeBekery
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2725] uppercase tracking-wide mb-1.5">
                Lời nhắn gửi tiệm bánh <span className="text-[#B23A2A]">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Chia sẻ với HeBekery về thắc mắc, mục tiêu dinh dưỡng hoặc thời gian bạn muốn nhận bánh..."
                className="w-full rounded-2xl border border-[#E5E2DF] bg-[#F8F6F5] p-3.5 text-xs sm:text-sm text-[#2A2725] focus:border-[#006561] focus:outline-none focus:ring-1 focus:ring-[#006561]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] rounded-full py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Send className="w-4 h-4 text-[#c8983d]" />
              <span>
                {submitMutation.isPending ? 'Đang gửi lời nhắn...' : 'Gửi Lời Nhắn Đến Tiệm Bánh'}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
