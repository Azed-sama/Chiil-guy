'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Menu, Search, ShoppingBag, X } from 'lucide-react'
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

function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = inputRef.current?.value.trim()
    setOpen(false)
    if (query) {
      router.push(`/produits?q=${encodeURIComponent(query)}`)
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Rechercher un produit"
        className={className}
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex items-center gap-1 animate-fade-in-left', className)}
      role="search"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          name="q"
          placeholder="Rechercher..."
          className="h-9 w-40 rounded border border-border bg-paper pl-8 pr-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent sm:w-56"
          onBlur={(e) => {
            // Referme si le champ est vide et perd le focus
            if (!e.currentTarget.value) setOpen(false)
          }}
        />
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fermer la recherche">
        <X className="h-4 w-4" />
      </Button>
    </form>
  )
}

function CartButton({ cartCount }: { cartCount: number }) {
  const [pulse, setPulse] = useState(false)
  const previousCount = useRef(cartCount)

  useEffect(() => {
    if (cartCount > previousCount.current) {
      setPulse(true)
      const timeout = setTimeout(() => setPulse(false), 500)
      previousCount.current = cartCount
      return () => clearTimeout(timeout)
    }
    previousCount.current = cartCount
  }, [cartCount])

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Panier${cartCount > 0 ? ` — ${cartCount} article${cartCount > 1 ? 's' : ''}` : ''}`}
    >
      <Link href="/panier">
        <span className="relative flex items-center justify-center">
          <ShoppingBag className={cn('h-4 w-4 transition-transform', pulse && 'animate-cart-pulse')} />
          {cartCount > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground transition-transform',
                pulse && 'scale-125'
              )}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </span>
      </Link>
    </Button>
  )
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

interface SiteHeaderProps {
  isAuthenticated: boolean
  isAdmin?: boolean
  cartCount: number
  storeName: string
}

export function SiteHeader({ isAuthenticated, isAdmin, cartCount, storeName }: SiteHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-paper/90 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-paper/80',
        scrolled ? 'border-border shadow-sm' : 'border-transparent'
      )}
    >
      <div
        className={cn(
          'container flex items-center justify-between transition-[height] duration-300',
          scrolled ? 'h-14' : 'h-16'
        )}
      >
        <Link href="/" className="flex items-baseline gap-1 font-display text-lg italic">
          {storeName}
          <span className="text-gold" aria-hidden="true">.</span>
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

        {/* Actions desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <HeaderSearch />
          <CartButton cartCount={cartCount} />

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/orders">Administration</Link>
                </Button>
              )}
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

        {/* Actions mobile : panier toujours visible + bouton menu */}
        <div className="flex items-center gap-1 md:hidden">
          <CartButton cartCount={cartCount} />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Panneau menu mobile */}
      {menuOpen && (
        <div className="border-t border-border bg-paper md:hidden">
          <nav className="container flex flex-col gap-1 py-3" aria-label="Navigation principale">
            <form action="/produits" method="get" role="search" className="relative mb-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                placeholder="Rechercher un produit..."
                className="h-11 w-full rounded border border-border bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
              />
            </form>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'rounded px-2 py-2.5 text-sm transition-colors hover:bg-paper-muted',
                  pathname === link.href ? 'font-medium text-ink' : 'text-ink-muted'
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-border" />

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/orders"
                    onClick={() => setMenuOpen(false)}
                    className="rounded px-2 py-2.5 text-sm text-ink-muted hover:bg-paper-muted"
                  >
                    Administration
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-2 py-2.5 text-sm text-ink-muted hover:bg-paper-muted"
                >
                  Mon compte
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded px-2 py-2.5 text-left text-sm text-ink-muted hover:bg-paper-muted"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Se déconnecter
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-2 py-2.5 text-sm text-ink-muted hover:bg-paper-muted"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setMenuOpen(false)}
                  className="rounded px-2 py-2.5 text-sm font-medium text-accent hover:bg-paper-muted"
                >
                  Créer un compte
                </Link>
              </>
            )}

            <div className="my-2 border-t border-border" />

            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-sm text-ink-muted">Thème</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}