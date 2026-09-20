import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { useId } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/Button'
import { NumberField } from '@/components/NumberField'
import { SegmentedControl } from '@/components/SegmentedControl'
import { RADIAL_EXTENTS } from '@/lib/gradient'
import type { GradientState, RadialExtent, RadialShape } from '@/lib/gradient'
import { cn } from '@/utils/cn'

type SetGradient = Dispatch<SetStateAction<GradientState>>

const NEUTRAL_TRACK = { '--range-bg': 'var(--border-strong)' } as CSSProperties

const DIRECTIONS = [
  { angle: 0, Icon: ArrowUp, label: 'Up, 0 degrees' },
  { angle: 45, Icon: ArrowUpRight, label: 'Up right, 45 degrees' },
  { angle: 90, Icon: ArrowRight, label: 'Right, 90 degrees' },
  { angle: 135, Icon: ArrowDownRight, label: 'Down right, 135 degrees' },
  { angle: 180, Icon: ArrowDown, label: 'Down, 180 degrees' },
  { angle: 225, Icon: ArrowDownLeft, label: 'Down left, 225 degrees' },
  { angle: 270, Icon: ArrowLeft, label: 'Left, 270 degrees' },
  { angle: 315, Icon: ArrowUpLeft, label: 'Up left, 315 degrees' },
] as const

const SHAPES: ReadonlyArray<{ value: RadialShape; label: string }> = [
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
]

export function GradientControls({ gradient, setGradient }: { gradient: GradientState; setGradient: SetGradient }) {
  const extentId = useId()

  if (gradient.type === 'linear') {
    return (
      <div className="space-y-3">
        <AngleControl
          label="Angle"
          value={gradient.angle}
          onChange={(angle) => setGradient((prev) => ({ ...prev, angle }))}
        />
        <div role="group" aria-label="Direction presets" className="flex flex-wrap gap-1">
          {DIRECTIONS.map(({ angle, Icon, label }) => (
            <Button
              key={angle}
              size="icon-sm"
              aria-label={label}
              aria-pressed={Math.round(gradient.angle) === angle}
              className={cn(Math.round(gradient.angle) === angle && 'border-foreground')}
              onClick={() => setGradient((prev) => ({ ...prev, angle }))}
            >
              <Icon className="size-3.5" aria-hidden />
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (gradient.type === 'radial') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Shape</p>
            <SegmentedControl
              label="Radial shape"
              options={SHAPES}
              value={gradient.shape}
              onChange={(shape) => setGradient((prev) => ({ ...prev, shape }))}
            />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={extentId} className="mb-1 block text-xs text-muted-foreground">
              Size
            </label>
            <select
              id={extentId}
              value={gradient.extent}
              onChange={(event) => setGradient((prev) => ({ ...prev, extent: event.target.value as RadialExtent }))}
              className="h-8 w-full rounded-md border border-border-strong bg-background px-2 text-[13px]"
            >
              {RADIAL_EXTENTS.map((extent) => (
                <option key={extent} value={extent}>
                  {extent}
                </option>
              ))}
            </select>
          </div>
        </div>
        <PositionControl gradient={gradient} setGradient={setGradient} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AngleControl
        label="Start angle"
        value={gradient.angle}
        onChange={(angle) => setGradient((prev) => ({ ...prev, angle }))}
      />
      <PositionControl gradient={gradient} setGradient={setGradient} />
    </div>
  )
}

function AngleControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-end gap-3">
      <NumberField label={`${label} (°)`} value={value} min={0} max={360} onChange={onChange} className="w-20 shrink-0" />
      <div className="min-w-0 flex-1 pb-2">
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(value)}
          aria-label={`${label} slider`}
          aria-valuetext={`${Math.round(value)} degrees`}
          onChange={(event) => onChange(Number(event.target.value))}
          className="range"
          style={NEUTRAL_TRACK}
        />
      </div>
    </div>
  )
}

const ANCHORS = [0, 50, 100] as const

function PositionControl({ gradient, setGradient }: { gradient: GradientState; setGradient: SetGradient }) {
  return (
    <div className="flex items-end gap-3">
      <div role="group" aria-label="Center presets" className="grid shrink-0 grid-cols-3 gap-1 rounded-md border p-1">
        {ANCHORS.map((y) =>
          ANCHORS.map((x) => {
            const active = gradient.x === x && gradient.y === y
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                aria-label={`Center at ${x}% ${y}%`}
                aria-pressed={active}
                onClick={() => setGradient((prev) => ({ ...prev, x, y }))}
                className={cn(
                  'size-5 rounded-sm border transition-colors',
                  active ? 'border-foreground bg-foreground' : 'border-border-strong bg-muted hover:bg-border-strong',
                )}
              />
            )
          }),
        )}
      </div>
      <NumberField
        label="Center X (%)"
        value={gradient.x}
        min={0}
        max={100}
        onChange={(x) => setGradient((prev) => ({ ...prev, x }))}
        className="w-20"
      />
      <NumberField
        label="Center Y (%)"
        value={gradient.y}
        min={0}
        max={100}
        onChange={(y) => setGradient((prev) => ({ ...prev, y }))}
        className="w-20"
      />
    </div>
  )
}
