import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageCircle,
  Sparkles,
  Phone,
  Flame,
  Clock,
  Heart,
  Truck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: 'product' | 'health' | 'order' | 'shipping'
}

const FAQS: FaqItem[] = [
  {
    id: '1',
    category: 'product',
    question: 'Bánh Biscotti Hebekery để được bao lâu? Cách bảo quản tốt nhất?',
    answer:
      'Bánh Biscotti Hebekery được nướng 2 lần theo công thức Ý truyền thống, hoàn toàn không sử dụng chất bảo quản. Hạn sử dụng tốt nhất là 3 tháng kể từ ngày nướng. Để giữ bánh giòn tan, bạn nên đậy kín nắp sau khi ăn, bảo quản nơi thoáng mát hoặc trong ngăn mát tủ lạnh.',
  },
  {
    id: '2',
    category: 'product',
    question: 'Bánh có sử dụng đường tinh luyện hay bột mì trắng không?',
    answer:
      'Hoàn toàn KHÔNG. Hebekery sử dụng 100% bột mì nguyên cám hữu cơ (Whole Wheat Flour) giữ trọn cám hạt và mầm dinh dưỡng, kết hợp đường ăn kiêng cỏ ngọt tự nhiên / Isomalt hoặc mật ong hoa nhãn nguyên chất.',
  },
  {
    id: '3',
    category: 'health',
    question: 'Người bị tiểu đường hoặc phụ nữ mang thai có dùng bánh được không?',
    answer:
      'Bánh Hebekery rất phù hợp cho người bị tiểu đường, tiền tiểu đường và mẹ bầu cần kiểm soát đường huyết (tiểu đường thai kỳ). Chỉ số đường huyết (GI) của bánh rất thấp nhờ tỷ lệ hạt dinh dưỡng (hạnh nhân, hạt điều, hạt bí) lên đến 70%.',
  },
  {
    id: '4',
    category: 'health',
    question: 'Mỗi khẩu phần bánh Biscotti / Granola nạp bao nhiêu Calo?',
    answer:
      'Trung bình mỗi khẩu phần tiêu chuẩn (khoảng 3-4 lát Biscotti ~ 35g-40g) chỉ cung cấp khoảng 110 - 130 kcal, nhưng mang lại 6g protein và 4g chất xơ dồi dào, giúp bạn no lâu suốt 3-4 giờ mà không bị thèm đồ ngọt.',
  },
  {
    id: '5',
    category: 'order',
    question: 'Làm thế nào để được miễn phí vận chuyển (Freeship)?',
    answer:
      'Mọi đơn hàng từ 299.000đ trở lên đều được Hebekery MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC. Ngoài ra, bạn có thể áp dụng thêm mã voucher FREESHIP (nếu có) tại trang thanh toán cho đơn từ 200k.',
  },
  {
    id: '6',
    category: 'order',
    question: 'Thanh toán chuyển khoản VietQR hoạt động ra sao?',
    answer:
      'Khi chọn hình thức Chuyển khoản VietQR, hệ thống sẽ hiển thị mã QR có sẵn số tiền và nội dung chuyển khoản tự động. Ngay khi bạn quét mã trên ứng dụng ngân hàng, hệ thống đối soát tự động của Hebekery sẽ xác nhận đơn hàng thành công trong 3 - 5 giây mà không cần chụp biên lai.',
  },
  {
    id: '7',
    category: 'shipping',
    question: 'Tôi ở TP.HCM thì bao lâu nhận được bánh?',
    answer:
      'Tại nội thành TP.HCM, Hebekery hỗ trợ giao hỏa tốc 2 giờ hoặc trong ngày theo khung giờ bạn chọn. Đơn hàng các tỉnh khác sẽ được chuyển phát nhanh bọc chống sốc 3 lớp, nhận bánh sau 1 - 2 ngày làm việc.',
  },
  {
    id: '8',
    category: 'shipping',
    question: 'Nếu bánh bị vỡ vụn hoặc ẩm mốc khi nhận hàng thì xử lý như thế nào?',
    answer:
      'Hebekery cam kết chính sách ĐỔI TRẢ 1-1 MIỄN PHÍ TRONG 7 NGÀY. Bạn chỉ cần chụp ảnh tình trạng hũ bánh gửi qua Hotline 097 97 64 185, bếp bánh sẽ gửi hũ mới hỏa tốc tận nhà mà không thu thêm bất kỳ chi phí nào.',
  },
]

export const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openIds, setOpenIds] = useState<string[]>(['1', '5'])

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const filteredFaqs = FAQS.filter((faq) => {
    const matchCat = activeCategory === 'all' || faq.category === activeCategory
    const matchSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="bg-[#FAF7F2] min-h-[calc(100vh-80px)] py-10 sm:py-14 font-text">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trung Tâm Trợ Giúp Hebekery</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2A2725]">
            Câu Hỏi Thường Gặp (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] max-w-lg mx-auto">
            Giải đáp mọi băn khoăn về bánh ăn kiêng dinh dưỡng, phương pháp bảo quản và chính sách giao nhận.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-2 relative">
            <Search className="w-4 h-4 text-[#6B6661] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm: calo, hạn sử dụng, freeship, tiểu đường..."
              className="pl-10 text-xs rounded-2xl bg-white border-[#E5E2DF] h-11 focus:border-[#006561]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'Tất cả câu hỏi' },
            { id: 'product', label: 'Bánh & Hạn dùng' },
            { id: 'health', label: 'Ăn kiêng & Sức khỏe' },
            { id: 'order', label: 'Đặt hàng & Voucher' },
            { id: 'shipping', label: 'Vận chuyển & Đổi trả' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-[#006561] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E2DF] text-[#6B6661] hover:border-[#006561]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#E5E2DF] p-6 space-y-3">
              <HelpCircle className="w-8 h-8 text-[#6B6661] mx-auto" />
              <p className="text-xs font-semibold text-[#2A2725]">
                Không tìm thấy câu hỏi phù hợp với từ khóa "{searchQuery}"
              </p>
              <p className="text-[11px] text-[#6B6661]">
                Bạn có thể gửi câu hỏi trực tiếp để được đội ngũ dinh dưỡng Hebekery tư vấn.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id)
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FAF7F2]/50 transition-colors"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-[#2A2725]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[#6B6661] shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180 text-[#006561]'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-[#6B6661] border-t border-[#E5E2DF]/40 leading-relaxed bg-[#FAF7F2]/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Support Help Banner */}
        <div className="bg-white border border-[#E5E2DF] rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#006561]/10 text-[#006561] flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-display text-base font-bold text-[#2A2725]">
            Chưa tìm thấy câu trả lời bạn cần?
          </h3>
          <p className="text-xs text-[#6B6661] max-w-md mx-auto">
            Đừng ngần ngại liên hệ trực tiếp với chúng tôi để được tư vấn thực đơn Eat Clean hoặc hỗ trợ đơn hàng.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006561] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#004e4a] transition-all cursor-pointer"
            >
              <span>Gửi Tin Nhắn Tư Vấn</span>
            </Link>
            <a
              href="tel:0979764185"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E5E2DF] hover:border-[#006561] text-[#2A2725] text-xs font-bold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#006561]" />
              <span>Hotline 097 97 64 185</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
