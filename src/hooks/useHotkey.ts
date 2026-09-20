import { useEffect, useRef } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function useHotkey(key: string, handler: (event: KeyboardEvent) => void): void {
  const latest = useRef(handler)

  useEffect(() => {
    latest.current = handler
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key) return
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      if (isTypingTarget(event.target)) return
      latest.current(event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key])
}
