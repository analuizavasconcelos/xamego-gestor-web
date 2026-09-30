export interface MessageData {
  customerName?: string
  cart: Array<{ product: { name: string; current_price: string | number }; quantity: number }>
  deliveryType: 'retirada' | 'entrega'
  selectedZoneName?: string
  deliveryFeeValue: number
  paymentMethod: 'pix' | 'dinheiro' | 'cartao'
  grandTotal: number
  formatMoney: (val: number) => string
}

const paymentLabels: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
}

export function buildWhatsAppMessage({
  customerName,
  cart,
  deliveryType,
  selectedZoneName,
  deliveryFeeValue,
  paymentMethod,
  grandTotal,
  formatMoney,
}: MessageData): string {
  const pixKey = import.meta.env.VITE_PIX_KEY || 'Chave não cadastrada'
  const pixName = import.meta.env.VITE_PIX_NAME || 'Nome não cadastrado'

  const itemsText = cart
    .map(
      (c) =>
        `• ${c.quantity}x *${c.product.name}* (${formatMoney(Number(c.product.current_price) * c.quantity)})`
    )
    .join('\n')

  const deliveryText =
    deliveryType === 'entrega'
      ? `🛵 *Taxa de Entrega:* ${formatMoney(deliveryFeeValue)}${
          selectedZoneName ? ` (${selectedZoneName})` : ''
        }`
      : `🛍️ *Modalidade:* Retirada no local`

  const clientText = customerName ? `Cliente: *${customerName}*\n` : ''

  const pixInfoText =
    paymentMethod === 'pix'
      ? `\n🔑 *Chave Pix:* ${pixKey}\n👤 *Titular:* ${pixName}\n`
      : ''

  return (
    `🍕 *XAMEGO ARTESANAL — RESUMO DO PEDIDO* 🍕\n\n` +
    `${clientText}` +
    `${itemsText}\n\n` +
    `-----------------------------------\n` +
    `${deliveryText}\n` +
    `💳 *Forma de Pagamento:* ${paymentLabels[paymentMethod] ?? paymentMethod}\n` +
    `${pixInfoText}` +
    `💰 *Valor Total:* *${formatMoney(grandTotal)}*\n` +
    `-----------------------------------\n\n` +
    `Seu pedido já foi recebido! Qualquer dúvida, estamos à disposição. 😊`
  )
}