export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
      return res.status(400).json({ message });
    }
    req[source] = result.data;
    next();
  };
}
