-- ============================================================================
-- 0025_quotation_counters.sql
-- Pi Decor — Postgres schema, migration 25
-- ============================================================================
-- Atomic sequence counters for quotation numbers (BG-YYYY-XXXX).
-- Prevents duplicate quotation numbers when drafts are deleted or recreated.
-- ============================================================================

create table if not exists quotation_counters (
  year      int primary key,
  last_seq  int not null default 0
);

comment on table quotation_counters is
  'Atomic year-based sequence counters for quotation numbers.';

-- Khởi tạo last_seq từ số lớn nhất hiện có trong bảng quotations theo từng năm
insert into quotation_counters (year, last_seq)
select
  split_part(quotation_number, '-', 2)::int as year,
  max(split_part(quotation_number, '-', 3)::int) as last_seq
from quotations
where quotation_number ~ '^BG-[0-9]{4}-[0-9]+$'
group by split_part(quotation_number, '-', 2)::int
on conflict (year) do update
set last_seq = greatest(quotation_counters.last_seq, excluded.last_seq);
