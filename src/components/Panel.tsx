import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PanelProps {
  title: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, actions, children, className }: PanelProps) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={cn('min-w-0 rounded-md border bg-panel', className)}>
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b px-3 py-1.5">
        <h2 id={headingId} className="text-[13px] font-medium">
          {title}
        </h2>
        {actions ? <div className="flex flex-wrap items-center gap-1.5">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-5">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
    </header>
  )
}
