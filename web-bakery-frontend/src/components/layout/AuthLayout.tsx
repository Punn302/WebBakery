import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import heroStitch from '@/assets/hero_stitch.jpg'

export const AuthLayout: React.FC = () => {
  const brandLogo = 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/logo.png?1790765513162'

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-text">
      <div className="w-full max-w-4xl bg-white border border-[#E5E2DF] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Bakery Atmosphere Branding in Hebekery Pine Green */}
        <div className="hidden md:flex md:col-span-5 relative bg-[#004e4a] text-white p-8 flex-col justify-between overflow-hidden">
          {/* Background Image with Warm Overlay */}
          <img
            src={heroStitch}
            alt="Hebekery Artisan Bakery"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003835] via-[#004e4a]/80 to-[#006561]/50 pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src={brandLogo}
                alt="Hebekery"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/95 text-[10px] font-bold tracking-wider uppercase mt-3">
              <Sparkles className="w-3.5 h-3.5 text-[#EDCA82]" />
              <span>Tiệm Bánh Dinh Dưỡng</span>
            </div>
          </div>

          {/* Middle Quote & Atmosphere */}
          <div className="relative z-10 space-y-4 my-auto">
            <p className="font-serif text-xl sm:text-2xl font-normal leading-relaxed italic text-[#FAF7F2]">
              “Bánh nướng mộc mỗi sáng sớm, giữ trọn vị thơm bùi từ lúa mì nguyên cám và mật ong tự nhiên.”
            </p>
            <div className="space-y-2.5 text-xs text-white/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8cd694] shrink-0" />
                <span>100% Không đường cát trắng</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8cd694] shrink-0" />
                <span>Minh bạch lượng Calo &amp; Macro</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8cd694] shrink-0" />
                <span>Đạt chứng nhận quốc tế ISO 22000 &amp; HACCP</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 text-[11px] text-white/70 border-t border-white/15 pt-4">
            Hotline hỗ trợ: <strong className="text-white font-mono">097 97 64 185</strong>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          {/* Mobile Logo Header */}
          <div className="md:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center">
              <img
                src={brandLogo}
                alt="Hebekery"
                className="h-10 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
