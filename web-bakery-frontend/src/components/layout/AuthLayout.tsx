import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-[#47654c] text-white flex items-center justify-center font-bold text-xl">
            H
          </div>
          <span className="font-extrabold text-2xl uppercase tracking-wider text-[#1c1917]">
            Hebekery
          </span>
        </Link>
        <p className="text-xs text-[#78716c]">
          Tiệm bánh healthy & dinh dưỡng tự nhiên mỗi ngày
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#e7e5e4] shadow-xs sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
