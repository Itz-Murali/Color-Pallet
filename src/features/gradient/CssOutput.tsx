import { CopyButton } from '@/components/CopyButton'
import { Panel } from '@/components/Panel'
import { SegmentedControl } from '@/components/SegmentedControl'
import type { CssColorFormat } from '@/lib/color'
import { buildGradientCss, buildGradientValue } from '@/lib/gradient'
import type { GradientState } from '@/lib/gradient'

const FORMATS: ReadonlyArray<{ value: CssColorFormat; label: string }> = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
]

interface CssOutputProps {
  gradient: GradientState
  format: CssColorFormat
  onFormatChange: (format: CssColorFormat) => void
}

export function CssOutput({ gradient, format, onFormatChange }: CssOutputProps) {
  return (
    <Panel
      title="CSS output"
      actions={
        <>
          <SegmentedControl label="Color format in output" options={FORMATS} value={format} onChange={onFormatChange} />
          <CopyButton variant="text" value={buildGradientValue(gradient, format)} label="gradient value">
            Copy value
          </CopyButton>
          <CopyButton variant="text" value={buildGradientCss(gradient, format)} label="CSS">
            Copy CSS
          </CopyButton>
        </>
      }
    >
      <pre tabIndex={0} aria-label="Generated CSS" className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed">
        <code>{buildGradientCss(gradient, format)}</code>
      </pre>
    </Panel>
  )
}
