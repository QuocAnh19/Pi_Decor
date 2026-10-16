import React, { useEffect, useState } from "react";
import {
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { api, ApiError } from "../../../lib/api";
import type { Admin } from "../../../lib/types";
import styles from "../AdminSettingsPage.module.scss";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AdminProfileCardProps {
  admin: Admin | null;
  token: string | null;
  isOwner: boolean;
  updateToken: (token: string, admin?: Admin) => void;
  onProfileUpdated: () => void;
}

/**
 * Thẻ cập nhật thông tin đăng nhập (email và mật khẩu) của tài khoản quản trị hiện tại.
 */
export function AdminProfileCard({
  admin,
  token,
  isOwner,
  updateToken,
  onProfileUpdated,
}: AdminProfileCardProps) {
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
      const payload: {
        email?: string;
        current_password?: string;
        password?: string;
      } = {};
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
      onProfileUpdated();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Cập nhật thông tin thất bại.";
      setProfileError(msg);
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>
            <KeyIcon className="h-5 w-5" style={{ width: 20, height: 20 }} />
            Thông Tin Đăng Nhập Của Bạn
          </h2>
          <p className={styles.cardDesc}>Thay đổi email đăng nhập hoặc cập nhật mật khẩu mới</p>
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
          <button type="button" className={styles.alertClose} onClick={() => setProfileError(null)}>
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
          <button type="submit" className={styles.buttonPrimary} disabled={isProfileSubmitting}>
            <ShieldCheckIcon style={{ width: 18, height: 18 }} />
            {isProfileSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
