import api from './axiosInstance'

// Thrust Areas
export async function getThrustAreas() {
  const res = await api.get('/admin/thrust-areas')
  return res.data.data
}

export async function getActiveThrustAreas() {
  const res = await api.get('/admin/thrust-areas/active')
  return res.data.data
}

export async function createThrustArea(name) {
  const res = await api.post('/admin/thrust-areas', { name })
  return res.data.data
}

export async function updateThrustArea(id, payload) {
  const res = await api.patch(`/admin/thrust-areas/${id}`, payload)
  return res.data.data
}

// Escalation Rules
export async function getEscalationRules() {
  const res = await api.get('/admin/escalation-rules')
  return res.data.data
}

export async function createEscalationRule(payload) {
  const res = await api.post('/admin/escalation-rules', payload)
  return res.data.data
}

export async function updateEscalationRule(id, payload) {
  const res = await api.patch(`/admin/escalation-rules/${id}`, payload)
  return res.data.data
}

// Escalations
export async function getEscalations() {
  const res = await api.get('/admin/escalations')
  return res.data.data
}

export async function resolveEscalation(id) {
  const res = await api.patch(`/admin/escalations/${id}/resolve`)
  return res.data.data
}

export async function runEscalationCheck() {
  const res = await api.post('/admin/escalations/run')
  return res.data.data
}

export async function getEmailLogs(page = 1, limit = 50) {
  const res = await api.get(`/admin/email-logs?page=${page}&limit=${limit}`)
  return res.data.data
}
