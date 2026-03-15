import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neubrutal'
  nbColor?: 'default' | 'accent' | 'white'
}

export function Card({ className = '', variant = 'default', nbColor, children, ...props }: CardProps) {
  // Neubrutal variant styles
  const neubrutalVariantStyles = {
    default: 'nb-bg-primary nb-border-2 nb-shadow-md nb-card-hover nb-transition',
    accent: 'nb-bg-accent nb-border-2 nb-shadow-md nb-card-hover nb-transition',
    white: 'nb-bg-white nb-border-2 nb-shadow-md nb-card-hover nb-transition',
  }

  // Old variants (for backward compatibility)
  const oldVariantStyles = {
    default: 'border border-gray-200 rounded-lg',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg shadow-white/10',
  }

  const getVariantStyles = () => {
    if (variant === 'neubrutal') {
      const color = nbColor || 'default'
      return neubrutalVariantStyles[color] || neubrutalVariantStyles.default
    }
    return oldVariantStyles[variant] || oldVariantStyles.default
  }

  return (
    <div
      className={`${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
