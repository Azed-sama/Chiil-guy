import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ImageOff, MessageCircle, Sparkles, Truck } from 'lucide-react'
import { getFeaturedProducts } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { getSiteSettings } from '@/lib/data/settings'
import { getCurrentUser } from '@/lib/data/auth'
import { ProductGrid } from '@/components/shop/product-grid'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const [featuredProducts, categories, settings, { user }] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getSiteSettings(),
    getCurrentUser(),
  ])
  
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="container flex flex-col items-center gap-6 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Nouvelle collection</p>
          <h1 className="max-w-2xl font-display text-5xl italic leading-[1.05] balance sm:text-6xl">
            Des essentiels pensés pour durer.
          </h1>
          <p className="max-w-md text-ink-muted">
            Une sélection soignée, livrée où que tu sois. Commande en quelques clics, on s'occupe du reste.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/produits">
                Découvrir la collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Discuter sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl">Parcourir par catégorie</h2>
            <Link href="/produits" className="text-sm text-accent hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/produits?categorie=${category.slug}`}
                className="group overflow-hidden rounded-lg border border-border"
              >
                <div className="relative aspect-square bg-paper-muted">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-muted">
                      <ImageOff className="h-6 w-6" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <p className="p-3 text-sm font-medium text-ink">{category.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits en vedette */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-border bg-paper-muted">
          <div className="container py-16">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-2xl">Nos coups de cœur</h2>
              <Link href="/produits" className="text-sm text-accent hover:underline">
                Tout voir
              </Link>
            </div>
            <ProductGrid products={featuredProducts} isAuthenticated={!!user} />
          </div>
        </section>
      )}

      {/* Réassurance */}
      <section className="container py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-base">Sélection soignée</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Des produits choisis pour leur qualité, pas leur volume.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-base">Suivi personnalisé</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Chaque commande est finalisée directement avec toi sur WhatsApp.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-base">Livraison flexible</h3>
            <p className="mt-1 text-sm text-ink-muted">On s'adapte à ta ville et à ton quartier.</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-accent text-accent-foreground">
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="font-display text-3xl">Prêt à découvrir la collection ?</h2>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-accent-foreground/30 bg-transparent text-accent-foreground hover:bg-accent-foreground/10"
          >
            <Link href="/produits">
              Voir tous les produits
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}