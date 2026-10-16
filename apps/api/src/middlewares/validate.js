/**
 * Middleware xác thực dữ liệu đầu vào bằng Zod schema.
 * Tự động loại bỏ các trường thừa (strip), ghi đè kết quả đã parse vào req[source],
 * và trả về lỗi 400 kèm thông điệp chi tiết mà không làm vỡ cấu trúc { message } của client.
 * @param {import("zod").ZodSchema} schema
 * @param {"body"|"query"|"params"} [source="body"]
 * @returns {import("express").RequestHandler}
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue?.message ?? "Dữ liệu không hợp lệ.";
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ message, errors });
    }
    req[source] = result.data;
    next();
  };
}
