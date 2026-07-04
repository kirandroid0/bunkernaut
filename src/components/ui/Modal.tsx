/** Modal overlay for sheets and dialogs. */
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-[var(--color-text)]/50 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50 pixel-box max-h-[85dvh] overflow-y-auto p-5',
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <h2 className="heading-impact text-xl sm:text-2xl mb-4 text-[var(--color-text)]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </>
  )
}
