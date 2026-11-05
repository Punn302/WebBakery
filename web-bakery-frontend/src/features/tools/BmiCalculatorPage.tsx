import React, { useState } from 'react'
import { Activity, Flame, Dumbbell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const BmiCalculatorPage: React.FC = () => {
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [age, setAge] = useState(25)
  const [height, setHeight] = useState(162)
  const [weight, setWeight] = useState(54)
  const [activity, setActivity] = useState(1.375) // 1.2: Ít vận động, 1.375: Nhẹ, 1.55: Vừa, 1.725: Nặng
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose')

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#e7e5e4] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#1c1917]">
          Công Cụ Tính Chỉ Số BMI, TDEE & Macro
        </h1>
        <p className="text-xs text-[#78716c] mt-1">
          Dành riêng cho khách hàng của Hebekery để xây dựng thực đơn ăn kiêng lành mạnh và khoa học.
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
                <span className="text-[10px] text-[#78716c] uppercase tracking-wider block">Chỉ số BMI</span>
                <span className="text-2xl font-black text-[#1c1917]">{bmi}</span>
                <span className="block text-xs text-[#47654c] font-semibold mt-0.5">{bmiCategory}</span>
              </div>

              <div className="bg-white p-4 border border-[#e7e5e4]">
                <span className="text-[10px] text-[#78716c] uppercase tracking-wider block">Calo Mục Tiêu</span>
                <span className="text-2xl font-black text-[#d97724]">{targetCalories}</span>
                <span className="block text-xs text-[#78716c] mt-0.5">kcal / ngày</span>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#e7e5e4]">
              <span className="text-xs font-bold text-[#1c1917] block">Phân Bổ Dinh Dưỡng Đa Lượng (Macro):</span>
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
    </div>
  )
}
