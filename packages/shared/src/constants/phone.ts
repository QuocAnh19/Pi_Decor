/**
 * Biểu thức chính quy kiểm tra số điện thoại Việt Nam hợp lệ:
 * Bắt đầu bằng 0 hoặc +84, theo sau là 8-10 chữ số.
 */
export const VN_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;

/**
 * Loại bỏ khoảng trắng, dấu gạch nối, dấu chấm và ngoặc đơn khỏi số điện thoại.
 */
export function sanitizePhoneNumber(phone: string): string {
  return typeof phone === "string" ? phone.replace(/[\s.\-()]/g, "") : "";
}

/**
 * Kiểm tra nhanh số điện thoại có đúng định dạng Việt Nam hay không.
 */
export function isValidVietnamesePhone(phone: string): boolean {
  return VN_PHONE_REGEX.test(sanitizePhoneNumber(phone));
}
