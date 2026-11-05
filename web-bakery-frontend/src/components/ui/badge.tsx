import * as React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'outline' | 'success' | 'destructive'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#47654c] text-white',
    secondary: 'bg-[#f4efe6] text-[#292524] border border-[#e7e5e4]',
    accent: 'bg-[#d97724] text-white',
    outline: 'border border-[#47654c] text-[#47654c]',
    success: 'bg-[#15803d] text-white',
    destructive: 'bg-[#dc2626] text-white',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-none tracking-wide select-none',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
