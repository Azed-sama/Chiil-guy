import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fusionne des classes Tailwind en résolvant les conflits
 * (ex: "px-2" + "px-4" -> "px-4"). Utilisé dans tous les composants UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un montant en Franc CFA (XOF), format français.
 * XOF n'a pas de sous-unité (pas de centimes) : Intl gère ça
 * automatiquement (0 décimale affichée).
 */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    currencyDisplay: 'code',
  })
    .format(amount)
    .replace('XOF', 'FCFA')
}

/**
 * Calcule le prix effectif d'un produit (tient compte d'une promotion
 * en cours, avec fenêtre de dates optionnelle). Miroir côté application
 * de la logique SQL de la vue `products_with_effective_price`.
 */
export function getEffectivePrice(product: {
  price: number
  sale_price: number | null
  sale_starts_at: string | null
  sale_ends_at: string | null
}) {
  const now = new Date()
  const startsOk = !product.sale_starts_at || now >= new Date(product.sale_starts_at)
  const endsOk = !product.sale_ends_at || now <= new Date(product.sale_ends_at)
  const isOnSale = product.sale_price != null && startsOk && endsOk

  return {
    price: isOnSale ? (product.sale_price as number) : product.price,
    originalPrice: product.price,
    isOnSale,
    discountPercent: isOnSale
      ? Math.round((1 - (product.sale_price as number) / product.price) * 100)
      : 0,
  }
}

/**
 * Transforme un texte en slug URL-friendly (minuscules, tirets, sans
 * accents). Utilisé pour générer automatiquement le slug produit
 * depuis son nom dans le formulaire admin.
 */
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Construit une URL en fusionnant les query params actuels avec des
 * surcharges, en retirant les clés vides. Utilisé pour tous les liens
 * de filtre/tri/pagination du catalogue (navigation sans JavaScript).
 */
export function buildHref(
  basePath: string,
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
  const params = new URLSearchParams()
  const merged = { ...current, ...overrides }

  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value)
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
