import React, { useState } from 'react'
import {
  Activity,
  Flame,
  Dumbbell,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Percent,
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

  let bmiCategory = 'Bình thường'
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
              benefit: 'Dồi dào Kẽm và Magie hỗ trợ tối ưu phục hồi cơ bắp',
            },
            {
              product: {
                id: 'P005',
                description: 'Granola siêu hạt protein và bơ hạt phỉ',
                name: 'Granola Siêu Hạt Protein & Bơ Hạt Phỉ',
                price: 145000,
                stock: 20,
                imageUrl:
                  'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 5,
                calories: 290,
                protein: 14,
                fat: 14,
                carbs: 26,
              },
              quantity: 2,
              benefit: 'Đậm đặc protein từ hạt thực vật và bột whey cô lập',
            },
            {
              product: {
                id: 'P006',
                description: 'Bánh quy yến mạch chuối và hạt óc chó',
                name: 'Bánh Quy Yến Mạch Chuối & Hạt Óc Chó',
                price: 85000,
                stock: 15,
                imageUrl:
                  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 4,
                calories: 180,
                protein: 6,
                fat: 6,
                carbs: 25,
              },
              quantity: 1,
              benefit: 'Nạp glycogen nhanh trước và sau các buổi tập tạ',
            },
          ],
        }

      case 'maintain':
      default:
        return {
          title: 'Gói Bánh Dinh Dưỡng 7 Ngày - Cân Bằng Năng Lượng & Giữ Dáng',
          description:
            'Tỷ lệ vàng giữa carb chuyển hóa chậm, men tự nhiên và chất béo tốt giúp cơ thể nhẹ nhàng, thanh lọc và tràn đầy sinh khí.',
          avgCaloriesPerMeal: 360,
          items: [
            {
              product: {
                id: 'P007',
                description: 'Bánh mì sourdough men tự nhiên hạt chia',
                name: 'Bánh Mì Men Tự Nhiên Sourdough Hạt Chia',
                price: 65000,
                stock: 16,
                imageUrl:
                  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
                active: true,
                lowStockThreshold: 3,
                calories: 195,
                protein: 8,
                fat: 3,
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
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Page Header */}
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Công Cụ Tính Chỉ Số BMI, TDEE & Gợi Ý Thực Đơn Tuần
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Dành riêng cho khách hàng của Hebekery để xây dựng thực đơn ăn kiêng lành mạnh, chính xác theo từng thể trạng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Input */}
        <div className="border border-[#e7e5e4] bg-white p-6 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#47654c]" />
            <span>Thông Số Cơ Thể Của Bạn</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">Giới tính</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={gender === 'female' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setGender('female')}
                >
                  Nữ
                </Button>
                <Button
                  type="button"
                  variant={gender === 'male' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setGender('male')}
                >
                  Nam
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">Tuổi</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(+e.target.value)}
                  min={10}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">Chiều cao (cm)</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(+e.target.value)}
                  min={100}
                  max={230}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">Cân nặng (kg)</label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(+e.target.value)}
                  min={30}
                  max={180}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                Tần suất vận động trong tuần
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(+e.target.value)}
                className="w-full h-10 border border-[#d6d3d1] bg-white px-3 text-xs text-[#1c1917] focus:outline-none focus:border-[#47654c]"
              >
                <option value={1.2}>Ít vận động (Nhân viên văn phòng, ngồi nhiều)</option>
                <option value={1.375}>Vận động nhẹ (Tập luyện 1 - 3 buổi/tuần)</option>
                <option value={1.55}>Vận động vừa (Tập luyện 3 - 5 buổi/tuần)</option>
                <option value={1.725}>Vận động nhiều (Tập luyện 6 - 7 buổi/tuần)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1">Mục tiêu hiện tại</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={goal === 'lose' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setGoal('lose')}
                >
                  Giảm mỡ
                </Button>
                <Button
                  type="button"
                  variant={goal === 'maintain' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setGoal('maintain')}
                >
                  Giữ dáng
                </Button>
                <Button
                  type="button"
                  variant={goal === 'gain' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setGoal('gain')}
                >
                  Tăng cơ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <div className="border border-[#47654c] bg-[#f4efe6] p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#47654c]" />
              <span>Chỉ Số Khuyến Nghị Hàng Ngày</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 border border-[#e7e5e4]">
                <span className="text-[10px] text-[#78716c] uppercase tracking-wider block">
                  Chỉ số BMI
                </span>
                <span className="text-2xl font-black text-[#1c1917]">{bmi}</span>
                <span className="block text-xs text-[#47654c] font-semibold mt-0.5">
                  {bmiCategory}
                </span>
              </div>

              <div className="bg-white p-4 border border-[#e7e5e4]">
                <span className="text-[10px] text-[#78716c] uppercase tracking-wider block">
                  Calo Mục Tiêu
                </span>
                <span className="text-2xl font-black text-[#d97724]">{targetCalories}</span>
                <span className="block text-xs text-[#78716c] mt-0.5">kcal / ngày</span>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#e7e5e4]">
              <span className="text-xs font-bold text-[#1c1917] block">
                Phân Bổ Dinh Dưỡng Đa Lượng (Macro):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 border border-[#e7e5e4]">
                  <span className="text-[10px] text-[#78716c] block">Chất đạm</span>
                  <strong className="text-[#1c1917]">{protein}g</strong>
                </div>
                <div className="bg-white p-2 border border-[#e7e5e4]">
                  <span className="text-[10px] text-[#78716c] block">Tinh bột tốt</span>
                  <strong className="text-[#1c1917]">{carbs}g</strong>
                </div>
                <div className="bg-white p-2 border border-[#e7e5e4]">
                  <span className="text-[10px] text-[#78716c] block">Chất béo lành</span>
                  <strong className="text-[#1c1917]">{fat}g</strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#78716c] leading-relaxed italic">
              * Lời khuyên từ Hebekery: Hãy chọn các loại bánh ngũ cốc nguyên cám hoặc thanh hạt năng lượng cho bữa phụ để duy trì mức năng lượng ổn định mà không lo tích mỡ thừa!
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Upsell Section: Curated 7-Day Nutrition Pack */}
      <div className="border-2 border-[#47654c] bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e7e5e4] pb-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#d97724] text-white">
                <Calendar className="w-3 h-3" /> Gợi Ý 7 Ngày
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#15803d] text-white">
                <Percent className="w-3 h-3" /> Tiết kiệm 10%
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#1c1917] uppercase tracking-wide">
              {combo.title}
            </h3>
            <p className="text-xs text-[#57534e] leading-relaxed">{combo.description}</p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#78716c] line-through block">
              {formatCurrency(originalTotal)}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#47654c]">
              {formatCurrency(discountTotal)}
            </span>
            <span className="text-[10px] text-[#15803d] font-bold block">
              Tiết kiệm {formatCurrency(savedAmount)} khi mua trọn bộ
            </span>
          </div>
        </div>

        {/* Combo Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {combo.items.map((it) => (
            <div
              key={it.product.id}
              className="p-4 border border-[#e7e5e4] bg-[#faf8f5] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="aspect-video w-full overflow-hidden border border-[#e7e5e4]">
                  <img
                    src={it.product.imageUrl}
                    alt={it.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1c1917] leading-snug">
                    {it.product.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-[#d97724] block mt-0.5">
                    Số lượng: x{it.quantity} khẩu phần
                  </span>
                </div>
                <p className="text-[11px] text-[#78716c] leading-relaxed">{it.benefit}</p>
              </div>

              <div className="pt-2 border-t border-[#e7e5e4] flex items-center justify-between text-xs">
                <span className="text-[#78716c]">{it.product.calories} kcal/phần</span>
                <span className="font-bold text-[#1c1917]">
                  {formatCurrency(it.product.price * it.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e7e5e4]">
          <div className="text-xs text-[#57534e] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#15803d] shrink-0" />
            <span>
              Bánh nướng mới mỗi sáng, đóng gói chân không bảo quản tươi ngon suốt cả tuần.
            </span>
          </div>

          <Button
            size="lg"
            disabled={isAddingCombo}
            onClick={handleAddWeeklyComboToCart}
            className="w-full sm:w-auto px-8 flex items-center justify-center gap-2 bg-[#47654c] hover:bg-[#38513c] text-white shrink-0 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAddingCombo ? 'Đang thêm vào giỏ...' : '1-Click: Thêm Trọn Bộ Vào Giỏ Hàng'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
