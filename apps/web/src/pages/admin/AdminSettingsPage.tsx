import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/authContext";
import { api, ApiError } from "../../lib/api";
import type { Admin } from "../../lib/types";
import { AdminProfileCard } from "./components/AdminProfileCard";
import { AdminAccountsCard } from "./components/AdminAccountsCard";
import styles from "./AdminSettingsPage.module.scss";

export function AdminSettingsPage() {
  const { admin, token, updateToken } = useAuth();
  const isOwner = admin?.role === "owner";

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminListError, setAdminListError] = useState<string | null>(null);

  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    if (!token) return;
    setLoadingAdmins(true);
    setAdminListError(null);
    try {
      const list = await api.listAdmins();
      setAdmins(list);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Không tải được danh sách admin.";
      setAdminListError(msg);
    } finally {
      setLoadingAdmins(false);
    }
  }, [token]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  async function handleConfirmDelete() {
    if (!token || !isOwner || !adminToDelete) return;

    setIsDeleting(true);
    setAdminListError(null);
    try {
      await api.deleteAdmin(adminToDelete.id);
      setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete.id));
      setDeleteSuccess(`Đã xoá tài khoản ${adminToDelete.email} thành công.`);
      setAdminToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Xoá tài khoản thất bại.";
      setAdminListError(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Cài Đặt Tài Khoản</h1>
        <p className={styles.subtitle}>
          Quản lý thông tin bảo mật của bạn và danh sách tài khoản quản trị viên
        </p>
      </div>

      <AdminProfileCard
        admin={admin}
        token={token}
        isOwner={isOwner}
        updateToken={updateToken}
        onProfileUpdated={loadAdmins}
      />

      <AdminAccountsCard
        currentAdmin={admin}
        token={token}
        isOwner={isOwner}
        admins={admins}
        loadingAdmins={loadingAdmins}
        adminListError={adminListError}
        setAdminListError={setAdminListError}
        deleteSuccess={deleteSuccess}
        setDeleteSuccess={setDeleteSuccess}
        onAdminCreated={loadAdmins}
        onRequestDeleteAdmin={setAdminToDelete}
      />

      {adminToDelete && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Xác Nhận Xoá Tài Khoản</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xoá tài khoản quản trị <strong>{adminToDelete.email}</strong>?
              </p>
              <p style={{ marginTop: 8, fontSize: 13, color: "#B4586B" }}>
                Tài khoản này sẽ ngay lập tức mất toàn bộ quyền truy cập vào trang quản trị. Hành
                động này không thể hoàn tác.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => setAdminToDelete(null)}
                disabled={isDeleting}
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                className={styles.buttonDanger}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xoá…" : "Xác nhận xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
