import { Plus, Minus, Trash2, Pizza } from 'lucide-react'
import type { Product } from '../../types'

interface CartItem {
  product: Product
  quantity: number
}

interface CartItemListProps {
  cart: CartItem[]
  onAddToCart: (product: Product) => void
  onDecreaseFromCart: (productId: number) => void
  onRemoveFromCart: (productId: number) => void
  formatMoney: (value: number) => string
}

export function CartItemList({
  cart,
  onAddToCart,
  onDecreaseFromCart,
  onRemoveFromCart,
  formatMoney,
}: CartItemListProps) {
  function stockAvailable(product: Product) {
    const inCart = cart.find((c) => c.product.id === product.id)?.quantity ?? 0
    return product.current_stock - inCart
  }

  if (cart.length === 0) {
    return (
      <div className="py-8 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center text-brown-light/60">
          <Pizza size={24} />
        </div>
        <p className="text-xs font-medium text-brown-light">Nenhum item selecionado</p>
        <p className="text-[11px] text-brown-light/60">Toque nas pizzas ao lado para adicionar à comanda</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-cream-dark/40 max-h-56 overflow-y-auto pr-1">
      {cart.map((c) => (
        <div key={c.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-brown truncate">{c.product.name}</p>
            <p className="text-[11px] text-brown-light">
              {formatMoney(Number(c.product.current_price))} cada
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-cream/40 p-1 rounded-xl border border-cream-dark/60">
            <button
              type="button"
              onClick={() => onDecreaseFromCart(c.product.id)}
              className="w-6 h-6 rounded-lg bg-white text-brown hover:bg-cream flex items-center justify-center transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center font-bold text-brown text-xs">{c.quantity}</span>
            <button
              type="button"
              onClick={() => onAddToCart(c.product)}
              disabled={stockAvailable(c.product) <= 0}
              className="w-6 h-6 rounded-lg bg-white text-brown hover:bg-cream flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemoveFromCart(c.product.id)}
            className="text-brown-light/50 hover:text-red-600 transition-colors p-1"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}