-- Migration 0029: Thêm các cột lưu trữ bằng chứng đồng ý xử lý dữ liệu cá nhân (Consent)
-- Tuân thủ quy định bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP).

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_version text;

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_version text;

-- Cập nhật ghi chú giải thích schema
COMMENT ON COLUMN leads.consent_at IS 'Thời điểm người dùng xác nhận đồng ý xử lý dữ liệu cá nhân';
COMMENT ON COLUMN leads.consent_version IS 'Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý';
COMMENT ON COLUMN testimonials.consent_at IS 'Thời điểm người gửi đánh giá xác nhận đồng ý xử lý dữ liệu';
COMMENT ON COLUMN testimonials.consent_version IS 'Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý';
