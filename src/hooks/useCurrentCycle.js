import { useState, useEffect, useCallback } from 'react'
import { getActiveCycle } from '../api/cycles.api'
import useAuth from './useAuth'

export function useCurrentCycle() {
  const { appUser } = useAuth()
  const [cycle, setCycle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCycle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getActiveCycle()
      setCycle(data)
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
      setCycle(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (appUser) fetchCycle()
  }, [appUser, fetchCycle])

  return { cycle, loading, error, refetch: fetchCycle }
}

export default useCurrentCycle
