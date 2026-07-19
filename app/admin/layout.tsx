import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-muted">
      <header className="border-b border-border bg-paper">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour au site
            </Link>
            <Link href="/admin/orders" className="truncate font-display text-lg italic">
              Administration
            </Link>
          </div>

          <SignOutButton />
        </div>

        <nav
          className="container flex gap-5 overflow-x-auto border-t border-border py-3 text-sm"
          aria-label="Navigation admin"
        >
          <Link href="/admin/orders" className="shrink-0 text-ink hover:text-accent">
            Commandes
          </Link>
          <Link href="/admin/products" className="shrink-0 text-ink hover:text-accent">
            Produits
          </Link>
          <Link href="/admin/categories" className="shrink-0 text-ink hover:text-accent">
            Catégories
          </Link>
          <Link href="/admin/users" className="shrink-0 text-ink hover:text-accent">
            Utilisateurs
          </Link>
          <Link href="/admin/settings" className="shrink-0 text-ink hover:text-accent">
            Paramètres
          </Link>
        </nav>
      </header>

      <div className="bg-paper">{children}</div>
    </div>
  )
}