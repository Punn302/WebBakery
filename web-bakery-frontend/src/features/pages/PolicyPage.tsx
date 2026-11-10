import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  RotateCcw,
  Truck,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export const PolicyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'return'
  const [activeTab, setActiveTab] = useState<string>(initialTab)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['return', 'shipping', 'privacy', 'terms'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const tabs = [
    { id: 'return', label: 'Chính sách Đổi trả 1-1', icon: RotateCcw },
    { id: 'shipping', label: 'Vận chuyển & Freeship', icon: Truck },
    { id: 'privacy', label: 'Bảo mật Thông tin', icon: ShieldCheck },
    { id: 'terms', label: 'Điều khoản Dịch vụ', icon: FileText },
  ]

  return (
    <div className="bg-[#FAF7F2] min-h-[calc(100vh-80px)] py-10 sm:py-14 font-text">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cam Kết Đồng Hành Cùng Bạn</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2A2725]">
            Chính Sách &amp; Quyền Lợi Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] max-w-xl mx-auto">
            Tại Hebekery, chúng tôi luôn đặt trải nghiệm ẩm thực lành mạnh và sự an tâm của bạn lên hàng đầu.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none',
                  isActive
                    ? 'bg-[#006561] text-white shadow-xs'
                    : 'bg-white border border-[#E5E2DF] text-[#6B6661] hover:border-[#006561] hover:text-[#006561]'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#006561]')} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-10 shadow-xs">
          {/* TAB 1: RETURN POLICY */}
          {activeTab === 'return' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-[#E5E2DF] pb-5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
                  Chính Sách Đổi Trả 1-1 Trong Vòng 7 Ngày
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6661] mt-1.5 leading-relaxed">
                  Bánh Hebekery được nướng mộc tự nhiên không chất bảo quản. Nếu bạn không hài lòng về bất kỳ lý do gì, chúng tôi sẵn sàng đổi mới 1-1 hoặc hoàn tiền 100%.
                </p>
              </div>

              {/* Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#006561]">
                    <CheckCircle2 className="w-4 h-4 text-[#006561]" />
                    <span>Trường Hợp Được Đổi Trả Miễn Phí</span>
                  </div>
                  <ul className="text-xs text-[#6B6661] space-y-2 list-disc pl-5 leading-relaxed">
                    <li>Bánh bị ẩm, mất độ giòn, hoặc có dấu hiệu ẩm mốc do vận chuyển.</li>
                    <li>Bao bì hũ bị móp méo, nứt vỡ hoặc rách tem niêm phong.</li>
                    <li>Giao sai hương vị (ví dụ đặt Matcha nhưng nhận Choco) hoặc thiếu số lượng.</li>
                    <li>Bánh bị vỡ vụn quá 30% thể tích hộp khi nhận hàng.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C9785C]">
                    <Clock className="w-4 h-4 text-[#C9785C]" />
                    <span>Thời Gian &amp; Quy Cách Xử Lý</span>
                  </div>
                  <ul className="text-xs text-[#6B6661] space-y-2 list-disc pl-5 leading-relaxed">
                    <li>Thời hạn tiếp nhận khiếu nại: Trong vòng <strong>7 ngày</strong> kể từ khi shipper giao bánh thành công.</li>
                    <li>Nội thành TP.HCM &amp; Hà Nội: Đổi hũ mới hỏa tốc trong <strong>2 giờ</strong>.</li>
                    <li>Các tỉnh thành khác: Gửi mẻ bánh nướng mới trong 24h - 48h làm việc.</li>
                    <li>Khách hàng không mất bất kỳ chi phí vận chuyển phát sinh nào.</li>
                  </ul>
                </div>
              </div>

              {/* 3 Step Process */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-[#2A2725] uppercase tracking-wider">
                  Quy Trình Đổi Trả 3 Bước Cực Kỳ Đơn Giản:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-[#E5E2DF] text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[#006561] text-white font-bold text-xs flex items-center justify-center mx-auto">
                      1
                    </div>
                    <h4 className="font-semibold text-xs text-[#2A2725]">Chụp ảnh hoặc quay video</h4>
                    <p className="text-[11px] text-[#6B6661]">
                      Gửi ảnh chụp tình trạng bánh qua Zalo hoặc Hotline 097 97 64 185.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[#E5E2DF] text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[#006561] text-white font-bold text-xs flex items-center justify-center mx-auto">
                      2
                    </div>
                    <h4 className="font-semibold text-xs text-[#2A2725]">Xác nhận tức thì</h4>
                    <p className="text-[11px] text-[#6B6661]">
                      Nhân viên CSKH kiểm tra và xác nhận đổi mới hoặc hoàn tiền ngay trong 15 phút.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[#E5E2DF] text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[#006561] text-white font-bold text-xs flex items-center justify-center mx-auto">
                      3
                    </div>
                    <h4 className="font-semibold text-xs text-[#2A2725]">Giao mẻ bánh mới</h4>
                    <p className="text-[11px] text-[#6B6661]">
                      Shipper mang hũ bánh mới đến tận tay và nhận lại hũ cũ mà bạn không cần thanh toán thêm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING POLICY */}
          {activeTab === 'shipping' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-[#E5E2DF] pb-5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
                  Chính Sách Vận Chuyển &amp; Giao Hàng Toàn Quốc
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6661] mt-1.5 leading-relaxed">
                  Hebekery đóng gói chống sốc 3 lớp chuyên dụng cho bánh nướng giòn tan, đảm bảo nguyên vẹn hương vị mộc đến tận tay bạn.
                </p>
              </div>

              {/* Freeship Rule highlight banner */}
              <div className="p-6 rounded-2xl bg-[#006561]/8 border border-[#006561]/25 flex items-start gap-4">
                <Truck className="w-8 h-8 text-[#006561] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-[#006561]">
                    Miễn Phí Vận Chuyển Toàn Quốc Cho Đơn Hàng Từ 299.000đ
                  </h3>
                  <p className="text-xs text-[#2A2725] leading-relaxed">
                    Hệ thống sẽ tự động trừ phí ship về 0đ ngay tại bước thanh toán khi giỏ hàng của bạn đạt từ 299k, áp dụng cho mọi tỉnh thành từ Bắc vào Nam.
                  </p>
                </div>
              </div>

              {/* Shipping Rates Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#2A2725] uppercase tracking-wider">
                  Bảng Biểu Phí &amp; Thời Gian Giao Bánh:
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-[#E5E2DF] rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E5E2DF] text-[#2A2725] font-bold">
                        <th className="p-3">Khu vực</th>
                        <th className="p-3">Thời gian nhận bánh</th>
                        <th className="p-3">Đơn &lt; 299.000đ</th>
                        <th className="p-3">Đơn &ge; 299.000đ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2DF] text-[#6B6661]">
                      <tr>
                        <td className="p-3 font-semibold text-[#2A2725]">Nội thành TP. Hồ Chí Minh</td>
                        <td className="p-3">Giao hỏa tốc 2 giờ hoặc trong ngày</td>
                        <td className="p-3">30.000đ</td>
                        <td className="p-3 font-bold text-[#16a34a]">MIỄN PHÍ</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#2A2725]">Nội thành TP. Hà Nội</td>
                        <td className="p-3">1 - 2 ngày làm việc</td>
                        <td className="p-3">30.000đ</td>
                        <td className="p-3 font-bold text-[#16a34a]">MIỄN PHÍ</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-[#2A2725]">Các tỉnh thành khác</td>
                        <td className="p-3">2 - 3 ngày làm việc</td>
                        <td className="p-3">30.000đ</td>
                        <td className="p-3 font-bold text-[#16a34a]">MIỄN PHÍ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn text-xs sm:text-sm text-[#6B6661] leading-relaxed">
              <div className="border-b border-[#E5E2DF] pb-5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
                  Chính Sách Bảo Mật Thông Tin Khách Hàng
                </h2>
                <p className="text-xs text-[#6B6661] mt-1.5">
                  Cập nhật lần cuối: Tháng 11/2026 • Tuân thủ quy định pháp luật thương mại điện tử Việt Nam.
                </p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <h3 className="font-bold text-[#2A2725] text-sm">1. Mục đích thu thập thông tin</h3>
                <p>
                  Chúng tôi thu thập thông tin cá nhân (họ tên, số điện thoại, địa chỉ nhận hàng, email) chỉ nhằm mục đích xử lý đơn hàng, điều phối giao bánh, và gửi thông báo khuyến mãi khi có sự đồng ý của bạn.
                </p>

                <h3 className="font-bold text-[#2A2725] text-sm">2. Bảo mật thanh toán</h3>
                <p>
                  Các giao dịch chuyển khoản VietQR được đối soát hoàn toàn tự động qua hạ tầng ngân hàng bảo mật, chúng tôi không lưu trữ thông tin thẻ ngân hàng hoặc mật khẩu tài khoản của bạn.
                </p>

                <h3 className="font-bold text-[#2A2725] text-sm">3. Cam kết không chia sẻ</h3>
                <p>
                  Hebekery cam kết tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin khách hàng cho bên thứ ba vì bất kỳ mục đích thương mại nào.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn text-xs sm:text-sm text-[#6B6661] leading-relaxed">
              <div className="border-b border-[#E5E2DF] pb-5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
                  Điều Khoản Dịch Vụ &amp; Sử Dụng Website
                </h2>
                <p className="text-xs text-[#6B6661] mt-1.5">
                  Áp dụng cho mọi khách hàng truy cập và đặt bánh trên nền tảng HeBekery.
                </p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <h3 className="font-bold text-[#2A2725] text-sm">1. Quy định đặt hàng và hủy đơn</h3>
                <p>
                  Khách hàng có thể tự do hủy đơn hàng khi đơn còn ở trạng thái <code>CHỜ XỬ LÝ (PENDING)</code> ngay trong mục Lịch sử đơn hàng của mình. Khi bếp đã nướng bánh hoặc bàn giao shipper, quý khách vui lòng liên hệ hotline hỗ trợ.
                </p>

                <h3 className="font-bold text-[#2A2725] text-sm">2. Thông tin dinh dưỡng &amp; Khẩu phần</h3>
                <p>
                  Các chỉ số calo, protein, carb và fat được kiểm nghiệm dựa trên công thức nướng mộc tiêu chuẩn. Giá trị thực tế có thể dao động nhẹ trong phạm vi cho phép của thực phẩm hữu cơ tự nhiên.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Contact Help */}
        <div className="text-center p-6 bg-white border border-[#E5E2DF] rounded-2xl space-y-2">
          <p className="text-xs text-[#6B6661]">
            Bạn cần hỗ trợ thêm thông tin hoặc có câu hỏi đặc biệt?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <Link
              to="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006561] hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Xem Câu hỏi thường gặp (FAQ)</span>
            </Link>
            <span className="text-[#E5E2DF]">•</span>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9785C] hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gửi tin nhắn tư vấn</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
