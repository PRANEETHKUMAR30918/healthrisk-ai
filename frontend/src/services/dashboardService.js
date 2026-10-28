import { api } from './api'

export const dashboardService = {
  getMetrics: async () => {
    const res = await api.get('/api/dashboard')
    return res.data
  },
  getStats: async () => {
    const res = await api.get('/api/dashboard')
    return res.data
  },
}
