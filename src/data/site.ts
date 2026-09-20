export const SITE = {
  name: 'Color Pallet',
  tagline: 'Color tools for developers and designers.',
  repoUrl: 'https://github.com/Itz-Murali/Color-Pallet',
  logoUrl: 'https://files.catbox.moe/o949te.png',
} as const

export interface Creator {
  name: string
  handle: string
  githubUrl: string
  imageUrl: string
}

export const CREATORS: readonly Creator[] = [
  {
    name: 'Murali',
    handle: 'Itz-Murali',
    githubUrl: 'https://github.com/Itz-Murali',
    imageUrl: 'https://itz-murali-images.vercel.app/api',
  },
  {
    name: 'Anya',
    handle: 'itz-Anya',
    githubUrl: 'https://github.com/itz-Anya',
    imageUrl: 'https://random-images-anya.vercel.app/anya',
  },
]
