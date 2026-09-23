export interface Product {
  id: number
  name: string
  size: string
  image_path: string | null
  current_cost: string
  current_price: string
  current_stock: number
  low_stock_threshold: number
  is_active: boolean
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: string
  unit_cost: string
  total_price: string
  total_profit: string
}

export interface DeliveryZone {
  id: number
  name: string
  customer_fee: string
  courier_fee: string
  is_active: boolean
}

export type OrderStatus = 'pendente' | 'em_preparo' | 'saiu_para_entrega' | 'entregue' | 'cancelado'

export interface Order {
  id: number
  customer_name: string | null
  customer_phone: string | null
  delivery_address: string | null
  delivery_type: 'retirada' | 'entrega'
  delivery_zone_id: number | null
  delivery_zone?: DeliveryZone
  delivery_fee: string
  courier_fee: string
  courier_name: string | null
  courier_settled: boolean
  payment_method: 'dinheiro' | 'pix' | 'cartao'
  change_for: string | null
  total_price: string
  total_profit: string
  status: OrderStatus
  delivered_at: string | null
  items: OrderItem[]
  created_at: string
}

export interface ProfitReport {
  period: { start: string; end: string }
  total_revenue: number
  total_cost: number
  total_profit: number
  total_units_sold: number
  by_product: {
    product_name: string
    product_size: string
    quantity_sold: number
    total_revenue: number
    total_profit: number
  }[]
}