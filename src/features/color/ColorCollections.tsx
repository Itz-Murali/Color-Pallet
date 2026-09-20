import { Button } from '@/components/Button'
import { Link } from '@/components/Link'
import { Panel } from '@/components/Panel'
import { Swatch } from '@/components/Swatch'
import { useLibrary } from '@/features/library/library-context'
import { hexToRgba } from '@/lib/color'
import { cn } from '@/utils/cn'
import { useColor } from './color-context'

const SAVED_PREVIEW = 14

export function ColorCollections() {
  const { hex, setRgba } = useColor()
  const { recent, saved, clearRecent } = useLibrary()

  const use = (value: string) => {
    const rgba = hexToRgba(value)
    if (rgba) setRgba(rgba)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Panel
        title="Recent"
        actions={
          recent.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearRecent}>
              Clear
            </Button>
          ) : null
        }
      >
        <div className="p-3">
          {recent.length > 0 ? (
            <ColorChips colors={recent} activeHex={hex} onPick={use} />
          ) : (
            <p className="text-[13px] text-muted-foreground">No recent colors.</p>
          )}
        </div>
      </Panel>

      <Panel
        title="Saved"
        actions={
          saved.length > 0 ? (
            <Link to="/saved" className="px-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
              View all {saved.length}
            </Link>
          ) : null
        }
      >
        <div className="p-3">
          {saved.length > 0 ? (
            <ColorChips colors={saved.slice(0, SAVED_PREVIEW).map((item) => item.hex)} activeHex={hex} onPick={use} />
          ) : (
            <p className="text-[13px] text-muted-foreground">No saved colors.</p>
          )}
        </div>
      </Panel>
    </div>
  )
}

function ColorChips({
  colors,
  activeHex,
  onPick,
}: {
  colors: readonly string[]
  activeHex: string
  onPick: (hex: string) => void
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {colors.map((color) => (
        <li key={color}>
          <button
            type="button"
            onClick={() => onPick(color)}
            aria-label={`Use ${color}`}
            aria-current={color === activeHex ? 'true' : undefined}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md border pr-2 pl-1.5 font-mono text-xs transition-colors hover:bg-muted',
              color === activeHex && 'border-foreground',
            )}
          >
            <Swatch color={color} className="size-4 rounded-sm" />
            {color}
          </button>
        </li>
      ))}
    </ul>
  )
}
