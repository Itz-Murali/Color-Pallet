import { ArrowLeftRight, Minus, Plus } from 'lucide-react'
import { useRef } from 'react'
import type { Dispatch, KeyboardEvent, PointerEvent, SetStateAction } from 'react'
import { Button } from '@/components/Button'
import { ColorPicker } from '@/components/ColorPicker'
import { ColorTextInput } from '@/components/ColorTextInput'
import { NumberField } from '@/components/NumberField'
import { Swatch } from '@/components/Swatch'
import { clamp, hsvaToRgba, rgbaToHex, rgbaToHsva, round, toCssRgb } from '@/lib/color'
import { MAX_STOPS, MIN_STOPS, addStop, removeStop, reverseStops, sortStops } from '@/lib/gradient'
import type { GradientState, GradientStop } from '@/lib/gradient'
import type { Hsva } from '@/types/color'
import { cn } from '@/utils/cn'

interface StopEditorProps {
  gradient: GradientState
  setGradient: Dispatch<SetStateAction<GradientState>>
  activeId: string
  onActiveChange: (id: string) => void
}

const stopHex = (stop: GradientStop) => rgbaToHex(hsvaToRgba(stop.color))

export function StopEditor({ gradient, setGradient, activeId, onActiveChange }: StopEditorProps) {
  const { stops } = gradient
  const activeIndex = Math.max(0, stops.findIndex((stop) => stop.id === activeId))
  const activeStop = stops[activeIndex]

  const updateStop = (id: string, patch: Partial<Pick<GradientStop, 'color' | 'position'>>) =>
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)),
    }))

  const add = () => {
    const next = addStop(stops)
    const created = next.find((stop) => !stops.some((existing) => existing.id === stop.id))
    setGradient((prev) => ({ ...prev, stops: next }))
    if (created) onActiveChange(created.id)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-medium">Color stops</h3>
        <div className="flex gap-1.5">
          <Button size="sm" onClick={() => setGradient((prev) => ({ ...prev, stops: reverseStops(prev.stops) }))}>
            <ArrowLeftRight className="size-3.5" aria-hidden />
            Reverse
          </Button>
          <Button size="sm" onClick={add} disabled={stops.length >= MAX_STOPS}>
            <Plus className="size-3.5" aria-hidden />
            Add stop
          </Button>
        </div>
      </div>

      <StopBar
        stops={stops}
        activeId={activeStop.id}
        onSelect={onActiveChange}
        onMove={(id, position) => updateStop(id, { position })}
      />

      <ul className="space-y-1.5">
        {stops.map((stop, index) => {
          const active = stop.id === activeStop.id
          return (
            <li
              key={stop.id}
              onFocus={() => onActiveChange(stop.id)}
              className={cn('flex items-center gap-2 rounded-md border p-1.5', active && 'border-foreground')}
            >
              <button
                type="button"
                aria-pressed={active}
                aria-label={`Edit stop ${index + 1} color`}
                onClick={() => onActiveChange(stop.id)}
                className="shrink-0 rounded"
              >
                <Swatch color={toCssRgb(hsvaToRgba(stop.color))} className="size-7 rounded" />
              </button>
              <ColorTextInput
                label={`Stop ${index + 1} color`}
                value={stopHex(stop)}
                onCommit={(rgba) => updateStop(stop.id, { color: rgbaToHsva(rgba, stop.color.h) })}
                className="min-w-0 flex-1"
              />
              <NumberField
                hideLabel
                label={`Stop ${index + 1} position (%)`}
                value={stop.position}
                min={0}
                max={100}
                onChange={(position) => updateStop(stop.id, { position })}
                className="w-16 shrink-0"
              />
              <span className="text-xs text-muted-foreground" aria-hidden>
                %
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove stop ${index + 1}`}
                disabled={stops.length <= MIN_STOPS}
                onClick={() => {
                  setGradient((prev) => ({ ...prev, stops: removeStop(prev.stops, stop.id) }))
                  if (active) onActiveChange(stops[index === 0 ? 1 : 0].id)
                }}
              >
                <Minus className="size-3.5" aria-hidden />
              </Button>
            </li>
          )
        })}
      </ul>

      <div className="border-t pt-3">
        <p className="mb-2 text-xs text-muted-foreground">Editing stop {activeIndex + 1}</p>
        <ColorPicker
          label={`Stop ${activeIndex + 1}`}
          value={activeStop.color}
          areaClassName="aspect-[2/1]"
          onChange={(color: Hsva) => updateStop(activeStop.id, { color })}
        />
      </div>
    </div>
  )
}

interface StopBarProps {
  stops: readonly GradientStop[]
  activeId: string
  onSelect: (id: string) => void
  onMove: (id: string, position: number) => void
}

function StopBar({ stops, activeId, onSelect, onMove }: StopBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<string | null>(null)

  const barGradient = `linear-gradient(to right, ${sortStops(stops)
    .map((stop) => `${stopHex(stop)} ${round(stop.position, 1)}%`)
    .join(', ')})`

  const moveTo = (id: string, clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    if (rect.width === 0) return
    onMove(id, clamp(Math.round(((clientX - rect.left) / rect.width) * 100), 0, 100))
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>, id: string) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragging.current = id
    onSelect(id)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, stop: GradientStop) => {
    const step = event.shiftKey ? 10 : 1
    let next = stop.position
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next -= step
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next += step
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 100
    else return
    event.preventDefault()
    onMove(stop.id, clamp(next, 0, 100))
  }

  return (
    <div className="px-3">
      <div className="swatch h-6 rounded-md">
        <div className="absolute inset-0" style={{ backgroundImage: barGradient }} />
      </div>
      <div ref={trackRef} className="relative isolate h-7">
        {stops.map((stop, index) => {
          const active = stop.id === activeId
          return (
            <div
              key={stop.id}
              role="slider"
              tabIndex={0}
              aria-label={`Stop ${index + 1} position`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(stop.position)}
              aria-valuetext={`${stopHex(stop)} at ${Math.round(stop.position)}%`}
              onPointerDown={(event) => onPointerDown(event, stop.id)}
              onPointerMove={(event) => {
                if (dragging.current === stop.id) moveTo(stop.id, event.clientX)
              }}
              onPointerUp={() => {
                dragging.current = null
              }}
              onPointerCancel={() => {
                dragging.current = null
              }}
              onKeyDown={(event) => onKeyDown(event, stop)}
              className={cn(
                'absolute top-0.5 -ml-3 size-6 cursor-grab touch-none rounded-full active:cursor-grabbing',
                active ? 'z-10' : 'z-0',
              )}
              style={{ left: `${stop.position}%` }}
            >
              <span
                className={cn('swatch m-1 block size-4 rounded-full border-2 border-white', active && 'scale-125')}
                style={{ boxShadow: active ? '0 0 0 2px var(--foreground)' : '0 0 0 1px rgb(0 0 0 / 0.5)' }}
              >
                <span className="absolute inset-0" style={{ backgroundColor: toCssRgb(hsvaToRgba(stop.color)) }} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
