import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { ProfitReport, Order } from '../types/index'
import MetricCard from '../components/MetricCard'
import OrderListItem from '../components/OrderListItem'
import { TrendingUp, DollarSign, Receipt, Layers, Pizza } from 'lucide-react'

function formatMoney(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function toDateInput(d: Date) {
  return d.toISOString().split('T')[0]
}

const presets = [
  { label: 'Hoje', getRange: () => [new Date(), new Date()] as [Date, Date] },
  {
    label: 'Últimos 7 dias',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [start, end] as [Date, Date]
    },
  },
  {
    label: 'Este mês',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      return [start, end] as [Date, Date]
    },
  },
]

export default function Reports() {
  const [report, setReport] = useState<ProfitReport | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activePreset, setActivePreset] = useState('Hoje')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function loadReport(start: Date, end: Date) {
    setLoading(true)
    try {
      const res = await api.get<ProfitReport>('/reports/profit', {
        params: { start_date: toDateInput(start), end_date: toDateInput(end) },
      })
      setReport(res.data)
    } finally {
      setLoading(false)
    }
  }

  async function loadOrders() {
    setOrdersLoading(true)
    try {
      const res = await api.get('/orders', { params: { status: 'concluido' } })
      setOrders(res.data.data ?? res.data)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    const [start, end] = presets[0].getRange()
    loadReport(start, end)
    loadOrders()
  }, [])

  async function handleDelete(orderId: number) {
    if (!confirm('Excluir este pedido? O estoque será devolvido automaticamente.')) return
    setDeletingId(orderId)
    try {
      await api.delete(`/orders/${orderId}`)
      await loadOrders()
      const [start, end] = presets.find((p) => p.label === activePreset)!.getRange()
      await loadReport(start, end)
    } finally {
      setDeletingId(null)
    }
  }

  const profitMargin =
    report && report.total_revenue > 0 ? ((report.total_profit / report.total_revenue) * 100).toFixed(0) : '0'

  const maxProductProfit = report?.by_product?.length ? Math.max(...report.by_product.map((p) => p.total_profit)) : 1

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-brown tracking-tight">Relatórios</h1>
          <p className="text-xs md:text-sm text-brown-light">Visão financeira e desempenho de produtos</p>
        </div>

        <div className="inline-flex bg-cream/60 p-1 rounded-xl border border-cream-dark/80 self-start sm:self-auto">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setActivePreset(preset.label)
                const [start, end] = preset.getRange()
                loadReport(start, end)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === preset.label ? 'bg-white text-terracotta' : 'text-brown-light hover:text-brown'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !report ? (
        <div className="bg-white rounded-2xl border border-cream-dark p-12 text-center text-xs text-brown-light font-medium">
          Calculando métricas do período...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Faturamento Total"
            value={formatMoney(report.total_revenue)}
            icon={DollarSign}
            subtitle={`${report.total_units_sold} ${report.total_units_sold === 1 ? 'pizza vendida' : 'pizzas vendidas'}`}
          />
          <MetricCard
            label="Custo dos Insumos"
            value={formatMoney(report.total_cost)}
            icon={Receipt}
            subtitle="Gasto estimado na produção"
          />
          <MetricCard
            label="Lucro Líquido"
            value={formatMoney(report.total_profit)}
            icon={TrendingUp}
            subtitle="Retorno líquido no período"
            tone="positive"
            badge={report.total_revenue > 0 ? `${profitMargin}% margem` : undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-cream-dark p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cream-dark/60 pb-3">
            <h2 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={15} className="text-terracotta" />
              Lucro por Sabor
            </h2>
            <span className="text-[11px] text-brown-light font-medium">Por relevância</span>
          </div>

          {loading || !report ? (
            <p className="text-xs text-brown-light text-center py-6">Carregando...</p>
          ) : report.by_product.length === 0 ? (
            <p className="text-xs text-brown-light text-center py-8">Nenhuma venda registrada neste período.</p>
          ) : (
            <div className="space-y-3.5">
              {report.by_product
                .sort((a, b) => b.total_profit - a.total_profit)
                .map((item, i) => {
                  const barWidth = Math.max(8, Math.round((item.total_profit / maxProductProfit) * 100))
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-brown truncate max-w-[160px]">{item.product_name}</span>
                        <div className="text-right">
                          <span className="font-bold text-sage tabular-nums">{formatMoney(item.total_profit)}</span>
                          <span className="text-[10px] text-brown-light block">
                            {item.quantity_sold} {item.quantity_sold === 1 ? 'un' : 'uns'}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-cream/60 rounded-full overflow-hidden">
                        <div className="h-full bg-sage rounded-full transition-all duration-300" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-cream-dark overflow-hidden">
          <div className="px-5 py-3.5 border-b border-cream-dark/60 flex items-center justify-between bg-cream/10">
            <h2 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
              <Pizza size={15} className="text-brown-light" />
              Histórico de Pedidos
            </h2>
            <span className="text-[11px] text-brown-light font-medium">
              {orders.length} {orders.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {ordersLoading ? (
            <div className="p-8 text-center text-xs text-brown-light">Carregando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-brown-light">Nenhum pedido lançado até o momento.</div>
          ) : (
            <div className="divide-y divide-cream-dark/40 max-h-[550px] overflow-y-auto">
              {orders.map((order) => (
                <OrderListItem key={order.id} order={order} onDelete={handleDelete} deleting={deletingId === order.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
