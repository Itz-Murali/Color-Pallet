import { useId, useRef } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { clamp, hsvToRgb } from '@/lib/color/convert'
import type { Hsva } from '@/types/color'
import { cn } from '@/utils/cn'

const HUE_BACKGROUND =
  'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))'
const CHECKER = 'conic-gradient(#d4d4d8 25%, #ffffff 0 50%, #d4d4d8 0 75%, #ffffff 0) 0 0 / 10px 10px'

interface ColorPickerProps {
  value: Hsva
  onChange: (next: Hsva) => void
  showAlpha?: boolean
  areaClassName?: string
  label?: string
}

export function ColorPicker({ value, onChange, showAlpha = true, areaClassName = 'aspect-[5/3]', label = '' }: ColorPickerProps) {
  const hueId = useId()
  const alphaId = useId()
  const prefix = label ? `${label} ` : ''
  const rgb = hsvToRgb(value)
  const solid = `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)})`
  const alphaBackground = `linear-gradient(to right, rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)} / 0), ${solid}), ${CHECKER}`

  return (
    <div className="space-y-3">
      <SaturationArea
        prefix={prefix}
        value={value}
        solid={solid}
        className={areaClassName}
        onChange={(s, v) => onChange({ ...value, s, v })}
      />
      <SliderRow id={hueId} label="Hue" valueText={`${Math.round(value.h)}°`}>
        <input
          id={hueId}
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(value.h)}
          aria-label={`${prefix}Hue`}
          aria-valuetext={`${Math.round(value.h)} degrees`}
          onChange={(event) => onChange({ ...value, h: Number(event.target.value) })}
          className="range"
          style={{ '--range-bg': HUE_BACKGROUND } as CSSProperties}
        />
      </SliderRow>
      {showAlpha && (
        <SliderRow id={alphaId} label="Alpha" valueText={`${Math.round(value.a * 100)}%`}>
          <input
            id={alphaId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(value.a * 100)}
            aria-label={`${prefix}Alpha`}
            aria-valuetext={`${Math.round(value.a * 100)} percent`}
            onChange={(event) => onChange({ ...value, a: Number(event.target.value) / 100 })}
            className="range"
            style={{ '--range-bg': alphaBackground } as CSSProperties}
          />
        </SliderRow>
      )}
    </div>
  )
}

function SliderRow({
  id,
  label,
  valueText,
  children,
}: {
  id: string
  label: string
  valueText: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      {children}
      <span className="text-right font-mono text-xs tabular-nums">{valueText}</span>
    </div>
  )
}

interface SaturationAreaProps {
  prefix: string
  value: Hsva
  solid: string
  className: string
  onChange: (saturation: number, brightness: number) => void
}

function SaturationArea({ prefix, value, solid, className, onChange }: SaturationAreaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromPointer = (clientX: number, clientY: number) => {
    const element = ref.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const x = clamp((clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((clientY - rect.top) / rect.height, 0, 1)
    onChange(x * 100, (1 - y) * 100)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragging.current = true
    updateFromPointer(event.clientX, event.clientY)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) updateFromPointer(event.clientX, event.clientY)
  }

  const stopDragging = () => {
    dragging.current = false
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1
    let { s, v } = value
    switch (event.key) {
      case 'ArrowLeft':
        s -= step
        break
      case 'ArrowRight':
        s += step
        break
      case 'ArrowUp':
        v += step
        break
      case 'ArrowDown':
        v -= step
        break
      default:
        return
    }
    event.preventDefault()
    onChange(clamp(s, 0, 100), clamp(v, 0, 100))
  }

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={`${prefix}Saturation and brightness`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value.s)}
      aria-valuetext={`Saturation ${Math.round(value.s)}%, brightness ${Math.round(value.v)}%`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onKeyDown={onKeyDown}
      className={cn('relative w-full cursor-crosshair touch-none rounded-md select-none', className)}
      style={{
        backgroundImage: `linear-gradient(to top, #000000, rgb(0 0 0 / 0)), linear-gradient(to right, #ffffff, hsl(${value.h} 100% 50%))`,
        boxShadow: 'inset 0 0 0 1px var(--swatch-edge)',
      }}
    >
      <span className="handle" style={{ left: `${value.s}%`, top: `${100 - value.v}%`, backgroundColor: solid }} />
    </div>
  )
}
