import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'icon' | 'icon-sm'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-foreground text-background hover:opacity-90',
  secondary: 'border border-border-strong bg-panel text-foreground hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
}

const SIZES: Record<Size, string> = {
  sm: 'h-7 gap-1.5 px-2.5 text-xs',
  md: 'h-8 gap-2 px-3 text-[13px]',
  icon: 'size-8',
  'icon-sm': 'size-7',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
