"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LiquidGlassContainerProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassContainer({ children, className = "" }: LiquidGlassContainerProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 ${className}`}>
      {/* Animated Background Blobs */}
      <AnimatePresence>
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-10 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, 30, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
