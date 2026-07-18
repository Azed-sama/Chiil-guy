import type { Metadata } from 'next'
import { CategoryForm } from '@/components/admin/category-form'

export const metadata: Metadata = { title: 'Nouvelle catégorie — Administration' }

export default function NewCategoryPage() {
  return (
    <main className="container max-w-xl py-8">
      <h1 className="font-display text-2xl">Nouvelle catégorie</h1>
      <p className="mt-1 text-sm text-ink-muted">Elle sera ajoutée en fin de liste, réorganisable ensuite.</p>

      <div className="mt-8">
        <CategoryForm mode="create" />
      </div>
    </main>
  )
}
