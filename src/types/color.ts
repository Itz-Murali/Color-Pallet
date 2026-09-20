export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Rgba extends Rgb {
  a: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export interface Hsv {
  h: number
  s: number
  v: number
}

export interface Hsva extends Hsv {
  a: number
}
