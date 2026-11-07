import React, { useState } from 'react'
import {
  Activity,
  Flame,
  Sparkles,
  ShoppingBag,
  Calendar,
  Percent,
  CheckCircle2,
  Scale,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/format'
import { toast } from 'sonner'
import type { Product } from '@/types'

interface ComboItem {
  product: Product
  quantity: number
  benefit: string
  portionCalo: string
}

export const BmiCalculatorPage: React.FC = () => {
  const { addItem, setIsCartOpen } = useCart()
  const [gender, setGender] = useState<'female' | 'male'>('female')
  const [age, setAge] = useState(25)
  const [height, setHeight] = useState(162)
  const [weight, setWeight] = useState(52)
  const [activity, setActivity] = useState(1.375) // 1.2: Ít vận động, 1.375: Nhẹ, 1.55: Vừa, 1.725: Nặng
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose')
  const [isAddingCombo, setIsAddingCombo] = useState(false)

  // Harris-Benedict Formula for BMR
  const bmr =
    gender === 'male'
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age

  const tdee = Math.round(bmr * activity)

  // Calorie target based on goal
  let targetCalories = tdee
  if (goal === 'lose') targetCalories = Math.round(tdee - 400)
  if (goal === 'gain') targetCalories = Math.round(tdee + 350)

  // BMI (WHO Asia-Pacific Standards)
  const heightInMeters = height / 100
  const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(1)

  // Asian BMI Classifications:
  // < 18.5: Gầy (Blue)
  // 18.5 - 22.9: Cân đối lý tưởng (Sage #7B9461)
  // 23.0 - 24.9: Thừa cân (Mustard #c8983d)
  // >= 25.0: Béo phì (Terracotta #B23A2A)
  let bmiCategory = 'Cân đối lý tưởng'
  let bmiColor = 'text-[#7B9461]'
  let bmiBg = 'bg-[#7B9461]/10 border-[#7B9461]/30 text-[#7B9461]'
  let bmiNote = 'Vóc dáng chuẩn. Tiếp tục duy trì chế độ dinh dưỡng lành mạnh!'

  if (bmi < 18.5) {
    bmiCategory = 'Gầy (Thiếu cân)'
    bmiColor = 'text-blue-600'
    bmiBg = 'bg-blue-50 border-blue-200 text-blue-700'
    bmiNote = 'Cần tăng thêm năng lượng và đạm thực vật từ hạt dinh dưỡng.'
  } else if (bmi >= 23 && bmi < 25) {
    bmiCategory = 'Thừa cân'
    bmiColor = 'text-[#c8983d]'
    bmiBg = 'bg-[#c8983d]/15 border-[#c8983d]/30 text-[#c8983d]'
    bmiNote = 'Nên giảm tinh bột nhanh, ưu tiên bánh nguyên cám giàu xơ.'
  } else if (bmi >= 25) {
    bmiCategory = 'Béo phì'
    bmiColor = 'text-[#B23A2A]'
    bmiBg = 'bg-[#B23A2A]/15 border-[#B23A2A]/30 text-[#B23A2A]'
    bmiNote = 'Áp dụng thâm hụt calo kiểm soát, thay hoàn toàn đường tinh luyện.'
  }

  // Visual Gauge needle position (clamped 15 to 32)
  const gaugePercent = Math.min(Math.max(((bmi - 15) / (32 - 15)) * 100, 2), 98)

  // Macro distribution: 30% Protein, 45% Carb, 25% Fat
  const protein = Math.round((targetCalories * 0.3) / 4)
  const carbs = Math.round((targetCalories * 0.45) / 4)
  const fat = Math.round((targetCalories * 0.25) / 9)

  // Curated Bakery Bundles
  const getWeeklyCombo = (): {
    title: string
    sub: string
    badge: string
    avgCaloriesPerMeal: number
    items: ComboItem[]
  } => {
    switch (goal) {
      case 'lose':
        return {
          title: 'Combo Thon Gọn & Giảm Mỡ Tự Nhiên',
          sub: 'Tinh bột chậm từ lúa mạch đen & yến mạch • No lâu 5-6h • 0g đường cát',
          badge: 'Giảm mỡ khoa học',
          avgCaloriesPerMeal: 165,
          items: [
            {
              product: {
                id: 'P001',
                description: 'Bánh mì đen nguyên cám lúa mạch Đức chuẩn men tự nhiên',
                name: 'Bánh Mì Đen Nguyên Cám HeBekery',
                price: 45000,
                stock: 20,
                imageUrl: '/images/whole-wheat-sourdough.jpg',
                active: true,
                lowStockThreshold: 5,
                calories: 165,
                protein: 7,
                fat: 2,
                carbs: 32,
              },
              quantity: 2,
              benefit: '100% lúa mạch đen Đức, giàu chất xơ beta-glucan',
              portionCalo: '165 kcal / lát dày',
            },
            {
              product: {
                id: 'P002',
                description: 'Biscotti yến mạch cam quế hạnh nhân ngọt thanh mật ong',
                name: 'Biscotti Yến Mạch Hạnh Nhân Cam Quế',
                price: 95000,
                stock: 15,
                imageUrl: '/images/biscotti.jpg',
                active: true,
                lowStockThreshold: 3,
                calories: 112,
                protein: 4,
                fat: 4,
                carbs: 18,
              },
              quantity: 2,
              benefit: 'Nướng 2 lần không dầu mỡ, ăn vặt 0 lo tích mỡ',
              portionCalo: '112 kcal / 2 bánh',
            },
            {
              product: {
                id: 'P003',
                description: 'Granola 85% hạt nhập khẩu nướng mật ong hoa nhãn',
                name: 'Granola Siêu Hạt Ăn Kiêng Không Đường',
                price: 125000,
                stock: 25,
                imageUrl: '/images/granola.jpg',
                active: true,
                lowStockThreshold: 4,
                calories: 210,
                protein: 8,
                fat: 10,
                carbs: 22,
              },
              quantity: 1,
              benefit: 'Hạnh nhân Úc, óc chó, hạt bí xanh giòn rụm',
              portionCalo: '210 kcal / 40g',
            },
          ],
        }

      case 'gain':
        return {
          title: 'Combo Giàu Đạm Xây Dựng Cơ Bắp',
          sub: 'Tăng cường protein thực vật & Omega-3 • Nạp năng lượng tập luyện bền bỉ',
          badge: 'Tăng cơ săn chắc',
          avgCaloriesPerMeal: 260,
          items: [
            {
              product: {
                id: 'P004',
                description: 'Bánh mì đen hạt bí và hướng dương giàu khoáng chất',
                name: 'Bánh Mì Đen Hạt Bí & Hướng Dương',
                price: 55000,
                stock: 18,
                imageUrl: '/images/whole-wheat-sourdough.jpg',
                active: true,
                lowStockThreshold: 3,
                calories: 220,
                protein: 10,
                fat: 5,
                carbs: 34,
              },
              quantity: 2,
              benefit: 'Hạt bí xanh và hướng dương giàu Magie, Kẽm',
              portionCalo: '220 kcal / khẩu phần',
            },
            {
              product: {
                id: 'P005',
                description: 'Granola cacao nguyên chất 85% đậm vị Bỉ',
                name: 'Granola Chocolate Cacao 85% Bỉ',
                price: 145000,
                stock: 20,
                imageUrl: '/images/granola-choco.jpg',
                active: true,
                lowStockThreshold: 4,
                calories: 260,
                protein: 9,
                fat: 12,
                carbs: 28,
              },
              quantity: 2,
              benefit: 'Flavonoid cacao đen thư giãn cơ sau tập luyện',
              portionCalo: '260 kcal / 45g',
            },
            {
              product: {
                id: 'P006',
                description: 'Biscotti đúp hạt hạnh nhân & hạt điều Bình Phước',
                name: 'Biscotti Đúp Đạm Hạnh Nhân & Hạt Điều',
                price: 110000,
                stock: 12,
                imageUrl: '/images/biscotti.jpg',
                active: true,
                lowStockThreshold: 2,
                calories: 145,
                protein: 6,
                fat: 5,
                carbs: 16,
              },
              quantity: 1,
              benefit: '60% hạt dinh dưỡng, bổ sung axit amin thiết yếu',
              portionCalo: '145 kcal / 2 bánh',
            },
          ],
        }

      case 'maintain':
      default:
        return {
          title: 'Combo Cân Bằng Năng Lượng & Giữ Dáng',
          sub: 'Cân bằng vi chất & chất chống oxy hóa tự nhiên • Cơ thể nhẹ nhàng, tươi trẻ',
          badge: 'Giữ dáng thanh nhẹ',
          avgCaloriesPerMeal: 195,
          items: [
            {
              product: {
                id: 'P007',
                description: 'Bánh mì Sourdough lúa mạch lên men tự nhiên 24h',
                name: 'Bánh Mì Sourdough Lên Men Tự Nhiên',
                price: 65000,
                stock: 15,
                imageUrl: '/images/whole-wheat-sourdough.jpg',
                active: true,
                lowStockThreshold: 3,
                calories: 175,
                protein: 6,
                fat: 1,
                carbs: 35,
              },
              quantity: 2,
              benefit: 'Lên men chậm 24h, bảo vệ hệ vi sinh đường ruột',
              portionCalo: '175 kcal / lát',
            },
            {
              product: {
                id: 'P008',
                description: 'Granola siêu hạt nướng mật ong hoa nhãn nguyên chất',
                name: 'Granola Siêu Hạt Mật Ong Hoa Nhãn',
                price: 135000,
                stock: 22,
                imageUrl: '/images/granola.jpg',
                active: true,
                lowStockThreshold: 4,
                calories: 240,
                protein: 9,
                fat: 11,
                carbs: 24,
              },
              quantity: 2,
              benefit: 'Ngọt dịu thanh mát từ mật ong rừng tự nhiên',
              portionCalo: '240 kcal / 45g',
            },
            {
              product: {
                id: 'P009',
                description: 'Bánh ngói hạnh nhân lát mỏng nướng giòn rụm',
                name: 'Bánh Ngói Hạnh Nhân Ít Ngọt Keto',
                price: 110000,
                stock: 14,
                imageUrl: '/images/almond-cookies.jpg',
                active: true,
                lowStockThreshold: 2,
                calories: 135,
                protein: 5,
                fat: 4,
                carbs: 12,
              },
              quantity: 1,
              benefit: '90% hạnh nhân lát mỏng, ít ngọt, giòn tan',
              portionCalo: '135 kcal / 3 bánh',
            },
          ],
        }
    }
  }

  const combo = getWeeklyCombo()

  // Pricing (10% combo discount)
  const originalTotal = combo.items.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0
  )
  const discountTotal = Math.round(originalTotal * 0.9)
  const savedAmount = originalTotal - discountTotal

  // 1-Click Upsell Handler
  const handleAddWeeklyComboToCart = async () => {
    try {
      setIsAddingCombo(true)
      for (const item of combo.items) {
        await addItem(item.product, item.quantity)
      }
      toast.success(
        `Đã thêm gói "${combo.title}" vào giỏ hàng với ưu đãi -10%!`,
        { duration: 3500 }
      )
      setIsCartOpen(true)
    } catch {
      toast.error('Có lỗi khi thêm gói bánh vào giỏ hàng')
    } finally {
      setIsAddingCombo(false)
    }
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6 pb-16">
      {/* ================= Hero Header Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006561]/10 text-[#006561] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#c8983d]" />
            <span>Công Cụ Sức Khỏe HeBekery • Harris-Benedict</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#6B6661]">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#2A2725] font-semibold">
              0g Đường Cát
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#2A2725] font-semibold">
              100% Nguyên Cám
            </span>
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#2A2725] tracking-tight">
          Tính Chỉ Số BMI &amp; Nhu Cầu Năng Lượng TDEE
        </h1>

        <p className="font-serif italic text-sm sm:text-base text-[#6B6661] max-w-3xl leading-relaxed">
          “Hiểu rõ cơ thể để ăn đúng nhu cầu — Tính toán lượng Calo chính xác, cá nhân hóa dinh dưỡng cùng thực đơn bánh nướng mẻ nhỏ mỗi ngày.”
        </p>
      </div>

      {/* ================= 2-Column Calculator & Results Board ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Input Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E5E2DF] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-4">
            <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#006561]" />
              <span>1. Nhập Thông Số Cơ Thể</span>
            </h2>
            <span className="text-xs text-[#9A938C]">Bước 1/2</span>
          </div>

          <div className="space-y-5">
            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-2 uppercase tracking-wide">
                Giới tính sinh học
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-3 px-4 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    gender === 'female'
                      ? 'bg-[#006561] text-[#FEFBF4] border-[#006561] shadow-xs'
                      : 'bg-[#F8F6F5] text-[#6B6661] border-[#E5E2DF] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <span>Nữ giới</span>
                  {gender === 'female' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-3 px-4 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    gender === 'male'
                      ? 'bg-[#006561] text-[#FEFBF4] border-[#006561] shadow-xs'
                      : 'bg-[#F8F6F5] text-[#6B6661] border-[#E5E2DF] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <span>Nam giới</span>
                  {gender === 'male' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Age, Height, Weight Controls */}
            <div className="space-y-4">
              {/* Age */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2A2725] uppercase tracking-wide">
                    Độ tuổi
                  </label>
                  <span className="font-mono text-sm font-bold text-[#006561]">
                    {age} <span className="text-xs text-[#6B6661] font-normal">tuổi</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={12}
                    max={90}
                    value={age}
                    onChange={(e) => setAge(+e.target.value)}
                    className="w-full accent-[#006561] cursor-pointer"
                  />
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(+e.target.value)}
                    min={12}
                    max={90}
                    className="w-20 bg-[#F8F6F5] border-[#E5E2DF] rounded-xl text-center font-mono font-bold text-xs h-9"
                  />
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2A2725] uppercase tracking-wide">
                    Chiều cao
                  </label>
                  <span className="font-mono text-sm font-bold text-[#006561]">
                    {height} <span className="text-xs text-[#6B6661] font-normal">cm</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={120}
                    max={215}
                    value={height}
                    onChange={(e) => setHeight(+e.target.value)}
                    className="w-full accent-[#006561] cursor-pointer"
                  />
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(+e.target.value)}
                    min={120}
                    max={215}
                    className="w-20 bg-[#F8F6F5] border-[#E5E2DF] rounded-xl text-center font-mono font-bold text-xs h-9"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2A2725] uppercase tracking-wide">
                    Cân nặng hiện tại
                  </label>
                  <span className="font-mono text-sm font-bold text-[#006561]">
                    {weight} <span className="text-xs text-[#6B6661] font-normal">kg</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={35}
                    max={160}
                    step={0.5}
                    value={weight}
                    onChange={(e) => setWeight(+e.target.value)}
                    className="w-full accent-[#006561] cursor-pointer"
                  />
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(+e.target.value)}
                    min={35}
                    max={160}
                    step={0.5}
                    className="w-20 bg-[#F8F6F5] border-[#E5E2DF] rounded-xl text-center font-mono font-bold text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Activity Level Cards */}
            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-2 uppercase tracking-wide">
                Mức độ vận động hàng ngày
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    val: 1.2,
                    label: 'Ít vận động',
                    desc: 'Ngồi văn phòng, ít di chuyển',
                  },
                  {
                    val: 1.375,
                    label: 'Vận động nhẹ',
                    desc: 'Tập nhẹ 1 - 3 buổi/tuần, yoga',
                  },
                  {
                    val: 1.55,
                    label: 'Vận động vừa',
                    desc: 'Gym, chạy bộ 3 - 5 buổi/tuần',
                  },
                  {
                    val: 1.725,
                    label: 'Vận động nặng',
                    desc: 'Tập 6 - 7 buổi/tuần, cường độ cao',
                  },
                ].map((act) => (
                  <button
                    key={act.val}
                    type="button"
                    onClick={() => setActivity(act.val)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      activity === act.val
                        ? 'border-[#006561] bg-[#006561]/5 ring-1 ring-[#006561]'
                        : 'border-[#E5E2DF] bg-[#F8F6F5] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2725]">{act.label}</span>
                      {activity === act.val && (
                        <Check className="w-3.5 h-3.5 text-[#006561]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B6661] mt-0.5">{act.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Selector Cards */}
            <div>
              <label className="block text-xs font-semibold text-[#2A2725] mb-2 uppercase tracking-wide">
                Mục tiêu của bạn
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'Giảm mỡ', icon: TrendingDown, note: '-400 kcal' },
                  { id: 'maintain', label: 'Giữ cân', icon: Minus, note: 'Chuẩn TDEE' },
                  { id: 'gain', label: 'Tăng cơ', icon: TrendingUp, note: '+350 kcal' },
                ].map((g) => {
                  const Icon = g.icon
                  const isSelected = goal === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as any)}
                      className={`p-3 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-[#006561] bg-[#006561] text-white shadow-xs'
                          : 'border-[#E5E2DF] bg-[#F8F6F5] text-[#6B6661] hover:bg-[#F4EFE6]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{g.label}</span>
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-[#FEFBF4]/90' : 'text-[#9A938C]'
                        }`}
                      >
                        {g.note}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results & Interactive Gauge Card */}
        <div className="lg:col-span-6 bg-[#F8F6F5] rounded-3xl border border-[#E5E2DF] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-4">
            <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#006561]" />
              <span>2. Kết Quả Đánh Giá Thể Trạng</span>
            </h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${bmiBg}`}>
              {bmiCategory}
            </span>
          </div>

          {/* Interactive BMI Gauge Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E2DF] space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#6B6661] uppercase tracking-wider block">
                  Chỉ số BMI của bạn
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-mono text-4xl font-extrabold text-[#2A2725]">
                    {bmi}
                  </span>
                  <span className={`text-xs font-bold ${bmiColor}`}>
                    ({bmiCategory})
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#6B6661] max-w-[200px] text-right italic font-serif">
                {bmiNote}
              </p>
            </div>

            {/* Visual Colored Scale Gauge */}
            <div className="space-y-1.5 pt-1">
              <div className="relative h-4 w-full rounded-full overflow-hidden flex bg-stone-100 border border-[#E5E2DF]">
                {/* 4 Color zones */}
                <div className="h-full bg-blue-500" style={{ width: '22%' }} title="Gầy (< 18.5)" />
                <div className="h-full bg-[#7B9461]" style={{ width: '30%' }} title="Cân đối (18.5 - 22.9)" />
                <div className="h-full bg-[#c8983d]" style={{ width: '20%' }} title="Thừa cân (23 - 24.9)" />
                <div className="h-full bg-[#B23A2A]" style={{ width: '28%' }} title="Béo phì (≥ 25)" />
              </div>

              {/* Pin indicator */}
              <div className="relative h-4 w-full">
                <div
                  className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${gaugePercent}%` }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#2A2725]" />
                  <span className="font-mono text-[10px] font-bold text-[#2A2725] bg-white px-1.5 py-0.5 rounded shadow-xs border border-[#E5E2DF]">
                    {bmi}
                  </span>
                </div>
              </div>

              {/* Gauge labels */}
              <div className="grid grid-cols-4 text-center text-[10px] font-semibold text-[#9A938C] pt-1">
                <span className="text-blue-600">&lt; 18.5 Gầy</span>
                <span className="text-[#7B9461]">18.5-22.9 Cân đối</span>
                <span className="text-[#c8983d]">23-24.9 Thừa cân</span>
                <span className="text-[#B23A2A]">≥ 25 Béo phì</span>
              </div>
            </div>
          </div>

          {/* Calorie Stats Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2DF]">
              <span className="text-[10px] text-[#9A938C] uppercase tracking-wider block font-semibold">
                BMR Chuyển Hóa Cơ Bản
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-[#2A2725]">
                  {Math.round(bmr)}
                </span>
                <span className="text-xs text-[#6B6661] font-mono">kcal/ngày</span>
              </div>
              <span className="block text-[10px] text-[#9A938C] mt-1">
                Năng lượng tối thiểu sinh tồn
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E2DF]">
              <span className="text-[10px] text-[#9A938C] uppercase tracking-wider block font-semibold">
                TDEE Tổng Tiêu Hao
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-[#006561]">
                  {tdee}
                </span>
                <span className="text-xs text-[#006561] font-mono">kcal/ngày</span>
              </div>
              <span className="block text-[10px] text-[#9A938C] mt-1">
                Bao gồm cả mức độ vận động
              </span>
            </div>
          </div>

          {/* Recommended Daily Calorie Intake Hero Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#006561] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#006561] uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#c8983d]" />
                Lượng Calo Khuyến Nghị Nạp Mỗi Ngày
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006561]/10 text-[#006561]">
                {goal === 'lose' ? 'Mục tiêu Giảm Mỡ' : goal === 'gain' ? 'Mục tiêu Tăng Cơ' : 'Mục tiêu Giữ Dáng'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-black text-[#006561]">
                {targetCalories.toLocaleString('vi-VN')}
              </span>
              <span className="text-sm font-semibold text-[#2A2725]">
                kcal / ngày
              </span>
            </div>

            {/* Macro Breakdown */}
            <div className="pt-2 border-t border-[#E5E2DF] space-y-2">
              <span className="text-[11px] font-semibold text-[#6B6661] block">
                Phân bổ Macro chuẩn HeBekery (30% Protein - 45% Carb - 25% Fat):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F8F6F5] p-2.5 rounded-xl border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Đạm thực vật (30%)</span>
                  <span className="font-mono text-sm font-bold text-[#006561] block mt-0.5">
                    {protein}g
                  </span>
                </div>
                <div className="bg-[#F8F6F5] p-2.5 rounded-xl border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Tinh bột chậm (45%)</span>
                  <span className="font-mono text-sm font-bold text-[#c8983d] block mt-0.5">
                    {carbs}g
                  </span>
                </div>
                <div className="bg-[#F8F6F5] p-2.5 rounded-xl border border-[#E5E2DF]">
                  <span className="text-[10px] text-[#6B6661] block">Béo lành (25%)</span>
                  <span className="font-mono text-sm font-bold text-[#91350a] block mt-0.5">
                    {fat}g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Curated 7-Day Nutrition Pack (Personalized Upsell) ================= */}
      <div className="bg-white rounded-3xl border-2 border-[#006561] p-6 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E2DF] pb-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#006561] text-[#FEFBF4] rounded-full">
                <Calendar className="w-3.5 h-3.5 text-[#c8983d]" /> Gợi Ý Thực Đơn 7 Ngày
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#FFE6DC] text-[#B23A2A] rounded-full">
                <Percent className="w-3 h-3" /> Tiết kiệm 10%
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
              {combo.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6661] leading-relaxed">
              {combo.sub}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#9A938C] line-through block font-mono">
              {formatCurrency(originalTotal)}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#006561]">
              {formatCurrency(discountTotal)}
            </span>
            <span className="text-xs text-[#7B9461] font-semibold block mt-0.5">
              Tiết kiệm {formatCurrency(savedAmount)} khi đặt trọn gói combo
            </span>
          </div>
        </div>

        {/* Combo Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {combo.items.map((it) => (
            <div
              key={it.product.id}
              className="p-4 rounded-2xl border border-[#E5E2DF] bg-[#F8F6F5] flex flex-col justify-between space-y-3 hover:border-[#006561] transition-all"
            >
              <div className="space-y-2.5">
                <div className="aspect-square sm:aspect-video w-full overflow-hidden rounded-xl border border-[#E5E2DF] bg-white">
                  <img
                    src={it.product.imageUrl}
                    alt={it.product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F4EFE6] text-[#006561]">
                      {it.portionCalo}
                    </span>
                    <span className="text-[11px] font-semibold text-[#91350a]">
                      Số lượng: x{it.quantity}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-[#2A2725] leading-snug mt-1">
                    {it.product.name}
                  </h4>
                </div>
                <p className="text-xs text-[#6B6661] leading-relaxed">
                  {it.benefit}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E2DF] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#6B6661]">
                  {it.product.calories} kcal/phần
                </span>
                <span className="font-mono font-bold text-[#2A2725]">
                  {formatCurrency(it.product.price * it.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E2DF]">
          <div className="text-xs text-[#6B6661] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#7B9461] shrink-0" />
            <span>
              Bánh nướng thủ công mẻ nhỏ mỗi sáng • Đóng gói hút chân không giữ trọn độ thơm giòn.
            </span>
          </div>

          <Button
            size="lg"
            disabled={isAddingCombo}
            onClick={handleAddWeeklyComboToCart}
            className="w-full sm:w-auto px-8 py-3 rounded-full flex items-center justify-center gap-2 bg-[#006561] hover:bg-[#1a9a9b] text-[#FEFBF4] font-semibold shrink-0 cursor-pointer shadow-md transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#c8983d]" />
            <span>
              {isAddingCombo ? 'Đang thêm vào giỏ...' : 'Thêm Gói Bánh Vào Giỏ Hàng (-10%)'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
