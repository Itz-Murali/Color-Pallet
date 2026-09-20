import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { PageHeader, Panel } from '@/components/Panel'
import { Swatch } from '@/components/Swatch'
import { useColor } from '@/features/color/color-context'
import { ColorInputPanel, ContrastChecks, ContrastSummary } from '@/features/contrast/ContrastPanels'
import {
  contrastRatio,
  hexToRgba,
  hsvToRgb,
  rgbToHex,
  rgbaToHsva,
  roundRgb,
  suggestForeground,
} from '@/lib/color'
import type { Hsva } from '@/types/color'
import { readSearchParams, replaceSearchParams } from '@/utils/url'

interface Pair {
  foreground: Hsva
  background: Hsva
}

const WHITE: Hsva = { h: 0, s: 0, v: 100, a: 1 }
const BLACK: Hsva = { h: 0, s: 0, v: 0, a: 1 }
const AA_NORMAL = 4.5

const toRgb = (color: Hsva) => roundRgb(hsvToRgb(color))

function readInitialPair(fallbackBackground: Hsva): Pair {
  const params = readSearchParams()
  const read = (key: string): Hsva | null => {
    const rgba = hexToRgba(params.get(key) ?? '')
    return rgba ? rgbaToHsva({ ...rgba, a: 1 }) : null
  }
  const background = read('bg') ?? { ...fallbackBackground, a: 1 }
  const bestText =
    contrastRatio(toRgb(WHITE), toRgb(background)) >= contrastRatio(toRgb(BLACK), toRgb(background)) ? WHITE : BLACK
  return { background, foreground: read('fg') ?? bestText }
}

export default function ContrastPage() {
  const { hsva } = useColor()
  const [{ foreground, background }, setPair] = useState<Pair>(() => readInitialPair(hsva))

  const fgRgb = toRgb(foreground)
  const bgRgb = toRgb(background)
  const ratio = contrastRatio(fgRgb, bgRgb)

  const fgHex = rgbToHex(fgRgb)
  const bgHex = rgbToHex(bgRgb)

  useEffect(() => {
    replaceSearchParams({ fg: fgHex.slice(1), bg: bgHex.slice(1) })
  }, [fgHex, bgHex])

  const suggestion = ratio >= AA_NORMAL ? null : suggestForeground(fgRgb, bgRgb, AA_NORMAL)

  return (
    <>
      <PageHeader
        title="Contrast checker"
        description="Check WCAG contrast between two colors."
      />

      <div className="sticky top-12 z-10 -mx-4 border-b bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:p-0">
        <ContrastSummary
          foreground={foreground}
          background={background}
          ratio={ratio}
          onSwap={() => setPair((pair) => ({ foreground: pair.background, background: pair.foreground }))}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ColorInputPanel
          title="Foreground"
          value={foreground}
          onChange={(next) => setPair((pair) => ({ ...pair, foreground: next }))}
        />
        <ColorInputPanel
          title="Background"
          value={background}
          onChange={(next) => setPair((pair) => ({ ...pair, background: next }))}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <ContrastChecks ratio={ratio} />
        {suggestion ? (
          <Panel title="Suggestion">
            <div className="flex items-center gap-3 p-3">
              <Swatch color={rgbToHex(suggestion)} className="size-10 shrink-0 rounded" />
              <p className="min-w-0 flex-1 text-[13px]">
                Closest foreground that passes AA: <code className="font-mono">{rgbToHex(suggestion)}</code>
              </p>
              <Button
                size="sm"
                onClick={() =>
                  setPair((pair) => ({
                    ...pair,
                    foreground: rgbaToHsva({ ...suggestion, a: 1 }, pair.foreground.h),
                  }))
                }
              >
                Apply
              </Button>
            </div>
          </Panel>
        ) : null}
      </div>
    </>
  )
}
