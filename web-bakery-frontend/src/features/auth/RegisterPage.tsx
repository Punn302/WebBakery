import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().trim().email('Địa chỉ email không hợp lệ'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        const cleaned = val.replace(/[\s.-]/g, '')
        return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleaned)
      },
      { message: 'Số điện thoại không hợp lệ (ví dụ: 0912345678)' }
    ),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)

      // Clean phone number: remove spaces/dots/dashes and convert +84 to 0
      let cleanPhone = data.phone.replace(/[\s.-]/g, '')
      if (cleanPhone.startsWith('+84')) {
        cleanPhone = '0' + cleanPhone.slice(3)
      }

      await registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: cleanPhone,
        password: data.password,
      })

      toast.success('Đăng ký tài khoản thành công! Bạn đã được tự động đăng nhập.')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const respData = (err as { response?: { data?: { message?: string; errors?: Record<string, string> } } })?.response?.data
      let msg = respData?.message

      if (!msg && respData?.errors) {
        msg = Object.values(respData.errors).join(', ')
      }

      if (!msg) {
        msg = (err as Error)?.message || 'Đăng ký thất bại, email có thể đã tồn tại'
      }

      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-sm mx-auto w-full font-text">
      <div className="space-y-1">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725] tracking-tight">
          Đăng Ký Thành Viên
        </h2>
        <p className="text-xs text-[#6B6661]">
          Gia nhập cộng đồng ăn sạch và nhận ưu đãi riêng từ Hebekery
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#2A2725] mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#006561]" />
            <span>Họ và tên</span>
          </label>
          <Input
            placeholder="Nguyễn Văn A"
            className="rounded-xl border-[#E5E2DF] focus:border-[#006561] focus:ring-[#006561] text-xs h-10"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-[11px] text-[#B23A2A] mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2A2725] mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#006561]" />
            <span>Địa chỉ Email</span>
          </label>
          <Input
            type="email"
            placeholder="user@gmail.com"
            className="rounded-xl border-[#E5E2DF] focus:border-[#006561] focus:ring-[#006561] text-xs h-10"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-[#B23A2A] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2A2725] mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#006561]" />
            <span>Số điện thoại</span>
          </label>
          <Input
            placeholder="0912345678"
            className="rounded-xl border-[#E5E2DF] focus:border-[#006561] focus:ring-[#006561] text-xs h-10"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-[11px] text-[#B23A2A] mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2A2725] mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#006561]" />
            <span>Mật khẩu</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="•••••••• (tối thiểu 6 ký tự)"
              className="rounded-xl border-[#E5E2DF] focus:border-[#006561] focus:ring-[#006561] text-xs h-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6661] hover:text-[#2A2725] transition-colors p-1"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-[#B23A2A] mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#006561] hover:bg-[#004e4a] text-[#FEFBF4] rounded-full h-11 text-xs font-bold tracking-wider flex items-center justify-center gap-2 mt-5 shadow-xs cursor-pointer transition-all"
        >
          <span>{isLoading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ THÀNH VIÊN'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-[#6B6661] pt-4 border-t border-[#E5E2DF]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-[#006561] hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  )
}
