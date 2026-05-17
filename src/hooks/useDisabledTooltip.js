import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export default function useDisabledTooltip(disabled, reason) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = useCallback((e) => {
    if (disabled && reason) {
      e.preventDefault()
      e.stopPropagation()
      toast.error(reason, {
        duration: 3000,
        icon: 'ℹ️',
      })
    }
  }, [disabled, reason])

  const handleMouseEnter = useCallback(() => {
    if (disabled && reason) {
      setShowTooltip(true)
    }
  }, [disabled, reason])

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false)
  }, [])

  return {
    showTooltip,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
  }
}