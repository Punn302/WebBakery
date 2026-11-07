import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5E2DF] bg-[#FBF6EA] text-[#2A2725] font-text select-none">
      {/* 4-COLUMN MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: HeBekery Logo & Contact */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group inline-block">
              <img
                src="/images/logo.webp"
                alt="HeBekery"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black tracking-tight text-[#006561] leading-none">
                  HeBekery
                </span>
                <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#6B6661] mt-1 leading-none">
                  Health &amp; Beauty Foods
                </span>
              </div>
            </Link>

            <div className="text-xs text-[#6B6661] space-y-2.5 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#006561] shrink-0 mt-0.5" />
                <span>2D Hồ Ngọc Cẩn, Phường Tân Thành, Quận Tân Phú, TP HCM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#006561] shrink-0" />
                <a
                  href="tel:0979764185"
                  className="font-bold text-[#2A2725] hover:text-[#006561] transition-colors"
                >
                  097 97 64 185
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
                <Clock className="w-4 h-4 text-[#7B9461] shrink-0" />
                <span>Giờ mở cửa: 08:00 - 21:00 hàng ngày</span>
              </div>
            </div>
          </div>

          {/* Col 2: Danh Mục Sản Phẩm */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#006561]">
              Danh Mục Sản Phẩm
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6B6661]">
              <li>
                <Link
                  to="/products?search=biscotti"
                  className="hover:text-[#006561] hover:underline transition-colors flex items-center justify-between"
                >
                  <span>Biscotti nguyên cám</span>
                  <span className="text-[10px] text-[#7B9461] font-medium bg-[#7B9461]/10 px-2 py-0.5 rounded-full">
                    0g đường
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products?search=granola"
                  className="hover:text-[#006561] hover:underline transition-colors flex items-center justify-between"
                >
                  <span>Granola siêu hạt</span>
                  <span className="text-[10px] text-[#C9785C] font-medium bg-[#C9785C]/10 px-2 py-0.5 rounded-full">
                    Siêu giòn
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products?search=keto"
                  className="hover:text-[#006561] hover:underline transition-colors flex items-center justify-between"
                >
                  <span>Bánh ngói keto</span>
                  <span className="text-[10px] text-[#6B6661] font-medium bg-[#6B6661]/10 px-2 py-0.5 rounded-full">
                    Keto
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products?search=bar"
                  className="hover:text-[#006561] hover:underline transition-colors flex items-center justify-between"
                >
                  <span>Thanh năng lượng (Nut Bar)</span>
                  <span className="text-[10px] text-[#006561] font-medium bg-[#006561]/10 px-2 py-0.5 rounded-full">
                    Protein
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products?search=g%E1%BA%A1o+l%E1%BB%A9t"
                  className="hover:text-[#006561] hover:underline transition-colors flex items-center justify-between"
                >
                  <span>Bún mì gạo lứt</span>
                  <span className="text-[10px] text-[#7B9461] font-medium bg-[#7B9461]/10 px-2 py-0.5 rounded-full">
                    Eat clean
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ Trợ Khách Hàng */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#006561]">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6B6661]">
              <li>
                <Link to="/about" className="hover:text-[#006561] transition-colors">
                  Chính sách đổi trả &amp; hoàn tiền
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#006561] transition-colors">
                  Chính sách giao hàng hỏa tốc 2H
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#006561] transition-colors">
                  Hướng dẫn mua hàng &amp; thanh toán
                </Link>
              </li>
              <li>
                <Link
                  to="/tracking"
                  className="text-[#006561] font-semibold hover:underline flex items-center gap-1.5"
                >
                  <span>Tra cứu tiến độ đơn hàng</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/bmi-tdee" className="hover:text-[#006561] transition-colors">
                  Công cụ tính Calo &amp; BMI tự động
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Chứng Nhận & Kết Nối */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#006561]">
              Chứng Nhận &amp; Kết Nối
            </h4>

            {/* Badges */}
            <div className="flex flex-col gap-2.5">
              {/* Bộ Công Thương Badge */}
              <div className="flex items-center gap-2.5 bg-white border border-[#E5E2DF] p-2 rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#B23A2A]/10 text-[#B23A2A] flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#2A2725] uppercase tracking-tight">
                    Đã thông báo
                  </div>
                  <div className="text-[10px] text-[#6B6661]">Bộ Công Thương (online.gov.vn)</div>
                </div>
              </div>

              {/* DMCA & ISO Standards */}
              <div className="flex items-center gap-2.5 bg-white border border-[#E5E2DF] p-2 rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#006561]/10 text-[#006561] flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#2A2725]">DMCA Protected</div>
                  <div className="text-[10px] text-[#6B6661]">ISO 22000 • HACCP Codex</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-[#9A938C] block mb-2">
                THEO DÕI HEBEKERY
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook HeBekery"
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:bg-[#006561] hover:text-white hover:border-[#006561] transition-all text-xs font-bold"
                >
                  f
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram HeBekery"
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:bg-[#006561] hover:text-white hover:border-[#006561] transition-all text-xs font-bold"
                >
                  ig
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok HeBekery"
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E2DF] flex items-center justify-center text-[#2A2725] hover:bg-[#006561] hover:text-white hover:border-[#006561] transition-all text-xs font-bold"
                >
                  tt
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="border-t border-[#E5E2DF] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9A938C] gap-3">
          <div>© 2026 HeBekery. All rights reserved.</div>
          <div className="flex items-center gap-3 text-xs text-[#6B6661]">
            <span>100% Không Đường Tinh Luyện</span>
            <span>•</span>
            <span>Bột Nguyên Cám Chuẩn Eat Clean</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
