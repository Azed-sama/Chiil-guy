import type { Metadata } from 'next'
import { getCategories } from '@/lib/data/categories'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = { title: 'Nouveau produit — Administration' }

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <main className="container max-w-3xl py-8">
      <h1 className="font-display text-2xl">Nouveau produit</h1>
      <p className="mt-1 text-sm text-ink-muted">Remplis les informations puis enregistre pour le publier.</p>

      <div className="mt-8">
        <ProductForm mode="create" categories={categories} />
      </div>
    </main>
  )
}
