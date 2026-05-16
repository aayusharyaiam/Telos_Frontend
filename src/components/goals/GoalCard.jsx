import Badge from '../shared/Badge'

export default function GoalCard({ goal, canEdit, onUpdateWeightage, onDelete }) {
  return (
    <div className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_auto]">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
          {goal.isShared ? <Badge tone="indigo">Shared</Badge> : null}
        </div>
        <p className="text-xs text-ink-500">{goal.thrustArea}</p>
      </div>
      <div className="text-sm text-ink-700">
        Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        Weightage
        <input
          type="number"
          min="10"
          value={goal.weightage}
          disabled={!canEdit}
          onChange={(event) => onUpdateWeightage(goal, Number(event.target.value))}
          className="w-20 rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm disabled:bg-sand-100"
        />
        %
      </label>
      {canEdit && !goal.isShared ? (
        <button
          className="text-sm font-semibold text-red-600"
          onClick={() => onDelete(goal.id)}
        >
          Delete
        </button>
      ) : canEdit && goal.isShared ? (
        <Badge tone="indigo">Target Locked</Badge>
      ) : (
        <Badge tone={goal.isLocked ? 'emerald' : 'slate'}>{goal.isLocked ? 'Locked' : '--'}</Badge>
      )}
    </div>
  )
}
