import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`border border-gray-200 rounded-lg ${className}`}
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
