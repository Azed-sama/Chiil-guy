import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Heart, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'À propos',
  description: "Découvre l'histoire et les valeurs de la boutique.",
}

const VALUES = [
  {
    icon: Sparkles,
    title: 'Sélection soignée',
    description: 'Chaque produit est choisi avec attention pour sa qualité et son style intemporel.',
  },
  {
    icon: Heart,
    title: 'Une relation de confiance',
    description: 'On échange directement avec toi sur WhatsApp pour un service personnalisé, pas un chatbot.',
  },
  {
    icon: ShieldCheck,
    title: 'Qualité garantie',
    description: 'Satisfait ou on trouve une solution ensemble — ta satisfaction est notre priorité.',
  },
]

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 85% 15%, rgb(var(--color-accent) / 0.35), transparent 55%), radial-gradient(circle at 10% 90%, rgb(var(--color-gold) / 0.18), transparent 45%)',
          }}
          aria-hidden="true"
        />
        <div className="container relative py-20 text-center">
          <p className="animate-fade-in-up font-mono text-xs uppercase tracking-[0.2em] text-gold">
            Notre histoire
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl animate-fade-in-up font-display text-4xl italic leading-tight balance text-paper [animation-delay:75ms]">
            Une boutique pensée pour durer, pas pour suivre les tendances.
          </h1>
        </div>
      </section>

      {/* NOTE : contenu de démonstration — à remplacer par la véritable histoire de la boutique */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl space-y-6 text-ink-muted">
          <p>
            Tout est parti d'une conviction simple : on peut proposer des produits de qualité, à des prix
            justes, sans intermédiaire compliqué. Depuis le début, chaque commande est traitée avec le même
            soin — de la sélection des produits jusqu'à l'échange final avec toi sur WhatsApp.
          </p>
          <p>
            Basée au Bénin, notre équipe met un point d'honneur à rester proche de sa clientèle. Pas de
            service client anonyme : quand tu commandes, tu parles directement à quelqu'un qui connaît ses
            produits.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-paper-muted">
        <div className="container py-20">
          <h2 className="text-center font-display text-3xl">Ce qui nous anime</h2>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <value.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-lg">{value.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20 text-center">
        <h2 className="font-display text-2xl">Une question avant de commander ?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          On est disponibles sur WhatsApp pour te conseiller sur le bon choix.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/contact">Nous contacter</Link>
        </Button>
      </section>
    </main>
  )
}