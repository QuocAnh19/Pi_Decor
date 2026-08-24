import { useEffect, useRef, useState, ReactNode } from "react";
import { XMarkIcon, ChevronDoubleUpIcon } from "@heroicons/react/24/outline";
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
  showScrollTopButton?: boolean;
  bodyPadding?: boolean;
  closeOnBackdropClick?: boolean;
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
  showScrollTopButton = true,
  bodyPadding = true,
  closeOnBackdropClick = true,
}: ModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);

  // Lock outside body scroll when modal is open
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      setCanScrollUp(false);
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

  const handleBodyScroll = () => {
    if (bodyRef.current) {
      setCanScrollUp(bodyRef.current.scrollTop > 60);
    }
  };

  const handleScrollTop = () => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  if (variant === "drawer") {
    return (
      <>
        <div
          className={styles.backdrop}
          onClick={closeOnBackdropClick ? onClose : undefined}
          style={{ cursor: closeOnBackdropClick ? "pointer" : "default" }}
        />
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

          <div
            ref={bodyRef}
            onScroll={handleBodyScroll}
            className={`${styles.body} ${!bodyPadding ? styles.bodyFlush : ""}`}
          >
            {children}
          </div>

          {/* Floating Scroll to Top button at bottom-right of popup */}
          {showScrollTopButton && canScrollUp && (
            <button
              type="button"
              className={styles.bottomScrollTopBtn}
              onClick={handleScrollTop}
              title="Cuộn lên đầu trang popup"
              aria-label="Cuộn lên đầu trang popup"
            >
              <ChevronDoubleUpIcon style={{ width: 20, height: 20 }} />
            </button>
          )}
        </aside>
      </>
    );
  }

  return (
    <div
      className={styles.backdrop}
      onClick={closeOnBackdropClick ? onClose : undefined}
      style={{ cursor: closeOnBackdropClick ? "pointer" : "default" }}
    >
      <div
        className={`${styles.modal} ${className}`}
        style={{ maxWidth, cursor: "default" }}
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

        <div
          ref={bodyRef}
          onScroll={handleBodyScroll}
          className={`${styles.body} ${!bodyPadding ? styles.bodyFlush : ""}`}
        >
          {children}
        </div>

        {/* Floating Scroll to Top button at bottom-right of popup */}
        {showScrollTopButton && canScrollUp && (
          <button
            type="button"
            className={styles.bottomScrollTopBtn}
            onClick={handleScrollTop}
            title="Cuộn lên đầu trang popup"
            aria-label="Cuộn lên đầu trang popup"
          >
            <ChevronDoubleUpIcon style={{ width: 20, height: 20 }} />
          </button>
        )}
      </div>
    </div>
  );
}
