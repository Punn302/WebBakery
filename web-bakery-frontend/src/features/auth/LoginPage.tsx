import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().trim().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate(from !== '/login' ? from : '/', { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, user, navigate, from])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const loggedUser = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })
      toast.success('Đăng nhập thành công!')

      // Smart navigation
      if (from && from !== '/' && from !== '/login') {
        navigate(from, { replace: true })
      } else if (loggedUser.role === 'ADMIN' || (loggedUser.role as string) === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (loggedUser.role === 'STAFF_WAREHOUSE') {
        navigate('/admin/inventory', { replace: true })
      } else if (loggedUser.role === 'STAFF_SALES') {
        navigate('/admin/orders', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Email hoặc mật khẩu không chính xác'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', pass, { shouldValidate: true })
  }

  return (
    <div className="space-y-6 max-w-sm mx-auto w-full">
      <div className="space-y-1">
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#2e1e12] tracking-tight">
          Đăng Nhập
        </h2>
        <p className="text-xs text-[#7c6856]">
          Chào mừng bạn quay lại thưởng thức những mẻ bánh lành mạnh
        </p>
      </div>

      {/* Quick Demo Fill Buttons */}
      <div className="p-3 bg-[#f7f3ee] border border-[#eadbce] rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#4a3728]">Tài khoản thử nghiệm nhanh:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => fillDemoAccount('user@hebekery.vn', '123456')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#eadbce] rounded-lg text-[11px] text-[#2e1e12] hover:border-[#47654c] hover:bg-[#eef3ee] transition-all text-left"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#47654c] shrink-0" />
            <div className="truncate">
              <div className="font-medium truncate">Khách hàng</div>
              <div className="text-[10px] text-[#7c6856] truncate">user@hebekery.vn</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@hebekery.vn', 'admin123')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#eadbce] rounded-lg text-[11px] text-[#2e1e12] hover:border-[#47654c] hover:bg-[#eef3ee] transition-all text-left"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#b47243] shrink-0" />
            <div className="truncate">
              <div className="font-medium truncate">Quản trị viên</div>
              <div className="text-[10px] text-[#7c6856] truncate">admin@hebekery.vn</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#2e1e12] mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#7c6856]" />
            <span>Địa chỉ Email</span>
          </label>
          <Input
            type="email"
            placeholder="user@hebekery.vn"
            className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c] text-xs h-10"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[#2e1e12] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#7c6856]" />
              <span>Mật khẩu</span>
            </label>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            className="rounded-xl border-[#eadbce] focus:border-[#47654c] focus:ring-[#47654c] text-xs h-10"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-[11px] text-[#dc2626] mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="btn-tactile w-full bg-[#4a3728] hover:bg-[#2e1e12] text-white rounded-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mt-2"
        >
          <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-[#7c6856] pt-4 border-t border-[#eadbce]/60">
        Bạn chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-[#4a3728] hover:text-[#2e1e12] underline">
          Đăng ký thành viên mới
        </Link>
      </div>
    </div>
  )
}
