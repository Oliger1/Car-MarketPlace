import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, meAPI } from '../api/client'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [ready, setReady]   = useState(false)

  const loadMe = useCallback(async () => {
    try {
      const r = await meAPI.get()
      setUser(r.data?.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => { loadMe() }, [loadMe])

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password })
    setUser(r.data?.user ?? null)
    return r.data
  }

  const register = async (data) => {
    const r = await authAPI.register(data)
    setUser(r.data?.user ?? null)
    return r.data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth: must be inside AuthProvider')
  return c
}
