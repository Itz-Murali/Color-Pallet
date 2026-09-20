import type { Rgb, Rgba } from '@/types/color'
import { clamp, isOpaque, rgbToHsl, rgbToHsv, rgbaToHex, round } from './convert'

export type FormatId = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsb'
export type CssColorFormat = 'hex' | 'rgb' | 'hsl'
export type ComponentMode = 'rgb' | 'hsl' | 'hsv'

export interface FormatRow {
  id: FormatId
  label: string
  value: string
}

const int = (value: number) => Math.round(value)

export function formatAlpha(alpha: number): string {
  return String(round(clamp(alpha, 0, 1), 2))
}

export function formatRgb({ r, g, b }: Rgb): string {
  return `rgb(${int(r)}, ${int(g)}, ${int(b)})`
}

export function formatRgba({ r, g, b, a }: Rgba): string {
  return `rgba(${int(r)}, ${int(g)}, ${int(b)}, ${formatAlpha(a)})`
}

export function formatHsl(rgb: Rgb, hue = 0): string {
  const { h, s, l } = rgbToHsl(rgb, hue)
  return `hsl(${int(h)}, ${int(s)}%, ${int(l)}%)`
}

export function formatHsla(rgba: Rgba, hue = 0): string {
  const { h, s, l } = rgbToHsl(rgba, hue)
  return `hsla(${int(h)}, ${int(s)}%, ${int(l)}%, ${formatAlpha(rgba.a)})`
}

export function formatHsv(rgb: Rgb, hue = 0): string {
  const { h, s, v } = rgbToHsv(rgb, hue)
  return `hsv(${int(h)}, ${int(s)}%, ${int(v)}%)`
}

export function formatHsb(rgb: Rgb, hue = 0): string {
  const { h, s, v } = rgbToHsv(rgb, hue)
  return `hsb(${int(h)}, ${int(s)}%, ${int(v)}%)`
}

export function getFormatRows(rgba: Rgba, hue = 0): FormatRow[] {
  return [
    { id: 'hex', label: 'HEX', value: rgbaToHex(rgba) },
    { id: 'rgb', label: 'RGB', value: formatRgb(rgba) },
    { id: 'rgba', label: 'RGBA', value: formatRgba(rgba) },
    { id: 'hsl', label: 'HSL', value: formatHsl(rgba, hue) },
    { id: 'hsla', label: 'HSLA', value: formatHsla(rgba, hue) },
    { id: 'hsv', label: 'HSV', value: formatHsv(rgba, hue) },
    { id: 'hsb', label: 'HSB', value: formatHsb(rgba, hue) },
  ]
}

export function formatComponents(mode: ComponentMode, rgba: Rgba, hue = 0): string {
  const alpha = isOpaque(rgba.a) ? '' : `, ${formatAlpha(rgba.a)}`
  if (mode === 'rgb') {
    return `${int(rgba.r)}, ${int(rgba.g)}, ${int(rgba.b)}${alpha}`
  }
  if (mode === 'hsl') {
    const { h, s, l } = rgbToHsl(rgba, hue)
    return `${int(h)}°, ${int(s)}%, ${int(l)}%${alpha}`
  }
  const { h, s, v } = rgbToHsv(rgba, hue)
  return `${int(h)}°, ${int(s)}%, ${int(v)}%${alpha}`
}

export function formatCssColor(rgba: Rgba, format: CssColorFormat, hue = 0): string {
  const opaque = isOpaque(rgba.a)
  switch (format) {
    case 'hex':
      return rgbaToHex(rgba)
    case 'rgb':
      return opaque ? formatRgb(rgba) : formatRgba(rgba)
    case 'hsl':
      return opaque ? formatHsl(rgba, hue) : formatHsla(rgba, hue)
  }
}

export function toCssRgb(rgba: Rgba): string {
  return `rgb(${int(rgba.r)} ${int(rgba.g)} ${int(rgba.b)} / ${round(clamp(rgba.a, 0, 1), 3)})`
}
