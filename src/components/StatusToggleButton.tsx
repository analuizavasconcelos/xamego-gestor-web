import { CircleDashed, CheckCircle2 } from 'lucide-react'

interface StatusToggleButtonProps {
  status: 'pendente' | 'concluido'
  onClick: () => void
  variant?: 'pill' | 'block'
}

export default function StatusToggleButton({ status, onClick, variant = 'pill' }: StatusToggleButtonProps) {
  const isPending = status === 'pendente'
  const pendingLabel = variant === 'block' ? 'Marcar como concluído' : 'Pendente'

  if (variant === 'block') {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
          isPending ? 'bg-cream text-brown-light hover:bg-cream-dark/60' : 'bg-sage-light text-sage'
        }`}
      >
        {isPending ? <CircleDashed size={16} /> : <CheckCircle2 size={16} />}
        {isPending ? pendingLabel : 'Concluído'}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cream/60 hover:bg-cream transition-colors"
    >
      {isPending ? (
        <>
          <CircleDashed size={16} className="text-brown-light" />
          <span className="text-xs font-medium text-brown-light hidden sm:inline">Pendente</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={16} className="text-sage" />
          <span className="text-xs font-medium text-sage hidden sm:inline">Concluído</span>
        </>
      )}
    </button>
  )
}
