import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
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

const dotVariants = cva('h-1.5 w-1.5 shrink-0 rounded-full', {
  variants: {
    variant: {
      gold: 'bg-gold',
      accent: 'bg-accent',
      success: 'bg-success',
      danger: 'bg-danger',
      neutral: 'bg-ink-muted',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

export interface BadgeProps
extends React.HTMLAttributes < HTMLSpanElement > ,
  VariantProps < typeof badgeVariants > {
    showDot ? : boolean
  }

export function Badge({ className, variant, showDot = true, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && <span className={dotVariants({ variant })} aria-hidden="true" />}
      {children}
    </span>
  )
}