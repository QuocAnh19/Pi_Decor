# ⚠️ QUY TẮC BẮT BUỘC: `components/admin/`

1. **Phạm vi sử dụng**: Thư mục này **CHỈ CHỨA** các component khung layout dành riêng cho Admin (ví dụ: `AdminGuard.tsx`, `AdminLayout.tsx`).
2. **CẤM CHỨA LOGIC NGHIỆP VỤ**: Không tạo mới hoặc di chuyển bất kỳ component nghiệp vụ nào (lead, project, venue, material, service, studio, testimonial...) vào đây.
3. **CẤM TẠO FILE SHIM**: Cấm tạo file `export { X } from "../../features/x"` chỉ để re-export.
4. **Vị trí của feature nghiệp vụ**: Mọi component nghiệp vụ **BẮT BUỘC** nằm trong `client/src/features/<ten-feature>/`.
