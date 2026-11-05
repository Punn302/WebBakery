import * as React from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'accent' | 'destructive' | 'ghost'
  size?: 'sm' | 'default' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-none cursor-pointer select-none'

    const variants = {
      default:
        'bg-[#47654c] text-white hover:bg-[#3a533e] active:bg-[#314634] btn-tactile',
      secondary:
        'bg-[#f4efe6] text-[#292524] hover:bg-[#eae3d6] active:bg-[#ded5c5] border border-[#e7e5e4] btn-tactile',
      accent:
        'bg-[#d97724] text-white hover:bg-[#c26719] active:bg-[#ab5813] btn-tactile',
      outline:
        'bg-transparent border border-[#47654c] text-[#47654c] hover:bg-[#47654c]/10 active:bg-[#47654c]/20',
      destructive:
        'bg-[#dc2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b] btn-tactile',
      ghost:
        'bg-transparent hover:bg-black/5 text-[#1c1917] active:bg-black/10',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      default: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
