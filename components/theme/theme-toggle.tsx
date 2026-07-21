'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className ? : string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Évite un mismatch d'hydratation : on ne connaît le thème
  // réel qu'une fois côté client.
  React.useEffect(() => setMounted(true), [])
  
  if (!mounted) {
    return <div className={cn('h-11 w-11', className)} aria-hidden="true" />
  }
  
  const isDark = resolvedTheme === 'dark'
  
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border',
        'text-ink-muted transition-colors hover:text-ink hover:bg-paper-muted',
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}