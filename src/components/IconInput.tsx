import type { LucideIcon } from 'lucide-react'

interface IconInputProps {
  icon: LucideIcon
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  as?: 'input' | 'textarea'
  rows?: number
  placeholder?: string
  required?: boolean
  compact?: boolean
}

export default function IconInput({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  as = 'input',
  rows = 3,
  placeholder,
  required,
  compact = false,
}: IconInputProps) {
  const iconSize = compact ? 14 : 15
  const iconPosition = compact ? 'left-2.5' : 'left-3'
  const paddingLeft = compact ? 'pl-8' : 'pl-9'

  const sharedClasses = `w-full ${paddingLeft} pr-3 bg-cream/40 border border-cream-dark rounded-lg text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta/50`

  return (
    <div>
      <label className="text-xs text-brown-light block mb-1">{label}</label>
      <div className="relative">
        <Icon
          size={iconSize}
          className={`absolute ${iconPosition} text-brown-light/60 ${as === 'textarea' ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}
        />
        {as === 'textarea' ? (
          <textarea
            required={required}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${sharedClasses} py-2 resize-none`}
          />
        ) : (
          <input
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${sharedClasses} h-9`}
          />
        )}
      </div>
    </div>
  )
}
