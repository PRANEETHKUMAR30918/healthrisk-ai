import { api } from './api'

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    return res.data
  },
  register: async (email, password, full_name, role = 'clinician') => {
    const res = await api.post('/api/auth/register', { email, password, full_name, role })
    return res.data
  },
  registerPatient: async (email, password, full_name, date_of_birth = null, sex = 'M') => {
    const payload = { email, password, full_name, role: 'patient', sex }
    if (date_of_birth) payload.date_of_birth = date_of_birth
    const res = await api.post('/api/auth/register', payload)
    return res.data
  },
}
