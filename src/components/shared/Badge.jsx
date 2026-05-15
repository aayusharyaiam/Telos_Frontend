const toneStyles = {
  slate: 'bg-sand-200 text-ink-800',
  indigo: 'bg-primary-100 text-primary-700',
  emerald: 'bg-accent-100 text-accent-700',
  amber: 'bg-sun-400/20 text-ink-800',
  red: 'bg-red-100 text-red-700',
}

export default function Badge({ children, tone = 'slate' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone] || toneStyles.slate}`}
    >
      {children}
    </span>
  )
}
