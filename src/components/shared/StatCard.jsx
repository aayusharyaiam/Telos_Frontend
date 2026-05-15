export default function StatCard({ title, value, caption, tone = 'indigo' }) {
  const toneRing = tone === 'emerald' ? 'ring-accent-200' : 'ring-primary-200'
  const toneValue = tone === 'emerald' ? 'text-accent-700' : 'text-primary-700'

  return (
    <div className={`rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ${toneRing}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-ink-600">{title}</p>
      <div className={`mt-3 text-3xl font-semibold ${toneValue}`}>{value}</div>
      {caption ? <p className="mt-2 text-sm text-ink-600">{caption}</p> : null}
    </div>
  )
}
