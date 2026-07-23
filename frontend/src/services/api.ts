import axios from 'axios'
import { getAccessToken } from './tokenStorage'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('No se configuro VITE_API_URL')
}

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

export default api