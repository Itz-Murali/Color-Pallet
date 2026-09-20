import type { Hsva } from '@/types/color'

export function randomColor(): Hsva {
  return {
    h: Math.floor(Math.random() * 360),
    s: 40 + Math.floor(Math.random() * 56),
    v: 55 + Math.floor(Math.random() * 46),
    a: 1,
  }
}
