import { getCurrentUser } from '@/lib/data/auth'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'

async function getAdminLabel() {
  const { user } = await getCurrentUser()
  if (!user) return { label: 'Administrateur', email: null }
  
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()
  
  return {
    label: profile?.full_name || 'Administrateur',
    email: user.email ?? null,
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { label, email } = await getAdminLabel()
  
  return (
    <div className="dark flex min-h-screen bg-paper text-ink">
      <AdminSidebar userLabel={label} userEmail={email} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav userLabel={label} userEmail={email} />

        <main className="flex-1 overflow-y-auto bg-paper">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}