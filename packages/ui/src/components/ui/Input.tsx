import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', style, ...rest }, ref) => {
    return (
      <label className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <span className="label">{label}</span>
        )}
        <input
          ref={ref}
          className="text-sm outline-none transition-colors duration-150"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            fontSize: 13,
            ...style,
          }}
          {...rest}
        />
      </label>
    )
  },
)

Input.displayName = 'Input'
