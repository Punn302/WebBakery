import React from 'react'
import { Heart, ShieldCheck, Award, Sparkles, Wheat, Flame } from 'lucide-react'
import heroStitch from '@/assets/hero_stitch.jpg'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Header Banner */}
      <div className="border-b border-[#eadbce] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Triết lý làm bánh thủ công</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#2e1e12] tracking-tight">
          Câu Chuyện Hebekery
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6856] mt-1.5">
          Hành trình mang đến những mẻ bánh nướng thủ công nguyên cám tốt cho vóc dáng & sức khỏe
        </p>
      </div>

      {/* Hero Visual Story */}
      <div className="relative rounded-3xl overflow-hidden border border-[#eadbce] shadow-xs">
        <img
          src={heroStitch}
          alt="Hebekery Kitchen"
          className="w-full h-72 sm:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2e1e12]/80 via-[#2e1e12]/30 to-transparent flex items-end p-6 sm:p-8">
          <p className="font-headline text-xl sm:text-2xl font-bold text-white max-w-xl leading-snug">
            “Chúng tôi nướng bánh không chỉ để thưởng thức, mà là để nuôi dưỡng cơ thể bằng sự chân thật.”
          </p>
        </div>
      </div>

      {/* Main Story Narrative */}
      <div className="space-y-4 text-xs sm:text-sm text-[#5c4a3a] leading-relaxed">
        <p className="text-base font-semibold text-[#2e1e12]">
          Hebekery được sinh ra từ niềm say mê làm bánh và mong muốn thay đổi thói quen dinh dưỡng lành mạnh hơn cho mọi gia đình Việt.
        </p>
        <p>
          Chúng tôi tin rằng bánh ngọt không nhất thiết phải chứa đầy đường tinh luyện hay chất béo chuyển hóa có hại. Tại Hebekery, từng chiếc bánh Biscotti, từng mẻ ngũ cốc Granola sấy giòn hay bánh mì đen nguyên cám đều được chăm chút kỹ lưỡng từ nguồn nguyên liệu bột mì nguyên cám hữu cơ, các loại hạt hạnh nhân, óc chó, hạt bí chuẩn VietGAP và vị ngọt tự nhiên từ mật ong hoa rừng.
        </p>
        <p>
          Mỗi ổ bánh khi ra lò đều được tính toán và công khai minh bạch bảng phân tích dinh dưỡng Calo & Macro, giúp những ai đang theo đuổi lối sống Eat Clean, giảm cân, tiểu đường hay tập luyện thể thao đều có thể an tâm thưởng thức mỗi ngày.
        </p>
      </div>

      {/* 3 Pillars of Quality */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#eadbce]">
        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#47654c]/10 text-[#47654c] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-base font-bold text-[#2e1e12]">Tâm Huyết & Thủ Công</h3>
          <p className="text-xs text-[#7c6856] leading-relaxed">
            Nướng mới mỗi mẻ bánh mỗi sáng sớm bằng men tự nhiên, giữ trọn độ thơm bùi giòn rụm tươi ngon nhất.
          </p>
        </div>

        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#d97724]/10 text-[#d97724] flex items-center justify-center">
            <Wheat className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-base font-bold text-[#2e1e12]">Minh Bạch Dinh Dưỡng</h3>
          <p className="text-xs text-[#7c6856] leading-relaxed">
            Công khai rõ ràng lượng Calo, Đạm, Béo trên từng bao bì sản phẩm để bạn kiểm soát khẩu phần dễ dàng.
          </p>
        </div>

        <div className="tactile-card rounded-2xl border border-[#eadbce] bg-white p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#4a3728]/10 text-[#4a3728] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-base font-bold text-[#2e1e12]">Không Chất Bảo Quản</h3>
          <p className="text-xs text-[#7c6856] leading-relaxed">
            Cam kết 100% không phụ gia tạo màu, không đường hóa học, an toàn tuyệt đối cho mẹ bầu và trẻ nhỏ.
          </p>
        </div>
      </div>
    </div>
  )
}
