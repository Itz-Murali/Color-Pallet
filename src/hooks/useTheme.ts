import { useCallback, useEffect, useState } from 'react'
import { readString, writeString } from '@/utils/storage'

export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = 'color-pallet:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readMode(): ThemeMode {
  const stored = readString(THEME_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function applyTheme(mode: ThemeMode): void {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia(DARK_QUERY).matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readMode)

  useEffect(() => {
    applyTheme(mode)
    if (mode !== 'system') return
    const query = window.matchMedia(DARK_QUERY)
    const onChange = () => applyTheme('system')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    writeString(THEME_KEY, next)
  }, [])

  return { mode, setMode }
}
