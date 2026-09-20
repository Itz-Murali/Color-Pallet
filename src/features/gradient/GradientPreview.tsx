import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/Button'
import { CopyButton } from '@/components/CopyButton'
import { buildGradientCss, buildGradientValue } from '@/lib/gradient'
import type { GradientState } from '@/lib/gradient'
import { cn } from '@/utils/cn'

interface GradientPreviewProps {
  gradient: GradientState
  onReset: () => void
}

function describe(gradient: GradientState): string {
  const stops = `${gradient.stops.length} stops`
  if (gradient.type === 'linear') return `${stops}, ${Math.round(gradient.angle)}°`
  if (gradient.type === 'radial') return `${stops}, ${gradient.shape}, center ${Math.round(gradient.x)}% ${Math.round(gradient.y)}%`
  return `${stops}, from ${Math.round(gradient.angle)}°, center ${Math.round(gradient.x)}% ${Math.round(gradient.y)}%`
}

export function GradientPreview({ gradient, onReset }: GradientPreviewProps) {
  return (
    <section aria-label="Gradient preview" className="rounded-md border bg-panel p-2 lg:p-3">
      <div className={cn('swatch h-24 rounded sm:h-28 lg:h-72')}>
        <div
          role="img"
          aria-label={`${gradient.type} gradient preview`}
          className="absolute inset-0"
          style={{ backgroundImage: buildGradientValue(gradient) }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground capitalize">{gradient.type}</span> gradient, {describe(gradient)}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <Button size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
          <CopyButton variant="text" value={buildGradientCss(gradient)} label="CSS">
            Copy CSS
          </CopyButton>
        </div>
      </div>
    </section>
  )
}
