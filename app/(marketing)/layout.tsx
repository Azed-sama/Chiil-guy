import { createClient } from '@/lib/supabase/server'
import { getCartSummary } from '@/lib/data/cart'
import { getSiteSettings } from '@/lib/data/settings'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [
    {
      data: { user },
    },
    { count: cartCount },
    settings,
  ] = await Promise.all([supabase.auth.getUser(), getCartSummary(), getSiteSettings()])

  return (
    <>
      <SiteHeader isAuthenticated={!!user} cartCount={cartCount} storeName={settings.storeName} />
      {children}
      <SiteFooter storeName={settings.storeName} />
    </>
  )
}
