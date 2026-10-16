import {
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  UserGroupIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import type { Admin } from "../../../lib/types";
import { CreateAdminSection } from "./CreateAdminSection";
import styles from "../AdminSettingsPage.module.scss";

interface AdminAccountsCardProps {
  currentAdmin: Admin | null;
  token: string | null;
  isOwner: boolean;
  admins: Admin[];
  loadingAdmins: boolean;
  adminListError: string | null;
  setAdminListError: (msg: string | null) => void;
  deleteSuccess: string | null;
  setDeleteSuccess: (msg: string | null) => void;
  onAdminCreated: () => void;
  onRequestDeleteAdmin: (admin: Admin) => void;
}

/**
 * Thẻ quản lý danh sách tài khoản quản trị viên trong hệ thống.
 */
export function AdminAccountsCard({
  currentAdmin,
  token,
  isOwner,
  admins,
  loadingAdmins,
  adminListError,
  setAdminListError,
  deleteSuccess,
  setDeleteSuccess,
  onAdminCreated,
  onRequestDeleteAdmin,
}: AdminAccountsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>
            <UserGroupIcon className="h-5 w-5" style={{ width: 20, height: 20 }} />
            Danh Sách Tài Khoản Quản Trị
          </h2>
          <p className={styles.cardDesc}>
            {isOwner
              ? "Chủ sở hữu có quyền tạo và xoá tài khoản quản trị viên khác."
              : "Tài khoản quản trị viên có thể xem danh sách tài khoản trong hệ thống."}
          </p>
        </div>
      </div>

      {deleteSuccess && (
        <div className={styles.alertSuccess}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircleIcon style={{ width: 18, height: 18 }} />
            <span>{deleteSuccess}</span>
          </div>
          <button
            type="button"
            className={styles.alertClose}
            onClick={() => setDeleteSuccess(null)}
          >
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {adminListError && (
        <div className={styles.alertError}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExclamationCircleIcon style={{ width: 18, height: 18 }} />
            <span>{adminListError}</span>
          </div>
          <button
            type="button"
            className={styles.alertClose}
            onClick={() => setAdminListError(null)}
          >
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {isOwner ? (
        <CreateAdminSection token={token} isOwner={isOwner} onAdminCreated={onAdminCreated} />
      ) : (
        <div className={styles.infoBanner}>
          <InformationCircleIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
          <span>
            Chỉ tài khoản có quyền <strong>Chủ sở hữu (Owner)</strong> mới có thể tạo hoặc xoá các
            tài khoản quản trị khác.
          </span>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loadingAdmins ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 28 }}>
                  Đang tải danh sách tài khoản…
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 28 }}>
                  Chưa có tài khoản quản trị nào.
                </td>
              </tr>
            ) : (
              admins.map((a) => {
                const isCurrent = a.id === currentAdmin?.id;
                const isTargetOwner = a.role === "owner";
                const canDelete = isOwner && !isCurrent && !isTargetOwner;

                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong>{a.email}</strong>
                        {isCurrent && <span className={styles.currentBadge}>(Bạn)</span>}
                      </div>
                    </td>
                    <td>
                      {isTargetOwner ? (
                        <span className={styles.badgeOwner}>Owner</span>
                      ) : (
                        <span className={styles.badgeAdmin}>Admin</span>
                      )}
                    </td>
                    <td>
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {canDelete ? (
                        <button
                          type="button"
                          className={styles.buttonDanger}
                          onClick={() => onRequestDeleteAdmin(a)}
                        >
                          <TrashIcon style={{ width: 14, height: 14 }} />
                          Xoá
                        </button>
                      ) : isCurrent ? (
                        <span className={styles.currentBadge}>Tài khoản hiện tại</span>
                      ) : isTargetOwner ? (
                        <span className={styles.currentBadge}>Chủ sở hữu</span>
                      ) : (
                        <span style={{ color: "#9C9186" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
