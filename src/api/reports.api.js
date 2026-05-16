import api from './axiosInstance'

export async function getCompletionReport(params = {}) {
  const res = await api.get('/reports/completion', { params })
  return res.data.data
}

export async function getAuditReport(params = {}) {
  const res = await api.get('/reports/audit', { params })
  return res.data.data
}

export async function getAchievementReport(format = 'json', filters = {}) {
  const params = { format, ...filters }
  if (format === 'csv' || format === 'xlsx') {
    const res = await api.get('/reports/achievement', {
      params,
      responseType: 'blob',
    })
    return res.data
  }
  const res = await api.get('/reports/achievement', { params })
  return res.data.data
}

export async function getAdminSummary() {
  const res = await api.get('/reports/admin-summary')
  return res.data.data
}

export async function getAnalyticsOverview() {
  const res = await api.get('/reports/analytics/overview')
  return res.data.data
}

export async function getAnalyticsTrends() {
  const res = await api.get('/reports/analytics/trends')
  return res.data.data
}

export async function getAnalyticsDistribution() {
  const res = await api.get('/reports/analytics/distribution')
  return res.data.data
}

export async function getManagerEffectiveness() {
  const res = await api.get('/reports/analytics/manager-effectiveness')
  return res.data.data
}
