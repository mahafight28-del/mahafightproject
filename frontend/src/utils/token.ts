let inMemoryToken: string | null = null

export const setToken = (token: string | null, persist = false) => {
  inMemoryToken = token
  try {
    if (persist) sessionStorage.setItem('mf_token', token ?? '')
    else sessionStorage.removeItem('mf_token')
  } catch {
    // ignore
  }
}

export const getToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken
  try {
    const t = sessionStorage.getItem('mf_token')
    if (t) {
      inMemoryToken = t
      return t
    }
  } catch {}
  return null
}

export const clearToken = () => {
  inMemoryToken = null
  try {
    sessionStorage.removeItem('mf_token')
  } catch {}
}
