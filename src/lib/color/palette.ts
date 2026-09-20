import type { Rgb } from '@/types/color'
import { clamp, hslToRgb, mixRgba, normalizeHue, rgbToHex, rgbToHsl } from './convert'
import { formatRgb } from './format'

export type PaletteType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic'
  | 'shades'
  | 'tints'

export interface PaletteTypeInfo {
  id: PaletteType
  label: string
  description: string
  adjustable: boolean
}

export const PALETTE_TYPES: readonly PaletteTypeInfo[] = [
  { id: 'complementary', label: 'Complementary', description: 'Base and its opposite on the wheel', adjustable: false },
  { id: 'analogous', label: 'Analogous', description: 'Neighbours within 60° of the base', adjustable: false },
  { id: 'triadic', label: 'Triadic', description: 'Three hues 120° apart', adjustable: false },
  { id: 'split-complementary', label: 'Split complementary', description: 'Base plus the two hues beside its opposite', adjustable: false },
  { id: 'tetradic', label: 'Tetradic', description: 'Two complementary pairs (rectangle)', adjustable: false },
  { id: 'monochromatic', label: 'Monochromatic', description: 'One hue across a range of lightness', adjustable: true },
  { id: 'shades', label: 'Shades', description: 'Base mixed toward black', adjustable: true },
  { id: 'tints', label: 'Tints', description: 'Base mixed toward white', adjustable: true },
]

export interface PaletteColor {
  hex: string
  rgb: string
  label: string
}

export const MIN_STEPS = 3
export const MAX_STEPS = 12
export const DEFAULT_STEPS = 5

const HUE_OFFSETS: Partial<Record<PaletteType, readonly number[]>> = {
  complementary: [0, 180],
  analogous: [-60, -30, 0, 30, 60],
  triadic: [0, 120, 240],
  'split-complementary': [0, 150, 210],
  tetradic: [0, 60, 180, 240],
}

function toPaletteColor(rgb: Rgb, label: string): PaletteColor {
  const rounded = { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) }
  return { hex: rgbToHex(rounded), rgb: formatRgb(rounded), label }
}

function offsetLabel(offset: number): string {
  if (offset === 0) return 'Base'
  return `${offset > 0 ? '+' : '−'}${Math.abs(offset)}°`
}

export function clampSteps(steps: number): number {
  return clamp(Math.round(steps), MIN_STEPS, MAX_STEPS)
}

export function generatePalette(base: Rgb, type: PaletteType, steps = DEFAULT_STEPS): PaletteColor[] {
  const hsl = rgbToHsl(base)
  const count = clampSteps(steps)

  const offsets = HUE_OFFSETS[type]
  if (offsets) {
    return offsets.map((offset) =>
      toPaletteColor(hslToRgb({ ...hsl, h: normalizeHue(hsl.h + offset) }), offsetLabel(offset)),
    )
  }

  if (type === 'monochromatic') {
    const minLightness = 15
    const maxLightness = 90
    const step = (maxLightness - minLightness) / (count - 1)
    const anchor = Math.round((clamp(hsl.l, minLightness, maxLightness) - minLightness) / step)
    return Array.from({ length: count }, (_, index) => {
      const lightness = clamp(hsl.l + (index - anchor) * step, 4, 97)
      return toPaletteColor(
        hslToRgb({ ...hsl, l: lightness }),
        index === anchor ? 'Base' : `L ${Math.round(lightness)}%`,
      )
    })
  }

  const target = type === 'shades' ? { r: 0, g: 0, b: 0, a: 1 } : { r: 255, g: 255, b: 255, a: 1 }
  const from = { ...base, a: 1 }
  return Array.from({ length: count }, (_, index) => {
    const amount = index / count
    return toPaletteColor(mixRgba(from, target, amount), index === 0 ? 'Base' : `${Math.round(amount * 100)}%`)
  })
}

export type PaletteExportFormat = 'hex' | 'css' | 'json'

export const PALETTE_EXPORT_FORMATS: readonly { id: PaletteExportFormat; label: string }[] = [
  { id: 'hex', label: 'HEX list' },
  { id: 'css', label: 'CSS variables' },
  { id: 'json', label: 'JSON array' },
]

export function formatPalette(colors: readonly PaletteColor[], format: PaletteExportFormat): string {
  switch (format) {
    case 'hex':
      return colors.map((color) => color.hex).join('\n')
    case 'css':
      return `:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color.hex};`).join('\n')}\n}`
    case 'json':
      return JSON.stringify(
        colors.map((color) => color.hex),
        null,
        2,
      )
  }
}
