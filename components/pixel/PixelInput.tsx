"use client"

import { ChangeEvent, InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PixelInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  type?: "text" | "number"
  className?: string
}

export default function PixelInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  ...props
}: PixelInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <>
      <div className="px-input-wrapper">
        {label && <label className="px-input-label">{label}</label>}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn("px-input", className)}
          {...props}
        />
      </div>
      <style>{`
        .px-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .px-input {
          border: 2px solid var(--px-border);
          background: var(--px-bg-primary);
          padding: 8px 12px;
          font-family: var(--font-pixel-body);
          font-size: 16px;
          outline: none;
          transition: box-shadow 0.1s;
          width: 100%;
          color: var(--px-text-primary);
        }

        .px-input:focus {
          border-color: var(--px-primary);
          box-shadow: 2px 2px 0 var(--px-primary-dark);
        }

        .px-input-label {
          display: block;
          font-family: var(--font-pixel);
          font-size: 10px;
          margin-bottom: 4px;
          color: var(--px-text-secondary);
        }
      `}</style>
    </>
  )
}
