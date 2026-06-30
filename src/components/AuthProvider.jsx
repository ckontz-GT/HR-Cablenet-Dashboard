import { createContext, useContext, useState, useCallback } from 'react'

// NOTE: this is a client-side demo gate only. The dashboard contains nothing
// but mock/seeded data, so these credentials guard a demo — they are not real
// authentication and should never protect sensitive data.
const STORAGE_KEY = 'cablenet_hr_authed'
const CREDENTIALS = { username: 'adminGT', password: 'kostis321!@' }

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
  })

  const login = useCallback((username, password) => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      setAuthed(true)
      try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setAuthed(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  return <AuthCtx.Provider value={{ authed, login, logout }}>{children}</AuthCtx.Provider>
}
