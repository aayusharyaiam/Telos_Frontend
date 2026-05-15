import api from './axiosInstance'

export async function getUsers() {
  const res = await api.get('/users')
  return res.data.data
}

export async function updateUser(id, payload) {
  const res = await api.patch(`/users/${id}`, payload)
  return res.data.data
}
