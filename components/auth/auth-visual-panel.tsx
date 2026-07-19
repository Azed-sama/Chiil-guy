export function AuthVisualPanel({ storeName }: { storeName: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Dégradé signature : vert forêt profond -> noir, avec un halo doré discret */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgb(var(--color-accent) / 0.35), transparent 55%), radial-gradient(circle at 85% 80%, rgb(var(--color-gold) / 0.18), transparent 45%), rgb(var(--color-ink))',
        }}
        aria-hidden="true"
      />

      {/* Motif géométrique discret, en léger flottement */}
      <svg
        className="absolute -right-24 -top-24 h-[32rem] w-[32rem] animate-float opacity-[0.07]"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="200" cy="200" r="199" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="200" r="80" stroke="white" strokeWidth="1" />
      </svg>

      <div className="relative z-10 font-display text-2xl italic text-paper">{storeName}</div>

      <div className="relative z-10 max-w-sm animate-fade-in-left">
        <p className="font-display text-3xl italic leading-tight text-paper">
          Des essentiels pensés pour durer.
        </p>
        <p className="mt-4 text-sm text-paper/70">
          Une sélection soignée, livrée où que tu sois. Rejoins-nous pour suivre tes commandes et
          profiter d'un accompagnement personnalisé sur WhatsApp.
        </p>
      </div>
    </div>
  )
}