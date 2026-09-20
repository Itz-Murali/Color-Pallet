import { describe, expect, it } from 'vitest'
import {
  addStop,
  buildGradientCss,
  buildGradientValue,
  createDefaultGradient,
  parseGradientParams,
  removeStop,
  reverseStops,
  serializeGradient,
} from './gradient'

describe('gradient CSS', () => {
  it('builds the default linear gradient', () => {
    const state = createDefaultGradient()
    expect(buildGradientValue(state)).toBe('linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)')
    expect(buildGradientCss(state)).toBe(
      'background: linear-gradient(\n  135deg,\n  #7C3AED 0%,\n  #06B6D4 100%\n);',
    )
  })

  it('builds radial and conic gradients', () => {
    const state = { ...createDefaultGradient(), type: 'radial' as const }
    expect(buildGradientValue(state)).toBe(
      'radial-gradient(circle farthest-corner at 50% 50%, #7C3AED 0%, #06B6D4 100%)',
    )
    const conic = { ...createDefaultGradient(), type: 'conic' as const, angle: 90, x: 25, y: 75 }
    expect(buildGradientValue(conic)).toBe(
      'conic-gradient(from 90deg at 25% 75%, #7C3AED 0%, #06B6D4 100%)',
    )
  })

  it('sorts stops by position and supports other color formats', () => {
    const state = createDefaultGradient()
    state.stops = [...state.stops].reverse()
    expect(buildGradientValue(state, 'rgb')).toBe(
      'linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(6, 182, 212) 100%)',
    )
  })

  it('writes alpha stops as 8-digit hex or rgba()', () => {
    const state = createDefaultGradient()
    state.stops[0].color = { ...state.stops[0].color, a: 0.5 }
    expect(buildGradientValue(state)).toContain('#7C3AED80 0%')
    expect(buildGradientValue(state, 'rgb')).toContain('rgba(124, 58, 237, 0.5) 0%')
  })
})

describe('stop editing', () => {
  it('adds a stop in the widest gap and respects the limits', () => {
    let stops = createDefaultGradient().stops
    stops = addStop(stops)
    expect(stops).toHaveLength(3)
    expect(stops[2].position).toBe(50)
    for (let i = 0; i < 20; i += 1) stops = addStop(stops)
    expect(stops).toHaveLength(10)
  })

  it('never removes below two stops', () => {
    const stops = createDefaultGradient().stops
    expect(removeStop(stops, stops[0].id)).toHaveLength(2)
    const three = addStop(stops)
    expect(removeStop(three, three[2].id)).toHaveLength(2)
  })

  it('reverses positions', () => {
    const stops = reverseStops(addStop(createDefaultGradient().stops))
    expect(stops.map((stop) => stop.position)).toEqual([100, 0, 50])
  })
})

describe('URL state', () => {
  it('round-trips a gradient', () => {
    const state = { ...createDefaultGradient(), type: 'conic' as const, angle: 45, x: 30, y: 60 }
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(serializeGradient(state))) {
      if (value !== undefined) params.set(key, value)
    }
    const parsed = parseGradientParams(params)
    expect(parsed).not.toBeNull()
    expect(buildGradientValue(parsed!)).toBe(buildGradientValue(state))
  })

  it('accepts the short colors= form', () => {
    const parsed = parseGradientParams(new URLSearchParams('colors=7C3AED,06B6D4&angle=135'))
    expect(parsed && buildGradientValue(parsed)).toBe('linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)')
  })

  it('rejects unusable input and falls back on bad values', () => {
    expect(parseGradientParams(new URLSearchParams(''))).toBeNull()
    expect(parseGradientParams(new URLSearchParams('stops=zzz,yyy'))).toBeNull()
    expect(parseGradientParams(new URLSearchParams('stops=FF0000'))).toBeNull()
    const parsed = parseGradientParams(new URLSearchParams('stops=FF0000@0,0000FF@100&type=bogus&angle=abc'))
    expect(parsed?.type).toBe('linear')
    expect(parsed?.angle).toBe(135)
  })
})
