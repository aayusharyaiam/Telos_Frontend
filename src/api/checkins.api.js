import api from './axiosInstance'

export async function getCheckins({ sheetId = 'active', quarter = 'Q2' } = {}) {
  const res = await api.get('/checkins', { params: { sheetId, quarter } })
  return res.data.data
}

export async function upsertCheckin(payload) {
  const res = await api.post('/checkins', payload)
  return res.data.data
}

export async function getTeamCheckinSummary({ employeeId, quarter = 'Q2' } = {}) {
  const res = await api.get('/checkins/team-summary', { params: { employeeId, quarter } })
  return res.data.data
}

export async function submitManagerCheckin(id, managerComment) {
  const res = await api.patch(`/checkins/${id}/manager`, { managerComment })
  return res.data.data
}
