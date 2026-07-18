import { createClient } from '@/lib/supabase/server'
import { getCartSummary } from '@/lib/data/cart'
import { getSiteSettings } from '@/lib/data/settings'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { AccountNav } from '@/components/account/account-nav'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
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
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[14rem_1fr]">
          <AccountNav />
          <div>{children}</div>
        </div>
      </div>
      <SiteFooter storeName={settings.storeName} />
    </>
  )
}
