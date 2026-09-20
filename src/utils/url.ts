function serialize(params: URLSearchParams): string {
  return params.toString().replace(/%2C/gi, ',').replace(/%40/g, '@')
}

export function readSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

export function replaceSearchParams(patch: Record<string, string | undefined>): void {
  const params = readSearchParams()
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === '') params.delete(key)
    else params.set(key, value)
  }
  const query = serialize(params)
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next === current) return
  try {
    window.history.replaceState(window.history.state, '', next)
  } catch {
  }
}
