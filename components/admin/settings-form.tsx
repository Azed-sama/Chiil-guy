'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings'
import { updateSettings } from '@/app/actions/admin-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'

export function SettingsForm({ defaultValues }: { defaultValues: SettingsInput }) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues })

  async function onSubmit(data: SettingsInput) {
    setServerError(null)
    const result = await updateSettings(data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(result.error)
      return
    }

    toast.success('Paramètres mis à jour.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-5">
      <div>
        <Label htmlFor="storeName">Nom de la boutique</Label>
        <Input id="storeName" type="text" aria-invalid={!!errors.storeName} {...register('storeName')} />
        <FieldError id="storeName-error" message={errors.storeName?.message} />
      </div>

      <div>
        <Label htmlFor="storeDescription">Description courte (optionnel)</Label>
        <Textarea
          id="storeDescription"
          rows={3}
          placeholder="Utilisée pour le référencement (SEO) et les partages sur les réseaux"
          {...register('storeDescription')}
        />
        <FieldError id="storeDescription-error" message={errors.storeDescription?.message} />
      </div>

      <div>
        <Label htmlFor="contactEmail">Email de contact (optionnel)</Label>
        <Input
          id="contactEmail"
          type="email"
          aria-invalid={!!errors.contactEmail}
          {...register('contactEmail')}
        />
        <FieldError id="contactEmail-error" message={errors.contactEmail?.message} />
      </div>

      <div>
        <Label htmlFor="whatsappNumber">Numéro WhatsApp</Label>
        <Input
          id="whatsappNumber"
          type="text"
          placeholder="22912345678"
          aria-invalid={!!errors.whatsappNumber}
          {...register('whatsappNumber')}
        />
        <FieldError id="whatsappNumber-error" message={errors.whatsappNumber?.message} />
        <p className="mt-1.5 text-xs text-ink-muted">
          Format international, sans « + » ni espaces (ex : 22912345678 pour le Bénin).
        </p>
      </div>

      {serverError && (
        <p role="alert" className="rounded bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Enregistrer
      </Button>
    </form>
  )
}
