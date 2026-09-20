import { NAMED_COLORS, normalizeColorName } from '@/data/named-colors'
import type { ColorGroup, NamedColor } from '@/data/named-colors'
import { formatHsl, formatRgb, hexToRgba } from '@/lib/color'
import type { Rgb } from '@/types/color'

export type GroupFilter = 'All' | ColorGroup

export interface IndexedColor extends NamedColor {
  channels: Rgb
  rgb: string
  hsl: string
  key: string
  aliasKeys: string[]
}

let index: IndexedColor[] | null = null

export function getColorIndex(): readonly IndexedColor[] {
  if (!index) {
    index = NAMED_COLORS.map((color) => {
      const channels = hexToRgba(color.hex) ?? { r: 0, g: 0, b: 0, a: 1 }
      return {
        ...color,
        channels,
        rgb: formatRgb(channels),
        hsl: formatHsl(channels),
        key: normalizeColorName(color.name),
        aliasKeys: (color.aliases ?? []).map(normalizeColorName),
      }
    })
  }
  return index
}

function score(color: IndexedColor, query: string, queryKey: string, queryHex: string): number | null {
  if (queryKey === '') return null
  if (color.key === queryKey || color.aliasKeys.includes(queryKey)) return 0
  if (color.key.startsWith(queryKey) || color.aliasKeys.some((alias) => alias.startsWith(queryKey))) return 1
  const words = color.name.toLowerCase().split(' ')
  if (words.some((word) => word.startsWith(query))) return 2
  if (color.key.includes(queryKey) || color.aliasKeys.some((alias) => alias.includes(queryKey))) return 3
  if (queryHex.length >= 3 && color.hex.toLowerCase().includes(queryHex)) return 4
  return null
}

export function searchColors(rawQuery: string, group: GroupFilter = 'All'): IndexedColor[] {
  const pool = getColorIndex().filter((color) => group === 'All' || color.group === group)
  const query = rawQuery.trim().toLowerCase()
  if (query === '') return [...pool]

  const queryKey = normalizeColorName(query)
  const queryHex = query.replace(/^#/, '')
  const scored: Array<{ color: IndexedColor; score: number; order: number }> = []
  pool.forEach((color, order) => {
    const value = score(color, query, queryKey, queryHex)
    if (value !== null) scored.push({ color, score: value, order })
  })
  scored.sort((a, b) => a.score - b.score || a.order - b.order)
  return scored.map((entry) => entry.color)
}

function distance(a: Rgb, b: Rgb): number {
  const mean = (a.r + b.r) / 2
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt((2 + mean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - mean) / 256) * db * db)
}

export interface NearestColor {
  color: IndexedColor
  exact: boolean
}

export function nearestNamedColor(rgb: Rgb): NearestColor {
  const colors = getColorIndex()
  let best = colors[0]
  let bestDistance = Infinity
  for (const color of colors) {
    const d = distance(rgb, color.channels)
    if (d < bestDistance) {
      best = color
      bestDistance = d
    }
  }
  return { color: best, exact: bestDistance < 0.5 }
}
