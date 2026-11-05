import * as React from 'react'
import { cn } from '@/utils/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-none border border-[#d6d3d1] bg-white px-3 py-2 text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus-visible:outline-none focus-visible:border-[#47654c] focus-visible:ring-1 focus-visible:ring-[#47654c] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
