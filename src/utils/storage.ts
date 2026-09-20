export function readString(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function readJson<T>(key: string, isValid: (value: unknown) => value is T, fallback: T): T {
  const raw = readString(key)
  if (raw === null) return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    return writeString(key, JSON.stringify(value))
  } catch {
    return false
  }
}

export function isStorageAvailable(): boolean {
  try {
    const probe = 'color-pallet:probe'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
