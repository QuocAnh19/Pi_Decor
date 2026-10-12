-- ============================================================================
-- 0028_refresh_tokens_rotation.sql
-- Pi Decor — Postgres schema, migration 28
-- ============================================================================
-- Hỗ trợ xoay vòng Refresh Token (Token Rotation) và phát hiện sử dụng lại token (Reuse Detection):
-- 1. family_id: Nhóm các refresh token phát sinh từ cùng một phiên đăng nhập ban đầu
-- 2. replaced_by: Hash của token kế tiếp thay thế token hiện tại sau khi refresh thành công
-- 3. Bổ sung index cho token_hash và family_id để tăng tốc độ truy vấn
-- ============================================================================

alter table refresh_tokens add column if not exists family_id uuid;
alter table refresh_tokens add column if not exists replaced_by text;

create index if not exists idx_refresh_tokens_family on refresh_tokens (family_id);
create index if not exists idx_refresh_tokens_token_hash on refresh_tokens (token_hash);
