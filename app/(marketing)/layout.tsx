import { getCartSummary } from '@/lib/data/cart'
import { getSiteSettings } from '@/lib/data/settings'
import { getCurrentUser } from '@/lib/data/auth'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PageTransition } from '@/components/layout/page-transition'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [{ user, isAdmin }, { count: cartCount }, settings] = await Promise.all([
    getCurrentUser(),
    getCartSummary(),
    getSiteSettings(),
  ])
  
  return (
    <>
      <SiteHeader
        isAuthenticated={!!user}
        isAdmin={isAdmin}
        cartCount={cartCount}
        storeName={settings.storeName}
      />
      <PageTransition>{children}</PageTransition>
      <SiteFooter
        storeName={settings.storeName}
        storeDescription={settings.storeDescription}
        whatsappNumber={settings.whatsappNumber}
      />
    </>
  )
}