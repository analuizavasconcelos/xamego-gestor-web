import { Bike, Store, Trash2 } from 'lucide-react'
import Badge from './Badge'
import type { Order } from '../types/index'

function formatMoney(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const paymentLabels: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
}

interface OrderListItemProps {
  order: Order
  onDelete: (id: number) => void
  deleting: boolean
}

export default function OrderListItem({ order, onDelete, deleting }: OrderListItemProps) {
  const totalQuantity = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  return (
    <div className="p-4 hover:bg-cream/10 transition-colors space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brown">#{order.id}</span>
            <span className="text-xs font-semibold text-brown">
              {order.customer_name || 'Consumidor Balcão'}
            </span>
          </div>
          <span className="text-[10px] text-brown-light block mt-0.5">{formatDateTime(order.created_at)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brown tabular-nums">
            {formatMoney(order.total_price)}
          </span>
          <button
            onClick={() => onDelete(order.id)}
            disabled={deleting}
            className="text-brown-light/40 hover:text-red-600 p-1 transition-colors disabled:opacity-40"
            title="Excluir pedido e estornar estoque"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="text-xs text-brown-light/90 line-clamp-2">
        {order.items?.map((item, idx) => (
          <span key={item.id}>
            {item.quantity}x {item.product?.name ?? 'Pizza'}
            {idx < order.items.length - 1 ? ', ' : ''}
          </span>
        ))}
        <span className="text-brown font-medium"> ({totalQuantity} un)</span>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1">
        <div className="flex items-center gap-2">
          <Badge
            label={order.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'}
            icon={order.delivery_type === 'entrega' ? Bike : Store}
            tone={order.delivery_type === 'entrega' ? 'warning' : 'neutral'}
          />
          <span className="text-brown-light uppercase font-medium">
            {paymentLabels[order.payment_method] || order.payment_method}
          </span>
        </div>

        {order.delivery_type === 'entrega' && Number(order.delivery_fee) > 0 && (
          <span className="text-terracotta font-medium">
            Taxa: {formatMoney(order.delivery_fee)}
          </span>
        )}
      </div>
    </div>
  )
}
