import type { ReactNode } from 'react'

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border-strong bg-muted px-1 font-mono text-[10px] leading-4 text-muted-foreground">
      {children}
    </kbd>
  )
}
