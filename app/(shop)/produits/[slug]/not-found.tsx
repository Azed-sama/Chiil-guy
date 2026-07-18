import Link from 'next/link'
import { PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProductNotFound() {
  return (
    <main className="container flex flex-col items-center gap-4 py-32 text-center">
      <PackageX className="h-10 w-10 text-ink-muted" aria-hidden="true" />
      <h1 className="font-display text-2xl">Ce produit n'existe pas ou n'est plus disponible</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Il a peut-être été retiré du catalogue ou l'adresse est incorrecte.
      </p>
      <Button asChild className="mt-2">
        <Link href="/produits">Retour au catalogue</Link>
      </Button>
    </main>
  )
}
