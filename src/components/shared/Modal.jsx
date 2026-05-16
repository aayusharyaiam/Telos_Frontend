import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
