import React, { useState } from "react";
import {
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { api, ApiError } from "../../../lib/api";
import styles from "../AdminSettingsPage.module.scss";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateAdminSectionProps {
  token: string | null;
  isOwner: boolean;
  onAdminCreated: () => void;
}

/**
 * Biểu mẫu tạo tài khoản quản trị viên mới (chỉ dành cho Owner).
 */
export function CreateAdminSection({ token, isOwner, onAdminCreated }: CreateAdminSectionProps) {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminSuccess, setCreateAdminSuccess] = useState<string | null>(null);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);

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
      const created = await api.createAdmin({
        email: cleanEmail,
        password: newAdminPassword,
      });
      setCreateAdminSuccess(`Đã tạo tài khoản cho ${created.email} thành công.`);
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminConfirmPassword("");
      onAdminCreated();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Tạo tài khoản quản trị thất bại.";
      setCreateAdminError(msg);
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  return (
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
          <button type="submit" className={styles.buttonPrimary} disabled={isCreatingAdmin}>
            <UserPlusIcon style={{ width: 18, height: 18 }} />
            {isCreatingAdmin ? "Đang tạo…" : "Tạo tài khoản"}
          </button>
        </div>
      </form>
    </div>
  );
}
