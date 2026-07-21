'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Menu, ShoppingBag, X } from 'lucide-react'
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
      </Link> <
    /Button>
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
  isAdmin ? : boolean
  cartCount: number
  storeName: string
}

export function SiteHeader({ isAuthenticated, isAdmin, cartCount, storeName }: SiteHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])
  
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
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-paper md:hidden"
          >
            <nav className="container flex flex-col gap-1 py-3" aria-label="Navigation principale">
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}