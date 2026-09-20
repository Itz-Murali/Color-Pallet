import type { Hsva } from '@/types/color'
import {
  clamp,
  hexToRgba,
  hsvaToRgba,
  mixRgba,
  normalizeHue,
  rgbaToHex,
  rgbaToHsva,
  round,
} from './color/convert'
import { formatCssColor } from './color/format'
import type { CssColorFormat } from './color/format'

export type GradientType = 'linear' | 'radial' | 'conic'
export type RadialShape = 'circle' | 'ellipse'
export type RadialExtent = 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'

export const GRADIENT_TYPES: readonly GradientType[] = ['linear', 'radial', 'conic']
export const RADIAL_SHAPES: readonly RadialShape[] = ['circle', 'ellipse']
export const RADIAL_EXTENTS: readonly RadialExtent[] = [
  'closest-side',
  'closest-corner',
  'farthest-side',
  'farthest-corner',
]

export const MIN_STOPS = 2
export const MAX_STOPS = 10

export interface GradientStop {
  id: string
  color: Hsva
  position: number
}

export interface GradientState {
  type: GradientType
  angle: number
  shape: RadialShape
  extent: RadialExtent
  x: number
  y: number
  stops: GradientStop[]
}

let stopCounter = 0
export function createStopId(): string {
  stopCounter += 1
  return `stop-${stopCounter}`
}

function stopFromHex(hex: string, position: number): GradientStop {
  const rgba = hexToRgba(hex)
  return {
    id: createStopId(),
    color: rgbaToHsva(rgba ?? { r: 0, g: 0, b: 0, a: 1 }),
    position,
  }
}

export function createDefaultGradient(): GradientState {
  return {
    type: 'linear',
    angle: 135,
    shape: 'circle',
    extent: 'farthest-corner',
    x: 50,
    y: 50,
    stops: [stopFromHex('#7C3AED', 0), stopFromHex('#06B6D4', 100)],
  }
}

export function sortStops(stops: readonly GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

export function addStop(stops: readonly GradientStop[]): GradientStop[] {
  if (stops.length >= MAX_STOPS) return [...stops]
  const sorted = sortStops(stops)
  let gapIndex = 0
  let widest = -1
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const gap = sorted[i + 1].position - sorted[i].position
    if (gap > widest) {
      widest = gap
      gapIndex = i
    }
  }
  const left = sorted[gapIndex]
  const right = sorted[gapIndex + 1] ?? left
  const mixed = mixRgba(hsvaToRgba(left.color), hsvaToRgba(right.color), 0.5)
  return [
    ...stops,
    {
      id: createStopId(),
      color: rgbaToHsva(mixed, left.color.h),
      position: round((left.position + right.position) / 2),
    },
  ]
}

export function removeStop(stops: readonly GradientStop[], id: string): GradientStop[] {
  if (stops.length <= MIN_STOPS) return [...stops]
  return stops.filter((stop) => stop.id !== id)
}

export function reverseStops(stops: readonly GradientStop[]): GradientStop[] {
  return stops.map((stop) => ({ ...stop, position: 100 - stop.position }))
}

const trim = (value: number) => String(round(value, 1))

function stopToCss(stop: GradientStop, format: CssColorFormat): string {
  const color = formatCssColor(hsvaToRgba(stop.color), format, stop.color.h)
  return `${color} ${trim(stop.position)}%`
}

function gradientHead(state: GradientState): string {
  const center = `${trim(state.x)}% ${trim(state.y)}%`
  switch (state.type) {
    case 'linear':
      return `${trim(state.angle)}deg`
    case 'radial':
      return `${state.shape} ${state.extent} at ${center}`
    case 'conic':
      return `from ${trim(state.angle)}deg at ${center}`
  }
}

export function buildGradientValue(
  state: GradientState,
  format: CssColorFormat = 'hex',
  multiline = false,
): string {
  const parts = [gradientHead(state), ...sortStops(state.stops).map((stop) => stopToCss(stop, format))]
  return multiline
    ? `${state.type}-gradient(\n  ${parts.join(',\n  ')}\n)`
    : `${state.type}-gradient(${parts.join(', ')})`
}

export function buildGradientCss(state: GradientState, format: CssColorFormat = 'hex'): string {
  return `background: ${buildGradientValue(state, format, true)};`
}

export function hasTransparency(state: GradientState): boolean {
  return state.stops.some((stop) => stop.color.a < 1)
}

export function serializeGradient(state: GradientState): Record<string, string | undefined> {
  const isRadial = state.type === 'radial'
  const isLinear = state.type === 'linear'
  return {
    type: state.type,
    angle: isRadial ? undefined : trim(state.angle),
    shape: isRadial ? state.shape : undefined,
    extent: isRadial ? state.extent : undefined,
    x: isLinear ? undefined : trim(state.x),
    y: isLinear ? undefined : trim(state.y),
    stops: state.stops
      .map((stop) => `${rgbaToHex(hsvaToRgba(stop.color)).slice(1)}@${trim(stop.position)}`)
      .join(','),
    colors: undefined,
  }
}

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback
}

function numberParam(value: string | null, fallback: number, min: number, max: number): number {
  if (value === null || value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback
}

export function parseGradientParams(params: URLSearchParams): GradientState | null {
  const raw = params.get('stops') ?? params.get('colors')
  if (!raw) return null

  const tokens = raw.split(',').filter(Boolean).slice(0, MAX_STOPS)
  const stops: GradientStop[] = []
  tokens.forEach((token, index) => {
    const [hex, position] = token.split('@')
    const rgba = hexToRgba(hex ?? '')
    if (!rgba) return
    const evenly = tokens.length > 1 ? (index / (tokens.length - 1)) * 100 : 0
    stops.push({
      id: createStopId(),
      color: rgbaToHsva(rgba),
      position: numberParam(position ?? null, evenly, 0, 100),
    })
  })
  if (stops.length < MIN_STOPS) return null

  const defaults = createDefaultGradient()
  return {
    type: pick(params.get('type'), GRADIENT_TYPES, defaults.type),
    angle: normalizeHue(numberParam(params.get('angle'), defaults.angle, -360, 720)),
    shape: pick(params.get('shape'), RADIAL_SHAPES, defaults.shape),
    extent: pick(params.get('extent'), RADIAL_EXTENTS, defaults.extent),
    x: numberParam(params.get('x'), defaults.x, 0, 100),
    y: numberParam(params.get('y'), defaults.y, 0, 100),
    stops,
  }
}
