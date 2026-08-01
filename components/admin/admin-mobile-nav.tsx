'use client'

import { useState, useEffect } from 'react'
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
  Menu,
  X,
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

export function AdminMobileNav({
  userLabel,
  userEmail,
}: {
  userLabel: string
  userEmail: string | null
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // Ferme le drawer automatiquement après un changement de page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  
  // Empêche le scroll du contenu derrière le drawer quand il est ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  return (
    <>
      {/* Barre supérieure mobile */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-paper-muted px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-display text-base italic text-ink">Azed shop</span>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-paper hover:text-ink"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {/* Drawer + overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-ink/50 animate-fade-in"
            aria-label="Fermer le menu"
          />

          <div className="relative flex h-full w-72 max-w-[85vw] animate-fade-in-left flex-col bg-paper-muted shadow-premium-lg">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-display text-base italic text-ink">Menu admin</span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigation admin mobile">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'text-ink-muted hover:bg-paper hover:text-ink'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {item.label}
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
          </div>
        </div>
      )}
    </>
  )
}