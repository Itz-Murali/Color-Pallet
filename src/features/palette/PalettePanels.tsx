import { Bookmark, BookmarkCheck, CornerDownLeft } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/Button'
import { ColorPicker } from '@/components/ColorPicker'
import { ColorTextInput } from '@/components/ColorTextInput'
import { CopyButton } from '@/components/CopyButton'
import { NumberField } from '@/components/NumberField'
import { Panel } from '@/components/Panel'
import { Swatch } from '@/components/Swatch'
import { useColor } from '@/features/color/color-context'
import { useLibrary } from '@/features/library/library-context'
import { PALETTE_EXPORT_FORMATS, PALETTE_TYPES, formatPalette, toCssRgb } from '@/lib/color'
import type { PaletteColor, PaletteExportFormat, PaletteType, PaletteTypeInfo } from '@/lib/color'
import { cn } from '@/utils/cn'

interface BasePanelProps {
  type: PaletteType
  onTypeChange: (type: PaletteType) => void
  steps: number
  onStepsChange: (steps: number) => void
  info: PaletteTypeInfo
}

export function PaletteControls({ type, onTypeChange, steps, onStepsChange, info }: BasePanelProps) {
  const { hsva, hex, rgba, setHsva, setRgba } = useColor()

  return (
    <div className="space-y-4">
      <Panel title="Base color">
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-2">
            <Swatch color={toCssRgb(rgba)} className="size-8 shrink-0 rounded" />
            <ColorTextInput label="Base color" value={hex} onCommit={setRgba} className="min-w-0 flex-1" />
            <CopyButton value={hex} label="base HEX" />
          </div>
          <ColorPicker value={hsva} onChange={setHsva} showAlpha={false} areaClassName="aspect-[2/1]" label="Base color" />
        </div>
      </Panel>

      <Panel title="Palette type">
        <div className="space-y-3 p-3">
          <div role="group" aria-label="Palette type" className="grid grid-cols-1 gap-1">
            {PALETTE_TYPES.map((option) => {
              const selected = option.id === type
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onTypeChange(option.id)}
                  className={cn(
                    'rounded-md border px-2.5 py-1.5 text-left transition-colors',
                    selected ? 'border-foreground bg-muted' : 'border-transparent hover:bg-muted',
                  )}
                >
                  <span className="block text-[13px] font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                </button>
              )
            })}
          </div>
          {info.adjustable && (
            <NumberField
              label="Number of colors"
              value={steps}
              min={3}
              max={12}
              onChange={onStepsChange}
              className="w-28"
            />
          )}
        </div>
      </Panel>
    </div>
  )
}

interface PaletteResultProps {
  colors: readonly PaletteColor[]
  onUseAsBase: (hex: string) => void
}

export function PaletteResult({ colors, onUseAsBase }: PaletteResultProps) {
  const [format, setFormat] = useState<PaletteExportFormat>('hex')
  const formatId = useId()
  const { isSaved, toggleSaved } = useLibrary()

  return (
    <Panel
      title="Generated palette"
      actions={
        <>
          <label htmlFor={formatId} className="sr-only">
            Copy format
          </label>
          <select
            id={formatId}
            value={format}
            onChange={(event) => setFormat(event.target.value as PaletteExportFormat)}
            className="h-7 rounded-md border border-border-strong bg-background px-1.5 text-xs"
          >
            {PALETTE_EXPORT_FORMATS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <CopyButton variant="text" value={formatPalette(colors, format)} label="palette">
            Copy palette
          </CopyButton>
        </>
      }
    >
      <div className="space-y-3 p-3">
        <div className="flex h-28 overflow-hidden rounded-md border sm:h-36" role="img" aria-label={`Palette of ${colors.length} colors`}>
          {colors.map((color, index) => (
            <span key={`${color.hex}-${index}`} className="h-full flex-1 transition-colors duration-150" style={{ backgroundColor: color.hex }} />
          ))}
        </div>

        <ul className="divide-y">
          {colors.map((color, index) => {
            const saved = isSaved(color.hex)
            return (
              <li key={`${color.hex}-${index}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <Swatch color={color.hex} className="size-8 shrink-0 rounded" />
                <span className="w-14 shrink-0 text-xs text-muted-foreground">{color.label}</span>
                <span className="flex items-center gap-0.5">
                  <code className="w-[4.5rem] font-mono text-[13px]">{color.hex}</code>
                  <CopyButton value={color.hex} label={`${color.hex} HEX`} />
                </span>
                <span className="flex min-w-0 items-center gap-0.5">
                  <code className="truncate font-mono text-[13px]">{color.rgb}</code>
                  <CopyButton value={color.rgb} label={`${color.hex} RGB`} />
                </span>
                <span className="ml-auto flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Use ${color.hex} as base color`}
                    title="Use as base color"
                    onClick={() => onUseAsBase(color.hex)}
                  >
                    <CornerDownLeft className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={saved ? `Remove ${color.hex} from saved` : `Save ${color.hex}`}
                    aria-pressed={saved}
                    title={saved ? 'Remove from saved' : 'Save color'}
                    onClick={() => toggleSaved(color.hex)}
                  >
                    {saved ? <BookmarkCheck className="size-3.5" aria-hidden /> : <Bookmark className="size-3.5" aria-hidden />}
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </Panel>
  )
}
