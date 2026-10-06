import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
if (!baseURL && import.meta.env.PROD) {
  console.error('VITE_API_URL não está definida neste build.')
}

export const api = axios.create({
  baseURL: baseURL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xamego_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xamego_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)