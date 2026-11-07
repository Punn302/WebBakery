import React, { useState } from 'react'
import {
  Activity,
  Flame,
  Sparkles,
  ShoppingBag,
  Calendar,
  Percent,
  Check,
  CheckCircle2,
  Wheat,
  Scale,
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
}

export const BmiCalculatorPage: React.FC = () => {
  const { addItem, setIsCartOpen } = useCart()
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [age, setAge] = useState(25)
  const [height, setHeight] = useState(162)
  const [weight, setWeight] = useState(54)
  const [activity, setActivity] = useState(1.375) // 1.2: Ít vận động, 1.375: Nhẹ, 1.55: Vừa, 1.725: Nặng
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose')
  const [isAddingCombo, setIsAddingCombo] = useState(false)

  // Tính BMR theo Harris-Benedict
  const bmr =
    gender === 'male'
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age

  const tdee = Math.round(bmr * activity)

  // Calo theo mục tiêu
  let targetCalories = tdee
  if (goal === 'lose') targetCalories = Math.round(tdee - 400)
  if (goal === 'gain') targetCalories = Math.round(tdee + 350)

  // BMI
  const heightInMeters = height / 100
  const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(1)

  let bmiCategory = 'Cân Đối Lý Tưởng'
  if (bmi < 18.5) bmiCategory = 'Hơi gầy'
  else if (bmi >= 23 && bmi < 25) bmiCategory = 'Thừa cân nhẹ'
  else if (bmi >= 25) bmiCategory = 'Thừa cân'

  // Macro: 30% Protein, 45% Carb, 25% Fat
  const protein = Math.round((targetCalories * 0.3) / 4)
  const carbs = Math.round((targetCalories * 0.45) / 4)
  const fat = Math.round((targetCalories * 0.25) / 9)

  // Curated 7-Day Bakery Packs according to user goal
  const getWeeklyCombo = (): {
    title: string
    description: string
    avgCaloriesPerMeal: number
    items: ComboItem[]
  } => {
    switch (goal) {
      case 'lose':
        return {
          title: 'Gói Bánh Dinh Dưỡng 7 Ngày - Eat Clean & Giảm Mỡ Tự Nhiên',
          description:
            'Tập trung vào tinh bột chậm chuyển hóa từ lúa mạch đen và hạt yến mạch, giúp no lâu suốt 5-6 tiếng và kiểm soát đường huyết.',
          avgCaloriesPerMeal: 280,
          items: [
            {
              product: {
                id: 'P001',
                description: 'Bánh mì đen nguyên cám lúa mạch Đức cao cấp',
                name: 'Bánh Mì Đen Nguyên Cám Hebekery',
                price: 45000,
                stock: 20,
                imageUrl:
                  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 5,
                calories: 165,
                protein: 7,
                fat: 2,
                carbs: 32,
              },
              quantity: 2,
              benefit: '100% lúa mạch đen, giàu chất xơ hòa tan beta-glucan',
            },
            {
              product: {
                id: 'P002',
                description: 'Biscotti yến mạch cam quế hạnh nhân ít ngọt',
                name: 'Biscotti Yến Mạch Hạnh Nhân Cam Quế (Ít Ngọt)',
                price: 95000,
                stock: 15,
                imageUrl:
                  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 3,
                calories: 120,
                protein: 4,
                fat: 4,
                carbs: 18,
              },
              quantity: 2,
              benefit: 'Nướng giòn không dầu mỡ, ăn vặt không lo tích mỡ bụng',
            },
            {
              product: {
                id: 'P003',
                description: 'Granola siêu hạt không đường',
                name: 'Granola Siêu Hạt Ăn Kiêng Không Đường',
                price: 125000,
                stock: 25,
                imageUrl:
                  'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 4,
                calories: 210,
                protein: 8,
                fat: 10,
                carbs: 22,
              },
              quantity: 1,
              benefit: '85% hạt dinh dưỡng cao cấp (Hạnh nhân, óc chó, hạt bí)',
            },
          ],
        }

      case 'gain':
        return {
          title: 'Gói Bánh Dinh Dưỡng 7 Ngày - Giàu Đạm Phục Hồi & Tăng Cơ',
          description:
            'Tăng cường đạm thực vật và chất béo lành mạnh Omega-3 hỗ trợ xây dựng cơ bắp và nạp năng lượng tập luyện cường độ cao.',
          avgCaloriesPerMeal: 460,
          items: [
            {
              product: {
                id: 'P004',
                description: 'Bánh mì đen hạt bí và hướng dương',
                name: 'Bánh Mì Đen Hạt Bí & Hướng Dương Giàu Khoáng',
                price: 55000,
                stock: 18,
                imageUrl:
                  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 3,
                calories: 220,
                protein: 10,
                fat: 5,
                carbs: 34,
              },
              quantity: 2,
              benefit: 'Hạt bí xanh và hướng dương giàu Magie, Kẽm và Protein',
            },
            {
              product: {
                id: 'P005',
                description: 'Granola Chocolate Bỉ thượng hạng',
                name: 'Granola Chocolate Cacao 85% Đậm Vị Bỉ',
                price: 145000,
                stock: 20,
                imageUrl:
                  'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 4,
                calories: 260,
                protein: 9,
                fat: 12,
                carbs: 28,
              },
              quantity: 2,
              benefit: 'Flavonoid từ cacao đen nguyên chất giúp thư giãn cơ bắp sau tập',
            },
            {
              product: {
                id: 'P006',
                description: 'Biscotti hạt điều và hạnh nhân đúp đạm',
                name: 'Biscotti Đúp Đạm Hạnh Nhân & Hạt Điều Bình Phước',
                price: 110000,
                stock: 12,
                imageUrl:
                  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 2,
                calories: 145,
                protein: 6,
                fat: 5,
                carbs: 16,
              },
              quantity: 1,
              benefit: 'Tỷ lệ hạt dinh dưỡng đạt 60%, cung cấp axit amin thiết yếu',
            },
          ],
        }

      case 'maintain':
      default:
        return {
          title: 'Gói Bánh Dinh Dưỡng 7 Ngày - Duy Trì Vóc Dáng & Trẻ Hóa',
          description:
            'Cân bằng dinh dưỡng vi lượng và chất chống oxy hóa tự nhiên giúp cơ thể thanh nhẹ, tràn đầy sức sống mỗi ngày.',
          avgCaloriesPerMeal: 350,
          items: [
            {
              product: {
                id: 'P007',
                description: 'Bánh mì Sourdough men tự nhiên',
                name: 'Bánh Mì Sourdough Lúa Mạch Men Tự Nhiên Hebekery',
                price: 65000,
                stock: 15,
                imageUrl:
                  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 3,
                calories: 175,
                protein: 6,
                fat: 1,
                carbs: 35,
              },
              quantity: 2,
              benefit: 'Lên men chậm 24h, bảo vệ hệ vi sinh đường ruột khỏe mạnh',
            },
            {
              product: {
                id: 'P008',
                description: 'Granola siêu hạt nướng mật ong hoa nhãn',
                name: 'Granola Siêu Hạt Nướng Mật Ong Hoa Nhãn',
                price: 135000,
                stock: 22,
                imageUrl:
                  'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 4,
                calories: 240,
                protein: 9,
                fat: 11,
                carbs: 24,
              },
              quantity: 2,
              benefit: 'Vị ngọt dịu thanh khiết, chống oxy hóa với mật ong tự nhiên',
            },
            {
              product: {
                id: 'P009',
                description: 'Bánh muffin yến mạch việt quất tươi',
                name: 'Bánh Muffin Yến Mạch Việt Quất Tươi',
                price: 75000,
                stock: 14,
                imageUrl:
                  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 2,
                calories: 155,
                protein: 5,
                fat: 4,
                carbs: 24,
              },
              quantity: 1,
              benefit: 'Giàu anthocyanin từ quả việt quất tươi mọng nước',
            },
          ],
        }
    }
  }

  const combo = getWeeklyCombo()

  // Calculate pricing (with 10% combo discount)
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
        `Đã thêm trọn bộ ${combo.items.length} món trong Thực Đơn Tuần vào giỏ hàng với giá ưu đãi!`
      )
      setIsCartOpen(true)
    } catch {
      toast.error('Có lỗi khi thêm gói bánh vào giỏ hàng')
    } finally {
      setIsAddingCombo(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 pb-16">
      {/* ================= Hero Header Banner ================= */}
      <div className="bg-white rounded-3xl border border-[#eadbce] p-8 sm:p-10 tactile-card space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#d97724]" />
          <span>Công Thức Harris-Benedict Chuẩn Khoa Học</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#4a3728]">
          Hiểu Rõ Chỉ Số Cơ Thể – Ăn Bánh Ngon Vẫn Giữ Dáng Thon
        </h1>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-2xl leading-relaxed">
          Tính toán nhu cầu năng lượng hàng ngày (TDEE) và tự động nhận gợi ý combo bánh ngũ cốc Hebekery 7 ngày phù hợp với mục tiêu giảm mỡ hoặc tăng cơ của riêng bạn.
        </p>
      </div>

      {/* ================= 2-Column Calculator & Results Board ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Input Card */}
        <div className="md:col-span-6 bg-white rounded-3xl border border-[#eadbce] p-7 tactile-card space-y-6">
          <h2 className="font-headline text-lg font-bold text-[#4a3728] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#47654c]" />
            <span>Nhập Thông Số Cơ Thể</span>
          </h2>

          <div className="space-y-4">
            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-semibold text-[#4a3728] mb-1.5">Giới tính</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-[#4a3728] text-[#faf8f5] shadow-xs'
                      : 'bg-[#faf8f5] text-[#78716c] border border-[#eadbce] hover:bg-[#f4efea]'
                  }`}
                >
                  Nữ
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-[#4a3728] text-[#faf8f5] shadow-xs'
                      : 'bg-[#faf8f5] text-[#78716c] border border-[#eadbce] hover:bg-[#f4efea]'
                  }`}
                >
                  Nam
                </button>
              </div>
            </div>

            {/* Age, Height, Weight Steppers */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4a3728] mb-1">Tuổi</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(+e.target.value)}
                  min={10}
                  max={100}
                  className="bg-[#faf8f5] border-[#eadbce] rounded-xl text-xs font-semibold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a3728] mb-1">Chiều cao (cm)</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(+e.target.value)}
                  min={100}
                  max={230}
                  className="bg-[#faf8f5] border-[#eadbce] rounded-xl text-xs font-semibold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a3728] mb-1">Cân nặng (kg)</label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(+e.target.value)}
                  min={30}
                  max={180}
                  className="bg-[#faf8f5] border-[#eadbce] rounded-xl text-xs font-semibold text-center"
                />
              </div>
            </div>

            {/* Activity Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#4a3728] mb-1.5">
                Tần suất vận động trong tuần
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(+e.target.value)}
                className="w-full h-11 border border-[#eadbce] rounded-xl bg-[#faf8f5] px-3 text-xs text-[#4a3728] font-medium focus:outline-none focus:border-[#4a3728] cursor-pointer"
              >
                <option value={1.2}>Ít vận động (Nhân viên văn phòng, ngồi nhiều)</option>
                <option value={1.375}>Vận động nhẹ (Tập luyện 1 - 3 buổi/tuần: Yoga, đi bộ)</option>
                <option value={1.55}>Vận động vừa (Tập luyện 3 - 5 buổi/tuần: Gym, Chạy bộ)</option>
                <option value={1.725}>Vận động nhiều (Tập luyện 6 - 7 buổi/tuần, VĐV)</option>
              </select>
            </div>

            {/* Goal Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#4a3728] mb-1.5">Mục tiêu của bạn</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'Giảm mỡ' },
                  { id: 'maintain', label: 'Giữ dáng' },
                  { id: 'gain', label: 'Tăng cơ' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      goal === g.id
                        ? 'bg-[#47654c] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#78716c] border border-[#eadbce] hover:bg-[#f4efea]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results & Macro Board */}
        <div className="md:col-span-6 bg-[#faf8f5] rounded-3xl border border-[#eadbce] p-7 tactile-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#eadbce] pb-4">
            <h2 className="font-headline text-lg font-bold text-[#4a3728] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d97724]" />
              <span>Chỉ Số Năng Lượng Đề Xuất</span>
            </h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#47654c]/10 text-[#47654c]">
              BMI: {bmi} ({bmiCategory})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#eadbce]">
              <span className="text-[10px] text-[#78716c] uppercase tracking-wider block font-semibold">
                BMR Cơ Bản
              </span>
              <span className="font-headline text-2xl font-bold text-[#4a3728]">{Math.round(bmr)}</span>
              <span className="block text-[11px] text-[#78716c] mt-0.5">kcal / ngày</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#eadbce] ring-2 ring-[#47654c]/30">
              <span className="text-[10px] text-[#47654c] uppercase tracking-wider block font-bold">
                Calo Mục Tiêu (Hebekery)
              </span>
              <span className="font-headline text-2xl font-bold text-[#47654c]">{targetCalories}</span>
              <span className="block text-[11px] text-[#47654c] font-semibold mt-0.5">kcal / ngày</span>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-[#4a3728] block">
              Phân Bổ Macro Chuẩn Eat Clean:
            </span>
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">30% Đạm</span>
                <strong className="text-base text-[#47654c] font-headline">{protein}g</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">45% Tinh bột tốt</span>
                <strong className="text-base text-[#d97724] font-headline">{carbs}g</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#eadbce]">
                <span className="text-[10px] text-[#78716c] block">25% Béo lành</span>
                <strong className="text-base text-[#4a3728] font-headline">{fat}g</strong>
              </div>
            </div>

            {/* Visual Colored Ratio Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-200 mt-2">
              <div className="h-full bg-[#47654c]" style={{ width: '30%' }} title="30% Protein" />
              <div className="h-full bg-[#d97724]" style={{ width: '45%' }} title="45% Good Carbs" />
              <div className="h-full bg-[#4a3728]" style={{ width: '25%' }} title="25% Healthy Fat" />
            </div>
          </div>

          <p className="text-[11px] text-[#78716c] leading-relaxed italic border-t border-[#eadbce] pt-3">
            * Lời khuyên từ chuyên gia dinh dưỡng Hebekery: Sử dụng bánh ngũ cốc lên men tự nhiên và hạt nướng mật ong vào bữa sáng &amp; bữa phụ 15h giúp no lâu, giảm cảm giác thèm đường công nghiệp.
          </p>
        </div>
      </div>

      {/* ================= Curated 7-Day Nutrition Pack (Stitch Screen 3 Upsell) ================= */}
      <div className="bg-white rounded-3xl border-2 border-[#4a3728] p-7 sm:p-9 tactile-card space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eadbce] pb-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#d97724] text-white rounded-full">
                <Calendar className="w-3 h-3" /> Gợi Ý 7 Ngày
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#47654c] text-white rounded-full">
                <Percent className="w-3 h-3" /> Tiết kiệm 10%
              </span>
            </div>
            <h3 className="font-headline text-lg sm:text-xl font-bold text-[#4a3728]">
              {combo.title}
            </h3>
            <p className="text-xs text-[#78716c] leading-relaxed">{combo.description}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#78716c] line-through block">
              {formatCurrency(originalTotal)}
            </span>
            <span className="font-headline text-2xl font-bold text-[#4a3728]">
              {formatCurrency(discountTotal)}
            </span>
            <span className="text-xs text-[#47654c] font-semibold block">
              Tiết kiệm {formatCurrency(savedAmount)} khi mua combo trọn bộ
            </span>
          </div>
        </div>

        {/* Combo Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {combo.items.map((it) => (
            <div
              key={it.product.id}
              className="p-4 rounded-2xl border border-[#eadbce] bg-[#faf8f5] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#eadbce]">
                  <img
                    src={it.product.imageUrl}
                    alt={it.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-[#4a3728] leading-snug">
                    {it.product.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-[#d97724] block mt-0.5">
                    Số lượng: x{it.quantity} phần trong tuần
                  </span>
                </div>
                <p className="text-xs text-[#78716c] leading-relaxed">{it.benefit}</p>
              </div>

              <div className="pt-2 border-t border-[#eadbce] flex items-center justify-between text-xs">
                <span className="text-[#78716c]">{it.product.calories} kcal/phần</span>
                <span className="font-bold text-[#4a3728]">
                  {formatCurrency(it.product.price * it.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#eadbce]">
          <div className="text-xs text-[#78716c] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
            <span>
              Bánh nướng mẻ nhỏ mỗi sáng, đóng gói giữ trọn độ thơm giòn suốt 7 ngày.
            </span>
          </div>

          <Button
            size="lg"
            disabled={isAddingCombo}
            onClick={handleAddWeeklyComboToCart}
            className="w-full sm:w-auto px-8 py-3 rounded-full flex items-center justify-center gap-2 bg-[#4a3728] hover:bg-[#2e1e12] text-[#faf8f5] font-semibold shrink-0 cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#d97724]" />
            <span>{isAddingCombo ? 'Đang thêm vào giỏ...' : '1-Chạm: Đặt Mua Trọn Bộ Combo 7 Ngày'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
