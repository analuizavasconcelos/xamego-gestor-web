import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  subtitle?: string
  tone?: 'neutral' | 'positive'
  badge?: string
}

export default function MetricCard({ label, value, icon: Icon, subtitle, tone = 'neutral', badge }: MetricCardProps) {
  const valueColor = tone === 'positive' ? 'text-sage' : 'text-brown'

  return (
    <div className="bg-white border border-cream-dark/70 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] font-medium text-brown-light uppercase tracking-wider">{label}</span>
        <Icon size={15} className="text-brown-light/50" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl sm:text-3xl font-display font-semibold ${valueColor} tabular-nums leading-none`}>
          {value}
        </p>
        {badge && (
          <span className="text-[11px] font-bold text-sage bg-sage-light px-1.5 py-0.5 rounded-md">{badge}</span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-brown-light/70 mt-2">{subtitle}</p>}
    </div>
  )
}
