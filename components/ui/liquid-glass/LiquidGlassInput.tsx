"use client"

import React from "react"
import { motion } from "framer-motion"

interface LiquidGlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
}

export function LiquidGlassInput({
  label,
  error = false,
  className = "",
  ...props
}: LiquidGlassInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {label && (
        <label className="text-xs font-medium text-white/70 mb-1.5 block">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5
          bg-white/5 backdrop-blur-sm
          border border-white/20 rounded-xl
          text-white placeholder:text-white/40
          focus:outline-none focus:ring-2
          ${error
            ? "ring-red-500 border-red-400/50 focus:border-red-400"
            : "ring-purple-500/50 focus:border-purple-400 focus:ring-purple-500/30"
          }
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    </motion.div>
  )
}
