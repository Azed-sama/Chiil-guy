import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-muted px-6 py-12">
      <Link href="/" className="mb-8 font-display text-xl italic text-ink">
        Nom de la boutique
      </Link>
      <div className="w-full max-w-sm animate-fade-in rounded-lg border border-border bg-paper p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
