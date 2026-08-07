# Ảnh/video thật cần thả vào đây

Chỉ cần đặt đúng tên file bên dưới vào thư mục `public/images/` — không cần
sửa code, trang sẽ tự động hiển thị ảnh thật thay cho khung placeholder.

| File cần                          | Dùng ở đâu             | Tỉ lệ khung | Gợi ý               |
| ---------------------------------- | ----------------------- | ----------- | -------------------- |
| `hero.jpg` (hoặc `hero.mp4`)       | Hero full-bleed (đầu trang) | Ngang, ~16:9 hoặc rộng hơn | Ảnh/video mạnh nhất, ánh sáng ấm, có chuyển động nhẹ nếu là video |
| `lookbook-sen-hong.jpg`            | Lookbook — "Sen Hồng"    | Dọc 4:5     | 1600×2000px          |
| `lookbook-champagne-gold.jpg`      | Lookbook — "Champagne Gold" | Dọc 4:5  | 1600×2000px          |
| `lookbook-san-vuon.jpg`            | Lookbook — "Sân Vườn"    | Dọc 4:5     | 1600×2000px          |
| `lookbook-classic-ivory.jpg`       | Lookbook — "Classic Ivory" | Dọc 4:5   | 1600×2000px          |
| `lookbook-rooftop.jpg`             | Lookbook — "Rooftop"     | Dọc 4:5     | 1600×2000px          |
| `lookbook-garden-party.jpg`        | Lookbook — "Garden Party" | Dọc 4:5    | 1600×2000px          |

Video hero (`.mp4`/`.webm`/`.mov`) sẽ tự phát, tắt tiếng, lặp lại — không cần
cấu hình gì thêm, chỉ cần đổi `heroMedia.src` trong `src/lib/content.ts`
thành `"/images/hero.mp4"`.

Muốn thêm/bớt ảnh lookbook hoặc đổi tên file? Sửa trực tiếp trong
`src/lib/content.ts` → mảng `lookbookItems`.
