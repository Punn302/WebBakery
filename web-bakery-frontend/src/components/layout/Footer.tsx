import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FBF6EA] border-t border-[#E5E2DF] text-[#2A2725] pt-14 pb-8 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block" title="HeBekery - Health & Beauty Foods">
              <img
                src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/logo.png?1790765513162"
                alt="HeBekery - Health & Beauty Foods"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-[#6B6661] max-w-sm font-text leading-relaxed">
              Thực phẩm dinh dưỡng &amp; bánh ăn kiêng lành mạnh chuẩn Eat Clean, Keto. Chúng tôi tạo
              nên những sản phẩm ngon thật, lành thật từ 100% nguyên liệu tự nhiên.
            </p>

            <div className="space-y-2.5 text-xs text-[#2A2725] font-medium pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9785C] shrink-0 mt-0.5" />
                <span>2D Hồ Ngọc Cẩn, Phường Tân Thành, Quận Tân Phú, TP HCM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#006561] shrink-0" />
                <a href="tel:0979764185" className="hover:text-[#006561] transition-colors">
                  Hotline: 097 97 64 185
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#006561] shrink-0" />
                <a
                  href="mailto:hebe.healthandbeauty@gmail.com"
                  className="hover:text-[#006561] transition-colors"
                >
                  hebe.healthandbeauty@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#6B6661] shrink-0" />
                <span>08:00 - 21:00 hàng ngày (kể cả Thứ 7 &amp; CN)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Danh Mục (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2A2725]">
              Sản phẩm
            </h4>
            <ul className="space-y-2 text-xs text-[#6B6661] font-text">
              <li>
                <Link to="/products?category=Biscotti" className="hover:text-[#006561] transition-colors">
                  Bánh Biscotti nguyên cám
                </Link>
              </li>
              <li>
                <Link to="/products?category=Granola" className="hover:text-[#006561] transition-colors">
                  Granola siêu hạt
                </Link>
              </li>
              <li>
                <Link to="/products?category=B%C3%A1nh+ng%C3%B3i" className="hover:text-[#006561] transition-colors">
                  Bánh ngói hạnh nhân keto
                </Link>
              </li>
              <li>
                <Link to="/products?category=Thanh+h%E1%BA%A1t" className="hover:text-[#006561] transition-colors">
                  Thanh hạt năng lượng
                </Link>
              </li>
              <li>
                <Link to="/products?category=Cookies" className="hover:text-[#006561] transition-colors">
                  Cookies hạnh nhân
                </Link>
              </li>
              <li>
                <Link to="/products?category=H%E1%BA%A1t" className="hover:text-[#006561] transition-colors">
                  Trái cây &amp; Hạt sấy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hỗ Trợ (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2A2725]">
              Lắng nghe bạn
            </h4>
            <ul className="space-y-2 text-xs text-[#6B6661] font-text">
              <li>
                <Link to="/about" className="hover:text-[#006561] transition-colors">
                  Câu chuyện thương hiệu
                </Link>
              </li>
              <li>
                <Link to="/bmi-tdee" className="hover:text-[#006561] transition-colors">
                  Công cụ tính Calo &amp; BMI
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#006561] transition-colors">
                  Liên hệ hợp tác &amp; Teabreak
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-[#006561] transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/vouchers" className="hover:text-[#006561] transition-colors">
                  Kho mã giảm giá &amp; Voucher
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=return" className="hover:text-[#006561] transition-colors">
                  Chính sách đổi trả 1-1
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=shipping" className="hover:text-[#006561] transition-colors">
                  Chính sách giao hỏa tốc 2H
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#006561] transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=privacy" className="hover:text-[#006561] transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Chứng Nhận & Kết Nối (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2A2725]">
              Chứng nhận chất lượng
            </h4>

            <div className="flex items-center gap-3">
              {/* Bộ Công Thương Badge */}
              <a
                href="http://online.gov.vn/Home/WebDetails/125589"
                target="_blank"
                rel="noreferrer"
                title="Đã thông báo Bộ Công Thương"
                className="inline-block"
              >
                <img
                  src="https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/payment-1.png?1790765513162"
                  alt="Đã thông báo Bộ Công Thương"
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </a>

              {/* DMCA Badge */}
              <a
                href="//www.dmca.com/Protection/Status.aspx?ID=8b60b4cb-72d8-4307-bdb3-20a48e3d9ba5&refurl=https://hebekery.vn"
                target="_blank"
                rel="noreferrer"
                title="DMCA.com Protection Status"
                className="inline-block"
              >
                <img
                  src="https://images.dmca.com/Badges/dmca_protected_sml_120l.png?ID=8b60b4cb-72d8-4307-bdb3-20a48e3d9ba5"
                  alt="DMCA Protected"
                  className="h-6 w-auto object-contain"
                />
              </a>
            </div>

            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-bold text-[#2A2725] uppercase tracking-wider">
                Giao hàng nhanh
              </p>
              <p className="text-xs text-[#6B6661]">
                Nội thành TP.HCM &amp; Hà Nội nhận bánh trong 2 giờ.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[#E5E2DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6661]">
          <p>© 2026 HeBekery. All rights reserved.</p>
          <p className="text-[11px]">Designed with care for healthy lifestyle community.</p>
        </div>
      </div>
    </footer>
  )
}
