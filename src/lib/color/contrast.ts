import type { Rgb } from '@/types/color'
import { hslToRgb, rgbToHsl } from './convert'

export function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const s = channel / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

const THRESHOLDS = [3, 4.5, 7]

export function formatRatio(ratio: number): string {
  const rounded = Math.round(ratio * 100) / 100
  const crossed = THRESHOLDS.some((threshold) => rounded >= threshold && ratio < threshold)
  const shown = crossed ? Math.floor(ratio * 100) / 100 : rounded
  return `${shown.toFixed(2)}:1`
}

export interface ContrastCheck {
  id: string
  level: 'AA' | 'AAA'
  label: string
  threshold: number
  pass: boolean
}

const CHECKS = [
  { id: 'aa-normal', level: 'AA', label: 'Normal text', threshold: 4.5 },
  { id: 'aa-large', level: 'AA', label: 'Large text', threshold: 3 },
  { id: 'aa-ui', level: 'AA', label: 'UI components and graphics', threshold: 3 },
  { id: 'aaa-normal', level: 'AAA', label: 'Normal text', threshold: 7 },
  { id: 'aaa-large', level: 'AAA', label: 'Large text', threshold: 4.5 },
] as const

export function evaluateContrast(ratio: number): ContrastCheck[] {
  return CHECKS.map((check) => ({ ...check, pass: ratio >= check.threshold }))
}

export function suggestForeground(foreground: Rgb, background: Rgb, target: number): Rgb | null {
  const hsl = rgbToHsl(foreground)
  let best: Rgb | null = null
  let bestDistance = Infinity

  for (const direction of [-1, 1]) {
    for (let distance = 0; distance <= 100; distance += 0.5) {
      const lightness = hsl.l + direction * distance
      if (lightness < 0 || lightness > 100) break
      const raw = hslToRgb({ ...hsl, l: lightness })
      const candidate = { r: Math.round(raw.r), g: Math.round(raw.g), b: Math.round(raw.b) }
      if (contrastRatio(candidate, background) >= target) {
        if (distance < bestDistance) {
          best = candidate
          bestDistance = distance
        }
        break
      }
    }
  }
  return best
}
