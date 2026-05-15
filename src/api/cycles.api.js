import api from './axiosInstance'

export async function getCycles() {
  const res = await api.get('/cycles')
  return res.data.data
}

export async function getActiveCycle() {
  const res = await api.get('/cycles/active')
  return res.data.data
}

export async function updateCycleWindow(cycleId, phase, status) {
  const res = await api.patch(`/cycles/${cycleId}/windows/${phase}`, { status })
  return res.data.data
}
