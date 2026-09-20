interface EyeDropperResult {
  sRGBHex: string
}

interface EyeDropperInstance {
  open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>
}

type EyeDropperConstructor = new () => EyeDropperInstance

function getConstructor(): EyeDropperConstructor | undefined {
  return (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper
}

export function isEyeDropperSupported(): boolean {
  return typeof window !== 'undefined' && getConstructor() !== undefined
}

export async function pickColorFromScreen(): Promise<string | null> {
  const EyeDropper = getConstructor()
  if (!EyeDropper) return null
  try {
    const result = await new EyeDropper().open()
    return result.sRGBHex
  } catch {
    return null
  }
}
