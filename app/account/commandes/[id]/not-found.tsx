import Link from 'next/link'
import { PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <PackageX className="h-10 w-10 text-ink-muted" aria-hidden="true" />
      <h1 className="font-display text-xl">Commande introuvable</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Elle n'existe pas ou ne fait pas partie de tes commandes.
      </p>
      <Button asChild className="mt-2">
        <Link href="/account/commandes">Retour à mes commandes</Link>
      </Button>
    </div>
  )
}
