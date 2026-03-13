"use client"

import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PixelRadioProps extends Omit<HTMLAttributes<HTMLLabelElement>, "children"> {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: string
  description?: string
}

export default function PixelRadio({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  className,
  ...props
}: PixelRadioProps) {
  return (
    <>
      <label
        className={cn("px-radio-label", className)}
        {...props}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <span className={cn("px-radio", checked && "px-radio-checked")}>
          {checked && <span className="px-radio-dot" />}
        </span>
        <div>
          <span className="px-radio-label-text">{label}</span>
          {description && <p className="px-radio-description">{description}</p>}
        </div>
      </label>
      <style>{`
        .px-radio-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          padding: 12px;
          border: 2px solid transparent;
          transition: background-color 0.2s;
        }

        .px-radio-label:hover {
          background-color: var(--px-bg-secondary);
        }

        .px-radio {
          width: 20px;
          height: 20px;
          border: 2px solid var(--px-border);
          background: var(--px-bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .px-radio-checked {
          border-color: var(--px-primary);
          background: var(--px-primary-light);
        }

        .px-radio-dot {
          width: 8px;
          height: 8px;
          background: var(--px-primary-dark);
        }

        .px-radio-label-text {
          font-family: var(--font-pixel);
          font-size: 10px;
          display: block;
        }

        .px-radio-description {
          font-family: var(--font-pixel-body);
          font-size: 14px;
          color: var(--px-text-secondary);
          margin-top: 4px;
        }
      `}</style>
    </>
  )
}
