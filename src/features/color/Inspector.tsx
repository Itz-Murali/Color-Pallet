import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/Button'
import { Panel } from '@/components/Panel'
import { Swatch } from '@/components/Swatch'
import { ValueRow } from '@/components/ValueRow'
import { contrastRatio, formatRatio, getFormatRows, rgbToHex, toCssRgb } from '@/lib/color'
import { useLibrary } from '@/features/library/library-context'
import { useColor } from './color-context'
import { nearestNamedColor } from './color-index'

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

export function Inspector() {
  const { rgba, hsva, hex } = useColor()
  const { isSaved, toggleSaved, persistent } = useLibrary()
  const saved = isSaved(hex)

  const rows = useMemo(() => getFormatRows(rgba, hsva.h), [rgba, hsva.h])
  const nearest = useMemo(() => nearestNamedColor(rgba), [rgba])
  const opaque = rgbToHex(rgba)

  return (
    <Panel
      title="Inspector"
      actions={
        <Button size="sm" aria-pressed={saved} onClick={() => toggleSaved(hex)}>
          {saved ? <BookmarkCheck className="size-3.5" aria-hidden /> : <Bookmark className="size-3.5" aria-hidden />}
          {saved ? 'Saved' : 'Save color'}
        </Button>
      }
    >
      <div className="space-y-3 p-3">
        <Swatch color={toCssRgb(rgba)} className="h-36 w-full rounded-md" />

        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-[13px] font-medium">
            {nearest.exact ? '' : 'Nearest: '}
            {nearest.color.name}
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">{nearest.color.group}</p>
        </div>

        <dl className="divide-y">
          {rows.map((row) => (
            <ValueRow key={row.id} label={row.label} value={row.value} />
          ))}
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <ContrastChip label="White text" background={opaque} foreground="#FFFFFF" ratio={contrastRatio(rgba, WHITE)} />
          <ContrastChip label="Black text" background={opaque} foreground="#000000" ratio={contrastRatio(rgba, BLACK)} />
        </div>

        <p className="text-xs text-muted-foreground">
          {persistent
            ? 'Saved colors are stored in this browser only.'
            : 'Local storage is unavailable. Saved colors last until you close this tab.'}
        </p>
      </div>
    </Panel>
  )
}

function ContrastChip({
  label,
  background,
  foreground,
  ratio,
}: {
  label: string
  background: string
  foreground: string
  ratio: number
}) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs"
      style={{ backgroundColor: background, color: foreground }}
    >
      <span className="font-medium">{label}</span>
      <span className="font-mono">{formatRatio(ratio)}</span>
    </div>
  )
}
