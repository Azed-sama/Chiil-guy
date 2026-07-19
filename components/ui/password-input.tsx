'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit < React.InputHTMLAttributes < HTMLInputElement > , 'type' >
  
  function PasswordInputBase(props: PasswordInputProps, ref: React.Ref < HTMLInputElement > ) {
    const { className, ...rest } = props
    const [visible, setVisible] = React.useState(false)
    
    return (
      <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-muted hover:text-ink"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    )
  }

export const PasswordInput = React.forwardRef(PasswordInputBase)
PasswordInput.displayName = 'PasswordInput'