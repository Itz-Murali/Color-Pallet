import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { PageHeader, Panel } from '@/components/Panel'
import { SegmentedControl } from '@/components/SegmentedControl'
import { CssOutput } from '@/features/gradient/CssOutput'
import { GradientControls } from '@/features/gradient/GradientControls'
import { GradientPreview } from '@/features/gradient/GradientPreview'
import { StopEditor } from '@/features/gradient/StopEditor'
import type { CssColorFormat } from '@/lib/color'
import { GRADIENT_TYPES, createDefaultGradient, serializeGradient } from '@/lib/gradient'
import type { GradientState, GradientType } from '@/lib/gradient'
import { replaceSearchParams } from '@/utils/url'

const TYPE_OPTIONS = GRADIENT_TYPES.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}))

interface GradientPageProps {
  gradient: GradientState
  setGradient: Dispatch<SetStateAction<GradientState>>
}

export default function GradientPage({ gradient, setGradient }: GradientPageProps) {
  const [format, setFormat] = useState<CssColorFormat>('hex')
  const [activeId, setActiveId] = useState(gradient.stops[0].id)

  useEffect(() => {
    replaceSearchParams(serializeGradient(gradient))
  }, [gradient])

  const reset = () => {
    const fresh = createDefaultGradient()
    setGradient(fresh)
    setActiveId(fresh.stops[0].id)
  }

  return (
    <>
      <PageHeader
        title="Gradient generator"
        description="Build linear, radial and conic gradients and copy the CSS."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        {}
        <div className="contents lg:sticky lg:top-16 lg:block lg:space-y-4">
          <div className="sticky top-12 z-10 order-1 -mx-4 border-b bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:static lg:order-none lg:mx-0 lg:border-0 lg:p-0">
            <GradientPreview gradient={gradient} onReset={reset} />
          </div>
          <div className="order-3 lg:order-none">
            <CssOutput gradient={gradient} format={format} onFormatChange={setFormat} />
          </div>
        </div>

        <div className="order-2 lg:order-none">
          <Panel
            title="Gradient"
            actions={
              <SegmentedControl
                label="Gradient type"
                options={TYPE_OPTIONS}
                value={gradient.type}
                onChange={(type: GradientType) => setGradient((prev) => ({ ...prev, type }))}
              />
            }
          >
            <div className="space-y-5 p-3">
              <GradientControls gradient={gradient} setGradient={setGradient} />
              <div className="border-t pt-4">
                <StopEditor
                  gradient={gradient}
                  setGradient={setGradient}
                  activeId={activeId}
                  onActiveChange={setActiveId}
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
