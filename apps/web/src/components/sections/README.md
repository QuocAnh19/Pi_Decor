# ⚠️ QUY TẮC BẮT BUỘC: `components/sections/`

1. **Phạm vi sử dụng**: Thư mục này **CHỈ CHỨA** các section tĩnh / dùng 1 lần duy nhất trên giao diện trang chủ (ví dụ: `Hero.tsx`, `Lookbook.tsx`, `ClosingCta.tsx`).
2. **CẤM CHỨA LOGIC NGHIỆP VỤ**: Không tạo mới hoặc di chuyển bất kỳ component nghiệp vụ có state/custom-hook nào vào đây.
3. **CẤM TẠO FILE SHIM**: Cấm tạo file `export { X } from "../../features/x"` chỉ để re-export.
4. **Vị trí của feature nghiệp vụ**: Tất cả các tính năng như `Services`, `Testimonials`, `MapTeaser`, `Projects`... **BẮT BUỘC** nằm trong `client/src/features/<ten-feature>/`.
