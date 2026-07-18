import type { Metadata } from 'next'
import { getMyProfile } from '@/lib/data/account'
import { ProfileForm } from '@/components/account/profile-form'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export const metadata: Metadata = { title: 'Mon profil' }

export default async function AccountProfilePage() {
  const profile = await getMyProfile()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl">Mon profil</h1>
        <p className="mt-1 text-sm text-ink-muted">{profile?.email}</p>
      </div>

      <section className="max-w-md">
        <h2 className="mb-4 font-display text-lg">Informations personnelles</h2>
        <ProfileForm defaultValues={{ fullName: profile?.fullName ?? '', phone: profile?.phone ?? '' }} />
      </section>

      <section className="max-w-md border-t border-border pt-8">
        <h2 className="mb-4 font-display text-lg">Mot de passe</h2>
        <UpdatePasswordForm />
      </section>
    </div>
  )
}
