"use client"

import { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type PixelCardVariant = "default" | "success" | "info"

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  header?: string
  children: ReactNode
  variant?: PixelCardVariant
  className?: string
}

export default function PixelCard({
  header,
  children,
  variant = "default",
  className,
  ...props
}: PixelCardProps) {
  return (
    <>
      <div
        className={cn(
          "px-card",
          variant === "success" && "px-card-success",
          variant === "info" && "px-card-info",
          className
        )}
        {...props}
      >
        {header && <div className="px-card-header">{header}</div>}
        <div className="px-card-content">{children}</div>
      </div>
      <style>{`
        .px-card {
          border: 3px solid var(--px-border);
          box-shadow: 4px 4px 0 var(--px-border);
          background: var(--px-bg-secondary);
        }

        .px-card-success {
          border-color: var(--px-success);
          box-shadow: 4px 4px 0 var(--px-success);
        }

        .px-card-info {
          border-color: var(--px-info);
          box-shadow: 4px 4px 0 var(--px-info);
        }

        .px-card-header {
          background: var(--px-bg-primary);
          border-bottom: 2px solid var(--px-border);
          padding: 12px 16px;
          font-family: var(--font-pixel);
          font-size: 10px;
        }

        .px-card-content {
          padding: 16px;
        }
      `}</style>
    </>
  )
}
