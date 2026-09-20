import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { ColorTextInput } from '@/components/ColorTextInput'
import { NumberField } from '@/components/NumberField'
import { SegmentedControl } from '@/components/SegmentedControl'
import { formatComponents, hslToRgb, rgbToHsl } from '@/lib/color'
import type { ComponentMode } from '@/lib/color'
import { useColor } from './color-context'

type Mode = 'hex' | ComponentMode

const MODES: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
  { value: 'hsv', label: 'HSV' },
]

export function FormatConverter() {
  const { hsva, rgba, hex, setHsva, setRgba } = useColor()
  const [mode, setMode] = useState<Mode>('hex')
  const hsl = rgbToHsl(rgba, hsva.h)

  const alpha = (
    <NumberField
      label="A"
      value={hsva.a}
      min={0}
      max={1}
      step={0.01}
      decimals={2}
      onChange={(a) => setHsva({ ...hsva, a })}
    />
  )

  return (
    <div className="space-y-3 border-t pt-3">
      <SegmentedControl label="Color format" options={MODES} value={mode} onChange={setMode} />

      {mode === 'hex' && (
        <div className="flex items-center gap-2">
          <ColorTextInput
            label="Hex value"
            placeholder="#7C3AED or any CSS color"
            value={hex}
            onCommit={setRgba}
            className="flex-1"
          />
          <CopyButton value={hex} label="HEX" />
        </div>
      )}

      {mode === 'rgb' && (
        <div className="grid grid-cols-4 gap-2">
          <NumberField label="R" value={rgba.r} min={0} max={255} onChange={(r) => setRgba({ ...rgba, r })} />
          <NumberField label="G" value={rgba.g} min={0} max={255} onChange={(g) => setRgba({ ...rgba, g })} />
          <NumberField label="B" value={rgba.b} min={0} max={255} onChange={(b) => setRgba({ ...rgba, b })} />
          {alpha}
        </div>
      )}

      {mode === 'hsl' && (
        <div className="grid grid-cols-4 gap-2">
          <NumberField label="H°" value={hsva.h} min={0} max={360} onChange={(h) => setHsva({ ...hsva, h })} />
          <NumberField
            label="S%"
            value={hsl.s}
            min={0}
            max={100}
            onChange={(s) => setRgba({ ...hslToRgb({ ...hsl, s }), a: hsva.a })}
          />
          <NumberField
            label="L%"
            value={hsl.l}
            min={0}
            max={100}
            onChange={(l) => setRgba({ ...hslToRgb({ ...hsl, l }), a: hsva.a })}
          />
          {alpha}
        </div>
      )}

      {mode === 'hsv' && (
        <div className="grid grid-cols-4 gap-2">
          <NumberField label="H°" value={hsva.h} min={0} max={360} onChange={(h) => setHsva({ ...hsva, h })} />
          <NumberField label="S%" value={hsva.s} min={0} max={100} onChange={(s) => setHsva({ ...hsva, s })} />
          <NumberField label="V%" value={hsva.v} min={0} max={100} onChange={(v) => setHsva({ ...hsva, v })} />
          {alpha}
        </div>
      )}

      {mode !== 'hex' && (
        <div className="flex items-center gap-2 rounded-md bg-muted py-1 pr-1 pl-2">
          <code className="min-w-0 flex-1 truncate font-mono text-[13px]">
            {formatComponents(mode, rgba, hsva.h)}
          </code>
          <CopyButton value={formatComponents(mode, rgba, hsva.h)} label={`${mode.toUpperCase()} values`} />
        </div>
      )}
    </div>
  )
}
