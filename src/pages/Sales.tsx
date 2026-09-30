import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product, DeliveryZone } from '../types'
import { CircleCheck, ShoppingBag } from 'lucide-react'

import { ProductGrid } from '../components/sales/ProductGrid'
import { CartItemList } from '../components/sales/CartItemList'
import { CartCheckoutForm } from '../components/sales/CartCheckoutForm'
import { buildWhatsAppMessage } from '@/utils/whatsappMessage'

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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProducts()
    api.get<DeliveryZone[]>('/delivery-zones').then((res) => setZones(res.data))
  }, [])

  function loadProducts() {
    api.get<Product[]>('/products').then((res) => setProducts(res.data))
  }

  function addToCart(product: Product) {
    const inCart = cart.find((c) => c.product.id === product.id)?.quantity ?? 0
    if (product.current_stock - inCart <= 0) return

    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) {
        return prev.map((c) => (c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function decreaseFromCart(productId: number) {
    setCart((prev) =>
      prev.map((c) => (c.product.id === productId ? { ...c, quantity: c.quantity - 1 } : c)).filter((c) => c.quantity > 0)
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

  async function handleCopyWhatsApp() {
    if (cart.length === 0) return

    const message = buildWhatsAppMessage({
      customerName,
      cart,
      deliveryType,
      selectedZoneName: selectedZone?.name,
      deliveryFeeValue,
      paymentMethod,
      grandTotal,
      formatMoney,
    })

    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-cream-dark max-w-md mx-auto my-8">
        <div className="w-20 h-20 rounded-full bg-sage-light text-sage flex items-center justify-center mb-5">
          <CircleCheck size={44} strokeWidth={2.2} />
        </div>
        <h2 className="text-2xl font-bold text-brown">Pedido Registrado!</h2>
        <p className="text-sm text-brown-light mt-1.5 mb-6 max-w-xs">
          O estoque foi baixado e os valores já estão contabilizados no fechamento.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98]"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <ProductGrid products={products} cart={cart} onAddToCart={addToCart} formatMoney={formatMoney} />
        </div>

        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl border border-cream-dark p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
              <h2 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={15} className="text-terracotta" />
                Resumo do Pedido
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            <CartItemList
              cart={cart}
              onAddToCart={addToCart}
              onDecreaseFromCart={decreaseFromCart}
              onRemoveFromCart={removeFromCart}
              formatMoney={formatMoney}
            />

            {cart.length > 0 && (
              <CartCheckoutForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
                zoneId={zoneId}
                setZoneId={setZoneId}
                zones={zones}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                error={error}
                itemsTotal={itemsTotal}
                deliveryFeeValue={deliveryFeeValue}
                selectedZone={selectedZone}
                grandTotal={grandTotal}
                submitting={submitting}
                copied={copied}
                onCopyWhatsApp={handleCopyWhatsApp}
                onConfirm={handleConfirm}
                formatMoney={formatMoney}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}