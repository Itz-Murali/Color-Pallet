import { createContext, useContext } from 'react'
import type { Hsva, Rgba } from '@/types/color'

export interface ColorContextValue {
  hsva: Hsva
  rgba: Rgba
  hex: string
  setHsva: (next: Hsva) => void
  setRgba: (next: Rgba) => void
}

export const ColorContext = createContext<ColorContextValue | null>(null)

export function useColor(): ColorContextValue {
  const value = useContext(ColorContext)
  if (!value) throw new Error('useColor must be used inside <ColorProvider>')
  return value
}
