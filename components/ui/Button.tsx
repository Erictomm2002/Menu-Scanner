import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default' | 'glass' | 'neubrutal'
  nbColor?: 'primary' | 'secondary' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  gradient?: 'purple-blue' | 'blue-cyan' | 'purple-cyan'
  glow?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  gradient = 'purple-blue',
  glow = false,
  className = '',
  children,
  ...props
}, ref) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'

  // New clean design variants
  const newVariantStyles: Record<string, string> = {
    primary: 'bg-[#2463eb] text-white hover:bg-[#1d4ed8]',
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    outline: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400',
    ghost: 'text-slate-600 hover:text-[#2463eb]',
  }

  // Old liquid glass variants (for backward compatibility)
  const oldVariantStyles: Record<string, string> = {
    default: 'text-white',
    ghost: 'bg-transparent text-gray-900',
    outline: 'bg-white/10 border-2 border-white/30 text-white hover:bg-white/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
  }

  const gradientStyles: Record<string, string> = {
    'purple-blue': 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500',
    'blue-cyan': 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
    'purple-cyan': 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500',
  }

  // Neubrutal variant styles
  const neubrutalVariantStyles: Record<string, string> = {
    primary: 'nb-bg-primary nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
    secondary: 'bg-[#4ECDC4] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
    accent: 'bg-[#FF6B9D] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
    outline: 'bg-[#FFF9E6] nb-border-2 nb-shadow-sm nb-button-hover nb-button-active nb-transition text-[#2D3436]',
  }

  // Use new styles for new variants, old styles for old variants
  const isNewVariant = ['primary', 'secondary', 'outline', 'ghost', 'neubrutal'].includes(variant)

  const isNeubrutalVariant = variant === 'neubrutal'

  const getNeubrutalVariant = () => {
    const color = props.nbColor || 'primary'
    return neubrutalVariantStyles[color] || neubrutalVariantStyles.primary
  }

  const getVariantStyles = () => {
    if (isNeubrutalVariant) {
      return getNeubrutalVariant()
    }
    return isNewVariant ? newVariantStyles : oldVariantStyles
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm font-semibold',
    lg: 'px-7 py-3.5 text-base font-semibold',
  }
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${getVariantStyles()} ${sizeStyles[size]} ${variant === 'default' && !isNeubrutalVariant && isNewVariant ? gradientStyles[gradient] : ''} ${glow ? 'shadow-lg shadow-purple-500/50' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'
