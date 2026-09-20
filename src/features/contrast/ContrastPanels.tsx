import { ArrowLeftRight, Check, X } from 'lucide-react'
import { ColorPicker } from '@/components/ColorPicker'
import { ColorTextInput } from '@/components/ColorTextInput'
import { Button } from '@/components/Button'
import { CopyButton } from '@/components/CopyButton'
import { Panel } from '@/components/Panel'
import { Swatch } from '@/components/Swatch'
import { evaluateContrast, formatRatio, hsvaToRgba, rgbToHex, rgbaToHsva, roundRgb } from '@/lib/color'
import type { ContrastCheck } from '@/lib/color'
import type { Hsva, Rgb } from '@/types/color'
import { cn } from '@/utils/cn'

const toOpaqueRgb = (color: Hsva): Rgb => roundRgb(hsvaToRgba(color))

interface ColorInputPanelProps {
  title: string
  value: Hsva
  onChange: (next: Hsva) => void
}

export function ColorInputPanel({ title, value, onChange }: ColorInputPanelProps) {
  const rgb = toOpaqueRgb(value)
  const hex = rgbToHex(rgb)
  return (
    <Panel title={title}>
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <Swatch color={hex} className="size-8 shrink-0 rounded" />
          <ColorTextInput
            label={`${title} color`}
            value={hex}
            onCommit={(rgba) => onChange({ ...rgbaToHsva({ ...rgba, a: 1 }, value.h) })}
            className="min-w-0 flex-1"
          />
          <CopyButton value={hex} label={`${title.toLowerCase()} HEX`} />
        </div>
        <ColorPicker value={value} onChange={(next) => onChange({ ...next, a: 1 })} showAlpha={false} areaClassName="aspect-[2/1]" label={title} />
      </div>
    </Panel>
  )
}

interface ContrastSummaryProps {
  foreground: Hsva
  background: Hsva
  ratio: number
  onSwap: () => void
}

export function ContrastSummary({ foreground, background, ratio, onSwap }: ContrastSummaryProps) {
  const fg = rgbToHex(toOpaqueRgb(foreground))
  const bg = rgbToHex(toOpaqueRgb(background))
  const checks = evaluateContrast(ratio)
  const quick = [checks[0], checks[3]]

  return (
    <section aria-label="Contrast result" className="rounded-md border bg-panel p-2 lg:p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div
          className="flex min-w-0 flex-1 flex-col justify-center rounded border px-4 py-3 sm:py-4"
          style={{ backgroundColor: bg, color: fg }}
        >
          <p className="truncate text-xl leading-tight font-bold sm:text-2xl">The quick brown fox</p>
          <p className="mt-1 truncate text-sm">Pack my box with five dozen liquor jugs.</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:w-64 sm:flex-col sm:items-start sm:justify-center">
          <div>
            <p className="text-xs text-muted-foreground">Contrast ratio</p>
            <p className="font-mono text-2xl leading-tight font-semibold tabular-nums">{formatRatio(ratio)}</p>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            {quick.map((check) => (
              <PassBadge key={check.id} pass={check.pass} label={`${check.level} normal text`} />
            ))}
          </div>
          <Button size="sm" onClick={onSwap} className="sm:self-stretch">
            <ArrowLeftRight className="size-3.5" aria-hidden />
            Swap
          </Button>
        </div>
      </div>
    </section>
  )
}

function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', pass ? 'text-success' : 'text-danger')}>
      {pass ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
      {label ? `${label}: ` : ''}
      {pass ? 'Pass' : 'Fail'}
    </span>
  )
}

export function ContrastChecks({ ratio }: { ratio: number }) {
  const checks: ContrastCheck[] = evaluateContrast(ratio)
  return (
    <Panel title="WCAG 2.x checks">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="px-3 py-2 font-medium">
                Level
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Applies to
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Needs
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {checks.map((check) => (
              <tr key={check.id}>
                <th scope="row" className="px-3 py-2 text-left font-medium">
                  {check.level}
                </th>
                <td className="px-3 py-2">{check.label}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{check.threshold}:1</td>
                <td className="px-3 py-2">
                  <PassBadge pass={check.pass} label="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
