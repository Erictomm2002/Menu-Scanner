"use client"

import React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface LiquidGlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  blurAmount?: "sm" | "md" | "lg" | "xl"
  opacity?: "low" | "medium" | "high"
}

export function LiquidGlassCard({
  children,
  className = "",
  blurAmount = "md",
  opacity = "medium",
  ...props
}: LiquidGlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  }

  const opacityClasses = {
    low: "bg-white/5",
    medium: "bg-white/10",
    high: "bg-white/15",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        ${opacityClasses[opacity]}
        ${blurClasses[blurAmount]}
        border border-white/20
        rounded-2xl
        shadow-lg
        shadow-white/10
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
