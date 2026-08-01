'use client'

import { useState } from 'react'
import { Download, Loader2, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AdminOrderDetail } from '@/lib/data/admin/orders'

interface ReceiptEditableInfo {
  customerName: string
  contactPhone: string
  shippingAddressText: string
}

function shippingAddressToText(address: unknown): string {
  if (!address || typeof address !== 'object') return ''
  const a = address as Record<string, unknown>
  const parts = [a.street, a.city, a.region, a.country].filter(
    (part): part is string => typeof part === 'string' && part.length > 0
  )
  return parts.join(', ')
}

export function ExportReceiptButton({ order }: { order: AdminOrderDetail }) {
  const [step, setStep] = useState<'closed' | 'choice' | 'edit'>('closed')
  const [isGenerating, setIsGenerating] = useState(false)
  const [info, setInfo] = useState<ReceiptEditableInfo>({
    customerName: order.customerName,
    contactPhone: order.contactPhone ?? '',
    shippingAddressText: shippingAddressToText(order.shippingAddress),
  })

  async function generatePdf(overrides: ReceiptEditableInfo) {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides),
      })

      if (!response.ok) throw new Error('Échec de la génération du reçu')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recu-${order.id.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setStep('closed')
    } catch {
      alert("Le reçu n'a pas pu être généré. Réessaie dans un instant.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button onClick={() => setStep('choice')} variant="outline" className="gap-2">
        <Download className="h-4 w-4" aria-hidden="true" />
        Exporter en PDF
      </Button>

      {step === 'choice' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl bg-paper p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg">Exporter le reçu</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Les informations du client sont-elles correctes ?
                </p>
              </div>
              <button
                onClick={() => setStep('closed')}
                className="text-ink-muted hover:text-ink"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <Button
                onClick={() => generatePdf(info)}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Confirmer et télécharger
              </Button>
              <Button
                onClick={() => setStep('edit')}
                disabled={isGenerating}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Modifier avant export
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl bg-paper p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg">Vérifier les informations</h2>
              <button
                onClick={() => setStep('closed')}
                className="text-ink-muted hover:text-ink"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                generatePdf(info)
              }}
              className="mt-4 flex flex-col gap-3.5"
            >
              <div>
                <label htmlFor="customerName" className="text-xs font-medium text-ink-muted">
                  Nom du client
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={info.customerName}
                  onChange={(e) => setInfo((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="text-xs font-medium text-ink-muted">
                  Téléphone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={info.contactPhone}
                  onChange={(e) => setInfo((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="shippingAddressText" className="text-xs font-medium text-ink-muted">
                  Adresse de livraison
                </label>
                <textarea
                  id="shippingAddressText"
                  value={info.shippingAddressText}
                  onChange={(e) =>
                    setInfo((prev) => ({ ...prev, shippingAddressText: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>

              <Button type="submit" disabled={isGenerating} size="lg" className="mt-1.5 gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Télécharger le reçu
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}