export function SiteFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center gap-4 py-10 text-sm text-ink-muted sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {storeName}. Tous droits réservés.
        </p>
        <nav className="flex flex-wrap justify-center gap-6" aria-label="Liens du pied de page">
          <a href="/a-propos" className="hover:text-ink">
            À propos
          </a>
          <a href="/contact" className="hover:text-ink">
            Contact
          </a>
          {/* Pages légales — à créer ultérieurement */}
          <a href="#" className="hover:text-ink">
            Mentions légales
          </a>
          <a href="#" className="hover:text-ink">
            CGV
          </a>
        </nav>
      </div>
    </footer>
  )
}
