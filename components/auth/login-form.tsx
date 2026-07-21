'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { signIn } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/produits'
  const [serverError, setServerError] = useState < string | null > (null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm < LoginInput > ({ resolver: zodResolver(loginSchema) })
  
  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const result = await signIn(data)
    
    if (!result.success) {
      setServerError(result.error)
      return
    }
    
    router.push(redirectTo)
    router.refresh()
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link href="/mot-de-passe-oublie" className="text-sm text-accent hover:underline">
            Oublié ?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      <AnimatePresence initial={false}>
        {serverError && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-2 overflow-hidden rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Se connecter
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="text-accent hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}