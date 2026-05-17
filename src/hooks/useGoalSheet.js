import { useState, useEffect, useCallback } from 'react'
import { getMyGoalSheet, createGoalSheet, getGoalSheet } from '../api/goalSheets.api'
import useAuth from './useAuth'

export function useGoalSheet(sheetId) {
  const { appUser } = useAuth()
  const [goalSheet, setGoalSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSheet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = sheetId
        ? await getGoalSheet(sheetId)
        : await getMyGoalSheet()
      setGoalSheet(data)
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message)
      setGoalSheet(null)
    } finally {
      setLoading(false)
    }
  }, [sheetId])

  useEffect(() => {
    if (appUser) fetchSheet()
  }, [appUser, fetchSheet])

  const ensureSheet = useCallback(async (cycleId) => {
    try {
      const existing = await getMyGoalSheet()
      if (existing) {
        setGoalSheet(existing)
        return existing
      }
    } catch {
      // sheet doesn't exist, will create new one
    }
    const created = await createGoalSheet(cycleId ? { cycleId } : {})
    setGoalSheet(created)
    return created
  }, [])

  return { goalSheet, loading, error, refetch: fetchSheet, ensureSheet, setGoalSheet }
}

export default useGoalSheet
