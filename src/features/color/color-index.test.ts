import { describe, expect, it } from 'vitest'
import { NAMED_COLORS, findNamedColor } from '@/data/named-colors'
import { hexToRgba } from '@/lib/color'
import { nearestNamedColor, searchColors } from './color-index'

describe('dataset', () => {
  it('contains only valid, unique-by-name entries', () => {
    const names = new Set<string>()
    for (const color of NAMED_COLORS) {
      expect(hexToRgba(color.hex), color.name).not.toBeNull()
      expect(names.has(color.name), `duplicate ${color.name}`).toBe(false)
      names.add(color.name)
    }
    const css = NAMED_COLORS.filter((color) => color.group === 'CSS')
    const aliasCount = css.reduce((total, color) => total + (color.aliases?.length ?? 0), 0)
    expect(css.length + aliasCount).toBe(148)
  })

  it('finds colors by name and alias', () => {
    expect(findNamedColor('medium purple')?.hex).toBe('#9370DB')
    expect(findNamedColor('Dark-Slate-Grey')?.hex).toBe('#2F4F4F')
  })
})

describe('searchColors', () => {
  it('ranks exact matches first', () => {
    expect(searchColors('red')[0].name).toBe('Red')
    expect(searchColors('purple')[0].name).toBe('Purple')
  })

  it('matches partial names, aliases and hex digits', () => {
    const names = searchColors('purple').map((color) => color.name)
    expect(names).toContain('Rebecca Purple')
    expect(names).toContain('Medium Purple')
    expect(searchColors('grey').map((color) => color.name)).toContain('Gray')
    expect(searchColors('#7c3aed')[0].name).toBe('Tailwind Violet 600')
  })

  it('filters by group and returns everything for an empty query', () => {
    expect(searchColors('', 'Tailwind').every((color) => color.group === 'Tailwind')).toBe(true)
    expect(searchColors('').length).toBe(NAMED_COLORS.length)
    expect(searchColors('zzzzzz')).toEqual([])
  })
})

describe('nearestNamedColor', () => {
  it('reports exact and approximate matches', () => {
    expect(nearestNamedColor({ r: 255, g: 0, b: 0 })).toMatchObject({ exact: true, color: { name: 'Red' } })
    const near = nearestNamedColor({ r: 250, g: 5, b: 5 })
    expect(near.exact).toBe(false)
    expect(near.color.name).toBe('Red')
  })
})
