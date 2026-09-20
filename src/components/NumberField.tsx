import { useId, useState } from 'react'
import { clamp, round } from '@/lib/color/convert'
import { cn } from '@/utils/cn'

interface NumberFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  decimals?: number
  hideLabel?: boolean
  onChange: (value: number) => void
  className?: string
}

export function NumberField({ label, value, min, max, step = 1, decimals = 0, hideLabel = false, onChange, className }: NumberFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className={cn(hideLabel ? 'sr-only' : 'mb-1 block text-xs text-muted-foreground')}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(round(value, decimals))}
        onChange={(event) => {
          setDraft(event.target.value)
          const parsed = event.target.valueAsNumber
          if (Number.isFinite(parsed)) onChange(clamp(parsed, min, max))
        }}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={() => setDraft(null)}
        className="field-number h-8 w-full min-w-0 rounded-md border border-border-strong bg-background px-2 font-mono text-[13px] tabular-nums"
      />
    </div>
  )
}
