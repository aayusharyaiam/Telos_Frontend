import api from './axiosInstance'

export async function getMyGoalSheet() {
  const res = await api.get('/goal-sheets/mine')
  return res.data.data
}

export async function createGoalSheet() {
  const res = await api.post('/goal-sheets')
  return res.data.data
}

export async function getTeamGoalSheets() {
  const res = await api.get('/goal-sheets/team')
  return res.data.data
}

export async function getGoalSheet(id) {
  const res = await api.get(`/goal-sheets/${id}`)
  return res.data.data
}

export async function submitGoalSheet(id) {
  const res = await api.patch(`/goal-sheets/${id}/submit`)
  return res.data.data
}

export async function approveGoalSheet(id) {
  const res = await api.patch(`/goal-sheets/${id}/approve`)
  return res.data.data
}

export async function returnGoalSheet(id, reason) {
  const res = await api.patch(`/goal-sheets/${id}/return`, { reason })
  return res.data.data
}
