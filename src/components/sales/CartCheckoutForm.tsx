import {
  User,
  Store,
  Bike,
  MapPin,
  QrCode,
  Banknote,
  CreditCard,
  AlertCircle,
  CircleCheck,
  Copy,
  Check,
} from 'lucide-react'
import type { DeliveryZone } from '../../types'

interface CartCheckoutFormProps {
  customerName: string
  setCustomerName: (val: string) => void
  deliveryType: 'retirada' | 'entrega'
  setDeliveryType: (val: 'retirada' | 'entrega') => void
  zoneId: number | null
  setZoneId: (val: number | null) => void
  zones: DeliveryZone[]
  paymentMethod: 'pix' | 'dinheiro' | 'cartao'
  setPaymentMethod: (val: 'pix' | 'dinheiro' | 'cartao') => void
  error: string | null
  itemsTotal: number
  deliveryFeeValue: number
  selectedZone?: DeliveryZone
  grandTotal: number
  submitting: boolean
  copied: boolean
  onCopyWhatsApp: () => void
  onConfirm: () => void
  formatMoney: (val: number) => string
}

const paymentOptions: { id: 'pix' | 'dinheiro' | 'cartao'; label: string; icon: typeof QrCode }[] = [
  { id: 'pix', label: 'Pix', icon: QrCode },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'cartao', label: 'Cartão', icon: CreditCard },
]

export function CartCheckoutForm({
  customerName,
  setCustomerName,
  deliveryType,
  setDeliveryType,
  zoneId,
  setZoneId,
  zones,
  paymentMethod,
  setPaymentMethod,
  error,
  itemsTotal,
  deliveryFeeValue,
  selectedZone,
  grandTotal,
  submitting,
  copied,
  onCopyWhatsApp,
  onConfirm,
  formatMoney,
}: CartCheckoutFormProps) {
  return (
    <div className="space-y-3.5 pt-2 border-t border-cream-dark/60">
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

      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
          Modalidade
        </label>
        <div className="grid grid-cols-2 gap-2 bg-cream/40 p-1 rounded-xl border border-cream-dark/60">
          <button
            type="button"
            onClick={() => { setDeliveryType('retirada'); setZoneId(null) }}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              deliveryType === 'retirada' ? 'bg-white text-brown' : 'text-brown-light hover:text-brown'
            }`}
          >
            <Store size={14} />
            Retirada
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType('entrega')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              deliveryType === 'entrega' ? 'bg-white text-terracotta' : 'text-brown-light hover:text-brown'
            }`}
          >
            <Bike size={14} />
            Entrega
          </button>
        </div>
      </div>

      {deliveryType === 'entrega' && (
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
            Bairro da Entrega *
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light/60 pointer-events-none" />
            <select
              value={zoneId ?? ''}
              onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
              className="w-full pl-9 pr-3 bg-white border border-cream-dark rounded-xl h-9 text-xs sm:text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
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

      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-brown-light block mb-1">
          Forma de Pagamento
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {paymentOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPaymentMethod(id)}
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
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5 pt-2 border-t border-cream-dark/60 text-xs">
        <div className="flex justify-between text-brown-light">
          <span>Subtotal</span>
          <span className="font-semibold text-brown">{formatMoney(itemsTotal)}</span>
        </div>
        {deliveryType === 'entrega' && (
          <div className="flex justify-between text-brown-light">
            <span>Taxa de entrega</span>
            <span className="font-semibold text-terracotta">
              {selectedZone ? formatMoney(deliveryFeeValue) : 'A calcular'}
            </span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-cream-dark/40">
          <span className="text-xs font-bold text-brown uppercase tracking-wider">Total</span>
          <span className="text-xl font-bold text-brown tabular-nums">{formatMoney(grandTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCopyWhatsApp}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
          copied
            ? 'bg-sage-light border-sage/40 text-sage'
            : 'bg-cream/50 border-cream-dark text-brown hover:bg-cream hover:border-brown-light/40'
        }`}
      >
        {copied ? (
          <>
            <Check size={16} className="text-sage" />
            <span>Resumo Copiado!</span>
          </>
        ) : (
          <>
            <Copy size={16} className="text-terracotta" />
            <span>Copiar Resumo p/ WhatsApp</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={submitting}
        className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <CircleCheck size={18} />
        <span>{submitting ? 'Registrando...' : 'Confirmar Pedido'}</span>
      </button>
    </div>
  )
}