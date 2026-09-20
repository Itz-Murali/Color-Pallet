import { cn } from '@/utils/cn'

interface SwatchProps {
  color: string
  className?: string
}

export function Swatch({ color, className }: SwatchProps) {
  return (
    <span aria-hidden="true" className={cn('swatch', className)}>
      <span className="absolute inset-0 transition-colors duration-150" style={{ backgroundColor: color }} />
    </span>
  )
}
