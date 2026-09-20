import { Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Button } from '@/components/Button'
import { Kbd } from '@/components/Kbd'
import { Panel } from '@/components/Panel'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Swatch } from '@/components/Swatch'
import { parseColorInput, toCssRgb } from '@/lib/color'
import { cn } from '@/utils/cn'
import { useColor } from './color-context'
import { getColorIndex, searchColors } from './color-index'
import type { GroupFilter, IndexedColor } from './color-index'

const PAGE_SIZE = 60
const POPULAR = ['Red', 'Blue', 'Purple', 'Cyan', 'Orange', 'Pink', 'Green', 'Yellow', 'Black', 'White', 'Gray']

const GROUP_OPTIONS: ReadonlyArray<{ value: GroupFilter; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'CSS', label: 'CSS' },
  { value: 'Tailwind', label: 'Tailwind' },
  { value: 'Developer', label: 'Dev' },
]

interface ColorSearchProps {
  inputRef: RefObject<HTMLInputElement | null>
}

export function ColorSearch({ inputRef }: ColorSearchProps) {
  const inputId = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const { rgba, hex, setRgba } = useColor()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<GroupFilter>('All')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const parsed = useMemo(() => parseColorInput(query), [query])
  const results = useMemo(() => searchColors(query, group), [query, group])
  const popular = useMemo(
    () =>
      POPULAR.map((name) => getColorIndex().find((color) => color.name === name)).filter(
        (color): color is IndexedColor => color !== undefined,
      ),
    [],
  )

  const isExplicitValue =
    parsed !== null && parsed.kind !== 'name' && (parsed.kind !== 'hex' || query.trim().startsWith('#'))

  useEffect(() => {
    if (isExplicitValue && parsed) setRgba(parsed.rgba)
  }, [isExplicitValue, parsed, setRgba])

  const apply = (color: IndexedColor) => setRgba({ ...color.channels, a: 1 })
  const visible = results.slice(0, limit)
  const hasQuery = query.trim() !== ''

  const status = !hasQuery
    ? `${results.length} colors`
    : isExplicitValue
      ? 'Color value applied'
      : results.length === 0
        ? 'No matches'
        : `${results.length} ${results.length === 1 ? 'match' : 'matches'}`

  return (
    <Panel
      title="Search colors"
      actions={
        <span className="flex items-center gap-1.5 text-xs">
          <Swatch color={toCssRgb(rgba)} className="size-3.5 rounded-sm" />
          <span className="font-mono">{hex}</span>
        </span>
      }
    >
      <div className="space-y-3 p-3">
        <div className="relative">
          <label htmlFor={inputId} className="sr-only">
            Search colors by name, HEX, RGB or HSL
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Name, #hex, rgb(), hsl()"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            enterKeyHint="search"
            onChange={(event) => {
              setQuery(event.target.value)
              setLimit(PAGE_SIZE)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (parsed) setRgba(parsed.rgba)
                else if (results[0]) apply(results[0])
              } else if (event.key === 'ArrowDown') {
                const first = listRef.current?.querySelector('button')
                if (first) {
                  event.preventDefault()
                  first.focus()
                }
              } else if (event.key === 'Escape') {
                setQuery('')
              }
            }}
            className="h-9 w-full rounded-md border border-border-strong bg-background pr-16 pl-8 text-[13px]"
          />
          <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
            {hasQuery ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            ) : (
              <span className="hidden pr-1.5 lg:block">
                <Kbd>/</Kbd>
              </span>
            )}
          </div>
        </div>

        {!hasQuery && (
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Popular</p>
            <ul className="flex flex-wrap gap-1.5">
              {popular.map((color) => (
                <li key={color.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(color.name)
                      apply(color)
                    }}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border pr-2 pl-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Swatch color={color.hex} className="size-3.5 rounded-sm" />
                    {color.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <SegmentedControl label="Filter by collection" options={GROUP_OPTIONS} value={group} onChange={setGroup} />
          <p role="status" className="text-xs text-muted-foreground">
            {status}
          </p>
        </div>

        {results.length > 0 ? (
          <ul ref={listRef} aria-label="Color results" className="max-h-80 divide-y overflow-y-auto rounded-md border lg:max-h-[30rem]">
            {visible.map((color) => {
              const current = color.hex === hex
              return (
                <li key={color.name}>
                  <button
                    type="button"
                    aria-current={current ? 'true' : undefined}
                    onClick={() => apply(color)}
                    className={cn(
                      'flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors hover:bg-muted',
                      current && 'bg-muted',
                    )}
                  >
                    <Swatch color={color.hex} className="size-8 shrink-0 rounded" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13px] font-medium">{color.name}</span>
                        <span className="shrink-0 font-mono text-xs">{color.hex}</span>
                      </span>
                      <span className="block truncate font-mono text-[11px] leading-4 text-muted-foreground">
                        {color.rgb}
                      </span>
                      <span className="block truncate font-mono text-[11px] leading-4 text-muted-foreground">
                        {color.hsl}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {results.length > limit && (
              <li className="p-2">
                <Button className="w-full" size="sm" onClick={() => setLimit((current) => current + PAGE_SIZE)}>
                  Show more ({results.length - limit} left)
                </Button>
              </li>
            )}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed px-3 py-6 text-center text-[13px] text-muted-foreground">
            No colors match your search.
          </p>
        )}
      </div>
    </Panel>
  )
}
