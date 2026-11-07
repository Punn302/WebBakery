import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Award,
  Wheat,
  Clock,
  CheckCircle2,
  PackageCheck,
  Flame,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react'
import heroStitch from '@/assets/hero_stitch.jpg'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 py-2 pb-16">
      {/* ================= 1. Editorial Header Banner ================= */}
      <div className="space-y-4 border-b border-[#E5E2DF] pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#c8983d]" />
          <span>HeBekery Health &amp; Beauty Foods • Artisan Bakery</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-black text-[#2A2725] tracking-tight uppercase">
          Ăn Ngon - Sống Khỏe - Tươi Trẻ
        </h1>

        <blockquote className="font-serif italic text-xl sm:text-2xl text-[#91350a] max-w-3xl leading-relaxed">
          “Chọn nguyên liệu kỹ, làm chỉn chu — HeBekery đồng hành cùng lối sống lành mạnh của bạn.”
        </blockquote>
      </div>

      {/* ================= 2. Editorial Hero Visual Cover ================= */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E5E2DF] shadow-sm bg-white">
        <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative">
          <img
            src={heroStitch}
            alt="Xưởng bánh thủ công HeBekery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A2725]/85 via-[#2A2725]/30 to-transparent flex items-end p-6 sm:p-10">
            <div className="max-w-2xl space-y-2 text-white">
              <span className="px-3 py-1 rounded-full bg-[#006561] text-[11px] font-semibold tracking-wider uppercase inline-block">
                Bếp Nướng Mẻ Nhỏ Tươi Mới
              </span>
              <p className="font-display text-xl sm:text-2xl font-bold leading-snug">
                Nướng mới mỗi sớm mai từ ngũ cốc hạt nguyên bản, giữ trọn độ thơm giòn và giá trị dinh dưỡng thuần khiết.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. Four Core Metric Badges ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E2DF] shadow-xs text-center space-y-1">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#006561] block">
            0g
          </span>
          <span className="font-display text-xs sm:text-sm font-bold text-[#2A2725] block">
            Đường Tinh Luyện
          </span>
          <span className="text-[11px] text-[#6B6661] block">
            Vị ngọt từ mật ong hoa nhãn &amp; quả mọng
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E2DF] shadow-xs text-center space-y-1">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#7B9461] block">
            100%
          </span>
          <span className="font-display text-xs sm:text-sm font-bold text-[#2A2725] block">
            Bột Nguyên Cám
          </span>
          <span className="text-[11px] text-[#6B6661] block">
            Giữ trọn phôi mầm &amp; chất xơ hòa tan
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E2DF] shadow-xs text-center space-y-1">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#91350a] block">
            15.000+
          </span>
          <span className="font-display text-xs sm:text-sm font-bold text-[#2A2725] block">
            Khách Hàng Sống Lành
          </span>
          <span className="text-[11px] text-[#6B6661] block">
            Đồng hành tại 63 tỉnh thành toàn quốc
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E2DF] shadow-xs text-center space-y-1">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#c8983d] block">
            4.9 ★
          </span>
          <span className="font-display text-xs sm:text-sm font-bold text-[#2A2725] block">
            Đánh Giá Yêu Thích
          </span>
          <span className="text-[11px] text-[#6B6661] block">
            Dựa trên 8.500+ phản hồi chân thực
          </span>
        </div>
      </div>

      {/* ================= 4. Triết lý 3 KHÔNG (The 3-NOs Philosophy) ================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E2DF] pb-4">
          <div>
            <span className="text-xs font-bold text-[#006561] uppercase tracking-widest block">
              Triết Lý Làm Bánh Bất Biến
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A2725] mt-1">
              Cam Kết “3 KHÔNG” Tại HeBekery
            </h2>
          </div>
          <span className="text-xs text-[#6B6661] font-mono">
            #EatClean #LowCarb #HealthyLifestyle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Không 1 */}
          <div className="bg-white rounded-3xl border border-[#E5E2DF] p-7 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#006561] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[#006561]/10 text-[#006561] flex items-center justify-center font-mono font-bold text-base">
                  01
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFE6DC] text-[#B23A2A]">
                  Ngọt Thanh Tự Nhiên
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#2A2725]">
                0g Đường Cát Tinh Luyện
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6661] leading-relaxed">
                Thay thế 100% bằng mật ong hoa nhãn chín tự nhiên và vị ngọt thanh nhẹ từ quả mọng sấy lạnh. Không gây tăng vọt chỉ số đường huyết hay tích mỡ thừa.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E2DF] flex items-center gap-2 text-xs text-[#006561] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B9461]" />
              <span>Thân thiện với người ăn kiêng &amp; tiểu đường</span>
            </div>
          </div>

          {/* Không 2 */}
          <div className="bg-white rounded-3xl border border-[#E5E2DF] p-7 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#006561] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[#7B9461]/10 text-[#7B9461] flex items-center justify-center font-mono font-bold text-base">
                  02
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#7B9461]/15 text-[#7B9461]">
                  An Toàn Tuyệt Đối
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#2A2725]">
                100% Không Chất Bảo Quản
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6661] leading-relaxed">
                Tuyệt đối nói không với phụ gia công nghiệp, chất làm giòn xốp nhân tạo hay hương liệu hóa học. Bánh được giữ giòn bằng công nghệ nướng sấy tách ẩm kép.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E2DF] flex items-center gap-2 text-xs text-[#006561] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B9461]" />
              <span>Nướng mới liên tục trong tuần</span>
            </div>
          </div>

          {/* Không 3 */}
          <div className="bg-white rounded-3xl border border-[#E5E2DF] p-7 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#006561] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[#91350a]/10 text-[#91350a] flex items-center justify-center font-mono font-bold text-base">
                  03
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F4EFE6] text-[#91350a]">
                  Giàu Chất Xơ Beta-Glucan
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#2A2725]">
                100% Bột Nguyên Cám Nhập Khẩu
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6661] leading-relaxed">
                Sử dụng bột lúa mạch đen và lúa mì nguyên cám cao cấp nhập khẩu trực tiếp. Giữ nguyên lớp cám và phôi mầm giàu Vitamin nhóm B giúp no lâu suốt 5-6 tiếng.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E2DF] flex items-center gap-2 text-xs text-[#006561] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7B9461]" />
              <span>Hỗ trợ tiêu hóa &amp; kiểm soát cơn thèm ăn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 5. 4 Trụ Cột Chất Lượng & Chứng Nhận ================= */}
      <div className="bg-[#F8F6F5] rounded-3xl border border-[#E5E2DF] p-7 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#006561] uppercase tracking-widest">
            Tiêu Chuẩn Sản Xuất
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A2725]">
            4 Trụ Cột Chất Lượng HeBekery
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6661]">
            Đảm bảo an toàn vệ sinh thực phẩm tối đa từ khâu tuyển chọn hạt đến từng mẻ bánh trao tận tay.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#006561]/10 text-[#006561] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-display text-sm font-bold text-[#2A2725]">
              ISO 22000:2018
            </h4>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Hệ thống quản lý an toàn thực phẩm chuẩn quốc tế được kiểm nghiệm độc lập.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#7B9461]/10 text-[#7B9461] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-display text-sm font-bold text-[#2A2725]">
              HACCP Codex
            </h4>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Quy trình phân tích &amp; kiểm soát điểm tới hạn nghiêm ngặt ở từng công đoạn nhào bột.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#91350a]/10 text-[#91350a] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-display text-sm font-bold text-[#2A2725]">
              Nướng Mẻ Nhỏ Tươi Mới
            </h4>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Mỗi mẻ bánh được thợ lành nghề canh nhiệt thủ công, xuất lò nóng hổi mỗi sáng.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8983d]/10 text-[#c8983d] flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h4 className="font-display text-sm font-bold text-[#2A2725]">
              Đóng Gói Bảo Quản Tự Nhiên
            </h4>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Hũ pet nắp nhôm kín màng seal tiêu chuẩn, khóa trọn độ giòn thơm mà không dùng chất bảo quản.
            </p>
          </div>
        </div>
      </div>

      {/* ================= 6. Bốn Hương Vị Signature ================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E2DF] pb-4">
          <div>
            <span className="text-xs font-bold text-[#006561] uppercase tracking-widest block">
              Bộ Sưu Tập Hương Vị
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A2725] mt-1">
              4 Hương Vị Signature Độc Quyền
            </h2>
          </div>
          <p className="text-xs text-[#6B6661] font-serif italic max-w-sm">
            “Được phối trộn từ những nguyên liệu mộc tinh túy nhất của đất trời.”
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Vị 1 */}
          <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden group hover:border-[#006561] transition-all">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F8F6F5]">
              <img
                src="/images/dried-fruit.jpg"
                alt="Fruity Grains"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#006561]">
                SIGNATURE 01
              </span>
              <h4 className="font-display text-sm font-bold text-[#2A2725]">
                FRUITY GRAINS
              </h4>
              <p className="text-xs text-[#6B6661]">
                Hạt ngũ cốc nhập khẩu kết hợp quả mọng chua ngọt sấy lạnh.
              </p>
            </div>
          </div>

          {/* Vị 2 */}
          <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden group hover:border-[#006561] transition-all">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F8F6F5]">
              <img
                src="/images/granola-choco.jpg"
                alt="Dark Choco"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#91350a]">
                SIGNATURE 02
              </span>
              <h4 className="font-display text-sm font-bold text-[#2A2725]">
                DARK CHOCO
              </h4>
              <p className="text-xs text-[#6B6661]">
                Cacao nguyên chất không đường từ Bỉ, đậm vị đắng thanh quý phái.
              </p>
            </div>
          </div>

          {/* Vị 3 */}
          <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden group hover:border-[#006561] transition-all">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F8F6F5]">
              <img
                src="/images/matcha-almond.jpg"
                alt="Pure Matcha"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7B9461]">
                SIGNATURE 03
              </span>
              <h4 className="font-display text-sm font-bold text-[#2A2725]">
                PURE MATCHA
              </h4>
              <p className="text-xs text-[#6B6661]">
                Trà xanh Uji Nhật Bản tuyển chọn, thơm thanh khiết và chống oxy hóa.
              </p>
            </div>
          </div>

          {/* Vị 4 */}
          <div className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden group hover:border-[#006561] transition-all">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F8F6F5]">
              <img
                src="/images/almond-cookies.jpg"
                alt="Salty Cheese"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c8983d]">
                SIGNATURE 04
              </span>
              <h4 className="font-display text-sm font-bold text-[#2A2725]">
                SALTY CHEESE
              </h4>
              <p className="text-xs text-[#6B6661]">
                Phô mai cao cấp ít béo, vị mặn nhẹ hài hòa cùng lát hạnh nhân bùi ngậy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 7. CTA Explore Menu ================= */}
      <div className="bg-white rounded-3xl border border-[#E5E2DF] p-8 sm:p-10 text-center space-y-5 shadow-xs">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
          Bắt Đầu Hành Trình Ăn Ngon &amp; Sống Khỏe Cùng HeBekery
        </h3>
        <p className="text-xs sm:text-sm text-[#6B6661] max-w-xl mx-auto font-serif italic">
          “Từng mẻ bánh thơm giòn đã sẵn sàng xuất lò để đồng hành cùng bữa sáng và các bữa phụ dinh dưỡng của bạn.”
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] text-xs sm:text-sm font-semibold shadow-md transition-all uppercase tracking-wider cursor-pointer"
          >
            <span>Khám Phá Thực Đơn Bánh Healthy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
