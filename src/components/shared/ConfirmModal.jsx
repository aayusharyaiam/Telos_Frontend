export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading = false, tone = 'primary' }) {
  if (!open) return null

  const toneClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-500 hover:bg-amber-600',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 ${toneClasses[tone] || toneClasses.primary}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
