import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { Bike, CheckCircle2, Clock, User } from 'lucide-react'

interface CourierOrder {
  id: number
  customer_name: string | null
  delivery_address: string | null
  courier_name: string | null
  payment_method: string
  courier_fee: number | string
  total_price: number | string
  courier_settled: boolean
}

interface SettlementData {
  date: string
  courier_name: string
  total_deliveries: number
  total_fees_to_pay: number
  cash_collected: number
  net_balance: number
  settled_all: boolean
  orders: CourierOrder[]
}

export default function Courier() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [courierName, setCourierName] = useState('')
  const [data, setData] = useState<SettlementData | null>(null)
  const [loading, setLoading] = useState(false)
  const [settling, setSettling] = useState(false)

  async function fetchSummary() {
    setLoading(true)
    try {
      const response = await api.get<SettlementData>('/courier/settlement', {
        params: {
          date,
          courier_name: courierName || undefined,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao buscar acerto do motoboy:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSettle() {
    if (!window.confirm('Confirma o acerto de contas com o entregador para esta data?')) {
      return
    }

    setSettling(true)
    try {
      await api.post('/courier/settle', {
        date,
        courier_name: courierName || undefined,
      })
      await fetchSummary()
    } catch (error) {
      console.error('Erro ao registrar acerto:', error)
      alert('Não foi possível registrar o acerto.')
    } finally {
      setSettling(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [date, courierName])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold text-brown flex items-center gap-2">
          <Bike size={20} className="text-terracotta" strokeWidth={2.2} />
          Acerto de Motoboy
        </h1>
        <p className="text-sm text-brown-light">Fechamento de taxas por bairro e conferência de caixa</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-cream-dark p-4 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 px-3 text-sm bg-white border border-cream-dark rounded-lg text-brown"
        />
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light" />
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="h-9 pl-8 pr-3 text-sm bg-white border border-cream-dark rounded-lg text-brown placeholder:text-brown-light/60"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-brown-light text-center py-10">Carregando...</p>
      ) : data ? (
        <>
          {/* Cards métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-cream-dark p-4">
              <p className="text-xs text-brown-light mb-1">Entregas feitas</p>
              <p className="text-2xl font-bold text-brown">{data.total_deliveries}</p>
            </div>

            <div className="bg-white rounded-xl border border-cream-dark p-4">
              <p className="text-xs text-brown-light mb-1">Taxas do motoboy</p>
              <p className="text-2xl font-bold text-terracotta">
                {Number(data.total_fees_to_pay || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-cream-dark p-4">
              <p className="text-xs text-brown-light mb-1">Dinheiro na mão dele</p>
              <p className="text-2xl font-bold text-amber-700">
                {Number(data.cash_collected || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                data.net_balance >= 0 ? 'bg-sage-light border-sage/30' : 'bg-red-50 border-red-200'
              }`}
            >
              <p className={`text-xs mb-1 ${data.net_balance >= 0 ? 'text-sage' : 'text-red-600'}`}>
                {data.net_balance >= 0 ? 'Motoboy te repassa' : 'Você paga ao motoboy'}
              </p>
              <p className={`text-2xl font-bold ${data.net_balance >= 0 ? 'text-sage' : 'text-red-600'}`}>
                {Math.abs(Number(data.net_balance || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {/* Lista de entregas do dia */}
          <div className="bg-white rounded-xl border border-cream-dark overflow-hidden">
            <div className="px-4 py-3 border-b border-cream-dark flex items-center justify-between">
              <h2 className="text-sm font-medium text-brown-light">Entregas concluídas</h2>
              <span className="text-xs text-brown-light">
                {data.orders?.length || 0} {data.orders?.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>

            {!data.orders || data.orders.length === 0 ? (
              <p className="p-6 text-center text-sm text-brown-light">
                Nenhuma entrega com status "entregue" registrada para os filtros selecionados.
              </p>
            ) : (
              <div className="divide-y divide-cream-dark">
                {data.orders.map((order) => (
                  <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-brown">
                          #{order.id} {order.customer_name || 'Sem nome'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream text-brown-light font-medium capitalize">
                          {order.payment_method}
                        </span>
                        {order.courier_settled ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage-light text-sage font-medium">
                            Acertado
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brown-light mt-1">
                        {order.delivery_address || 'Endereço não informado'} · Entregador:{' '}
                        <span className="text-brown font-medium">{order.courier_name || 'Não atribuído'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <p className="text-brown-light mb-0.5">Taxa motoboy</p>
                        <p className="font-bold text-terracotta">
                          {Number(order.courier_fee || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-brown-light mb-0.5">Total pedido</p>
                        <p className="font-bold text-brown">
                          {Number(order.total_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* fechamento */}
            <div className="p-4 bg-cream border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-brown-light">
                {data.settled_all ? (
                  <>
                    <CheckCircle2 size={16} className="text-sage" />
                    <span>Todas as entregas deste dia já foram acertadas.</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} className="text-amber-600" />
                    <span>Existem entregas pendentes de conferência e quitação.</span>
                  </>
                )}
              </div>

              <button
                onClick={handleSettle}
                disabled={data.settled_all || !data.total_deliveries || settling}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                {settling ? 'Liquidando...' : data.settled_all ? 'Dia já acertado' : 'Concluir acerto do dia'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}