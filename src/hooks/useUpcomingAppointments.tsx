import { useEffect, useState } from 'react'
import { api } from '../api/client'

export interface Appointment {
  id: number
  client_name: string
  description: string
  date: string
  time: string
  status: 'pendente' | 'concluido'
}

export function useUpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Appointment[]>('/appointments', { params: { status: 'pendente', upcoming: 1 } })
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  return { appointments, loading }
}