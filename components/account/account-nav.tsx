'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/account', label: 'Mon profil', icon: User },
  { href: '/account/commandes', label: 'Mes commandes', icon: Package },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigation du compte" className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
      {LINKS.map((link) => {
        const isActive = link.href === '/account' ? pathname === link.href : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-accent/10 font-medium text-accent'
                : 'text-ink-muted hover:bg-paper-muted hover:text-ink'
            )}
          >
            <link.icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
