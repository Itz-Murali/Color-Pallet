import { Blend, Bookmark, Contrast, ExternalLink, Palette, Pipette } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { SITE } from '@/data/site'
import { useLibrary } from '@/features/library/library-context'
import { ROUTES } from '@/lib/router'
import { cn } from '@/utils/cn'
import { BrandLogo } from './BrandLogo'
import { Footer } from './Footer'
import { Link } from './Link'
import { ThemeToggle } from './ThemeToggle'

const ICONS: Record<string, LucideIcon> = {
  '/': Pipette,
  '/gradients': Blend,
  '/palettes': Palette,
  '/contrast': Contrast,
  '/saved': Bookmark,
}

interface AppShellProps {
  pathname: string
  children: ReactNode
}

export function AppShell({ pathname, children }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)
  const { saved } = useLibrary()

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-1.5 focus:text-[13px] focus:font-medium focus:text-background"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" aria-label={`${SITE.name}, go to explorer`} className="flex items-center gap-2 font-semibold tracking-tight">
            <BrandLogo />
            <span>{SITE.name}</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
            {ROUTES.map((route) => {
              const active = route.path === pathname
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                    active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {route.label}
                  {route.path === '/saved' && saved.length > 0 && (
                    <span className="font-mono text-[11px] text-muted-foreground">{saved.length}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a
              href={SITE.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              GitHub
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-8 outline-none sm:px-6"
      >
        {children}
      </main>

      <Footer />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {ROUTES.map((route) => {
            const Icon = ICONS[route.path]
            const active = route.path === pathname
            return (
              <li key={route.path}>
                <Link
                  to={route.path}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                    active ? 'bg-muted text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                  {route.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
