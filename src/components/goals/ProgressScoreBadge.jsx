import { computeScore } from '../../utils/scoreComputer'

export default function ProgressScoreBadge({ uomType, target, actual, targetDate, actualDate }) {
  const result = computeScore({ uomType, target, actual, targetDate, actualDate })

  if (result === null || result === undefined) {
    return <span className="text-sm font-semibold text-ink-500">N/A</span>
  }

  const color = result >= 80 ? 'text-accent-600' : result >= 50 ? 'text-sun-500' : 'text-red-600'

  return (
    <span className={`text-sm font-semibold ${color}`}>
      {Number(result).toFixed(1)}%
    </span>
  )
}
