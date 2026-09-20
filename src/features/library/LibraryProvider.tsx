import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { normalizeHex } from '@/lib/color'
import { isStorageAvailable, readJson, writeJson } from '@/utils/storage'
import { LibraryContext } from './library-context'
import type { LibraryContextValue, SavedColor } from './library-context'

const SAVED_KEY = 'color-pallet:saved'
const RECENT_KEY = 'color-pallet:recent'
export const MAX_SAVED = 200
export const MAX_RECENT = 18

const isHex = (value: unknown): value is string => typeof value === 'string' && normalizeHex(value) !== null

function isSavedList(value: unknown): value is SavedColor[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        isHex((item as SavedColor).hex) &&
        typeof (item as SavedColor).savedAt === 'number',
    )
  )
}

const isHexList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isHex)

const loadSaved = () => readJson<SavedColor[]>(SAVED_KEY, isSavedList, [])
const loadRecent = () => readJson<string[]>(RECENT_KEY, isHexList, [])

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedColor[]>(loadSaved)
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const [persistent] = useState(isStorageAvailable)

  useEffect(() => {
    writeJson(SAVED_KEY, saved)
  }, [saved])

  useEffect(() => {
    writeJson(RECENT_KEY, recent)
  }, [recent])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_KEY) setSaved(loadSaved())
      if (event.key === RECENT_KEY) setRecent(loadRecent())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isSaved = useCallback(
    (hex: string) => {
      const key = normalizeHex(hex)
      return key !== null && saved.some((item) => item.hex === key)
    },
    [saved],
  )

  const toggleSaved = useCallback((hex: string) => {
    const key = normalizeHex(hex)
    if (!key) return
    setSaved((previous) =>
      previous.some((item) => item.hex === key)
        ? previous.filter((item) => item.hex !== key)
        : [{ hex: key, savedAt: Date.now() }, ...previous].slice(0, MAX_SAVED),
    )
  }, [])

  const removeSaved = useCallback((hex: string) => {
    const key = normalizeHex(hex)
    if (key) setSaved((previous) => previous.filter((item) => item.hex !== key))
  }, [])

  const clearSaved = useCallback(() => setSaved([]), [])

  const addRecent = useCallback((hex: string) => {
    const key = normalizeHex(hex)
    if (!key) return
    setRecent((previous) => [key, ...previous.filter((item) => item !== key)].slice(0, MAX_RECENT))
  }, [])

  const clearRecent = useCallback(() => setRecent([]), [])

  const value = useMemo<LibraryContextValue>(
    () => ({ saved, recent, persistent, isSaved, toggleSaved, removeSaved, clearSaved, addRecent, clearRecent }),
    [saved, recent, persistent, isSaved, toggleSaved, removeSaved, clearSaved, addRecent, clearRecent],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
