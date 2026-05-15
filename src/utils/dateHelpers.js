import { format } from 'date-fns'

export function formatDate(value, fmt = 'dd MMM yyyy') {
  if (!value) return 'N/A'
  return format(new Date(value), fmt)
}
