"use client"

import { motion } from "framer-motion"
import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type PixelButtonVariant = "primary" | "secondary" | "danger"

interface PixelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "variant"> {
  variant?: PixelButtonVariant
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const buttonVariants = {
  hover: { y: -2 },
  tap: { y: 2 },
}

export default function PixelButton({
  variant = "primary",
  children,
  icon,
  className,
  disabled,
  ...props
}: PixelButtonProps) {
  return (
    <>
      <motion.button
        type="button"
        onClick={props.onClick}
        disabled={disabled}
        variants={buttonVariants}
        whileHover={disabled ? undefined : "hover"}
        whileTap={disabled ? undefined : "tap"}
        className={cn(
          "px-button",
          variant === "primary" && "px-button-primary",
          variant === "secondary" && "px-button-secondary",
          variant === "danger" && "px-button-danger",
          disabled && "px-button-disabled",
          className
        )}
        {...props}
      >
        {icon && <span className="px-button-icon">{icon}</span>}
        <span>{children}</span>
      </motion.button>
      <style>{`
        .px-button {
          border: 2px solid var(--px-border);
          box-shadow: 2px 2px 0 var(--px-border-light), 4px 4px 0 var(--px-border);
          transition: transform 0.1s, box-shadow 0.1s;
          padding: 12px 24px;
          font-family: var(--font-pixel);
          font-size: 10px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          color: var(--px-text-primary);
        }

        .px-button:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 var(--px-border-light), 5px 5px 0 var(--px-border);
        }

        .px-button:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: inset 2px 2px 0 var(--px-border);
        }

        .px-button-primary {
          background-color: var(--px-primary);
          color: white;
        }

        .px-button-secondary {
          background-color: var(--px-bg-secondary);
          color: var(--px-text-primary);
        }

        .px-button-danger {
          background-color: var(--px-warning);
          color: white;
        }

        .px-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .px-button-icon {
          display: flex;
          align-items: center;
        }
      `}</style>
    </>
  )
}
