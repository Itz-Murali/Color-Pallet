import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/Panel'
import { useColor } from '@/features/color/color-context'
import { useColorUrlSync } from '@/features/color/use-color-url-sync'
import { PaletteControls, PaletteResult } from '@/features/palette/PalettePanels'
import { DEFAULT_STEPS, PALETTE_TYPES, clampSteps, generatePalette, hexToRgba } from '@/lib/color'
import type { PaletteType } from '@/lib/color'
import { readSearchParams } from '@/utils/url'

function readType(): PaletteType {
  const requested = readSearchParams().get('type')
  return PALETTE_TYPES.find((option) => option.id === requested)?.id ?? 'analogous'
}

function readSteps(): number {
  const requested = Number(readSearchParams().get('steps'))
  return Number.isFinite(requested) && requested > 0 ? clampSteps(requested) : DEFAULT_STEPS
}

export default function PalettePage() {
  const { rgba, setRgba } = useColor()
  const [type, setType] = useState<PaletteType>(readType)
  const [steps, setSteps] = useState(readSteps)

  const info = PALETTE_TYPES.find((option) => option.id === type) ?? PALETTE_TYPES[0]
  useColorUrlSync({ type, steps: info.adjustable ? String(steps) : undefined })

  const colors = useMemo(() => generatePalette(rgba, type, steps), [rgba, type, steps])

  return (
    <>
      <PageHeader
        title="Palette generator"
        description="Generate palettes from a base color."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <div className="order-2 lg:order-none">
          <PaletteControls
            type={type}
            onTypeChange={setType}
            steps={steps}
            onStepsChange={(next) => setSteps(clampSteps(next))}
            info={info}
          />
        </div>
        <div className="order-1 lg:order-none">
          <PaletteResult
            colors={colors}
            onUseAsBase={(hex) => {
              const next = hexToRgba(hex)
              if (next) setRgba(next)
            }}
          />
        </div>
      </div>
    </>
  )
}
