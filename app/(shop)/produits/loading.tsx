export default function CatalogLoading() {
  return (
    <main>
      <section className="border-b border-border bg-paper-muted">
        <div className="container py-12">
          <div className="h-3 w-20 animate-pulse rounded bg-border" />
          <div className="mt-3 h-10 w-64 animate-pulse rounded bg-border" />
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-10 py-10 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <div className="h-96 animate-pulse rounded-lg bg-paper-muted" />
        </aside>

        <div>
          <div className="mb-6 h-4 w-24 animate-pulse rounded bg-border" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border">
                <div className="aspect-square animate-pulse bg-paper-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-16 animate-pulse rounded bg-border" />
                  <div className="h-4 w-full animate-pulse rounded bg-border" />
                  <div className="h-5 w-20 animate-pulse rounded bg-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
