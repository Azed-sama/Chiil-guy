'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { updatePassword } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'

export function UpdatePasswordForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null)
    const result = await updatePassword(data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    toast.success('Mot de passe mis à jour avec succès.')
    router.push('/account')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="mb-1 font-display text-xl">Nouveau mot de passe</h1>
        <p className="text-sm text-ink-muted">Choisis un nouveau mot de passe pour ton compte.</p>
      </div>

      <div>
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          {...register('confirmPassword')}
        />
        <FieldError id="confirmPassword-error" message={errors.confirmPassword?.message} />
      </div>

      {serverError && (
        <p role="alert" className="rounded bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Mettre à jour le mot de passe
      </Button>
    </form>
  )
}
