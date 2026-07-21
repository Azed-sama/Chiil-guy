import Link from 'next/link'

const EXPLORE_LINKS = [
  { href: '/produits', label: 'Catalogue' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

const LEGAL_LINKS = [
  // Pages légales — à créer ultérieurement
  { href: '#', label: 'Mentions légales' },
  { href: '#', label: 'CGV' },
  { href: '#', label: 'Confidentialité' },
]

export function SiteFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="border-t border-border bg-paper-muted/40">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="flex flex-col gap-3 lg:col-span-2 lg:pr-8">
          <Link href="/" className="flex items-baseline gap-1 font-display text-xl italic">
            {storeName}
            <span className="text-gold" aria-hidden="true">.</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
            Une sélection soignée, pensée pour durer. Livraison suivie et service client
            attentif, du premier clic à la réception.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">Explorer</h3>
          <nav className="flex flex-col gap-2.5" aria-label="Liens du pied de page">
            {EXPLORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">Légal</h3>
          <nav className="flex flex-col gap-2.5" aria-label="Liens légaux">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="w-fit text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center gap-2 py-6 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {storeName}. Tous droits réservés.
          </p>
          <p>Conçu avec soin.</p>
        </div>
      </div>
    </footer>
  )
}
