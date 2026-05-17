import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DisabledButtonHandler({ children, disabled, reason, position = 'top' }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = (e) => {
    if (disabled && reason) {
      e.preventDefault()
      e.stopPropagation()
      toast.error(reason, {
        duration: 3500,
        icon: 'ℹ️',
        style: {
          borderRadius: '12px',
          background: '#fef3c7',
          color: '#92400e',
        },
      })
    }
  }

  const handleMouseEnter = () => {
    if (disabled && reason) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  const tooltipPosition = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 -translate-y-full mt-2',
    bottom: 'top-0 left-1/2 -translate-x-1/2 translate-y-full mb-2',
    left: 'right-0 top-1/2 -translate-y-1/2 mr-2',
    right: 'left-0 top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={handleClick}>
        {children}
      </div>
      
      {showTooltip && reason && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm rounded-lg bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 whitespace-nowrap shadow-lg ${tooltipPosition[position]}`}
          style={{ 
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {reason}
          <div className={`absolute w-2 h-2 bg-ink-900 dark:bg-ink-100 rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`} />
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}