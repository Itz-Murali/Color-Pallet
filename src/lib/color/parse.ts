import { findNamedColor } from '@/data/named-colors'
import type { Rgba } from '@/types/color'
import { clamp, hexToRgba, hslToRgb, hsvToRgb } from './convert'

export type ParsedKind = 'hex' | 'function' | 'triplet' | 'name'

export interface ParsedColor {
  rgba: Rgba
  kind: ParsedKind
}

const FUNCTION_PATTERN = /^(rgba?|hsla?|hsva?|hsba?)\(\s*([^()]*?)\s*\)$/i
const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/

interface Component {
  value: number
  percent: boolean
}

function parseComponent(token: string): Component | null {
  const percent = token.endsWith('%')
  const raw = percent ? token.slice(0, -1) : token
  if (!NUMBER_PATTERN.test(raw)) return null
  return { value: Number(raw), percent }
}

function parseScaled(token: string, fullScale: number): number | null {
  const component = parseComponent(token)
  if (!component) return null
  const value = component.percent ? (component.value / 100) * fullScale : component.value
  return clamp(value, 0, fullScale)
}

function parsePercent(token: string): number | null {
  const component = parseComponent(token)
  return component ? clamp(component.value, 0, 100) : null
}

function parseHue(token: string): number | null {
  const component = parseComponent(token.replace(/(deg|°)$/i, ''))
  return component && !component.percent ? component.value : null
}

function parseAlpha(token: string): number | null {
  const component = parseComponent(token)
  if (!component) return null
  return clamp(component.percent ? component.value / 100 : component.value, 0, 1)
}

function parseFunction(name: string, body: string): Rgba | null {
  const tokens = body.split(/[\s,/]+/).filter(Boolean)
  if (tokens.length < 3 || tokens.length > 4) return null

  let alpha = 1
  if (tokens.length === 4) {
    const parsed = parseAlpha(tokens[3])
    if (parsed === null) return null
    alpha = parsed
  }

  const family = name.slice(0, 3).toLowerCase()
  if (family === 'rgb') {
    const r = parseScaled(tokens[0], 255)
    const g = parseScaled(tokens[1], 255)
    const b = parseScaled(tokens[2], 255)
    if (r === null || g === null || b === null) return null
    return { r, g, b, a: alpha }
  }

  const h = parseHue(tokens[0])
  const s = parsePercent(tokens[1])
  const third = parsePercent(tokens[2])
  if (h === null || s === null || third === null) return null
  if (family === 'hsl') return { ...hslToRgb({ h, s, l: third }), a: alpha }
  return { ...hsvToRgb({ h, s, v: third }), a: alpha }
}

function parseTriplet(text: string): Rgba | null {
  const tokens = text.split(/[\s,]+/).filter(Boolean)
  if (tokens.length < 3 || tokens.length > 4) return null
  if (!tokens.every((token) => NUMBER_PATTERN.test(token))) return null
  return {
    r: clamp(Number(tokens[0]), 0, 255),
    g: clamp(Number(tokens[1]), 0, 255),
    b: clamp(Number(tokens[2]), 0, 255),
    a: tokens.length === 4 ? clamp(Number(tokens[3]), 0, 1) : 1,
  }
}

export function parseColorInput(input: string): ParsedColor | null {
  const text = input.trim()
  if (text === '') return null

  const hex = hexToRgba(text)
  if (hex) return { rgba: hex, kind: 'hex' }

  const fn = FUNCTION_PATTERN.exec(text)
  if (fn) {
    const rgba = parseFunction(fn[1], fn[2])
    return rgba ? { rgba, kind: 'function' } : null
  }

  const triplet = parseTriplet(text)
  if (triplet) return { rgba: triplet, kind: 'triplet' }

  if (text.toLowerCase() === 'transparent') {
    return { rgba: { r: 0, g: 0, b: 0, a: 0 }, kind: 'name' }
  }

  const named = findNamedColor(text)
  const rgba = named ? hexToRgba(named.hex) : null
  return rgba ? { rgba, kind: 'name' } : null
}

export function parseColor(input: string): Rgba | null {
  return parseColorInput(input)?.rgba ?? null
}
