import Link from 'next/link'
import { getSiteSettings } from '@/lib/data/settings'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-muted px-6 py-12">
      <Link href="/" className="mb-8 font-display text-xl italic text-ink">
        {settings.storeName}
      </Link>
      <div className="w-full max-w-sm animate-fade-in rounded-lg border border-border bg-paper p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}