'use client'

import Link from 'next/link'
import { RefreshCw, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  dashboardHref?: string
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  dashboardHref = '/admin',
}: AdminEmptyStateProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-paper-muted px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      </div>
      <div className="mt-1 flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Actualiser
        </Button>
        <Button asChild>
          <Link href={dashboardHref}>Retour au tableau de bord</Link>
        </Button>
      </div>
    </div>
  )
}