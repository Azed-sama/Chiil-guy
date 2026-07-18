import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/data/admin/products'
import { getCategories } from '@/lib/data/categories'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = { title: 'Modifier le produit — Administration' }

interface EditProductPageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([getProductById(params.id), getCategories()])

  if (!product) {
    notFound()
  }

  return (
    <main className="container max-w-3xl py-8">
      <h1 className="font-display text-2xl">Modifier le produit</h1>
      <p className="mt-1 text-sm text-ink-muted">{product.name}</p>

      <div className="mt-8">
        <ProductForm
          mode="edit"
          categories={categories}
          productId={product.id}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            categoryId: product.categoryId,
            price: product.price,
            salePrice: product.salePrice,
            saleStartsAt: product.saleStartsAt,
            saleEndsAt: product.saleEndsAt,
            sku: product.sku,
            stockQuantity: product.stockQuantity,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
          }}
          defaultImages={product.images.map((img) => ({ url: img.url, altText: img.altText ?? '' }))}
        />
      </div>
    </main>
  )
}
