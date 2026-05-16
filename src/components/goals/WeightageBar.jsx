import Badge from '../shared/Badge'

export default function WeightageBar({ totalWeightage }) {
  const isExact = totalWeightage === 100
  const isOver = totalWeightage > 100

  return (
    <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-900">Weightage Health</p>
          <p className="text-xs text-ink-500">Total must equal 100% to submit.</p>
        </div>
        <Badge tone={isExact ? 'emerald' : 'amber'}>
          {totalWeightage}% allocated — {100 - totalWeightage}% remaining
        </Badge>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-sand-200">
        <div
          className={`h-2 rounded-full transition-all ${isExact ? 'bg-accent-500' : isOver ? 'bg-red-500' : 'bg-primary-500'}`}
          style={{ width: `${Math.min(totalWeightage, 100)}%` }}
        />
      </div>
    </div>
  )
}
