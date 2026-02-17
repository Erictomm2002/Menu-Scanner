import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass'
}

export function Card({ className = '', variant = 'default', children, ...props }: CardProps) {
  const variantStyles = {
    default: 'border border-gray-200 rounded-lg',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg shadow-white/10',
  }

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
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
