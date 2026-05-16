import { useMemo } from 'react'
import { QUARTERS } from '../utils/constants'

export function useWindowStatus(cycle, quarter) {
  return useMemo(() => {
    if (!cycle?.windows) return { isOpen: false, window: null, isForced: false }

    const phase = !quarter || quarter === 'GOAL_SETTING'
      ? 'GOAL_SETTING'
      : `${quarter}_CHECKIN`

    const window = cycle.windows.find(w => w.phase === phase)
    if (!window) return { isOpen: false, window: null, isForced: false }

    const isForced = window.status === 'FORCE_OPEN' || window.status === 'FORCE_CLOSED'
    const isOpen = window.status === 'FORCE_OPEN' ||
      (window.status === 'OPEN' && new Date() >= new Date(window.opensAt) && new Date() <= new Date(window.closesAt))

    return { isOpen, window, isForced }
  }, [cycle, quarter])
}

export default useWindowStatus
