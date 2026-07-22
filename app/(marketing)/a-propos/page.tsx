import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Heart, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/layout/reveal'

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
      <section className="border-b border-border bg-paper-muted">
        <div className="container py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Notre histoire</p>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight balance">
            Une boutique pensée pour durer, pas pour suivre les tendances.
          </h1>
        </div>
      </section>

      {/* NOTE : contenu de démonstration — à remplacer par la véritable histoire de la boutique */}
      <section className="container py-16">
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
        <div className="container py-16">
          <h2 className="text-center font-display text-2xl">Ce qui nous anime</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.1} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg">{value.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{value.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 text-center">
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
