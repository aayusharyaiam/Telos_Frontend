import api from './axiosInstance'

export async function createGoal(payload) {
  const res = await api.post('/goals', payload)
  return res.data.data
}

export async function updateGoal(id, payload) {
  const res = await api.patch(`/goals/${id}`, payload)
  return res.data.data
}

export async function deleteGoal(id) {
  await api.delete(`/goals/${id}`)
}
