import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Lock, Mail, ShieldCheck, User as UserIcon, Eye, EyeOff, Warehouse, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin || user.role === 'ADMIN' || (user.role as string) === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (user.role === 'STAFF_WAREHOUSE') {
        navigate('/admin/inventory', { replace: true })
      } else if (user.role === 'STAFF_SALES') {
        navigate('/admin/orders', { replace: true })
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
    <div className="space-y-6 max-w-sm mx-auto w-full font-text">
      <div className="space-y-1">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725] tracking-tight">
          Đăng Nhập
        </h2>
        <p className="text-xs text-[#6B6661]">
          Chào mừng bạn quay lại thưởng thức những mẻ bánh lành mạnh
        </p>
      </div>

      {/* Quick Demo Fill Buttons */}
      <div className="p-3 bg-[#FAF7F2] border border-[#E5E2DF] rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#2A2725]">Tài khoản thử nghiệm nhanh (4 Roles):</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => fillDemoAccount('user@hebekery.vn', '123456')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E5E2DF] rounded-lg text-[11px] text-[#2A2725] hover:border-[#006561] hover:bg-[#006561]/5 transition-all text-left cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#006561] shrink-0" />
            <div className="truncate">
              <div className="font-semibold truncate">1. Khách hàng</div>
              <div className="text-[10px] text-[#6B6661] truncate">user@hebekery.vn</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@hebekery.vn', 'admin123')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E5E2DF] rounded-lg text-[11px] text-[#2A2725] hover:border-[#006561] hover:bg-[#006561]/5 transition-all text-left cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#006561] shrink-0" />
            <div className="truncate">
              <div className="font-semibold truncate">2. Quản trị viên</div>
              <div className="text-[10px] text-[#6B6661] truncate">admin@hebekery.vn</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('warehouse@hebekery.vn', '123456')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E5E2DF] rounded-lg text-[11px] text-[#2A2725] hover:border-[#C9785C] hover:bg-[#C9785C]/5 transition-all text-left cursor-pointer"
          >
            <Warehouse className="w-3.5 h-3.5 text-[#C9785C] shrink-0" />
            <div className="truncate">
              <div className="font-semibold truncate">3. Thủ kho (Warehouse)</div>
              <div className="text-[10px] text-[#6B6661] truncate">warehouse@hebekery.vn</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('sales@hebekery.vn', '123456')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E5E2DF] rounded-lg text-[11px] text-[#2A2725] hover:border-[#0284c7] hover:bg-[#0284c7]/5 transition-all text-left cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
            <div className="truncate">
              <div className="font-semibold truncate">4. Bán hàng (Sales)</div>
              <div className="text-[10px] text-[#6B6661] truncate">sales@hebekery.vn</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#2A2725] mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#006561]" />
            <span>Địa chỉ Email</span>
          </label>
          <Input
            type="email"
            placeholder="user@hebekery.vn"
            className="rounded-xl border-[#E5E2DF] focus:border-[#006561] focus:ring-[#006561] text-xs h-10"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-[#B23A2A] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#2A2725] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#006561]" />
              <span>Mật khẩu</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[11px] text-[#006561] hover:underline font-medium cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="rounded-xl border-[#E5E2DF] focus:border-[#006561] focus:ring-[#006561] text-xs h-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A938C] hover:text-[#2A2725] cursor-pointer"
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
          className="w-full bg-[#006561] hover:bg-[#004e4a] text-white rounded-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
        >
          <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-[#6B6661] pt-4 border-t border-[#E5E2DF]">
        Bạn chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-[#006561] hover:underline">
          Đăng ký thành viên mới
        </Link>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display text-xl font-bold text-[#2A2725]">
              Quên Mật Khẩu Tài Khoản
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6661] leading-relaxed">
              Bạn đang gặp khó khăn khi đăng nhập vào hệ thống Hebekery?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-[#2A2725] bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E2DF]">
            <p className="font-semibold text-[#006561]">Hướng dẫn cấp lại / đặt lại mật khẩu:</p>
            <ul className="space-y-1.5 text-[#6B6661] list-disc list-inside">
              <li>Đối với tài khoản thử nghiệm nhanh, mật khẩu mặc định là: <span className="font-mono font-bold text-[#2A2725]">123456</span> (Khách hàng) hoặc <span className="font-mono font-bold text-[#2A2725]">admin123</span> (Quản trị viên).</li>
              <li>Nếu bạn đã đăng ký bằng email cá nhân và quên mật khẩu, vui lòng liên hệ ngay với bộ phận hỗ trợ khách hàng:</li>
            </ul>
            <div className="pt-2 border-t border-[#E5E2DF] space-y-1 text-xs">
              <p>📞 Hotline Bếp: <a href="tel:0979764185" className="font-bold text-[#006561]">097 97 64 185</a> (8:00 - 21:00 hàng ngày)</p>
              <p>✉️ Email: <a href="mailto:hebe.healthandbeauty@gmail.com" className="font-bold text-[#006561]">hebe.healthandbeauty@gmail.com</a></p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="bg-[#006561] text-white rounded-full text-xs font-semibold px-6 py-2 cursor-pointer"
            >
              Đã hiểu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
