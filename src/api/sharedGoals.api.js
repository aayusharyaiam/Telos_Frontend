import api from './axiosInstance'

export async function getSharedGoals() {
  const res = await api.get('/shared-goals')
  return res.data.data
}

export async function getSharedGoalRecipients() {
  const res = await api.get('/shared-goals/recipients')
  return res.data.data
}

export async function createSharedGoal(payload) {
  const res = await api.post('/shared-goals', payload)
  return res.data.data
}

export async function updateSharedGoalAchievement(id, payload) {
  const res = await api.patch(`/shared-goals/${id}/achievement`, payload)
  return res.data.data
}
