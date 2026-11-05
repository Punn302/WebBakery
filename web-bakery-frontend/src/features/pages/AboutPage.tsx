import React from 'react'
import { Sparkles, Heart, ShieldCheck, Award } from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Câu Chuyện Hebekery
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Hành trình mang đến những mẻ bánh nướng thủ công nguyên cám tốt cho sức khỏe
        </p>
      </div>

      <div className="prose text-xs text-[#57534e] space-y-4 leading-relaxed">
        <p className="text-sm font-medium text-[#1c1917]">
          Hebekery được sinh ra từ niềm đam mê làm bánh và mong muốn thay đổi thói quen ăn uống lành mạnh hơn cho mọi gia đình Việt.
        </p>
        <p>
          Chúng tôi tin rằng bánh ngọt không nhất thiết phải chứa đầy đường tinh luyện hay chất béo chuyển hóa có hại. Tại Hebekery, từng chiếc bánh Biscotti, từng mẻ ngũ cốc Granola sấy giòn hay bánh mì đen nguyên cám đều được chăm chút kỹ lưỡng từ nguồn nguyên liệu bột mì nguyên cám hữu cơ, các loại hạt hạnh nhân, óc chó, hạt bí chuẩn VietGAP và vị ngọt tự nhiên từ mật ong hoa rừng.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#e7e5e4]">
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <Heart className="w-5 h-5 text-[#47654c]" />
          <h3 className="font-bold text-sm text-[#1c1917]">Tâm Huyết & Thủ Công</h3>
          <p className="text-xs text-[#78716c]">Nướng mới mỗi mẻ bánh mỗi sáng sớm, giữ trọn độ thơm bùi tươi ngon nhất.</p>
        </div>
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <ShieldCheck className="w-5 h-5 text-[#47654c]" />
          <h3 className="font-bold text-sm text-[#1c1917]">Minh Bạch Dinh Dưỡng</h3>
          <p className="text-xs text-[#78716c]">Công khai rõ ràng lượng Calo, Đạm, Béo trên từng bao bì sản phẩm.</p>
        </div>
        <div className="border border-[#e7e5e4] bg-white p-5 space-y-2">
          <Award className="w-5 h-5 text-[#47654c]" />
          <h3 className="font-bold text-sm text-[#1c1917]">Không Chất Bảo Quản</h3>
          <p className="text-xs text-[#78716c]">Cam kết 100% không phụ gia, an toàn tuyệt đối cho mẹ bầu và trẻ nhỏ.</p>
        </div>
      </div>
    </div>
  )
}
