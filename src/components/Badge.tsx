import type { LucideIcon } from 'lucide-react'

interface BadgeProps {
  label: string
  icon?: LucideIcon
  tone?: 'neutral' | 'warning' | 'success' | 'danger'
}

const toneClasses: Record<string, string> = {
  neutral: 'bg-cream text-brown-light',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-sage-light text-sage',
  danger: 'bg-red-50 text-red-600',
}

export default function Badge({ label, icon: Icon, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {Icon && <Icon size={11} />}
      {label}
    </span>
  )
}
