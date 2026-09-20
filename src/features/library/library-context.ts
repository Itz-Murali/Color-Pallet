import { createContext, useContext } from 'react'

export interface SavedColor {
  hex: string
  savedAt: number
}

export interface LibraryContextValue {
  saved: readonly SavedColor[]
  recent: readonly string[]
  persistent: boolean
  isSaved: (hex: string) => boolean
  toggleSaved: (hex: string) => void
  removeSaved: (hex: string) => void
  clearSaved: () => void
  addRecent: (hex: string) => void
  clearRecent: () => void
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)

export function useLibrary(): LibraryContextValue {
  const value = useContext(LibraryContext)
  if (!value) throw new Error('useLibrary must be used inside <LibraryProvider>')
  return value
}
