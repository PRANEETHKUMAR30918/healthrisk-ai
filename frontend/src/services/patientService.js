import { api } from './api'

export const patientService = {
  list: async () => {
    const res = await api.get('/api/patients')
    return res.data
  },
  getAll: async () => {
    const res = await api.get('/api/patients')
    return res.data
  },
  get: async (id) => {
    const res = await api.get(`/api/patients/${id}`)
    return res.data
  },
  create: async (data) => {
    const res = await api.post('/api/patients', data)
    return res.data
  },
  update: async (id, data) => {
    const res = await api.put(`/api/patients/${id}`, data)
    return res.data
  },
  delete: async (id) => {
    const res = await api.delete(`/api/patients/${id}`)
    return res.data
  },
  getBiomarkerTrend: async (patientId, biomarker) => {
    const res = await api.get(`/api/patients/${patientId}/biomarkers/${encodeURIComponent(biomarker)}/trend`)
    return res.data
  },
}
