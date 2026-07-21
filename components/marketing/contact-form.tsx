'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { contactFormSchema, type ContactFormInput } from '@/lib/validations/contact'
import { sendContactMessage } from '@/app/(marketing)/contact/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({ resolver: zodResolver(contactFormSchema) })

  async function onSubmit(data: ContactFormInput) {
    setServerError(null)
    const result = await sendContactMessage(data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(result.error)
      return
    }

    setSubmitted(true)
    reset()
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-paper-muted p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-accent" aria-hidden="true" />
        <p className="font-display text-lg">Message envoyé</p>
        <p className="text-sm text-ink-muted">
          Merci ! On te répond au plus vite. Pour une réponse plus rapide, tu peux aussi nous écrire
          directement sur WhatsApp.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Envoyer un autre message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FieldError id="name-error" message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="subject">Sujet (optionnel)</Label>
        <Input id="subject" type="text" {...register('subject')} />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} aria-invalid={!!errors.message} {...register('message')} />
        <FieldError id="message-error" message={errors.message?.message} />
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

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Envoyer le message
      </Button>
    </form>
  )
}
