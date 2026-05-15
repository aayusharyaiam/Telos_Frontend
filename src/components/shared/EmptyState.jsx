export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white/70 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-ink-800">{title}</h3>
      {description ? <p className="mt-2 text-sm text-ink-600">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
