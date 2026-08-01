'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Users,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initialsFromLabel(label: string) {
  return label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AdminSidebar({
  userLabel,
  userEmail,
}: {
  userLabel: string
  userEmail: string | null
}) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-paper-muted lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <span className="font-display text-lg italic text-ink">Azed shop</span>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-accent">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Navigation admin">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-ink-muted hover:bg-paper hover:text-ink'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? 'text-accent' : 'text-ink-muted group-hover:text-ink'
                }`}
                aria-hidden="true"
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Retour au site
        </Link>

        <div className="flex items-center gap-2.5 rounded-lg bg-paper px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
            {initialsFromLabel(userLabel)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{userLabel}</p>
            {userEmail && <p className="truncate text-xs text-ink-muted">{userEmail}</p>}
          </div>
        </div>

        <SignOutButton className="mt-2 w-full justify-start text-ink-muted hover:text-danger" />
      </div>
    </aside>
  )
}