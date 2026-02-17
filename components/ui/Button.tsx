import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  gradient?: 'purple-blue' | 'blue-cyan' | 'purple-cyan'
  glow?: boolean
}

export function Button({
  variant = 'default',
  size = 'md',
  gradient = 'purple-blue',
  glow = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center'

  const gradientStyles = {
    'purple-blue': 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500',
    'blue-cyan': 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
    'purple-cyan': 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500',
  }

  const variantStyles = {
    default: 'text-white',
    ghost: 'bg-transparent text-gray-900',
    outline: 'bg-white/10 border-2 border-white/30 text-white hover:bg-white/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${variant === 'default' ? gradientStyles[gradient] : ''} ${glow ? 'shadow-lg shadow-purple-500/50' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

