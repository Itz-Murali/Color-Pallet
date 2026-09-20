import { Component } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="rounded-md border bg-panel p-6">
        <h1 className="text-base font-semibold">This view failed to load</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Reload the page to try again.</p>
        <Button className="mt-4" variant="primary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    )
  }
}
