import { useEffect } from 'react'
import { replaceSearchParams } from '@/utils/url'
import { useColor } from './color-context'

export function useColorUrlSync(extra?: Record<string, string | undefined>): void {
  const { hex } = useColor()
  const extraKey = extra ? JSON.stringify(extra) : ''

  useEffect(() => {
    const patch: Record<string, string | undefined> = extraKey ? JSON.parse(extraKey) : {}
    replaceSearchParams({ ...patch, hex: hex.slice(1) })
  }, [hex, extraKey])
}
