import Link from 'next/link'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-muted">
      <header className="border-b border-border bg-paper">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/admin/orders" className="font-display text-lg italic">
            Administration
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation admin">
            <Link href="/admin/orders" className="text-sm text-ink hover:text-accent">
              Commandes
            </Link>
            <Link href="/admin/products" className="text-sm text-ink hover:text-accent">
              Produits
            </Link>
            <Link href="/admin/categories" className="text-sm text-ink hover:text-accent">
              Catégories
            </Link>
            <Link href="/admin/users" className="text-sm text-ink hover:text-accent">
              Utilisateurs
            </Link>
            <Link href="/admin/settings" className="text-sm text-ink hover:text-accent">
              Paramètres
            </Link>
          </nav>

          <SignOutButton />
        </div>
      </header>

      <div className="bg-paper">{children}</div>
    </div>
  )
}
