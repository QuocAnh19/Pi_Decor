import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "Thiếu email hoặc mật khẩu." }).min(1, "Thiếu email hoặc mật khẩu."),
  password: z.string({ required_error: "Thiếu email hoặc mật khẩu." }).min(1, "Thiếu email hoặc mật khẩu."),
});
