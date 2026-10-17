import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Thiếu email hoặc mật khẩu." })
    .min(1, "Thiếu email hoặc mật khẩu."),
  password: z
    .string({ required_error: "Thiếu email hoặc mật khẩu." })
    .min(1, "Thiếu email hoặc mật khẩu."),
});

export const refreshTokenSchema = z.object({
  refresh_token: z
    .string({ required_error: "Thiếu refresh token." })
    .min(1, "Thiếu refresh token."),
});

export const logoutSchema = z.object({
  refresh_token: z.string().optional(),
});

export const createAdminSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z
      .string({ required_error: "Thiếu email." })
      .min(1, "Thiếu email.")
      .email("Định dạng email không hợp lệ.")
  ),
  password: z
    .string({ required_error: "Thiếu mật khẩu." })
    .min(12, "Mật khẩu phải từ 12 đến 128 ký tự.")
    .max(128, "Mật khẩu phải từ 12 đến 128 ký tự."),
  name: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined),
    z.string().max(100, "Tên hiển thị tối đa 100 ký tự.").optional()
  ),
});

export const updateMeSchema = z
  .object({
    email: z.preprocess(
      (v) => (typeof v === "string" && v.trim() !== "" ? v.trim().toLowerCase() : v),
      z.string().email("Định dạng email không hợp lệ.").optional()
    ),
    newPassword: z
      .string()
      .min(12, "Mật khẩu mới phải từ 12 đến 128 ký tự.")
      .max(128, "Mật khẩu mới phải từ 12 đến 128 ký tự.")
      .optional(),
    password: z
      .string()
      .min(12, "Mật khẩu mới phải từ 12 đến 128 ký tự.")
      .max(128, "Mật khẩu mới phải từ 12 đến 128 ký tự.")
      .optional(),
    currentPassword: z.string().optional(),
    current_password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isChangingEmail = Boolean(data.email);
    const isChangingPassword = Boolean(data.newPassword || data.password);
    const hasCurrentPassword = Boolean(data.currentPassword || data.current_password);

    if ((isChangingEmail || isChangingPassword) && !hasCurrentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.",
      });
    }
  });

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type LogoutDto = z.infer<typeof logoutSchema>;
export type CreateAdminDto = z.infer<typeof createAdminSchema>;
export type UpdateMeDto = z.infer<typeof updateMeSchema>;
