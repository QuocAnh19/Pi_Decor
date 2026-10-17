export interface CloudinaryUrlOptions {
  width?: number;
  quality?: "auto" | number;
}

/**
 * Tối ưu hóa đường dẫn ảnh từ CDN Cloudinary bằng cách thêm các cờ chuyển đổi (transformations):
 * f_auto (tự động chọn WebP/AVIF theo trình duyệt),
 * q_auto hoặc q_<quality> (tự động nén thông minh),
 * w_<width>, c_limit (giới hạn chiều rộng tối đa, không phóng to ảnh gốc).
 *
 * Nếu URL không thuộc domain Cloudinary hoặc là ảnh cục bộ (/images/..., /uploads/...),
 * hàm trả về nguyên bản để không làm gãy đường dẫn.
 */
export function cloudinaryUrl(
  url: string | null | undefined,
  options?: CloudinaryUrlOptions
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Chỉ can thiệp các URL ảnh Cloudinary hợp lệ
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const uploadToken = "/image/upload/";
  const uploadIndex = url.indexOf(uploadToken);
  if (uploadIndex === -1) {
    return url;
  }

  const prefix = url.slice(0, uploadIndex + uploadToken.length);
  let rest = url.slice(uploadIndex + uploadToken.length);

  // Xây dựng danh sách transformation
  const transforms: string[] = ["f_auto"];
  const quality = options?.quality ?? "auto";
  transforms.push(quality === "auto" ? "q_auto" : `q_${quality}`);

  if (options?.width && options.width > 0) {
    transforms.push(`w_${options.width}`, "c_limit");
  }

  const transformStr = transforms.join(",");

  // Nếu trong URL đã có chuỗi transformation cũ (ví dụ f_auto,q_auto hoặc w_500)
  // ngay trước v<version> hoặc tên file thì thay thế bằng transformation mới
  const existingTransformMatch = rest.match(/^((?:[a-z]{1,2}_[^/]+,?)+)\/(.*)$/);
  if (existingTransformMatch && !existingTransformMatch[1].startsWith("v")) {
    rest = existingTransformMatch[2];
  }

  return `${prefix}${transformStr}/${rest}`;
}
