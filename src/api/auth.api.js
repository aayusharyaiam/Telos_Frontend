import api from './axiosInstance'

export async function syncUser() {
  const res = await api.post('/auth/sync')
  return res.data.data
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data.data
}
