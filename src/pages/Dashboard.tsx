import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useUpcomingAppointments } from '../hooks/useUpcomingAppointments'
import MetricCard from '../components/MetricCard'
import { Plus, TrendingUp, ShoppingBag, TriangleAlert, Layers, ChevronRight, Pizza, CalendarDays } from 'lucide-react'

function formatMoney(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatShortDate(dateString: string) {
  const [, month, day] = dateString.split('-')
  return `${day}/${month}`
}

export default function Dashboard() {
  const { products, todayReport, loading } = useDashboard()
  const { name } = useCurrentUser()
  const { appointments, loading: loadingAppointments } = useUpcomingAppointments()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brown-light">Carregando...</p>
      </div>
    )
  }

  const lowStockProducts = products.filter((p) => p.current_stock <= p.low_stock_threshold)
  const soldUnits = todayReport?.total_units_sold ?? 0
  const revenue = todayReport?.total_revenue ?? 0
  const profit = todayReport?.total_profit ?? 0

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-8">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold text-brown tracking-tight">
            {getGreeting()}, {name}
          </h1>
          <p className="text-sm text-brown-light mt-0.5">Resumo da Xamêgo hoje</p>
        </div>
        <Link
          to="/sales"
          className="inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-dark
                     text-white font-medium text-sm px-5 py-3 rounded-2xl transition-colors shrink-0"
        >
          <Plus size={17} strokeWidth={2.5} />
          Nova venda
        </Link>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Faturamento" value={formatMoney(revenue)} icon={ShoppingBag} subtitle="Total bruto de hoje" />
        <MetricCard label="Lucro" value={formatMoney(profit)} icon={TrendingUp} subtitle="Líquido de hoje" tone="positive" />
        <MetricCard label="Vendidos" value={String(soldUnits)} icon={Pizza} subtitle="Unidades hoje" />
      </section>

      {lowStockProducts.length > 0 && (
        <section className="bg-white border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TriangleAlert size={17} className="text-amber-600 shrink-0" />
            <p className="text-sm text-brown truncate">
              <span className="font-medium">
                {lowStockProducts.length} {lowStockProducts.length === 1 ? 'item' : 'itens'}
              </span>{' '}
              com estoque baixo — {lowStockProducts.map((p) => p.name).join(', ')}
            </p>
          </div>
          <Link to="/products" className="text-xs font-medium text-amber-700 shrink-0">
            Repor
          </Link>
        </section>
      )}

      <section className="bg-white border border-cream-dark/70 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-cream-dark/60">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-brown-light" />
            <h2 className="text-[11px] font-medium text-brown-light uppercase tracking-wider">Próximos agendamentos</h2>
          </div>
          <Link to="/agendamentos" className="text-xs font-medium text-terracotta flex items-center gap-0.5">
            Ver tudo
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="px-6">
          {loadingAppointments ? (
            <p className="text-sm text-brown-light py-6">Carregando...</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-brown-light py-6">Nenhum agendamento pendente.</p>
          ) : (
            <div className="divide-y divide-cream-dark/50">
              {appointments.slice(0, 4).map((a) => (
                <div key={a.id} className="py-3.5 flex items-center gap-4">
                  <div className="bg-cream rounded-xl px-2.5 py-1.5 text-center shrink-0 min-w-[52px]">
                    <p className="text-[10px] font-medium text-terracotta uppercase">{formatShortDate(a.date)}</p>
                    <p className="text-xs font-bold text-brown">{a.time}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brown truncate">{a.client_name}</p>
                    <p className="text-xs text-brown-light truncate">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-cream-dark/70 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-cream-dark/60">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-brown-light" />
            <h2 className="text-[11px] font-medium text-brown-light uppercase tracking-wider">Estoque atual</h2>
          </div>
          <Link to="/products" className="text-xs font-medium text-terracotta flex items-center gap-0.5">
            Ver tudo
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="px-6 divide-y divide-cream-dark/50">
          {products.map((p) => {
            const isLow = p.current_stock <= p.low_stock_threshold
            return (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brown truncate">{p.name}</p>
                  <p className="text-xs text-brown-light">{p.size}</p>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${
                    isLow ? 'bg-amber-100 text-amber-700' : 'bg-sage-light text-sage'
                  }`}
                >
                  {p.current_stock}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
