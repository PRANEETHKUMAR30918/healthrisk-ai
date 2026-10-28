import { api } from './api'

export const reportService = {
  upload: async (patientId, file, reportDate, labName) => {
    const form = new FormData()
    form.append('patient_id', patientId)
    form.append('file', file)
    if (reportDate) form.append('report_date', reportDate)
    if (labName) form.append('lab_name', labName)

    const res = await api.post('/api/reports/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  list: async (patientId)=> {
    const res = await api.get('/api/reports', { params: { patient_id: patientId } })
    return res.data
  },
  get: async (id)=> {
    const res = await api.get(`/api/reports/${id}`)
    return res.data
  },
  extract: async (reportId) => {
    const res = await api.post(`/api/reports/${reportId}/extract`)
    return res.data
  },
  getExtraction: async (reportId) => {
    const res = await api.get(`/api/reports/${reportId}/extraction`)
    return res.data
  },
  correctBiomarker: async (reportId, biomarkerId, value, unit) => {
    const res = await api.put(`/api/reports/${reportId}/extraction/${biomarkerId}`, {
      corrected_value: value,
      corrected_unit: unit,
    })
    return res.data
  },
  analyze: async (reportId) => {
    const res = await api.post(`/api/reports/${reportId}/analyze`)
    return res.data
  },
  getBaseline: async (reportId) => {
    const res = await api.get(`/api/reports/${reportId}/baseline`)
    return res.data
  },
  getConsistency: async (reportId) => {
    const res = await api.get(`/api/reports/${reportId}/consistency`)
    return res.data
  },
  getRisk: async (reportId) => {
    const res = await api.get(`/api/reports/${reportId}/risk`)
    return res.data
  },
  getSummary: async (reportId) => {
    const res = await api.get(`/api/reports/${reportId}/summary`)
    return res.data
  },
}
