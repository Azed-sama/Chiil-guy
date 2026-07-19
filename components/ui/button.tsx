import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline: 'border border-border bg-transparent text-ink hover:bg-paper-muted',
        ghost: 'bg-transparent text-ink hover:bg-paper-muted',
        link: 'h-auto p-0 text-accent underline-offset-4 hover:underline',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        default: 'h-11 px-6 text-sm',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
)

export interface ButtonProps
extends React.ButtonHTMLAttributes < HTMLButtonElement > ,
  VariantProps < typeof buttonVariants > {
    isLoading ? : boolean
    asChild ? : boolean
  }

export const Button = React.forwardRef < HTMLButtonElement,
  ButtonProps > (
    ({ className, variant, size, isLoading, asChild, children, disabled, ...props }, ref) => {
      const Comp = asChild ? Slot : 'button'
      
      if (asChild) {
        return (
          <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
          {children}
        </Comp>
        )
      }
      
      return (
        <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
      )
    }
  )
Button.displayName = 'Button'