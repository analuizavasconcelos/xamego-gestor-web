import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import IconInput from '../components/IconInput'
import StatusToggleButton from '../components/StatusToggleButton'
import DateBadge from '../components/DateBadge'
import {
  Calendar,
  Clock,
  User,
  AlignLeft,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Trash2,
  X,
  MapPin,
  Wallet,
} from 'lucide-react'

interface Appointment {
  id: number
  client_name: string
  description: string
  address: string | null
  total_value: string | number
  amount_paid: string | number
  date: string
  time: string
  status: 'pendente' | 'concluido'
}

interface CalendarDay {
  day: number
  fullDate: string
  dayAppointments: Appointment[]
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const moneyInputClass =
  'w-full bg-cream/30 border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-terracotta'

function PaymentControl({
  a,
  onChangePaid,
}: {
  a: Appointment
  onChangePaid: (a: Appointment, newPaid: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const total = Number(a.total_value) || 0
  const paid = Number(a.amount_paid) || 0
  if (total <= 0) return null

  const remaining = Math.max(total - paid, 0)
  const isFullyPaid = remaining <= 0
  const percent = Math.min(100, Math.round((paid / total) * 100))

  function save(amountNow: number) {
    if (!amountNow || amountNow <= 0) return
    onChangePaid(a, Math.min(paid + amountNow, total))
    setValue('')
    setOpen(false)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={`font-bold ${isFullyPaid ? 'text-sage' : 'text-amber-700'}`}>
          {isFullyPaid ? 'Pago' : `Falta ${formatMoney(remaining)}`}
        </span>
        <span className="text-brown-light">
          {formatMoney(paid)} de {formatMoney(total)}
        </span>
      </div>

      <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isFullyPaid ? 'bg-sage' : 'bg-amber-400'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {!isFullyPaid && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-terracotta hover:text-terracotta-dark flex items-center gap-1 transition"
        >
          <Wallet size={13} />
          Registrar pagamento
        </button>
      )}

      {!isFullyPaid && open && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Quanto recebeu? (R$)"
              className="flex-1 bg-cream/30 border border-cream-dark rounded-xl h-9 px-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <button
              type="button"
              onClick={() => save(Number(value))}
              className="bg-sage text-white text-xs font-bold px-3 h-9 rounded-xl hover:bg-sage/90 transition"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setValue('')
              }}
              className="text-brown-light text-xs px-1 hover:text-brown transition"
            >
              Cancelar
            </button>
          </div>
          <button
            type="button"
            onClick={() => save(remaining)}
            className="text-xs font-semibold text-sage hover:underline"
          >
            Recebi o restante ({formatMoney(remaining)})
          </button>
        </div>
      )}

      {paid > 0 && !open && (
        <button
          type="button"
          onClick={() => {
            if (confirm('Zerar os pagamentos registrados deste pedido?')) onChangePaid(a, 0)
          }}
          className="block text-[10px] text-brown-light hover:text-brown transition"
        >
          Corrigir (zerar pagamentos)
        </button>
      )}
    </div>
  )
}

export default function Agendamentos() {
  const [view, setView] = useState<'list' | 'calendar'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [totalValue, setTotalValue] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    setLoading(true)
    const res = await api.get<Appointment[]>('/appointments')
    setAppointments(res.data)
    setLoading(false)
  }

  function patchLocal(id: number, patch: Partial<Appointment>) {
    setAppointments((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    setSelectedDay((prev) =>
      prev
        ? { ...prev, dayAppointments: prev.dayAppointments.map((x) => (x.id === id ? { ...x, ...patch } : x)) }
        : prev
    )
  }

  const formTotal = Number(totalValue) || 0
  const formPaid = Number(amountPaid) || 0
  const formRemaining = Math.max(formTotal - formPaid, 0)

  async function handleAddOrder(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (formPaid > formTotal) {
      setFormError('O valor pago não pode ser maior que o total.')
      return
    }

    setSaving(true)
    try {
      await api.post('/appointments', {
        client_name: clientName,
        description,
        address: address.trim() || null,
        total_value: formTotal,
        amount_paid: formPaid,
        date,
        time,
      })
      setClientName('')
      setDescription('')
      setAddress('')
      setTotalValue('')
      setAmountPaid('')
      setDate('')
      setTime('')
      await loadAppointments()
      setView('list')
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao salvar o agendamento.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(a: Appointment) {
    const newStatus = a.status === 'pendente' ? 'concluido' : 'pendente'
    patchLocal(a.id, { status: newStatus })
    await api.put(`/appointments/${a.id}`, { status: newStatus })
  }

  async function changePaid(a: Appointment, newPaid: number) {
    const previous = a.amount_paid
    patchLocal(a.id, { amount_paid: newPaid })
    try {
      await api.put(`/appointments/${a.id}`, { amount_paid: newPaid })
    } catch {
      patchLocal(a.id, { amount_paid: previous })
      alert('Não foi possível salvar o pagamento.')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir este agendamento?')) return
    await api.delete(`/appointments/${id}`)
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    setSelectedDay((prev) => (prev ? { ...prev, dayAppointments: prev.dayAppointments.filter((a) => a.id !== id) } : prev))
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const calendarDays: (CalendarDay | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) {
    const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    calendarDays.push({ day: i, fullDate: dayString, dayAppointments: appointments.filter((a) => a.date === dayString) })
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1))
  }
  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const sortedAppointments = [...appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brown tracking-tight">Agendamentos</h1>
          <p className="text-sm text-brown-light mt-0.5">Pedidos futuros, pra não esquecer nenhum</p>
        </div>

        <div className="bg-cream p-1 rounded-xl flex items-center border border-cream-dark/60">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'calendar' ? 'bg-white text-terracotta' : 'text-brown-light'
            }`}
          >
            <CalendarDays size={15} />
            Calendário
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-white text-terracotta' : 'text-brown-light'
            }`}
          >
            <LayoutList size={15} />
            Lista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 lg:col-span-1">
          <h2 className="text-sm font-medium text-brown flex items-center gap-1.5 mb-4">
            <Plus size={16} className="text-terracotta" />
            Novo agendamento
          </h2>

          <form onSubmit={handleAddOrder} className="space-y-3">
            <IconInput icon={User} label="Cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome do cliente" required />
            <IconInput icon={AlignLeft} label="Pedido" as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: 20 pãezinhos recheados" required />
            <IconInput icon={MapPin} label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro (opcional)" />

            <div className="grid grid-cols-2 gap-2">
              <IconInput icon={Calendar} label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required compact />
              <IconInput icon={Clock} label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} required compact />
            </div>

            {/* Pagamento */}
            <div className="bg-cream/20 p-3 rounded-xl border border-cream-dark space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-brown block mb-1">Valor total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    placeholder="0,00"
                    className={moneyInputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brown block mb-1">Já pagou (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0,00"
                    className={moneyInputClass}
                  />
                </div>
              </div>

              {formTotal > 0 && (
                <>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAmountPaid('')}
                      className="flex-1 text-[11px] font-semibold border border-cream-dark rounded-lg py-1.5 text-brown-light hover:bg-cream transition"
                    >
                      Nada
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid((formTotal / 2).toFixed(2))}
                      className="flex-1 text-[11px] font-semibold border border-cream-dark rounded-lg py-1.5 text-brown-light hover:bg-cream transition"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid(formTotal.toFixed(2))}
                      className="flex-1 text-[11px] font-semibold border border-cream-dark rounded-lg py-1.5 text-brown-light hover:bg-cream transition"
                    >
                      Total
                    </button>
                  </div>
                  <p className="text-[11px] px-1 text-brown-light">
                    {formRemaining > 0 ? (
                      <>Falta receber: <strong className="text-amber-700">{formatMoney(formRemaining)}</strong></>
                    ) : (
                      <strong className="text-sage">Pagamento completo</strong>
                    )}
                  </p>
                </>
              )}
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-terracotta hover:bg-terracotta-dark text-white text-sm font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Agendar pedido'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-brown-light text-center py-10">Carregando...</p>
          ) : view === 'calendar' ? (
            <div className="bg-white p-5 rounded-3xl border border-cream-dark/70">
              <div className="flex items-center justify-between mb-4 border-b border-cream-dark/60 pb-3">
                <h2 className="text-base font-semibold text-brown capitalize">
                  {monthNames[month]} <span className="text-brown-light font-normal">{year}</span>
                </h2>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-cream text-brown-light">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-cream text-brown-light">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-cream-dark/40 rounded-xl overflow-hidden border border-cream-dark/40">
                {weekDays.map((day) => (
                  <div key={day} className="bg-cream/60 py-2 text-center text-[10px] font-medium text-brown-light uppercase">
                    {day}
                  </div>
                ))}
                {calendarDays.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => item && item.dayAppointments.length > 0 && setSelectedDay(item)}
                    className={`bg-white min-h-[88px] p-1.5 text-left ${item ? 'hover:bg-cream/30' : 'cursor-default'} ${
                      item && item.dayAppointments.length > 0 ? 'cursor-pointer' : ''
                    }`}
                  >
                    {item && (
                      <>
                        <div
                          className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                            item.fullDate === new Date().toISOString().split('T')[0] ? 'bg-terracotta text-white' : 'text-brown'
                          }`}
                        >
                          {item.day}
                        </div>
                        <div className="space-y-1">
                          {item.dayAppointments.map((a) => (
                            <div
                              key={a.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                                a.status === 'concluido' ? 'bg-sage-light text-sage' : 'bg-cream text-brown'
                              }`}
                            >
                              {a.time.slice(0, 5)} {a.client_name}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.length === 0 ? (
                <div className="bg-white border border-dashed border-cream-dark rounded-3xl p-12 flex flex-col items-center text-center">
                  <CalendarDays size={32} className="text-brown-light/40 mb-3" />
                  <p className="text-brown font-medium text-sm">Nenhum agendamento</p>
                  <p className="text-xs text-brown-light mt-1">Os pedidos que você agendar aparecem aqui.</p>
                </div>
              ) : (
                sortedAppointments.map((a) => (
                  <div key={a.id} className="bg-white p-4 rounded-2xl border border-cream-dark/70 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <DateBadge date={a.date} time={a.time} />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-brown truncate">{a.client_name}</h3>
                        <p className="text-xs text-brown-light">{a.description}</p>
                        {a.address && (
                          <p className="text-xs text-brown-light mt-1 flex items-center gap-1">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{a.address}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusToggleButton status={a.status} onClick={() => toggleStatus(a)} />
                        <button onClick={() => handleDelete(a.id)} className="text-red-500 p-1.5">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <PaymentControl a={a} onChangePaid={changePaid} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-brown/40 flex items-end md:items-center justify-center p-0 md:p-4 z-20">
          <div className="bg-white rounded-t-2xl md:rounded-3xl p-5 w-full md:max-w-md space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-brown">{formatDate(selectedDay.fullDate)}</h2>
              <button onClick={() => setSelectedDay(null)} className="text-brown-light p-1">
                <X size={18} />
              </button>
            </div>

            {selectedDay.dayAppointments.length === 0 ? (
              <p className="text-sm text-brown-light py-6 text-center">Nenhum agendamento nesse dia.</p>
            ) : (
              <div className="space-y-3">
                {selectedDay.dayAppointments.map((a) => (
                  <div key={a.id} className="border border-cream-dark rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-brown">{a.client_name}</p>
                        <p className="text-xs text-brown-light flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {a.time.slice(0, 5)}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(a.id)} className="text-red-500 shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p className="text-sm text-brown-light mb-2">{a.description}</p>

                    {a.address && (
                      <p className="text-xs text-brown-light mb-3 flex items-center gap-1">
                        <MapPin size={12} className="shrink-0" />
                        {a.address}
                      </p>
                    )}

                    <div className="mb-3">
                      <PaymentControl a={a} onChangePaid={changePaid} />
                    </div>

                    <StatusToggleButton status={a.status} onClick={() => toggleStatus(a)} variant="block" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}