import type { Metadata } from 'next'
import { MessageCircle, Mail } from 'lucide-react'
import { ContactForm } from '@/components/marketing/contact-form'
import { getSiteSettings } from '@/lib/data/settings'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question ? Contacte-nous directement ou envoie-nous un message.',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}`

  return (
    <main>
      <section className="border-b border-border bg-paper-muted">
        <div className="container py-12">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Contact</p>
          <h1 className="mt-2 font-display text-4xl">On est là pour t'aider</h1>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-12 py-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl">Écris-nous</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Remplis le formulaire, on te répond généralement sous 24h.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6">
            <MessageCircle className="h-6 w-6 text-accent" aria-hidden="true" />
            <h3 className="mt-3 font-display text-lg">WhatsApp</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Le moyen le plus rapide de nous joindre pour une question urgente ou le suivi d'une commande.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Discuter sur WhatsApp →
            </a>
          </div>

          {settings.contactEmail && (
            <div className="rounded-lg border border-border p-6">
              <Mail className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg">Par email</h3>
              <p className="mt-1 text-sm text-ink-muted">Pour toute demande détaillée ou professionnelle.</p>
              <p className="mt-4 text-sm font-medium text-ink">{settings.contactEmail}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
