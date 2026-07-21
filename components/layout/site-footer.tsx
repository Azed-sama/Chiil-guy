import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

interface SiteFooterProps {
  storeName: string
  storeDescription ? : string
  whatsappNumber ? : string
}

const SHOP_LINKS = [
  { href: '/produits', label: 'Tous les produits' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Mon compte' },
  { href: '/account/commandes', label: 'Mes commandes' },
  { href: '/panier', label: 'Mon panier' },
]

export function SiteFooter({ storeName, storeDescription, whatsappNumber }: SiteFooterProps) {
  const year = new Date().getFullYear()
  
  return (
    <footer className="border-t border-border bg-paper-muted">
      <div className="container py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2">
            <p className="font-display text-lg italic">{storeName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              {storeDescription || 'Une sélection soignée, livrée où que tu sois.'}
            </p>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-ink"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Discuter sur WhatsApp
              </a>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Boutique</p>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Mon espace</p>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {storeName}. Tous droits réservés.
          </p>
          <p className="text-ink-muted/70">Site en cours de développement.</p>
        </div>
      </div>
    </footer>
  )
}