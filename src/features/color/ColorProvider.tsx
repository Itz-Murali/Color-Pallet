import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { clamp, hexToRgba, hsvaToRgba, rgbaToHex, rgbaToHsva } from '@/lib/color'
import type { Hsva, Rgba } from '@/types/color'
import { readSearchParams } from '@/utils/url'
import { ColorContext } from './color-context'

const DEFAULT_HEX = '#7C3AED'

function normalize(hsva: Hsva): Hsva {
  return {
    h: ((hsva.h % 360) + 360) % 360,
    s: clamp(hsva.s, 0, 100),
    v: clamp(hsva.v, 0, 100),
    a: clamp(hsva.a, 0, 1),
  }
}

function readInitialColor(): Hsva {
  const fromUrl = hexToRgba(readSearchParams().get('hex') ?? '')
  const rgba = fromUrl ?? (hexToRgba(DEFAULT_HEX) as Rgba)
  return rgbaToHsva(rgba)
}

export function ColorProvider({ children }: { children: ReactNode }) {
  const [hsva, setHsvaState] = useState<Hsva>(readInitialColor)

  const setHsva = useCallback((next: Hsva) => setHsvaState(normalize(next)), [])
  const setRgba = useCallback(
    (next: Rgba) => setHsvaState((previous) => normalize(rgbaToHsva(next, previous.h))),
    [],
  )

  const value = useMemo(() => {
    const rgba = hsvaToRgba(hsva)
    return { hsva, rgba, hex: rgbaToHex(rgba), setHsva, setRgba }
  }, [hsva, setHsva, setRgba])

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
}
