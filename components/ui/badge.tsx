import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        gold: 'bg-gold/15 text-gold',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-success/10 text-success',
        danger: 'bg-danger/10 text-danger',
        neutral: 'bg-paper-muted text-ink-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
