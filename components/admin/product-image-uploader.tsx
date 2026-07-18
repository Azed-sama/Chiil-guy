'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  url: string
  altText: string
}

interface ProductImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  /** Dossier de rangement dans le bucket (id produit, ou id temporaire à la création) */
  folderId: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo
const BUCKET = 'product-images'

export function ProductImageUploader({ images, onChange, folderId }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return

    const supabase = createClient()
    setIsUploading(true)
    const uploaded: UploadedImage[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" n'est pas une image.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" dépasse 5 Mo.`)
        continue
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')
      const path = `${folderId}/${Date.now()}-${safeName}`

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        console.error('Upload error:', error.message)
        toast.error(`Échec de l'envoi de "${file.name}".`)
        continue
      }

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      uploaded.push({ url: publicUrlData.publicUrl, altText: '' })
    }

    setIsUploading(false)
    if (uploaded.length > 0) {
      onChange([...images, ...uploaded])
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
    // Le fichier reste dans le Storage (nettoyage périodique à prévoir
    // plus tard si le volume d'images orphelines devient significatif).
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= images.length) return
    const next = [...images]
    ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
    onChange(next)
  }

  function updateAltText(index: number, altText: string) {
    const next = [...images]
    next[index] = { ...next[index], altText }
    onChange(next)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-sm text-ink-muted transition-colors',
          'hover:border-accent hover:text-accent disabled:opacity-50'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Envoi en cours...
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Ajouter des images (5 Mo max chacune)
          </>
        )}
      </button>

      {images.length > 0 && (
        <ul className="mt-4 space-y-3">
          {images.map((image, index) => (
            <li key={image.url} className="flex items-center gap-3 rounded-lg border border-border p-2">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-paper-muted">
                <Image
                  src={image.url}
                  alt={image.altText || 'Image produit'}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={image.altText}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  placeholder="Texte alternatif (accessibilité)"
                  className="h-9 w-full rounded border border-border bg-paper px-2.5 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
                />
                {index === 0 && <p className="mt-1 text-[11px] text-accent">Image principale</p>}
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    aria-label="Déplacer vers la gauche"
                    className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Déplacer vers la droite"
                    className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="Retirer cette image"
                  className="flex h-7 items-center justify-center rounded border border-border text-danger transition-colors hover:bg-danger/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
