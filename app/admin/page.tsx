import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShoppingBag,
  Package,
  Users,
  Wallet,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { getDashboardStats } from '@/lib/data/admin/dashboard'
import { AdminStatCard } from '@/components/admin/admin-stat-card'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Tableau de bord — Administration' }

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  
  return (
    <div>
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Tableau de bord</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Vue d'ensemble de l'activité de la boutique</p>
      </div>

      {/* Ventes par période */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Aujourd'hui" value={formatPrice(stats.salesToday)} icon={Wallet} tone="accent" delayMs={0} />
        <AdminStatCard
          label="Cette semaine"
          value={formatPrice(stats.salesThisWeek)}
          icon={TrendingUp}
          tone="accent"
          delayMs={50}
        />
        <AdminStatCard
          label="Ce mois-ci"
          value={formatPrice(stats.salesThisMonth)}
          icon={TrendingUp}
          tone="accent"
          delayMs={100}
        />
      </div>

      {/* Vue d'ensemble activité */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard
          label="Commandes"
          value={String(stats.totalOrdersCount)}
          icon={ShoppingBag}
          tone="neutral"
          delayMs={150}
        />
        <AdminStatCard
          label="Produits publiés"
          value={String(stats.publishedProductsCount)}
          icon={Package}
          tone="neutral"
          delayMs={200}
        />
        <AdminStatCard
          label="Utilisateurs"
          value={String(stats.usersCount)}
          icon={Users}
          tone="neutral"
          delayMs={250}
        />
        <AdminStatCard
          label="Stock bas"
          value={String(stats.lowStockProductsCount)}
          icon={AlertTriangle}
          tone={stats.lowStockProductsCount > 0 ? 'danger' : 'neutral'}
          delayMs={300}
        />
      </div>

      {/* Commandes en attente */}
      <Link
        href="/admin/orders"
        className="mt-6 flex animate-fade-in-up items-center gap-3.5 rounded-xl border border-border bg-paper-muted p-5 transition-all duration-200 hover:border-gold/40 hover:shadow-premium"
        style={{ animationDelay: '350ms' }}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-ink">
            {stats.pendingOrdersCount} commande{stats.pendingOrdersCount > 1 ? 's' : ''} en attente
          </p>
          <p className="text-sm text-ink-muted">À traiter dès que possible</p>
        </div>
      </Link>

      {/* Produits les plus vendus */}
      <div
        className="mt-4 animate-fade-in-up rounded-xl border border-border bg-paper-muted p-5"
        style={{ animationDelay: '400ms' }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Produits les plus vendus
          </h2>
        </div>

        {stats.topProducts.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 py-10 text-center">
            <Package className="h-6 w-6 text-ink-muted" aria-hidden="true" />
            <p className="text-sm text-ink-muted">Pas encore de ventes sur les 90 derniers jours.</p>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {stats.topProducts.map((product, i) => (
              <div key={product.productName} className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-medium text-ink-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{product.productName}</p>
                    <p className="text-xs text-ink-muted">
                      {product.totalQuantity} vendu{product.totalQuantity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-display text-sm text-ink">{formatPrice(product.totalRevenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}