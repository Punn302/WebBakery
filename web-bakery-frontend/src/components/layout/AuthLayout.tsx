import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import heroStitch from '@/assets/hero_stitch.jpg'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white border border-[#eadbce] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Bakery Atmosphere Branding (Stitch Screen 7) */}
        <div className="hidden md:flex md:col-span-5 relative bg-[#2e1e12] text-white p-8 flex-col justify-between overflow-hidden">
          {/* Background Image with Warm Overlay */}
          <img
            src={heroStitch}
            alt="Hebekery Artisan Bakery"
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2e1e12] via-[#2e1e12]/70 to-[#4a3728]/50" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src="/logo.webp"
                alt="Hebekery"
                className="h-9 w-auto object-contain brightness-0 invert"
              />
              <span className="font-headline text-xl font-bold tracking-tight text-[#faf8f5]">
                Hebekery
              </span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[10px] font-semibold tracking-wider uppercase mt-4">
              <Sparkles className="w-3 h-3 text-[#d97724]" />
              <span>Tiệm Bánh Dinh Dưỡng</span>
            </div>
          </div>

          {/* Middle Quote & Atmosphere */}
          <div className="relative z-10 space-y-4 my-auto">
            <p className="font-headline text-lg sm:text-xl font-medium leading-relaxed italic text-[#faf8f5]">
              “Bánh tươi nướng mới mỗi sáng sớm, giữ trọn vị thơm bùi từ lúa mì nguyên cám và mật ong hoa rừng.”
            </p>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>100% Không đường cát trắng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>Minh bạch lượng Calo & Macro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#47654c] shrink-0" />
                <span>Không chất bảo quản & phụ gia</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 text-[11px] text-white/60 border-t border-white/15 pt-4">
            Hotline hỗ trợ: <strong className="text-white">1900 6828</strong>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Mobile Logo Header */}
          <div className="md:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.webp" alt="Hebekery" className="h-8 w-auto object-contain" />
              <span className="font-headline text-xl font-bold text-[#2e1e12]">Hebekery</span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
