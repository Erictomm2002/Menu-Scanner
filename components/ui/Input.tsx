import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'secondary' | 'glass' | 'neubrutal'
  label?: string
  error?: boolean
}

export function Input({ className = '', variant = 'default', label, error = false, ...props }: InputProps) {
  // Neubrutal variant styles
  const neubrutalVariantStyles = 'nb-bg-white nb-border-2 nb-input-focus nb-transition px-4 py-3 text-[#2D3436] placeholder:text-[#636E72]'

  // New clean design variants
  const newVariantStyles: Record<string, string> = {
    default: 'bg-white border-slate-300 rounded-lg placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    secondary: 'bg-slate-50 border-slate-300 rounded-lg placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  }

  // Old liquid glass variant (for backward compatibility)
  const oldVariantStyles: Record<string, string> = {
    glass: 'bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50',
  }

  // Use new styles for new variants, old styles for glass variant
  const variantStyles = variant === 'neubrutal' ? neubrutalVariantStyles : (variant === 'glass' ? oldVariantStyles.glass : newVariantStyles[variant] || newVariantStyles.default)

  // Label styles
  const labelStyles: Record<string, string> = {
    default: 'text-slate-700',
    secondary: 'text-slate-600',
    glass: 'text-white/70',
    neubrutal: 'text-[#2D3436] font-bold',
  }

  const getLabelStyles = () => {
    return labelStyles[variant] || labelStyles.default
  }

  return (
    <div className="w-full">
      {label && (
        <label className={`text-xs font-semibold mb-1.5 block ${getLabelStyles()}`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm transition-all duration-200 border ${variantStyles} ${error && variant === 'neubrutal' ? 'border-[#FF6B6B] shadow-[2px_2px_0_#FF6B6B]' : error && variant === 'glass' ? 'ring-red-500 border-red-400/50' : error ? 'ring-red-500' : ''} ${className}`}
        {...props}
      />
    </div>
  )
}
