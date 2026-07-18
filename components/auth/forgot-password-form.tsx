'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { forgotPassword } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordInput) {
    await forgotPassword(data)
    // Toujours le même comportement, que l'email existe ou non.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <MailCheck className="h-10 w-10 text-accent" aria-hidden="true" />
        <h1 className="font-display text-xl">Vérifie ta boîte mail</h1>
        <p className="text-sm text-ink-muted">
          Si un compte existe avec cette adresse, tu recevras un lien pour réinitialiser ton mot de passe.
        </p>
        <Link href="/connexion" className="text-sm text-accent hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="mb-1 font-display text-xl">Mot de passe oublié</h1>
        <p className="text-sm text-ink-muted">
          Indique ton adresse email, on t'envoie un lien de réinitialisation.
        </p>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Envoyer le lien
      </Button>

      <p className="text-center text-sm text-ink-muted">
        <Link href="/connexion" className="text-accent hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
