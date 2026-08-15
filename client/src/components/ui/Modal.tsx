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
  showCloseButton?: boolean;
  bodyPadding?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "640px",
  variant = "modal",
  className = "",
  showCloseButton = true,
  bodyPadding = true,
}: ModalProps) {
  // Lock outside body scroll when modal is open
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      return;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle Esc key to close modal
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
          {title ? (
            <div className={styles.header}>
              <div className={styles.title}>{title}</div>
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Đóng bảng"
                  title="Đóng (Esc)"
                >
                  <XMarkIcon style={{ width: 20, height: 20 }} />
                </button>
              )}
            </div>
          ) : (
            showCloseButton && (
              <button
                type="button"
                className={styles.closeButtonFloating}
                onClick={onClose}
                aria-label="Đóng bảng"
                title="Đóng (Esc)"
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            )
          )}
          <div className={`${styles.body} ${!bodyPadding ? styles.bodyFlush : ""}`}>
            {children}
          </div>
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
        {title ? (
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Đóng cửa sổ"
                title="Đóng (Esc)"
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            )}
          </div>
        ) : (
          showCloseButton && (
            <button
              type="button"
              className={styles.closeButtonFloating}
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              title="Đóng (Esc)"
            >
              <XMarkIcon style={{ width: 20, height: 20 }} />
            </button>
          )
        )}
        <div className={`${styles.body} ${!bodyPadding ? styles.bodyFlush : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
