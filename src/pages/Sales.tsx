import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product, DeliveryZone } from '../types/index'
import { 
  CircleCheck, 
  Pizza, 
  Plus, 
  Minus, 
  Trash2, 
  Bike, 
  Store, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ShoppingBag, 
  MapPin, 
  User, 
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface CartItem {
  product: Product
  quantity: number
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([])
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada')
  const [zoneId, setZoneId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao'>('pix')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
    api.get<DeliveryZone[]>('/delivery-zones').then((res) => setZones(res.data))
  }, [])

  function loadProducts() {
    api.get<Product[]>('/products').then((res) => setProducts(res.data))
  }

  function stockAvailable(product: Product) {
    const inCart = cart.find((c) => c.product.id === product.id)?.quantity ?? 0
    return product.current_stock - inCart
  }

  function getCartQuantity(productId: number) {
    return cart.find((c) => c.product.id === productId)?.quantity ?? 0
  }

  function addToCart(product: Product) {
    if (stockAvailable(product) <= 0) return
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function decreaseFromCart(productId: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.product.id === productId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    )
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId))
  }

  const selectedZone = zones.find((z) => z.id === zoneId)
  const itemsTotal = cart.reduce((sum, c) => sum + Number(c.product.current_price) * c.quantity, 0)
  const deliveryFeeValue = deliveryType === 'entrega' && selectedZone ? Number(selectedZone.customer_fee) : 0
  const grandTotal = itemsTotal + deliveryFeeValue
  const totalItemsCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  async function handleConfirm() {
    if (cart.length === 0) return
    if (deliveryType === 'entrega' && !zoneId) {
      setError('Selecione o bairro para calcular a taxa de entrega.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/orders', {
        customer_name: customerName || null,
        delivery_type: deliveryType,
        delivery_zone_id: deliveryType === 'entrega' ? zoneId : null,
        payment_method: paymentMethod,
        status: 'entregue',
        items: cart.map((c) => ({ product_id: c.product.id, quantity: c.quantity })),
      })
      setSuccess(true)
      setCart([])
      setCustomerName('')
      setDeliveryType('retirada')
      setZoneId(null)
      loadProducts()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar o pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-cream-dark shadow-xs max-w-md mx-auto my-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
          <CircleCheck size={44} strokeWidth={2.2} />
        </div>
        <h2 className="text-2xl font-bold text-brown">Pedido Registrado!</h2>
        <p className="text-sm text-brown-light mt-1.5 mb-6 max-w-xs">
          O estoque foi baixado e os valores já estão contabilizados no fechamento.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-semibold py-3.5 px-6 rounded-2xl shadow-sm transition-all active:scale-[0.98]"
        >
          Lançar Novo Pedido
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-brown tracking-tight">Frente de Vendas</h1>
          <p className="text-xs md:text-sm text-brown-light">Selecione os produtos para montar o pedido</p>
        </div>
        {totalItemsCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold">
            <ShoppingBag size={14} />
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'} no pedido
          </span>
        )}
      </div>

      {/*Catálogo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((p) => {
              const available = stockAvailable(p)
              const inCartCount = getCartQuantity(p.id)
              const isOutOfStock = available <= 0

              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={isOutOfStock}
                  className={`group relative bg-white rounded-2xl p-3 text-left border transition-all flex flex-col justify-between select-none ${
                    inCartCount > 0 
                      ? 'border-terracotta/80 shadow-sm ring-1 ring-terracotta/30' 
                      : 'border-cream-dark hover:border-brown-light/40 hover:shadow-xs'
                  } ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-cream/20' : 'active:scale-[0.97]'}`}
                >
                  {/* Badge de quantidade no carrinho */}
                  {inCartCount > 0 && (
                    <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-terracotta text-white font-bold text-xs flex items-center justify-center shadow-sm animate-scale-in">
                      {inCartCount}
                    </span>
                  )}

                  {/* Foto do Produto */}
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

                  {/* Informações */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-brown truncate leading-snug">{p.name}</h3>
                    <p className="text-[11px] text-brown-light/80">{p.size}</p>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xs sm:text-sm font-bold text-emerald-700">
                        {formatMoney(Number(p.current_price))}
                      </span>
                      <span className={`text-[10px] font-medium ${isOutOfStock ? 'text-rose-600' : 'text-brown-light/70'}`}>
                        {isOutOfStock ? 'Esgotado' : `${available} un`}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Resumo da Venda */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl border border-cream-dark shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
              <h2 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={15} className="text-terracotta" />
                Resumo do Pedido
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center text-brown-light/60">
                  <Pizza size={24} />
                </div>
                <p className="text-xs font-medium text-brown-light">Nenhum item selecionado</p>
                <p className="text-[11px] text-brown-light/60">Toque nas pizzas ao lado para adicionar à comanda</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-dark/40 max-h-56 overflow-y-auto pr-1">
                {cart.map((c) => (
                  <div key={c.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brown truncate">{c.product.name}</p>
                      <p className="text-[11px] text-brown-light">
                        {formatMoney(Number(c.product.current_price))} cada
                      </p>
                    </div>

                    {/* Stepper (+ / -) */}
                    <div className="flex items-center gap-1.5 bg-cream/40 p-1 rounded-xl border border-cream-dark/60">
                      <button
                        onClick={() => decreaseFromCart(c.product.id)}
                        className="w-6 h-6 rounded-lg bg-white text-brown hover:bg-cream flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-bold text-brown text-xs">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(c.product)}
                        disabled={stockAvailable(c.product) <= 0}
                        className="w-6 h-6 rounded-lg bg-white text-brown hover:bg-cream flex items-center justify-center disabled:opacity-40 transition-colors shadow-xs"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(c.product.id)}
                      className="text-brown-light/50 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Informações do Cliente e da entrega */}
            {cart.length > 0 && (
              <div className="space-y-3.5 pt-2 border-t border-cream-dark/60">
                {/* Nome do Cliente */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
                    Cliente (opcional)
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light/60" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Dona Marta"
                      className="w-full pl-9 pr-3 bg-cream/20 border border-cream-dark rounded-xl h-9 text-xs sm:text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                </div>

                {/* Tipo de entrega  */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
                    Modalidade
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-cream/40 p-1 rounded-xl border border-cream-dark/60">
                    <button
                      type="button"
                      onClick={() => { setDeliveryType('retirada'); setZoneId(null) }}
                      className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        deliveryType === 'retirada' 
                          ? 'bg-white text-brown shadow-xs' 
                          : 'text-brown-light hover:text-brown'
                      }`}
                    >
                      <Store size={14} />
                      Retirada
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('entrega')}
                      className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        deliveryType === 'entrega' 
                          ? 'bg-white text-terracotta shadow-xs' 
                          : 'text-brown-light hover:text-brown'
                      }`}
                    >
                      <Bike size={14} />
                      Entrega
                    </button>
                  </div>
                </div>

                {/* Bairro */}
                {deliveryType === 'entrega' && (
                  <div className="animate-fade-in">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
                      Bairro da Entrega *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light/60 pointer-events-none" />
                      <select
                        value={zoneId ?? ''}
                        onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full pl-9 pr-3 bg-cream/20 border border-cream-dark rounded-xl h-9 text-xs sm:text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                      >
                        <option value="">Selecione o bairro</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name} ({formatMoney(Number(z.customer_fee))})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Forma de Pagamento */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'pix', label: 'Pix', icon: QrCode },
                      { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                      { id: 'cartao', label: 'Cartão', icon: CreditCard },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === id
                            ? 'bg-terracotta/10 border-terracotta text-terracotta'
                            : 'bg-white border-cream-dark text-brown-light hover:bg-cream/40'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Valores e botão de finalizar */}
                <div className="space-y-1.5 pt-2 border-t border-cream-dark/60 text-xs">
                  <div className="flex justify-between text-brown-light">
                    <span>Subtotal</span>
                    <span className="font-semibold text-brown">{formatMoney(itemsTotal)}</span>
                  </div>
                  {deliveryType === 'entrega' && (
                    <div className="flex justify-between text-brown-light">
                      <span>Taxa de entrega</span>
                      <span className="font-semibold text-blue-600">
                        {selectedZone ? formatMoney(deliveryFeeValue) : 'A calcular'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-cream-dark/40">
                    <span className="text-xs font-bold text-brown uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold text-brown tabular-nums font-sans">
                      {formatMoney(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CircleCheck size={18} />
                  <span>{submitting ? 'Registrando...' : 'Confirmar Pedido'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}