import api from './axiosInstance'

export async function getCompletionReport() {
  const res = await api.get('/reports/completion')
  return res.data.data
}
