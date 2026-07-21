import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ImageOff, MessageCircle, Sparkles, Truck } from 'lucide-react'
import { getFeaturedProducts } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { getSiteSettings } from '@/lib/data/settings'
import { getCurrentUser } from '@/lib/data/auth'
import { ProductGrid } from '@/components/shop/product-grid'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/layout/reveal'

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
      <section className="relative overflow-hidden bg-ink">
        {/* Dégradé signature, cohérent avec la page de connexion */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 15% 20%, rgb(var(--color-accent) / 0.4), transparent 55%), radial-gradient(circle at 90% 85%, rgb(var(--color-gold) / 0.2), transparent 45%)',
          }}
          aria-hidden="true"
        />

        {/* Motif géométrique discret, en léger flottement */}
        <svg
          className="absolute -right-32 -top-32 h-[36rem] w-[36rem] animate-float opacity-[0.06] sm:-right-20 sm:-top-20"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="199" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="200" r="80" stroke="white" strokeWidth="1" />
        </svg>

        <div className="container relative flex flex-col items-center gap-7 py-28 text-center sm:py-36">
          <p className="animate-fade-in-up font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Nouvelle collection
          </p>
          <h1 className="max-w-3xl animate-fade-in-up font-display text-6xl italic leading-[1.02] balance text-paper [animation-delay:75ms] sm:text-7xl">
            Des essentiels pensés pour durer.
          </h1>
          <p className="max-w-md animate-fade-in-up text-paper/70 [animation-delay:150ms]">
            Une sélection soignée, livrée où que tu sois. Commande en quelques clics, on s'occupe du
            reste.
          </p>
          <div className="flex animate-fade-in-up flex-col gap-3 [animation-delay:225ms] sm:flex-row">
            <Button asChild size="lg">
              <Link href="/produits">
                <span className="flex items-center gap-2">
                  Découvrir la collection
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-paper/25 bg-transparent text-paper hover:bg-paper/10"
            >
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Discuter sur WhatsApp
                </span>
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="container py-20">
          <Reveal className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl">Parcourir par catégorie</h2>
            <Link href="/produits" className="text-sm text-accent hover:underline">
              Tout voir
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {categories.slice(0, 4).map((category, i) => (
              <Reveal key={category.id} delay={i * 0.05}>
                <Link
                  href={`/produits?categorie=${category.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-premium-lg"
                >
                  <div className="relative aspect-square bg-paper-muted">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="(min-width: 640px) 25vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-muted">
                        <ImageOff className="h-6 w-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <p className="p-3.5 text-sm font-medium text-ink transition-colors group-hover:text-accent">
                    {category.name}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Produits en vedette */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-border bg-paper-muted">
          <div className="container py-20">
            <Reveal className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-3xl">Nos coups de cœur</h2>
              <Link href="/produits" className="text-sm text-accent hover:underline">
                Tout voir
              </Link>
            </Reveal>
            <ProductGrid products={featuredProducts} isAuthenticated={!!user} />
          </div>
        </section>
      )}

      {/* Réassurance */}
      <section className="container py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <Reveal className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-lg">Sélection soignée</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              Des produits choisis pour leur qualité, pas leur volume.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-lg">Suivi personnalisé</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              Chaque commande est finalisée directement avec toi sur WhatsApp.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Truck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-lg">Livraison flexible</h3>
            <p className="mt-1.5 text-sm text-ink-muted">On s'adapte à ta ville et à ton quartier.</p>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden border-t border-border bg-accent text-accent-foreground">
        <svg
          className="absolute -left-24 -bottom-24 h-96 w-96 animate-float opacity-[0.08]"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="199" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
        </svg>
        <div className="container relative flex flex-col items-center gap-5 py-20 text-center">
          <h2 className="font-display text-4xl">Prêt à découvrir la collection ?</h2>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-accent-foreground/30 bg-transparent text-accent-foreground hover:bg-accent-foreground/10"
          >
            <Link href="/produits">
              <span className="flex items-center gap-2">
                Voir tous les produits
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}