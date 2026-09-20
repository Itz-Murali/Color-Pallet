import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeMode } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

const OPTIONS = [
  { mode: 'light', label: 'Light theme', Icon: Sun },
  { mode: 'dark', label: 'Dark theme', Icon: Moon },
  { mode: 'system', label: 'System theme', Icon: Monitor },
] as const satisfies ReadonlyArray<{ mode: ThemeMode; label: string; Icon: unknown }>

export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  return (
    <div role="group" aria-label="Theme" className="inline-flex rounded-md border bg-muted p-0.5">
      {OPTIONS.map(({ mode: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          aria-label={label}
          title={label}
          onClick={() => setMode(option)}
          className={cn(
            'inline-flex size-6 items-center justify-center rounded border transition-colors',
            mode === option
              ? 'border-border-strong bg-panel text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </button>
      ))}
    </div>
  )
}
