import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { CopyButton } from '@/components/CopyButton'
import { Link } from '@/components/Link'
import { PageHeader, Panel } from '@/components/Panel'
import { Swatch } from '@/components/Swatch'
import { ValueRow } from '@/components/ValueRow'
import { useColor } from '@/features/color/color-context'
import { useLibrary } from '@/features/library/library-context'
import { formatHsl, formatRgb, hexToRgba } from '@/lib/color'
import { navigate } from '@/lib/router'

export default function SavedPage() {
  const { saved, persistent, removeSaved, clearSaved } = useLibrary()
  const { setRgba } = useColor()
  const [confirmingClear, setConfirmingClear] = useState(false)

  useEffect(() => {
    if (!confirmingClear) return
    const timer = window.setTimeout(() => setConfirmingClear(false), 4000)
    return () => window.clearTimeout(timer)
  }, [confirmingClear])

  const open = (hex: string) => {
    const rgba = hexToRgba(hex)
    if (!rgba) return
    setRgba(rgba)
    navigate('/')
  }

  return (
    <>
      <PageHeader
        title="Saved colors"
        description={
          persistent
            ? 'Stored in this browser with localStorage. No account needed.'
            : 'Local storage is unavailable. Saved colors last until you close this tab.'
        }
      />

      <Panel
        title={`Saved (${saved.length})`}
        actions={
          saved.length > 0 ? (
            <>
              <CopyButton variant="text" value={saved.map((item) => item.hex).join('\n')} label="all saved colors">
                Copy all
              </CopyButton>
              <Button
                size="sm"
                onClick={() => {
                  if (confirmingClear) {
                    clearSaved()
                    setConfirmingClear(false)
                  } else {
                    setConfirmingClear(true)
                  }
                }}
              >
                {confirmingClear ? 'Confirm clear all' : 'Clear all'}
              </Button>
            </>
          ) : null
        }
      >
        {saved.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-[13px] font-medium">No saved colors yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Save colors from the{' '}
              <Link to="/" className="underline underline-offset-2 hover:text-foreground">
                explorer
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {saved.map((item) => {
              const rgba = hexToRgba(item.hex)
              return (
                <li key={item.hex} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
                  <Swatch color={item.hex} className="size-10 shrink-0 rounded" />
                  <dl className="min-w-0 flex-1 basis-56">
                    <ValueRow label="HEX" value={item.hex} />
                    {rgba && <ValueRow label="RGB" value={formatRgb(rgba)} />}
                    {rgba && <ValueRow label="HSL" value={formatHsl(rgba)} />}
                  </dl>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" onClick={() => open(item.hex)}>
                      Open
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${item.hex}`} onClick={() => removeSaved(item.hex)}>
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </>
  )
}
