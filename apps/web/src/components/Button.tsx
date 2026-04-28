import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, fullWidth, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 glow-primary disabled:opacity-50 disabled:shadow-none',
      secondary: 'bg-surface-lighter text-white hover:bg-dark-500 active:bg-dark-400 border border-dark-400',
      danger: 'bg-danger text-white hover:bg-danger-700 active:opacity-80 glow-danger',
      outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10 active:bg-primary/20',
      ghost: 'bg-transparent text-dark-100 hover:text-white hover:bg-white/5 active:bg-white/10',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 text-base rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'font-display font-semibold transition-all duration-200 flex items-center justify-center gap-2',
          'active:scale-[0.97] disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Aguarde...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
export default Button
