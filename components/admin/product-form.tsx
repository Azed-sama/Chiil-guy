'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { productSchema, type ProductInput } from '@/lib/validations/product'
import { createProduct, updateProduct, saveProductImages } from '@/app/actions/admin-products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'
import { Switch } from '@/components/ui/switch'
import { ProductImageUploader, type UploadedImage } from '@/components/admin/product-image-uploader'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types/supabase'

interface ProductFormProps {
  mode: 'create' | 'edit'
  categories: Category[]
  productId?: string
  defaultValues?: Partial<ProductInput>
  defaultImages?: UploadedImage[]
}

export function ProductForm({ mode, categories, productId, defaultValues, defaultImages }: ProductFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [images, setImages] = useState<UploadedImage[]>(defaultImages ?? [])
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [folderId] = useState(() => productId ?? crypto.randomUUID())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
      stockQuantity: 0,
      price: 0,
      ...defaultValues,
    },
  })

  const isFeatured = watch('isFeatured')
  const isActive = watch('isActive')

  function handleNameBlur() {
    if (slugTouched) return
    const name = watch('name')
    if (name) setValue('slug', slugify(name))
  }

  async function onSubmit(data: ProductInput) {
    setServerError(null)

    const result = mode === 'create' ? await createProduct(data) : await updateProduct(productId!, data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(result.error)
      return
    }

    const finalProductId = mode === 'create' ? result.data!.id : productId!

    const imagesResult = await saveProductImages(
      finalProductId,
      images.map((img) => ({ url: img.url, altText: img.altText }))
    )

    if (!imagesResult.success) {
      // Le produit est bien créé/modifié malgré tout : on informe sans bloquer.
      toast.error(imagesResult.error)
    }

    toast.success(mode === 'create' ? 'Produit créé.' : 'Produit mis à jour.')
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <section className="space-y-5">
        <h2 className="font-display text-lg">Informations générales</h2>

        <div>
          <Label htmlFor="name">Nom du produit</Label>
          <Input
            id="name"
            type="text"
            aria-invalid={!!errors.name}
            onBlur={handleNameBlur}
            {...register('name')}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="slug" className="mb-0">
              Slug (URL)
            </Label>
            <button
              type="button"
              className="text-xs text-accent underline-offset-4 hover:underline"
              onClick={() => {
                setSlugTouched(false)
                const name = watch('name')
                if (name) setValue('slug', slugify(name))
              }}
            >
              régénérer depuis le nom
            </button>
          </div>
          <Input
            id="slug"
            type="text"
            aria-invalid={!!errors.slug}
            {...register('slug', { onChange: () => setSlugTouched(true) })}
          />
          <FieldError id="slug-error" message={errors.slug?.message} />
        </div>

        <div>
          <Label htmlFor="categoryId">Catégorie</Label>
          <select
            id="categoryId"
            className="h-11 w-full rounded border border-border bg-paper px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
            {...register('categoryId')}
          >
            <option value="">Aucune catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={5} {...register('description')} />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg">Images</h2>
        <ProductImageUploader images={images} onChange={setImages} folderId={folderId} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg">Prix et stock</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Prix (FCFA)</Label>
            <Input id="price" type="number" min={0} step="1" aria-invalid={!!errors.price} {...register('price')} />
            <FieldError id="price-error" message={errors.price?.message} />
          </div>

          <div>
            <Label htmlFor="sku">Référence (SKU) — optionnel</Label>
            <Input id="sku" type="text" {...register('sku')} />
          </div>
        </div>

        <div>
          <Label htmlFor="stockQuantity">Quantité en stock</Label>
          <Input
            id="stockQuantity"
            type="number"
            min={0}
            step="1"
            aria-invalid={!!errors.stockQuantity}
            {...register('stockQuantity')}
          />
          <FieldError id="stockQuantity-error" message={errors.stockQuantity?.message} />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg">Promotion (optionnel)</h2>

        <div>
          <Label htmlFor="salePrice">Prix promotionnel (FCFA)</Label>
          <Input
            id="salePrice"
            type="number"
            min={0}
            step="1"
            aria-invalid={!!errors.salePrice}
            {...register('salePrice')}
          />
          <FieldError id="salePrice-error" message={errors.salePrice?.message} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="saleStartsAt">Début de la promo</Label>
            <Input id="saleStartsAt" type="datetime-local" {...register('saleStartsAt')} />
          </div>
          <div>
            <Label htmlFor="saleEndsAt">Fin de la promo</Label>
            <Input id="saleEndsAt" type="datetime-local" {...register('saleEndsAt')} />
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          Laisse ces champs vides pour une promo active dès l'enregistrement, sans date de fin.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg">Visibilité</h2>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-ink">Produit actif</p>
            <p className="text-xs text-ink-muted">Visible sur le site public</p>
          </div>
          <Switch checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-ink">Mettre en vedette</p>
            <p className="text-xs text-ink-muted">Affiché en priorité sur l'accueil et le catalogue</p>
          </div>
          <Switch checked={isFeatured} onCheckedChange={(v) => setValue('isFeatured', v)} />
        </div>
      </section>

      {serverError && (
        <p role="alert" className="rounded bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Créer le produit' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  )
}
