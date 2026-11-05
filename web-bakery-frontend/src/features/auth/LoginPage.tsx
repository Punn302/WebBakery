import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await login(data)
      toast.success('Đăng nhập thành công!')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Email hoặc mật khẩu không chính xác'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold uppercase tracking-tight text-[#1c1917]">
          Đăng Nhập Tài Khoản
        </h2>
        <p className="text-xs text-[#78716c] mt-1">
          Nhập thông tin tài khoản Hebekery của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1c1917] mb-1">
            Email *
          </label>
          <Input
            type="email"
            placeholder="user@hebekery.vn"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1c1917] mb-1">
            Mật khẩu *
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />
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
          {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
        </Button>
      </form>

      <div className="text-center text-xs text-[#78716c] pt-4 border-t border-[#f5f5f4]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-[#47654c] hover:underline">
          Đăng ký thành viên
        </Link>
      </div>
    </div>
  )
}
