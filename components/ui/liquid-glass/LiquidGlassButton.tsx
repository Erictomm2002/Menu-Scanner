"use client"

import React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

type ButtonVariant = "default" | "outline" | "ghost" | "glass"
type ButtonSize = "sm" | "md" | "lg"
type GradientType = "purple-blue" | "blue-cyan" | "purple-cyan" | "none"

interface LiquidGlassButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  gradient?: GradientType
  glow?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit" | "reset"
}

export function LiquidGlassButton({
  variant = "default",
  size = "md",
  gradient = "purple-blue",
  glow = false,
  className = "",
  children,
  disabled,
  onClick,
  type,
}: LiquidGlassButtonProps) {
  const gradientClasses = {
    "purple-blue": "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500",
    "blue-cyan": "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
    "purple-cyan": "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500",
    none: "",
  }

  const variantClasses = {
    default: `text-white font-medium`,
    outline: "bg-white/10 border-2 border-white/30 text-white hover:bg-white/20",
    ghost: "bg-transparent text-white hover:bg-white/10",
    glass: `bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20`,
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  }

  const baseClasses = "rounded-xl transition-all duration-300 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"

  const motionProps: HTMLMotionProps<"button"> = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  }

  return (
    <motion.button
      {...motionProps}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${variant === "default" ? gradientClasses[gradient] : ""}
        ${glow ? "shadow-lg shadow-purple-500/50" : ""}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
