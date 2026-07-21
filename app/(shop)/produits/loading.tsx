import { Skeleton, ProductGridSkeleton } from '@/components/ui/skeleton'

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
          <ProductGridSkeleton />
        </div>
      </div>
    </main>
  )
}
