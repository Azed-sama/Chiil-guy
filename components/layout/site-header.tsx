'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, ShoppingBag } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Catalogue' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

interface SiteHeaderProps {
  isAuthenticated: boolean
  cartCount: number
  storeName: string
}

export function SiteHeader({ isAuthenticated, cartCount, storeName }: SiteHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg italic">
          {storeName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm transition-colors hover:text-ink',
                pathname === link.href ? 'font-medium text-ink' : 'text-ink-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Panier${cartCount > 0 ? ` — ${cartCount} article${cartCount > 1 ? 's' : ''}` : ''}`}
          >
            <Link href="/panier">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">Mon compte</Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/connexion">Se connecter</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/inscription">Créer un compte</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
