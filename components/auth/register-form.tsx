'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { CheckCircle2, MailCheck } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { signUp } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'

export function RegisterForm() {
  const [serverError, setServerError] = useState < string | null > (null)
  const [submittedEmail, setSubmittedEmail] = useState < string | null > (null)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm < RegisterInput > ({ resolver: zodResolver(registerSchema) })
  
  const password = watch('password') || ''
  
  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const result = await signUp(data)
    
    if (!result.success) {
      setServerError(result.error)
      return
    }
    
    // Confirmation email requise : on ne connecte pas l'utilisateur
    // immédiatement, on affiche une confirmation claire.
    setSubmittedEmail(data.email)
  }
  
  if (submittedEmail) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <MailCheck className="h-10 w-10 text-accent" aria-hidden="true" />
        <h1 className="font-display text-xl">Vérifie ta boîte mail</h1>
        <p className="text-sm text-ink-muted">
          Un email de confirmation a été envoyé à <strong className="text-ink">{submittedEmail}</strong>.
          Clique sur le lien qu'il contient pour activer ton compte.
        </p>
        <Link href="/connexion" className="text-sm text-accent hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }
  
  const criteria = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Une minuscule', met: /[a-z]/.test(password) },
    { label: 'Un chiffre', met: /[0-9]/.test(password) },
  ]
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          {...register('fullName')}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
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

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby="password-criteria"
          {...register('password')}
        />
        <ul id="password-criteria" className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
          {criteria.map((c) => (
            <li
              key={c.label}
              className={`flex items-center gap-1.5 text-xs ${c.met ? 'text-success' : 'text-ink-muted'}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <PasswordInput
          id="confirmPassword"
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
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="text-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}