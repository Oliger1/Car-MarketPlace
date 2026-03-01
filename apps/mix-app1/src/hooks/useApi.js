import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic fetch hook that avoids state updates on unmounted components.
 * Usage: const { data, loading, error, refetch } = useApi(fn, deps)
 */
export function useApi(apiFn, deps = [], initialData = null) {
  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn()
      if (mounted.current) setData(result?.data ?? result)
    } catch (e) {
      if (mounted.current) setError(e?.response?.data?.detail || e?.message || 'Gabim')
    } finally {
      if (mounted.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * Safely extract items + total from any API list response
 */
export function safeList(data) {
  if (!data) return { items: [], total: 0 }
  // Direct array
  if (Array.isArray(data)) return { items: data, total: data.length }
  // {items: [...]}
  if (Array.isArray(data.items)) return { items: data.items, total: data.total ?? data.count ?? data.items.length }
  // {results: [...]}
  if (Array.isArray(data.results)) return { items: data.results, total: data.total ?? data.count ?? data.results.length }
  // {data: [...]}
  if (Array.isArray(data.data)) return { items: data.data, total: data.total ?? data.count ?? data.data.length }
  // {cars: [...]} or {bookings: [...]} etc - any key that is an array
  const arrKey = Object.keys(data).find(k => Array.isArray(data[k]))
  if (arrKey) return { items: data[arrKey], total: data.total ?? data.count ?? data[arrKey].length }
  console.warn('[safeList] unknown shape:', data)
  return { items: [], total: 0 }
}
