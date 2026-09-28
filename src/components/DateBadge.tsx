function formatShort(dateString: string) {
  const [, month, day] = dateString.split('-')
  return `${day}/${month}`
}

interface DateBadgeProps {
  date: string
  time: string
}

export default function DateBadge({ date, time }: DateBadgeProps) {
  return (
    <div className="bg-cream rounded-xl px-3 py-2 flex flex-col items-center justify-center min-w-[78px] shrink-0">
      <span className="text-[10px] font-medium text-terracotta uppercase">{formatShort(date)}</span>
      <span className="text-base font-bold text-brown">{time.slice(0, 5)}</span>
    </div>
  )
}
