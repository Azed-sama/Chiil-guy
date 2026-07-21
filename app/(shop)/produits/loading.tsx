import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogLoading() {
  return (
    <main>
      <section className="border-b border-border bg-paper-muted">
        <div className="container py-12">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-10 w-64" />
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-10 py-10 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <Skeleton className="h-96 rounded-lg" />
        </aside>

        <div>
          <Skeleton className="mb-6 h-4 w-24" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border">
                <Skeleton className="aspect-square rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}