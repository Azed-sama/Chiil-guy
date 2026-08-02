'use client'

import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminEmptyStateProps {
  title: string
  description: string
  dashboardHref ? : string
}

function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 260 150" className="h-32 w-auto sm:h-36" role="img" aria-hidden="true">
      <circle cx="130" cy="75" r="62" fill="rgb(var(--color-accent) / 0.08)" />
      <rect
        x="80"
        y="82"
        width="100"
        height="52"
        rx="5"
        fill="none"
        stroke="rgb(var(--color-ink-muted) / 0.5)"
        strokeWidth="1.2"
      />
      <path
        d="M80 82 L130 58 L180 82"
        fill="none"
        stroke="rgb(var(--color-ink-muted) / 0.5)"
        strokeWidth="1.2"
      />
      <path
        d="M80 82 L130 106 L180 82"
        fill="none"
        stroke="rgb(var(--color-ink-muted) / 0.5)"
        strokeWidth="1.2"
      />
      <line
        x1="130"
        y1="58"
        x2="130"
        y2="106"
        stroke="rgb(var(--color-ink-muted) / 0.5)"
        strokeWidth="1.2"
      />
      <circle cx="105" cy="55" r="2.5" fill="rgb(var(--color-ink-muted) / 0.6)" />
      <circle cx="155" cy="55" r="2.5" fill="rgb(var(--color-ink-muted) / 0.6)" />
      <path
        d="M98 30 Q104 14 122 18"
        fill="none"
        stroke="rgb(var(--color-accent))"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      <path
        d="M162 34 Q158 16 138 20"
        fill="none"
        stroke="rgb(var(--color-accent))"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      <circle cx="124" cy="16" r="2.5" fill="rgb(var(--color-accent))" />
      <circle cx="137" cy="19" r="2.5" fill="rgb(var(--color-accent))" />
    </svg>
  )
}

export function AdminEmptyState({
  title,
  description,
  dashboardHref = '/admin',
}: AdminEmptyStateProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-paper-muted px-6 py-16 text-center sm:py-20">
      <EmptyStateIllustration />
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