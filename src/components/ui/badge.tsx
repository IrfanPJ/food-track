import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-green-500 text-white',
        secondary: 'border-transparent bg-slate-700 text-slate-300',
        destructive: 'border-transparent bg-red-500/20 text-red-400 border-red-500/20',
        outline: 'border-[#334155] text-slate-300',
        success: 'border-green-500/20 bg-green-500/10 text-green-400',
        warning: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
        danger: 'border-red-500/20 bg-red-500/10 text-red-400',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
        purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
