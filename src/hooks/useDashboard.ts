import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product, ProfitReport } from '../types/index'

export function useDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [todayReport, setTodayReport] = useState<ProfitReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      api.get<Product[]>('/products'),
      api.get<ProfitReport>('/reports/profit', {
        params: { start_date: today, end_date: today },
      }),
    ])
      .then(([productsRes, reportRes]) => {
        setProducts(productsRes.data)
        setTodayReport(reportRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return { products, todayReport, loading }
}