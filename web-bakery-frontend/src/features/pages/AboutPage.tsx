import React from 'react'
import { Heart, ShieldCheck, Award, Sparkles, Wheat } from 'lucide-react'
import heroStitch from '@/assets/hero_stitch.jpg'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header Banner */}
      <div className="border-b border-[#eadbce] pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
          <span>Về chúng tôi</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#2e1e12] tracking-tight">
          Câu Chuyện Hebekery
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6856] mt-1">
          Hành trình mang đến mẻ bánh nướng thủ công nguyên cám tốt cho vóc dáng &amp; sức khỏe
        </p>
      </div>

      {/* Hero Visual Story */}
      <div className="relative rounded-3xl overflow-hidden border border-[#eadbce] shadow-xs">
        <img
          src={heroStitch}
          alt="Hebekery Artisan Bakery"
          className="w-full h-64 sm:h-80 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2e1e12]/85 via-[#2e1e12]/30 to-transparent flex items-end p-6 sm:p-8">
          <p className="font-headline text-lg sm:text-2xl font-bold text-white max-w-lg leading-snug">
            “Bánh nướng thủ công bằng sự tử tế và nguyên liệu thuần khiết nhất.”
          </p>
        </div>
      </div>

      {/* 3 Core Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-4 rounded-2xl bg-white border border-[#eadbce] tactile-card">
          <span className="font-headline text-2xl sm:text-3xl font-bold text-[#4a3728] block">100%</span>
          <span className="text-[11px] text-[#78716c] font-medium">Nguyên liệu tự nhiên</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#eadbce] tactile-card">
          <span className="font-headline text-2xl sm:text-3xl font-bold text-[#d97724] block">0g</span>
          <span className="text-[11px] text-[#78716c] font-medium">Đường tinh luyện</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#eadbce] tactile-card">
          <span className="font-headline text-2xl sm:text-3xl font-bold text-[#47654c] block">&gt;15K</span>
          <span className="text-[11px] text-[#78716c] font-medium">Khách hàng tin chọn</span>
        </div>
      </div>

      {/* 3 Pillars of Quality - Short & Crisp */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-[#47654c]/10 text-[#47654c] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-sm font-bold text-[#2e1e12]">Tâm Huyết Thủ Công</h3>
          <p className="text-xs text-[#78716c] leading-relaxed">
            Nướng mới mỗi sớm mai bằng men tự nhiên, giữ trọn độ thơm giòn tươi mới.
          </p>
        </div>

        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-[#d97724]/10 text-[#d97724] flex items-center justify-center">
            <Wheat className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-sm font-bold text-[#2e1e12]">Minh Bạch Calo</h3>
          <p className="text-xs text-[#78716c] leading-relaxed">
            Công khai rõ ràng lượng Calo, Đạm, Béo trên từng bao bì sản phẩm.
          </p>
        </div>

        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-[#4a3728]/10 text-[#4a3728] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-sm font-bold text-[#2e1e12]">An Toàn Sức Khỏe</h3>
          <p className="text-xs text-[#78716c] leading-relaxed">
            Cam kết 100% không phụ gia, không chất bảo quản công nghiệp.
          </p>
        </div>
      </div>
    </div>
  )
}
