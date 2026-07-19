import Link from 'next/link'
import { getSiteSettings } from '@/lib/data/settings'
import { AuthVisualPanel } from '@/components/auth/auth-visual-panel'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthVisualPanel storeName={settings.storeName} />

      <div
        className="relative flex flex-col items-center justify-center px-6 py-12 lg:px-16"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgb(var(--color-accent) / 0.08), transparent 55%)',
        }}
      >
        <Link
          href="/"
          className="mb-8 font-display text-xl italic text-ink lg:hidden"
        >
          {settings.storeName}
        </Link>
        <div className="w-full max-w-sm animate-fade-in-up rounded-lg border border-border bg-paper p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}