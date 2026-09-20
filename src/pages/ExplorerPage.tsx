import { useRef } from 'react'
import { PageHeader } from '@/components/Panel'
import { useColor } from '@/features/color/color-context'
import { ColorCollections } from '@/features/color/ColorCollections'
import { ColorSearch } from '@/features/color/ColorSearch'
import { Inspector } from '@/features/color/Inspector'
import { PickerPanel } from '@/features/color/PickerPanel'
import { useColorUrlSync } from '@/features/color/use-color-url-sync'
import { useHotkey } from '@/hooks/useHotkey'
import { randomColor } from '@/lib/color'

export default function ExplorerPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const { setHsva } = useColor()

  useColorUrlSync()
  useHotkey('r', () => setHsva(randomColor()))
  useHotkey('/', (event) => {
    event.preventDefault()
    searchRef.current?.focus()
  })

  return (
    <>
      <PageHeader
        title="Color explorer"
        description="Search, pick and convert colors."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <ColorSearch inputRef={searchRef} />
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
            <PickerPanel />
            <Inspector />
          </div>
          <ColorCollections />
        </div>
      </div>
    </>
  )
}
