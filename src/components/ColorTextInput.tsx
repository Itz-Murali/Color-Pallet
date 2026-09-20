import { useState } from 'react'
import { parseColorInput } from '@/lib/color/parse'
import type { Rgba } from '@/types/color'
import { cn } from '@/utils/cn'

interface ColorTextInputProps {
  value: string
  onCommit: (rgba: Rgba) => void
  label: string
  placeholder?: string
  className?: string
}

export function ColorTextInput({ value, onCommit, label, placeholder, className }: ColorTextInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const invalid = draft !== null && draft.trim() !== '' && parseColorInput(draft) === null

  return (
    <input
      type="text"
      aria-label={label}
      aria-invalid={invalid || undefined}
      placeholder={placeholder}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      value={draft ?? value}
      onChange={(event) => {
        setDraft(event.target.value)
        const parsed = parseColorInput(event.target.value)
        if (parsed) onCommit(parsed.rgba)
      }}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={() => setDraft(null)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
      className={cn(
        'h-8 min-w-0 rounded-md border bg-background px-2 font-mono text-[13px]',
        invalid ? 'border-danger' : 'border-border-strong',
        className,
      )}
    />
  )
}
