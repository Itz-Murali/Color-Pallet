import { Pipette, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { ColorPicker } from '@/components/ColorPicker'
import { Kbd } from '@/components/Kbd'
import { Panel } from '@/components/Panel'
import { parseColor, randomColor } from '@/lib/color'
import { isEyeDropperSupported, pickColorFromScreen } from '@/utils/eyedropper'
import { useColor } from './color-context'
import { FormatConverter } from './FormatConverter'

export function PickerPanel() {
  const { hsva, setHsva, setRgba } = useColor()
  const [canPickFromScreen] = useState(isEyeDropperSupported)

  const pickFromScreen = async () => {
    const picked = await pickColorFromScreen()
    const rgba = picked ? parseColor(picked) : null
    if (rgba) setRgba(rgba)
  }

  return (
    <Panel title="Picker">
      <div className="space-y-4 p-3">
        <ColorPicker value={hsva} onChange={setHsva} />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setHsva(randomColor())}>
            <Shuffle className="size-3.5" aria-hidden />
            Generate random color
            <Kbd>R</Kbd>
          </Button>
          {canPickFromScreen && (
            <Button onClick={() => void pickFromScreen()}>
              <Pipette className="size-3.5" aria-hidden />
              Pick from screen
            </Button>
          )}
        </div>

        <FormatConverter />
      </div>
    </Panel>
  )
}
