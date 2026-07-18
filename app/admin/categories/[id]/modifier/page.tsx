import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryByIdAdmin } from '@/lib/data/admin/categories'
import { CategoryForm } from '@/components/admin/category-form'

export const metadata: Metadata = { title: 'Modifier la catégorie — Administration' }

interface EditCategoryPageProps {
  params: { id: string }
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const category = await getCategoryByIdAdmin(params.id)

  if (!category) {
    notFound()
  }

  return (
    <main className="container max-w-xl py-8">
      <h1 className="font-display text-2xl">Modifier la catégorie</h1>
      <p className="mt-1 text-sm text-ink-muted">{category.name}</p>

      <div className="mt-8">
        <CategoryForm
          mode="edit"
          categoryId={category.id}
          defaultValues={{
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            imageUrl: category.image_url,
            isActive: category.is_active,
          }}
        />
      </div>
    </main>
  )
}
