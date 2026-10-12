import React, { useCallback, useEffect, useState } from "react";
import {
  KeyIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  UserGroupIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import { api, ApiError } from "../../lib/api";
import type { Admin } from "../../lib/types";
import styles from "./AdminSettingsPage.module.scss";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AdminSettingsPage() {
  const { admin, token, updateToken } = useAuth();
  const isOwner = admin?.role === "owner";

  // ── Profile Settings State ───────────────────────────────────────────────
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (admin?.email) {
      setProfileEmail(admin.email);
    }
  }, [admin?.email]);

  // ── Admin List State ─────────────────────────────────────────────────────
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminListError, setAdminListError] = useState<string | null>(null);

  // ── Create Admin State (Owner only) ──────────────────────────────────────
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminSuccess, setCreateAdminSuccess] = useState<string | null>(null);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);

  // ── Delete Admin Modal State ─────────────────────────────────────────────
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

  // Load admins on mount
  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // ── Handle Profile Update ────────────────────────────────────────────────
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setProfileError(null);
    setProfileSuccess(null);

    const cleanEmail = profileEmail.trim().toLowerCase();
    const isEmailChanged = cleanEmail !== admin?.email?.toLowerCase();
    const isPasswordChanging = newPassword.length > 0;

    if (!isEmailChanged && !isPasswordChanging) {
      setProfileError("Bạn chưa thay đổi thông tin nào.");
      return;
    }

    if (isEmailChanged) {
      if (!cleanEmail) {
        setProfileError("Email không được để trống.");
        return;
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        setProfileError("Định dạng email không hợp lệ.");
        return;
      }
    }

    if (isPasswordChanging) {
      if (newPassword.length < 6) {
        setProfileError("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileError("Mật khẩu xác nhận không khớp.");
        return;
      }
      if (!currentPassword) {
        setProfileError("Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.");
        return;
      }
    }

    setIsProfileSubmitting(true);
    try {
      const payload: { email?: string; current_password?: string; password?: string } = {};
      if (isEmailChanged) payload.email = cleanEmail;
      if (isPasswordChanging) {
        payload.current_password = currentPassword;
        payload.password = newPassword;
      }

      const res = await api.updateMe(payload);
      updateToken(res.token, res.admin);
      setProfileSuccess(res.message || "Cập nhật thông tin thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh admin list so the updated email is reflected in the table
      loadAdmins();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Cập nhật thông tin thất bại.";
      setProfileError(msg);
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  // ── Handle Create Admin (Owner only) ─────────────────────────────────────
  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !isOwner) return;

    setCreateAdminError(null);
    setCreateAdminSuccess(null);

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setCreateAdminError("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setCreateAdminError("Định dạng email không hợp lệ.");
      return;
    }
    if (newAdminPassword.length < 6) {
      setCreateAdminError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newAdminPassword !== newAdminConfirmPassword) {
      setCreateAdminError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const created = await api.createAdmin(
        { email: cleanEmail, password: newAdminPassword }
      );
      setCreateAdminSuccess(`Đã tạo tài khoản cho ${created.email} thành công.`);
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminConfirmPassword("");
      loadAdmins();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Tạo tài khoản quản trị thất bại.";
      setCreateAdminError(msg);
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  // ── Handle Delete Admin (Owner only) ─────────────────────────────────────
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

      {/* ── SECTION 1: CẬP NHẬT THÔNG TIN CỦA BẠN ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>
              <KeyIcon className="h-5 w-5" style={{ width: 20, height: 20 }} />
              Thông Tin Đăng Nhập Của Bạn
            </h2>
            <p className={styles.cardDesc}>
              Thay đổi email đăng nhập hoặc cập nhật mật khẩu mới
            </p>
          </div>
          <div>
            {isOwner ? (
              <span className={styles.badgeOwner}>Chủ sở hữu (Owner)</span>
            ) : (
              <span className={styles.badgeAdmin}>Quản trị viên (Admin)</span>
            )}
          </div>
        </div>

        {profileSuccess && (
          <div className={styles.alertSuccess}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleIcon style={{ width: 18, height: 18 }} />
              <span>{profileSuccess}</span>
            </div>
            <button
              type="button"
              className={styles.alertClose}
              onClick={() => setProfileSuccess(null)}
            >
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        {profileError && (
          <div className={styles.alertError}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ExclamationCircleIcon style={{ width: 18, height: 18 }} />
              <span>{profileError}</span>
            </div>
            <button
              type="button"
              className={styles.alertClose}
              onClick={() => setProfileError(null)}
            >
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="profileEmail">
              Địa chỉ Email
            </label>
            <input
              id="profileEmail"
              type="email"
              className={styles.input}
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder="admin@pidecor.com"
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="currentPassword">
                Mật khẩu hiện tại
              </label>
              <input
                id="currentPassword"
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Bắt buộc nếu đổi mật khẩu mới"
                autoComplete="current-password"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự (để trống nếu không đổi)"
                autoComplete="new-password"
              />
            </div>
          </div>

          {newPassword.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="confirmPassword">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={isProfileSubmitting}
            >
              <ShieldCheckIcon style={{ width: 18, height: 18 }} />
              {isProfileSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>

      {/* ── SECTION 2: QUẢN LÝ TÀI KHOẢN ADMIN ── */}
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

        {/* Create admin form - ONLY FOR OWNER */}
        {isOwner ? (
          <div className={styles.createSection}>
            <h3 className={styles.createSectionTitle}>
              <UserPlusIcon style={{ width: 18, height: 18 }} />
              Thêm Quản Trị Viên Mới
            </h3>

            {createAdminSuccess && (
              <div className={styles.alertSuccess}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleIcon style={{ width: 18, height: 18 }} />
                  <span>{createAdminSuccess}</span>
                </div>
                <button
                  type="button"
                  className={styles.alertClose}
                  onClick={() => setCreateAdminSuccess(null)}
                >
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}

            {createAdminError && (
              <div className={styles.alertError}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ExclamationCircleIcon style={{ width: 18, height: 18 }} />
                  <span>{createAdminError}</span>
                </div>
                <button
                  type="button"
                  className={styles.alertClose}
                  onClick={() => setCreateAdminError(null)}
                >
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="newAdminEmail">
                    Email đăng nhập
                  </label>
                  <input
                    id="newAdminEmail"
                    type="email"
                    className={styles.input}
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="nhanvien@pidecor.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="newAdminPassword">
                    Mật khẩu (tối thiểu 6 ký tự)
                  </label>
                  <input
                    id="newAdminPassword"
                    type="password"
                    className={styles.input}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="newAdminConfirmPassword">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="newAdminConfirmPassword"
                  type="password"
                  className={styles.input}
                  value={newAdminConfirmPassword}
                  onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.buttonPrimary}
                  disabled={isCreatingAdmin}
                >
                  <UserPlusIcon style={{ width: 18, height: 18 }} />
                  {isCreatingAdmin ? "Đang tạo…" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.infoBanner}>
            <InformationCircleIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
            <span>
              Chỉ tài khoản có quyền <strong>Chủ sở hữu (Owner)</strong> mới có thể tạo
              hoặc xoá các tài khoản quản trị khác.
            </span>
          </div>
        )}

        {/* Admin List Table */}
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
                  const isCurrent = a.id === admin?.id;
                  const isTargetOwner = a.role === "owner";
                  const canDelete = isOwner && !isCurrent && !isTargetOwner;

                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong>{a.email}</strong>
                          {isCurrent && (
                            <span className={styles.currentBadge}>(Bạn)</span>
                          )}
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
                            onClick={() => setAdminToDelete(a)}
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

      {/* ── CONFIRM DELETE MODAL ── */}
      {adminToDelete && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Xác Nhận Xoá Tài Khoản</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Bạn có chắc chắn muốn xoá tài khoản quản trị{" "}
                <strong>{adminToDelete.email}</strong>?
              </p>
              <p style={{ marginTop: 8, fontSize: 13, color: "#B4586B" }}>
                Tài khoản này sẽ ngay lập tức mất toàn bộ quyền truy cập vào trang quản trị.
                Hành động này không thể hoàn tác.
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
