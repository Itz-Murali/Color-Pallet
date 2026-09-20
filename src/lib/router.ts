import { useSyncExternalStore } from 'react'

const NAVIGATE_EVENT = 'color-pallet:navigate'

export interface RouteDef {
  path: string
  label: string
  title: string
}

export const ROUTES: readonly RouteDef[] = [
  { path: '/', label: 'Explorer', title: 'Color Pallet — Color Tools for Developers & Designers' },
  { path: '/gradients', label: 'Gradients', title: 'Gradient Generator — Color Pallet' },
  { path: '/palettes', label: 'Palettes', title: 'Palette Generator — Color Pallet' },
  { path: '/contrast', label: 'Contrast', title: 'Contrast Checker — Color Pallet' },
  { path: '/saved', label: 'Saved', title: 'Saved Colors — Color Pallet' },
]

export function findRoute(pathname: string): RouteDef | undefined {
  return ROUTES.find((route) => route.path === pathname)
}

function currentPathname(): string {
  const { pathname } = window.location
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback)
  window.addEventListener(NAVIGATE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(NAVIGATE_EVENT, callback)
  }
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  if (options.replace) window.history.replaceState(null, '', to)
  else window.history.pushState(null, '', to)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
  window.scrollTo(0, 0)
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, currentPathname, () => '/')
}
