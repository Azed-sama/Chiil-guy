import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data/settings'
import { SettingsForm } from '@/components/admin/settings-form'

export const metadata: Metadata = { title: 'Paramètres — Administration' }

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <main className="container max-w-2xl py-8">
      <h1 className="font-display text-2xl">Paramètres</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Ces informations sont utilisées sur tout le site (en-tête, pied de page, contact, commandes).
      </p>

      <div className="mt-8">
        <SettingsForm
          defaultValues={{
            storeName: settings.storeName,
            storeDescription: settings.storeDescription ?? '',
            contactEmail: settings.contactEmail ?? '',
            whatsappNumber: settings.whatsappNumber,
          }}
        />
      </div>
    </main>
  )
}
