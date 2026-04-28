import { cn } from '../lib/utils'

interface LoadingSpinnerProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function LoadingSpinner({ text, size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={cn('border-2 border-dark-500 rounded-full', sizes[size])} />
        <div className={cn('absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin', sizes[size])} />
      </div>
      {text && <p className="text-sm text-dark-200 animate-pulse">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex justify-center py-12">{spinner}</div>
}
