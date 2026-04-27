// Formata valor em reais
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Formata data relativa
export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`

  return d.toLocaleDateString('pt-BR')
}

// Formata data completa
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Status da corrida em português
export function getRideStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    REQUESTED: 'Solicitada',
    ACCEPTED: 'Aceita',
    ARRIVING: 'Motorista chegando',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
  }
  return labels[status] || status
}

// Cor do status
export function getRideStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REQUESTED: 'text-yellow-600 bg-yellow-50',
    ACCEPTED: 'text-blue-600 bg-blue-50',
    ARRIVING: 'text-blue-600 bg-blue-50',
    IN_PROGRESS: 'text-primary bg-primary-50',
    COMPLETED: 'text-accent bg-green-50',
    CANCELLED: 'text-danger bg-red-50',
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

// Classnames helper simples
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
