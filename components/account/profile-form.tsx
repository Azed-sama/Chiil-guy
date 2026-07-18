'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { profileSchema, type ProfileInput } from '@/lib/validations/account'
import { updateProfile } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues })

  async function onSubmit(data: ProfileInput) {
    setServerError(null)
    const result = await updateProfile(data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(result.error)
      return
    }

    toast.success('Profil mis à jour.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          {...register('fullName')}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
      </div>

      <div>
        <Label htmlFor="phone">Téléphone (optionnel)</Label>
        <Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register('phone')} />
        <FieldError id="phone-error" message={errors.phone?.message} />
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
