/** Pixel-styled button with primary/secondary/ghost/danger variants. */
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'pixel-btn inline-flex items-center justify-center gap-2',
        {
          'bg-[var(--color-primary-btn)] text-[var(--color-primary-btn-text)]':
            variant === 'primary',
          'bg-[var(--color-accent)] text-[var(--color-primary-btn-text)]': variant === 'secondary',
          'bg-transparent text-[var(--color-text-muted)] shadow-none border-transparent':
            variant === 'ghost',
          'bg-[var(--color-text-muted)] text-[var(--color-primary-btn-text)]': variant === 'danger',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        variant === 'ghost' && 'hover:bg-[var(--color-bg-secondary)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
