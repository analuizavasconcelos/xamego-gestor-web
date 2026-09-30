import { Pizza } from 'lucide-react'
import type { Product } from '../../types'

interface ProductGridProps {
  products: Product[]
  cart: Array<{ product: Product; quantity: number }>
  onAddToCart: (product: Product) => void
  formatMoney: (value: number) => string
}

export function ProductGrid({ products, cart, onAddToCart, formatMoney }: ProductGridProps) {
  function stockAvailable(product: Product) {
    const inCart = cart.find((c) => c.product.id === product.id)?.quantity ?? 0
    return product.current_stock - inCart
  }

  function getCartQuantity(productId: number) {
    return cart.find((c) => c.product.id === productId)?.quantity ?? 0
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {products.map((p) => {
        const available = stockAvailable(p)
        const inCartCount = getCartQuantity(p.id)
        const isOutOfStock = available <= 0

        return (
          <button
            key={p.id}
            onClick={() => onAddToCart(p)}
            disabled={isOutOfStock}
            className={`group relative bg-white rounded-2xl p-3 text-left border transition-all flex flex-col justify-between select-none ${
              inCartCount > 0
                ? 'border-terracotta/80 ring-1 ring-terracotta/30'
                : 'border-cream-dark hover:border-brown-light/40'
            } ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-cream/20' : 'active:scale-[0.97]'}`}
          >
            {inCartCount > 0 && (
              <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-terracotta text-white font-bold text-xs flex items-center justify-center">
                {inCartCount}
              </span>
            )}

            <div className="aspect-square bg-cream/40 rounded-xl mb-2.5 overflow-hidden relative flex items-center justify-center border border-cream-dark/40">
              {p.image_path ? (
                <img
                  src={`/images/produtos/${p.image_path}`}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Pizza size={32} className="text-brown-light/50" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-brown truncate leading-snug">{p.name}</h3>
              <p className="text-[11px] text-brown-light/80">{p.size}</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-bold text-sage">
                  {formatMoney(Number(p.current_price))}
                </span>
                <span className={`text-[10px] font-medium ${isOutOfStock ? 'text-red-600' : 'text-brown-light/70'}`}>
                  {isOutOfStock ? 'Esgotado' : `${available} un`}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}