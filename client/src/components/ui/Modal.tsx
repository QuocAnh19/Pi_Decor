import { useEffect, ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./Modal.module.scss";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  variant?: "modal" | "drawer";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "640px",
  variant = "modal",
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (variant === "drawer") {
    return (
      <>
        <div className={styles.backdrop} onClick={onClose} />
        <aside className={`${styles.drawer} ${className}`} style={{ maxWidth }}>
          {title && (
            <div className={styles.header}>
              <div className={styles.title}>{title}</div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Đóng"
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>
          )}
          <div className={styles.body}>{children}</div>
        </aside>
      </>
    );
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modal} ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Đóng"
            >
              <XMarkIcon style={{ width: 20, height: 20 }} />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
