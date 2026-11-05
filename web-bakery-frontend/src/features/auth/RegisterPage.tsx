import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại, email có thể đã tồn tại'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold uppercase tracking-tight text-[#1c1917]">
          Đăng Ký Thành Viên
        </h2>
        <p className="text-xs text-[#78716c] mt-1">
          Gia nhập cộng đồng yêu bánh healthy cùng Hebekery
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1c1917] mb-1">
            Họ và tên *
          </label>
          <Input placeholder="Nguyễn Văn A" {...register('name')} />
          {errors.name && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1c1917] mb-1">
            Email *
          </label>
          <Input type="email" placeholder="user@gmail.com" {...register('email')} />
          {errors.email && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1c1917] mb-1">
            Số điện thoại *
          </label>
          <Input placeholder="0912345678" {...register('phone')} />
          {errors.phone && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1c1917] mb-1">
            Mật khẩu *
          </label>
          <Input type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
        </Button>
      </form>

      <div className="text-center text-xs text-[#78716c] pt-4 border-t border-[#f5f5f4]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-[#47654c] hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  )
}
