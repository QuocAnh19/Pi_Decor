import { ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Modal } from "../ui/Modal";
import styles from "./adminComponents.module.scss";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  message?: ReactNode;
  warningText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

/**
 * Modal xác nhận xoá thay thế cho window.confirm() trình duyệt.
 * Đảm bảo trải nghiệm UI hiện đại, không chặn luồng UI và nhất quán với design system.
 */
export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xoá",
  itemName,
  message,
  warningText = "Hành động này không thể hoàn tác.",
  confirmLabel = "Xác nhận xoá",
  cancelLabel = "Huỷ bỏ",
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="480px" title={title}>
      <div className={styles.confirmDeleteBody}>
        <div className={styles.confirmDeleteIconWrap}>
          <ExclamationTriangleIcon
            className="h-6 w-6"
            style={{ width: 28, height: 28, color: "#b91c1c" }}
          />
        </div>
        <div className={styles.confirmDeleteText}>
          {message || (
            <p>
              Bạn có chắc chắn muốn xoá{" "}
              {itemName ? <strong>{itemName}</strong> : "mục này"} khỏi hệ thống?
            </p>
          )}
          {warningText && (
            <p className={styles.confirmDeleteWarning}>{warningText}</p>
          )}
        </div>
      </div>
      <div className={styles.confirmDeleteFooter}>
        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={styles.buttonDanger}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Đang xoá…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
