import { CopyButton } from './CopyButton'

interface ValueRowProps {
  label: string
  value: string
}

export function ValueRow({ label, value }: ValueRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <dt className="w-11 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 truncate font-mono text-[13px]" title={value}>
        {value}
      </dd>
      <CopyButton value={value} label={label} />
    </div>
  )
}
