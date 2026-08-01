import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Package, TrendingUp } from 'lucide-react'
import { getDashboardStats } from '@/lib/data/admin/dashboard'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Tableau de bord — Administration' }

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  
  return (
    <main className="container py-8">
      <h1 className="font-display text-2xl">Tableau de bord</h1>
      <p className="mt-1 text-sm text-ink-muted">Vue d'ensemble de l'activité de la boutique</p>

      {/* Cartes de ventes */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Aujourd'hui</p>
          <p className="mt-2 font-display text-2xl">{formatPrice(stats.salesToday)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Cette semaine</p>
          <p className="mt-2 font-display text-2xl">{formatPrice(stats.salesThisWeek)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Ce mois-ci</p>
          <p className="mt-2 font-display text-2xl">{formatPrice(stats.salesThisMonth)}</p>
        </div>
      </div>

      {/* Commandes en attente */}
      <Link
        href="/admin/orders"
        className="mt-4 flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-accent/40 hover:bg-paper-muted"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-ink">
            {stats.pendingOrdersCount} commande{stats.pendingOrdersCount > 1 ? 's' : ''} en attente
          </p>
          <p className="text-sm text-ink-muted">À traiter dès que possible</p>
        </div>
      </Link>

      {/* Produits les plus vendus */}
      <div className="mt-6 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            Produits les plus vendus
          </h2>
        </div>

        {stats.topProducts.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 py-8 text-center">
            <Package className="h-6 w-6 text-ink-muted" aria-hidden="true" />
            <p className="text-sm text-ink-muted">Pas encore de ventes sur les 90 derniers jours.</p>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {stats.topProducts.map((product, i) => (
              <div key={product.productName} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper-muted text-xs font-medium text-ink-muted">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{product.productName}</p>
                    <p className="text-xs text-ink-muted">
                      {product.totalQuantity} vendu{product.totalQuantity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="font-display text-sm">{formatPrice(product.totalRevenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}