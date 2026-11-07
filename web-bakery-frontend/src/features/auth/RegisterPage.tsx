import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, User, Mail, Phone, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const registerSchema = z.object({
  name: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

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
      await registerUser(data)
      toast.success('Đăng ký tài khoản thành công!')
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại, email có thể đã tồn tại'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-sm mx-auto w-full">
      <div className="space-y-1">
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#2e1e12] tracking-tight">
          Đăng Ký Thành Viên
        </h2>
        <p className="text-xs text-[#7c6856]">
          Gia nhập cộng đồng ăn sạch và nhận ưu đãi riêng từ Hebekery
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-[#2e1e12] mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#7c6856]" />
            <span>Họ và tên</span>
          </label>
          <Input
            placeholder="Nguyễn Văn A"
            className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c] text-xs h-9"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2e1e12] mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#7c6856]" />
            <span>Địa chỉ Email</span>
          </label>
          <Input
            type="email"
            placeholder="user@gmail.com"
            className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c] text-xs h-9"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2e1e12] mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#7c6856]" />
            <span>Số điện thoại</span>
          </label>
          <Input
            placeholder="0912345678"
            className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c] text-xs h-9"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2e1e12] mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#7c6856]" />
            <span>Mật khẩu</span>
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c] text-xs h-9"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="btn-tactile w-full bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mt-4"
        >
          <span>{isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-[#7c6856] pt-3 border-t border-[#eadbce]/60">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-[#4a3728] hover:text-[#2e1e12] underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  )
}
