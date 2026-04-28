import { cn } from '../lib/utils'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  REQUESTED: { label: 'Solicitada', color: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  ACCEPTED: { label: 'Aceita', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  ARRIVING: { label: 'A caminho', color: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  IN_PROGRESS: { label: 'Em andamento', color: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent animate-pulse' },
  COMPLETED: { label: 'Concluída', color: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent' },
  CANCELLED: { label: 'Cancelada', color: 'bg-danger/10 text-danger border-danger/20', dot: 'bg-danger' },
  PENDING: { label: 'Pendente', color: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  APPROVED: { label: 'Aprovado', color: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent' },
  BLOCKED: { label: 'Bloqueado', color: 'bg-danger/10 text-danger border-danger/20', dot: 'bg-danger' },
  ONLINE: { label: 'Online', color: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent animate-pulse' },
  OFFLINE: { label: 'Offline', color: 'bg-dark-400/30 text-dark-200 border-dark-400/30', dot: 'bg-dark-300' },
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: 'bg-dark-500/30 text-dark-100 border-dark-400', dot: 'bg-dark-300' }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 border rounded-full font-medium',
      config.color,
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
