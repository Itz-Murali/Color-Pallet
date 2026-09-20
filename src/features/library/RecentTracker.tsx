import { useEffect, useRef } from 'react'
import { useColor } from '@/features/color/color-context'
import { useLibrary } from './library-context'

const SETTLE_MS = 900

export function RecentTracker() {
  const { hex } = useColor()
  const { addRecent } = useLibrary()
  const initialHex = useRef(hex)
  const armed = useRef(false)

  useEffect(() => {
    if (!armed.current) {
      if (hex === initialHex.current) return
      armed.current = true
    }
    const timer = window.setTimeout(() => addRecent(hex), SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [hex, addRecent])

  return null
}
