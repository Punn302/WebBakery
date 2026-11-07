import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#eadbce] bg-[#f5f0e9] text-[#292524] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <img
                src="/images/logo.webp"
                alt="Hebekery"
                className="h-9 w-auto object-contain"
              />
              <span className="text-[11px] font-semibold text-[#78716c] uppercase tracking-wider mt-1">
                BÁNH DINH DƯỠNG &amp; ĂN KIÊNG
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#78716c]">
              Mỗi mẻ bánh nướng Hebekery là sự kết hợp chuẩn mực giữa yến mạch nguyên cám, hạt dinh dưỡng tự nhiên và quy trình lên men chậm. Cam kết 100% không đường tinh luyện, không phụ gia công nghiệp.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#47654c] font-semibold">
              <Sparkles className="w-4 h-4 text-[#d97724]" />
              <span>Nướng mẻ nhỏ giới hạn mỗi sáng lúc 06:30</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-headline text-base font-semibold text-[#4a3728]">
              Khám Phá
            </h4>
            <ul className="space-y-2.5 text-xs text-[#78716c]">
              <li>
                <Link to="/products" className="hover:text-[#4a3728] transition-colors">
                  Thực đơn bánh nướng dinh dưỡng
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#4a3728] transition-colors">
                  Triết lý &amp; Câu chuyện làm bánh
                </Link>
              </li>
              <li>
                <Link to="/bmi-tdee" className="hover:text-[#4a3728] transition-colors">
                  Công cụ tính TDEE &amp; Combo 7 ngày
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-[#4a3728] transition-colors">
                  Tra cứu tiến độ &amp; Hành trình đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#4a3728] transition-colors">
                  Góp ý &amp; Đặt bánh theo yêu cầu
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Quality */}
          <div className="space-y-3">
            <h4 className="font-headline text-base font-semibold text-[#4a3728]">
              Chất Lượng &amp; Hỗ Trợ
            </h4>
            <ul className="space-y-2.5 text-xs text-[#78716c]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#47654c] shrink-0" />
                <span>Cam kết 100% nguyên liệu tự nhiên</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#47654c] shrink-0" />
                <span>Đổi trả 1-1 miễn phí trong 24h</span>
              </li>
              <li>Chính sách giao hỏa tốc 2H giữ trọn độ ấm giòn</li>
              <li>Minh bạch chỉ số Macro &amp; Calo từng loại bánh</li>
              <li>Bảo mật thông tin đơn hàng 100% SSL 256-bit</li>
            </ul>
          </div>

          {/* Col 4: Contact & Kitchen Address */}
          <div className="space-y-3">
            <h4 className="font-headline text-base font-semibold text-[#4a3728]">
              Bếp Nướng &amp; Liên Hệ
            </h4>
            <div className="space-y-2.5 text-xs text-[#78716c]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#4a3728] shrink-0 mt-0.5" />
                <span>45 Nguyễn Gia Trí, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#4a3728] shrink-0" />
                <span>Hotline Bếp: 1900 6828 (07:30 - 21:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#4a3728] shrink-0" />
                <span>cskh@hebekery.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>Mở cửa: 07:30 - 21:00 (Cả Thứ 7 &amp; Chủ Nhật)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#eadbce] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#a8a29e] gap-3">
          <div>
            © {new Date().getFullYear()} Hebekery Bakery. Tiệm Bánh Dinh Dưỡng &amp; Ăn Kiêng Thủ Công.
          </div>
          <div className="flex items-center gap-4 text-[#78716c]">
            <span>Ăn Ngon</span>
            <span>•</span>
            <span>Khỏe Đẹp</span>
            <span>•</span>
            <span>Giữ Dáng Bền Vững</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
