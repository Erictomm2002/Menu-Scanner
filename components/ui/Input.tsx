import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass'
  label?: string
  error?: boolean
}

export function Input({ className = '', variant = 'default', label, error = false, ...props }: InputProps) {
  const variantStyles = {
    default: 'border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
    glass: 'bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50',
  }

  return (
    <div className="w-full">
      {label && (
        <label className={`text-xs font-medium mb-1.5 block ${variant === 'glass' ? 'text-white/70' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 transition-all duration-200 ${variantStyles[variant]} ${error && variant === 'glass' ? 'ring-red-500 border-red-400/50' : error ? 'ring-red-500' : ''} ${className}`}
        {...props}
      />
    </div>
  )
}
