import { useEffect, useState, useCallback } from 'react'
import { getSavingGoals } from '../lib/supabase/savingGoals'

export function useSavingGoals() {
  const [savingGoals, setSavingGoals] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSavingGoals = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSavingGoals()
      if (Array.isArray(data)) setSavingGoals(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSavingGoals() }, [fetchSavingGoals])

  return { savingGoals, loading, fetchSavingGoals }
}
