import type { Hsl, Hsv, Hsva, Rgb, Rgba } from '@/types/color'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}

function computeHue(
  rn: number,
  gn: number,
  bn: number,
  max: number,
  delta: number,
  fallback: number,
): number {
  if (delta === 0) return fallback
  let hue: number
  if (max === rn) hue = ((gn - bn) / delta) % 6
  else if (max === gn) hue = (bn - rn) / delta + 2
  else hue = (rn - gn) / delta + 4
  return normalizeHue(hue * 60)
}

function chromaToRgb(hue: number, chroma: number, offset: number): Rgb {
  const sector = normalizeHue(hue) / 60
  const x = chroma * (1 - Math.abs((sector % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (sector < 1) {
    r = chroma
    g = x
  } else if (sector < 2) {
    r = x
    g = chroma
  } else if (sector < 3) {
    g = chroma
    b = x
  } else if (sector < 4) {
    g = x
    b = chroma
  } else if (sector < 5) {
    r = x
    b = chroma
  } else {
    r = chroma
    b = x
  }
  return { r: (r + offset) * 255, g: (g + offset) * 255, b: (b + offset) * 255 }
}

export function rgbToHsv({ r, g, b }: Rgb, fallbackHue = 0): Hsv {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  return {
    h: computeHue(rn, gn, bn, max, delta, fallbackHue),
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const sn = clamp(s, 0, 100) / 100
  const vn = clamp(v, 0, 100) / 100
  const chroma = vn * sn
  return chromaToRgb(h, chroma, vn - chroma)
}

export function rgbToHsl({ r, g, b }: Rgb, fallbackHue = 0): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  return {
    h: computeHue(rn, gn, bn, max, delta, fallbackHue),
    s: saturation * 100,
    l: lightness * 100,
  }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = clamp(s, 0, 100) / 100
  const ln = clamp(l, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * ln - 1)) * sn
  return chromaToRgb(h, chroma, ln - chroma / 2)
}

export function hsvaToRgba(hsva: Hsva): Rgba {
  return { ...hsvToRgb(hsva), a: hsva.a }
}

export function rgbaToHsva(rgba: Rgba, fallbackHue = 0): Hsva {
  return { ...rgbToHsv(rgba, fallbackHue), a: rgba.a }
}

export function roundRgb({ r, g, b }: Rgb): Rgb {
  return { r: Math.round(clamp(r, 0, 255)), g: Math.round(clamp(g, 0, 255)), b: Math.round(clamp(b, 0, 255)) }
}

export function mixRgba(from: Rgba, to: Rgba, t: number): Rgba {
  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
    a: from.a + (to.a - from.a) * t,
  }
}

function byteToHex(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()
}

export function isOpaque(alpha: number): boolean {
  return Math.round(clamp(alpha, 0, 1) * 255) >= 255
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${byteToHex(r)}${byteToHex(g)}${byteToHex(b)}`
}

export function rgbaToHex(rgba: Rgba): string {
  const base = rgbToHex(rgba)
  return isOpaque(rgba.a) ? base : `${base}${byteToHex(rgba.a * 255)}`
}

export function hexToRgba(input: string): Rgba | null {
  const match = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(input.trim())
  if (!match) return null
  let digits = match[1]
  if (digits.length <= 4) {
    digits = digits
      .split('')
      .map((char) => char + char)
      .join('')
  }
  const byteAt = (start: number) => parseInt(digits.slice(start, start + 2), 16)
  return {
    r: byteAt(0),
    g: byteAt(2),
    b: byteAt(4),
    a: digits.length === 8 ? byteAt(6) / 255 : 1,
  }
}

export function normalizeHex(input: string): string | null {
  const rgba = hexToRgba(input)
  return rgba ? rgbaToHex(rgba) : null
}
