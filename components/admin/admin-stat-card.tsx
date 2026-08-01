import type { LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'accent' | 'gold' | 'danger' | 'neutral'
  delayMs?: number
}

const TONE_STYLES: Record<NonNullable<AdminStatCardProps['tone']>, string> = {
  accent: 'bg-accent/10 text-accent',
  gold: 'bg-gold/10 text-gold',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-ink-muted/10 text-ink-muted',
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = 'accent',
  delayMs = 0,
}: AdminStatCardProps) {
  return (
    <div
      className="animate-fade-in-up rounded-xl border border-border bg-paper-muted p-5 shadow-xs transition-shadow duration-200 hover:shadow-premium"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_STYLES[tone]}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
    </div>
  )
}