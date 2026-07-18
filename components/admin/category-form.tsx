'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { categorySchema, type CategoryInput } from '@/lib/validations/category'
import { createCategory, updateCategory } from '@/app/actions/admin-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'
import { Switch } from '@/components/ui/switch'
import { CategoryImageUploader } from '@/components/admin/category-image-uploader'
import { slugify } from '@/lib/utils'

interface CategoryFormProps {
  mode: 'create' | 'edit'
  categoryId?: string
  defaultValues?: Partial<CategoryInput>
}

export function CategoryForm({ mode, categoryId, defaultValues }: CategoryFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [folderId] = useState(() => categoryId ?? crypto.randomUUID())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
      imageUrl: null,
      ...defaultValues,
    },
  })

  const isActive = watch('isActive')
  const imageUrl = watch('imageUrl')

  function handleNameBlur() {
    if (slugTouched) return
    const name = watch('name')
    if (name) setValue('slug', slugify(name))
  }

  async function onSubmit(data: CategoryInput) {
    setServerError(null)

    const result = mode === 'create' ? await createCategory(data) : await updateCategory(categoryId!, data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(result.error)
      return
    }

    toast.success(mode === 'create' ? 'Catégorie créée.' : 'Catégorie mise à jour.')
    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <Label htmlFor="name">Nom de la catégorie</Label>
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
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea id="description" rows={3} {...register('description')} />
      </div>

      <div>
        <Label>Image de la catégorie (optionnel)</Label>
        <CategoryImageUploader
          imageUrl={imageUrl ?? null}
          onChange={(url) => setValue('imageUrl', url)}
          folderId={folderId}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-ink">Catégorie active</p>
          <p className="text-xs text-ink-muted">Visible dans le catalogue et les filtres</p>
        </div>
        <Switch checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
      </div>

      {serverError && (
        <p role="alert" className="rounded bg-danger/10 px-3 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Créer la catégorie' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  )
}
