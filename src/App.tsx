import { Suspense, lazy, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ColorProvider } from '@/features/color/ColorProvider'
import { LibraryProvider } from '@/features/library/LibraryProvider'
import { RecentTracker } from '@/features/library/RecentTracker'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { createDefaultGradient, parseGradientParams } from '@/lib/gradient'
import type { GradientState } from '@/lib/gradient'
import { findRoute, usePathname } from '@/lib/router'
import ExplorerPage from '@/pages/ExplorerPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { readSearchParams } from '@/utils/url'

const GradientPage = lazy(() => import('@/pages/GradientPage'))
const PalettePage = lazy(() => import('@/pages/PalettePage'))
const ContrastPage = lazy(() => import('@/pages/ContrastPage'))
const SavedPage = lazy(() => import('@/pages/SavedPage'))

function Pages() {
  const pathname = usePathname()
  const [gradient, setGradient] = useState<GradientState>(
    () => parseGradientParams(readSearchParams()) ?? createDefaultGradient(),
  )

  useDocumentTitle(findRoute(pathname)?.title ?? 'Page not found — Color Pallet')

  let page
  switch (pathname) {
    case '/':
      page = <ExplorerPage />
      break
    case '/gradients':
      page = <GradientPage gradient={gradient} setGradient={setGradient} />
      break
    case '/palettes':
      page = <PalettePage />
      break
    case '/contrast':
      page = <ContrastPage />
      break
    case '/saved':
      page = <SavedPage />
      break
    default:
      page = <NotFoundPage />
  }

  return (
    <AppShell pathname={pathname}>
      <ErrorBoundary key={pathname}>
        <Suspense
          fallback={
            <p role="status" className="py-16 text-center text-[13px] text-muted-foreground">
              Loading…
            </p>
          }
        >
          {page}
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  )
}

export default function App() {
  return (
    <ColorProvider>
      <LibraryProvider>
        <RecentTracker />
        <Pages />
      </LibraryProvider>
    </ColorProvider>
  )
}
