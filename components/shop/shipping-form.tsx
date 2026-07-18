'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { shippingInfoSchema, type ShippingInfoInput } from '@/lib/validations/order'
import { createOrder } from '@/app/(shop)/commander/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'

export function ShippingForm() {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingInfoInput>({ resolver: zodResolver(shippingInfoSchema) })

  async function onSubmit(data: ShippingInfoInput) {
    setServerError(null)
    const result = await createOrder(data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(result.error)
      return
    }

    toast.success(`Commande ${result.orderReference} enregistrée !`)
    // Redirection vers WhatsApp pour finaliser les détails et le paiement
    window.location.href = result.whatsappUrl
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
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          {...register('fullName')}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
      </div>

      <div>
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Ex : 90123456"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          {...register('phone')}
        />
        <FieldError id="phone-error" message={errors.phone?.message} />
      </div>

      <div>
        <Label htmlFor="city">Ville / Quartier</Label>
        <Input
          id="city"
          type="text"
          placeholder="Ex : Cotonou, Akpakpa"
          aria-invalid={!!errors.city}
          aria-describedby={errors.city ? 'city-error' : undefined}
          {...register('city')}
        />
        <FieldError id="city-error" message={errors.city?.message} />
      </div>

      <div>
        <Label htmlFor="address">Adresse précise / repère</Label>
        <Input
          id="address"
          type="text"
          placeholder="Ex : Non loin du carrefour, maison bleue..."
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? 'address-error' : undefined}
          {...register('address')}
        />
        <FieldError id="address-error" message={errors.address?.message} />
      </div>

      <div>
        <Label htmlFor="notes">Note complémentaire (optionnel)</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Précisions sur la livraison, horaires..."
          {...register('notes')}
        />
      </div>

      {serverError && (
        <p role="alert" className="rounded bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Valider et continuer sur WhatsApp
      </Button>

      <p className="text-center text-xs text-ink-muted">
        Ta commande sera enregistrée, puis tu seras redirigé vers WhatsApp pour finaliser les détails avec
        nous.
      </p>
    </form>
  )
}
