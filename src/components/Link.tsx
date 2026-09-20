import type { ComponentProps } from 'react'
import { navigate } from '@/lib/router'

interface LinkProps extends Omit<ComponentProps<'a'>, 'href'> {
  to: string
}

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (rest.target && rest.target !== '_self') return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}
