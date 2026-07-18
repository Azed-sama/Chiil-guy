'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface CategoryImageUploaderProps {
  imageUrl: string | null
  onChange: (url: string | null) => void
  folderId: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo
const BUCKET = 'product-images'

export function CategoryImageUploader({ imageUrl, onChange, folderId }: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileSelected(file: File | undefined) {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Le fichier sélectionné n'est pas une image.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image trop lourde (5 Mo max).')
      return
    }

    const supabase = createClient()
    setIsUploading(true)

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')
    const path = `categories/${folderId}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    setIsUploading(false)

    if (error) {
      console.error('Upload error:', error.message)
      toast.error("Échec de l'envoi de l'image.")
      return
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    onChange(data.publicUrl)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />

      {imageUrl ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border bg-paper-muted">
          <Image src={imageUrl} alt="Image de la catégorie" fill sizes="128px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer l'image"
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-paper text-danger shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-xs text-ink-muted transition-colors',
            'hover:border-accent hover:text-accent disabled:opacity-50'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              Ajouter
            </>
          )}
        </button>
      )}
    </div>
  )
}
