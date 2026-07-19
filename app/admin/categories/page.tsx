import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Plus, ImageOff, Pencil } from 'lucide-react'
import { getAllCategoriesAdmin } from '@/lib/data/admin/categories'
import { ReorderCategoryButtons } from '@/components/admin/reorder-category-buttons'
import { DeleteCategoryButton } from '@/components/admin/delete-category-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Catégories — Administration' }

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin()
  
  return (
    <main className="container max-w-3xl py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">Catégories</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/admin/categories/nouvelle">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter une catégorie
            </span>
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
          <ImageOff className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="text-sm text-ink-muted">Aucune catégorie pour le moment.</p>
          <Button asChild className="mt-2">
            <Link href="/admin/categories/nouvelle">Créer ta première catégorie</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <ReorderCategoryButtons
                categoryId={category.id}
                isFirst={index === 0}
                isLast={index === categories.length - 1}
              />

              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-paper-muted">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-muted">
                    <ImageOff className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{category.name}</p>
                <p className="text-xs text-ink-muted">
                  {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                </p>
                {!category.isActive && (
                  <div className="mt-1">
                    <Badge variant="neutral">Désactivée</Badge>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button asChild variant="ghost" size="icon" aria-label={`Modifier ${category.name}`}>
                  <Link href={`/admin/categories/${category.id}/modifier`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}