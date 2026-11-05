import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#e7e5e4] bg-[#f4efe6] text-[#292524] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/images/logo.webp"
                alt="Hebekery"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs leading-relaxed text-[#78716c]">
              Tiệm bánh dinh dưỡng, bánh ăn kiêng và ngũ cốc sấy giòn thủ công. Chăm chút từng chiếc bánh với tình yêu sức khỏe và nguyên liệu tự nhiên nguyên bản.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs text-[#78716c]">
              <li>
                <Link to="/products" className="hover:text-[#47654c] transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#47654c] transition-colors">
                  Câu chuyện thương hiệu
                </Link>
              </li>
              <li>
                <Link to="/bmi-tdee" className="hover:text-[#47654c] transition-colors">
                  Công cụ tính TDEE & Macro
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#47654c] transition-colors">
                  Gửi lời nhắn đóng góp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
              Chính Sách & Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-xs text-[#78716c]">
              <li>Chính sách giao nhận & bảo quản bánh tươi</li>
              <li>Quy định đổi trả hàng trong 24 giờ</li>
              <li>Cam kết chất lượng không phụ gia</li>
              <li>Bảo mật thông tin khách hàng</li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
              Liên Hệ Tiệm
            </h4>
            <div className="space-y-2 text-xs text-[#78716c]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#47654c] shrink-0 mt-0.5" />
                <span>123 Đường Bánh Mì, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>0912 345 678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>contact@hebekery.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>07:30 - 21:00 hàng ngày</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e7e5e4] mt-10 pt-6 text-center text-xs text-[#a8a29e]">
          © {new Date().getFullYear()} Hebekery Bakery. Toàn bộ hình ảnh và sản phẩm thuộc bản quyền Hebekery.
        </div>
      </div>
    </footer>
  )
}
