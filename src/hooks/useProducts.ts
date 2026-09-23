import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    setLoading(true)
    const res = await api.get<Product[]>('/products')
    setProducts(res.data)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { products, loading, reload }
}