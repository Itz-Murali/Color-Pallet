import { useState } from 'react'
import { SITE } from '@/data/site'
import { cn } from '@/utils/cn'

interface BrandLogoProps {
  size?: number
  className?: string
}

export function BrandLogo({ size = 24, className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
        <rect x="2" y="2" width="9" height="9" rx="2" fill="#7C3AED" />
        <rect x="13" y="2" width="9" height="9" rx="2" fill="#06B6D4" />
        <rect x="2" y="13" width="9" height="9" rx="2" fill="#F97316" />
        <rect x="13" y="13" width="9" height="9" rx="2" fill="#22C55E" />
      </svg>
    )
  }

  return (
    <img
      src={SITE.logoUrl}
      alt=""
      width={size}
      height={size}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-sm object-contain', className)}
    />
  )
}
