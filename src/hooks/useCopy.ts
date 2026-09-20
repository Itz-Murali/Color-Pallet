import { useCallback, useEffect, useRef, useState } from 'react'
import { copyToClipboard } from '@/utils/clipboard'

export type CopyStatus = 'idle' | 'copied' | 'error'

export function useCopy(resetAfterMs = 1400) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timer = useRef<number | undefined>(undefined)

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text)
      setStatus(ok ? 'copied' : 'error')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setStatus('idle'), resetAfterMs)
      return ok
    },
    [resetAfterMs],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { status, copy }
}
