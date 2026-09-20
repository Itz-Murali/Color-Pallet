import { describe, expect, it } from 'vitest'
import type { Rgb } from '@/types/color'
import {
  contrastRatio,
  evaluateContrast,
  formatComponents,
  formatCssColor,
  formatRatio,
  generatePalette,
  formatPalette,
  getFormatRows,
  hexToRgba,
  hslToRgb,
  hsvToRgb,
  normalizeHex,
  parseColor,
  parseColorInput,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbaToHex,
  suggestForeground,
} from './index'

const VIOLET: Rgb = { r: 124, g: 58, b: 237 }

function expectClose(actual: Rgb, expected: Rgb, tolerance = 1.5) {
  expect(Math.abs(actual.r - expected.r)).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(actual.g - expected.g)).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(tolerance)
}

describe('hex', () => {
  it('parses 3, 4, 6 and 8 digit values with or without #', () => {
    expect(hexToRgba('#7C3AED')).toEqual({ ...VIOLET, a: 1 })
    expect(hexToRgba('7c3aed')).toEqual({ ...VIOLET, a: 1 })
    expect(hexToRgba('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(hexToRgba('#f008')?.a).toBeCloseTo(0x88 / 255)
    expect(hexToRgba('#7C3AED80')?.a).toBeCloseTo(128 / 255)
  })

  it('rejects invalid values', () => {
    expect(hexToRgba('#gggggg')).toBeNull()
    expect(hexToRgba('#12345')).toBeNull()
    expect(hexToRgba('')).toBeNull()
  })

  it('formats uppercase and adds alpha only when needed', () => {
    expect(rgbToHex(VIOLET)).toBe('#7C3AED')
    expect(rgbaToHex({ ...VIOLET, a: 1 })).toBe('#7C3AED')
    expect(rgbaToHex({ ...VIOLET, a: 0.5 })).toBe('#7C3AED80')
    expect(normalizeHex('abc')).toBe('#AABBCC')
  })
})

describe('HSL and HSV conversion', () => {
  it('matches known values for #7C3AED', () => {
    const hsl = rgbToHsl(VIOLET)
    expect([Math.round(hsl.h), Math.round(hsl.s), Math.round(hsl.l)]).toEqual([262, 83, 58])
    const hsv = rgbToHsv(VIOLET)
    expect([Math.round(hsv.h), Math.round(hsv.s), Math.round(hsv.v)]).toEqual([262, 76, 93])
  })

  it('converts back to RGB', () => {
    expectClose(hslToRgb({ h: 262, s: 83, l: 58 }), VIOLET)
    expectClose(hsvToRgb({ h: 262, s: 76, v: 93 }), VIOLET, 2)
  })

  it('round-trips every 17th color through both models', () => {
    for (let r = 0; r < 256; r += 17) {
      for (let g = 0; g < 256; g += 17) {
        for (let b = 0; b < 256; b += 17) {
          const rgb = { r, g, b }
          expectClose(hsvToRgb(rgbToHsv(rgb)), rgb, 0.001)
          expectClose(hslToRgb(rgbToHsl(rgb)), rgb, 0.001)
        }
      }
    }
  })

  it('keeps the fallback hue for greys', () => {
    expect(rgbToHsv({ r: 128, g: 128, b: 128 }, 200).h).toBe(200)
    expect(rgbToHsl({ r: 0, g: 0, b: 0 }, 90).h).toBe(90)
  })
})

describe('parseColorInput', () => {
  it('reads every supported notation', () => {
    expect(parseColor('rgb(124, 58, 237)')).toEqual({ ...VIOLET, a: 1 })
    expect(parseColor('rgb(124 58 237 / 50%)')?.a).toBeCloseTo(0.5)
    expect(parseColor('rgba(124, 58, 237, 0.25)')?.a).toBeCloseTo(0.25)
    expect(parseColor('124, 58, 237')).toEqual({ ...VIOLET, a: 1 })
    expectClose(parseColor('hsl(262, 83%, 58%)') as Rgb, VIOLET)
    expectClose(parseColor('hsl(262deg 83% 58%)') as Rgb, VIOLET)
    expectClose(parseColor('hsv(262, 76%, 93%)') as Rgb, VIOLET, 2)
    expectClose(parseColor('hsb(262, 76, 93)') as Rgb, VIOLET, 2)
  })

  it('reads names, ignoring case and spacing', () => {
    expect(rgbaToHex(parseColor('rebeccapurple') as never)).toBe('#663399')
    expect(rgbaToHex(parseColor('Medium Purple') as never)).toBe('#9370DB')
    expect(rgbaToHex(parseColor('GREY') as never)).toBe('#808080')
    expect(parseColor('transparent')?.a).toBe(0)
  })

  it('reports what kind of input it saw', () => {
    expect(parseColorInput('#fff')?.kind).toBe('hex')
    expect(parseColorInput('rgb(1,2,3)')?.kind).toBe('function')
    expect(parseColorInput('1 2 3')?.kind).toBe('triplet')
    expect(parseColorInput('red')?.kind).toBe('name')
  })

  it('returns null for garbage instead of throwing', () => {
    for (const input of ['', '   ', 'nonsense', 'rgb(1, 2)', 'rgb(a, b, c)', 'hsl(1, 2%, x)', 'rgb(1,2,3', '#12']) {
      expect(parseColor(input)).toBeNull()
    }
  })

  it('clamps out-of-range channels', () => {
    expect(parseColor('rgb(300, -5, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })
})

describe('formatting', () => {
  it('produces the documented strings', () => {
    const rows = Object.fromEntries(getFormatRows({ ...VIOLET, a: 1 }).map((row) => [row.id, row.value]))
    expect(rows).toEqual({
      hex: '#7C3AED',
      rgb: 'rgb(124, 58, 237)',
      rgba: 'rgba(124, 58, 237, 1)',
      hsl: 'hsl(262, 83%, 58%)',
      hsla: 'hsla(262, 83%, 58%, 1)',
      hsv: 'hsv(262, 76%, 93%)',
      hsb: 'hsb(262, 76%, 93%)',
    })
  })

  it('formats channel lists', () => {
    expect(formatComponents('rgb', { ...VIOLET, a: 1 })).toBe('124, 58, 237')
    expect(formatComponents('hsl', { ...VIOLET, a: 1 })).toBe('262°, 83%, 58%')
    expect(formatComponents('rgb', { ...VIOLET, a: 0.5 })).toBe('124, 58, 237, 0.5')
  })

  it('switches to rgba()/hsla() when transparent', () => {
    expect(formatCssColor({ ...VIOLET, a: 0.5 }, 'rgb')).toBe('rgba(124, 58, 237, 0.5)')
    expect(formatCssColor({ ...VIOLET, a: 1 }, 'rgb')).toBe('rgb(124, 58, 237)')
  })
})

describe('contrast', () => {
  const black = { r: 0, g: 0, b: 0 }
  const white = { r: 255, g: 255, b: 255 }

  it('matches WCAG reference values', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5)
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
    expect(contrastRatio({ r: 0x77, g: 0x77, b: 0x77 }, white)).toBeCloseTo(4.48, 2)
    expect(contrastRatio({ r: 0x76, g: 0x76, b: 0x76 }, white)).toBeCloseTo(4.54, 2)
  })

  it('is symmetric', () => {
    expect(contrastRatio(VIOLET, white)).toBeCloseTo(contrastRatio(white, VIOLET), 10)
  })

  it('evaluates thresholds', () => {
    const passes = (ratio: number) =>
      Object.fromEntries(evaluateContrast(ratio).map((check) => [check.id, check.pass]))
    expect(passes(4.5)).toMatchObject({ 'aa-normal': true, 'aaa-normal': false, 'aaa-large': true })
    expect(passes(2.9)).toMatchObject({ 'aa-large': false, 'aa-ui': false })
    expect(passes(7)).toMatchObject({ 'aaa-normal': true })
  })

  it('rounds the displayed ratio but never across a threshold', () => {
    expect(formatRatio(4.4776)).toBe('4.48:1')
    expect(formatRatio(4.499)).toBe('4.49:1')
    expect(formatRatio(6.999)).toBe('6.99:1')
    expect(formatRatio(4.5)).toBe('4.50:1')
    expect(formatRatio(21)).toBe('21.00:1')
  })

  it('suggests a foreground that passes', () => {
    const suggestion = suggestForeground({ r: 0x99, g: 0x99, b: 0x99 }, { r: 255, g: 255, b: 255 }, 4.5)
    expect(suggestion).not.toBeNull()
    expect(contrastRatio(suggestion as Rgb, { r: 255, g: 255, b: 255 })).toBeGreaterThanOrEqual(4.5)
  })

  it('returns null when the target is unreachable', () => {
    expect(suggestForeground({ r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }, 22)).toBeNull()
  })
})

describe('palettes', () => {
  const red: Rgb = { r: 255, g: 0, b: 0 }
  const hexes = (type: Parameters<typeof generatePalette>[1], steps?: number) =>
    generatePalette(red, type, steps).map((color) => color.hex)

  it('rotates hue for scheme palettes', () => {
    expect(hexes('complementary')).toEqual(['#FF0000', '#00FFFF'])
    expect(hexes('triadic')).toEqual(['#FF0000', '#00FF00', '#0000FF'])
    expect(hexes('tetradic')).toHaveLength(4)
    expect(hexes('split-complementary')).toHaveLength(3)
    expect(hexes('analogous')).toHaveLength(5)
  })

  it('keeps the base color in the analogous palette', () => {
    expect(hexes('analogous')[2]).toBe('#FF0000')
  })

  it('builds shades and tints from the base', () => {
    const shades = hexes('shades', 4)
    expect(shades).toHaveLength(4)
    expect(shades[0]).toBe('#FF0000')
    expect(shades[3]).toBe('#400000')
    const tints = hexes('tints', 4)
    expect(tints[0]).toBe('#FF0000')
    expect(tints[3]).toBe('#FFBFBF')
  })

  it('keeps the base in the monochromatic ladder with the requested size', () => {
    for (const steps of [3, 5, 9, 12]) {
      const palette = generatePalette(VIOLET, 'monochromatic', steps)
      expect(palette).toHaveLength(steps)
      expect(palette.filter((color) => color.label === 'Base')).toHaveLength(1)
      expect(palette.find((color) => color.label === 'Base')?.hex).toBe('#7C3AED')
    }
  })

  it('clamps the step count', () => {
    expect(generatePalette(VIOLET, 'shades', 1)).toHaveLength(3)
    expect(generatePalette(VIOLET, 'shades', 99)).toHaveLength(12)
  })

  it('exports in each format', () => {
    const palette = generatePalette(red, 'complementary')
    expect(formatPalette(palette, 'hex')).toBe('#FF0000\n#00FFFF')
    expect(formatPalette(palette, 'css')).toBe(':root {\n  --color-1: #FF0000;\n  --color-2: #00FFFF;\n}')
    expect(JSON.parse(formatPalette(palette, 'json'))).toEqual(['#FF0000', '#00FFFF'])
  })
})
