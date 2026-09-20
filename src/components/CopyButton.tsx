import { Check, Copy } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCopy } from '@/hooks/useCopy'
import { cn } from '@/utils/cn'
import { Button } from './Button'

interface CopyButtonProps {
  value: string
  label: string
  variant?: 'icon' | 'text'
  children?: ReactNode
  className?: string
}

export function CopyButton({ value, label, variant = 'icon', children, className }: CopyButtonProps) {
  const { status, copy } = useCopy()
  const announcement = status === 'copied' ? `${label} copied` : status === 'error' ? `Could not copy ${label}` : ''

  if (variant === 'text') {
    return (
      <span className={cn('relative inline-flex', className)}>
        <Button size="sm" onClick={() => void copy(value)}>
          {status === 'copied' ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed' : (children ?? 'Copy')}
        </Button>
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </span>
    )
  }

  return (
    <span className={cn('relative inline-flex', className)}>
      <Button variant="ghost" size="icon-sm" aria-label={`Copy ${label}`} onClick={() => void copy(value)}>
        {status === 'copied' ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      </Button>
      {status !== 'idle' && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-full z-20 mb-1 rounded bg-foreground px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-background"
        >
          {status === 'copied' ? 'Copied' : 'Copy failed'}
        </span>
      )}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </span>
  )
}
