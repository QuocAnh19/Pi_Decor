import { useMemo, useState } from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import { SearchInput, Select } from "../../components/ui";
import {
  AdminPageHeader,
  ViewToggle,
  StatusTabs,
  EmptyState,
  ConfirmDeleteModal,
  useConfirmDelete,
} from "../../components/admin";
import {
  useTestimonialsAdminQuery,
  useUpdateTestimonialStatusMutation,
  useDeleteTestimonialMutation,
} from "../../features/testimonials";
import { AdminTestimonialsListView } from "./components/AdminTestimonialsListView";
import styles from "./AdminTestimonialsPage.module.scss";

export function AdminTestimonialsPage() {
  const { token } = useAuth();
  const query = useTestimonialsAdminQuery(undefined, Boolean(token));
  const updateStatusMutation = useUpdateTestimonialStatusMutation();
  const deleteMutation = useDeleteTestimonialMutation();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const testimonials = useMemo(() => query.data ?? [], [query.data]);
  const status: "loading" | "ready" | "error" = query.isLoading
    ? "loading"
    : query.isError
      ? "error"
      : "ready";

  const counts = useMemo(() => {
    return {
      all: testimonials.length,
      pending: testimonials.filter((t) => (t.status ?? "pending") === "pending")
        .length,
      approved: testimonials.filter((t) => t.status === "approved").length,
      rejected: testimonials.filter((t) => t.status === "rejected").length,
    };
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      if (statusFilter !== "all" && (t.status ?? "pending") !== statusFilter) {
        return false;
      }
      if (ratingFilter !== "all" && String(t.rating ?? 5) !== ratingFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAuthor = t.author?.toLowerCase().includes(q);
        const matchQuote = t.quote?.toLowerCase().includes(q);
        const matchRole = t.role?.toLowerCase().includes(q);
        if (!matchAuthor && !matchQuote && !matchRole) return false;
      }
      return true;
    });
  }, [testimonials, statusFilter, ratingFilter, searchQuery]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    if (!token || updatingId) return;
    setUpdatingId(id);
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      setSuccessMsg(
        newStatus === "approved"
          ? "✓ Đã duyệt đánh giá thành công!"
          : "✓ Đã chuyển trạng thái từ chối.",
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  }

  const {
    isOpen: isDeleteOpen,
    loading: isDeleting,
    requestDelete,
    cancelDelete,
    executeDelete,
  } = useConfirmDelete<string>();

  async function handleConfirmDelete() {
    await executeDelete(async (id) => {
      setUpdatingId(id);
      try {
        await deleteMutation.mutateAsync(id);
        setSuccessMsg("✓ Đã xóa đánh giá.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } finally {
        setUpdatingId(null);
      }
    });
  }

  const statusTabs = [
    { id: "all", label: `Tất cả (${counts.all})` },
    { id: "pending", label: `Chờ duyệt (${counts.pending})` },
    { id: "approved", label: `Đã duyệt (${counts.approved})` },
    { id: "rejected", label: `Từ chối (${counts.rejected})` },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Quản Lý Đánh Giá Khách Hàng"
        subtitle="Kiểm duyệt, phê duyệt và quản lý các phản hồi, đánh giá từ cô dâu & chú rể"
      />

      {successMsg && (
        <div
          style={{
            padding: "10px 16px",
            backgroundColor: "#eef4ea",
            color: "#47663b",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid rgba(71, 102, 59, 0.3)",
          }}
        >
          {successMsg}
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm theo tên tác giả, nội dung đánh giá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              options={[
                { value: "all", label: "Tất cả số sao ⭐" },
                { value: "5", label: "5 Sao ⭐⭐⭐⭐⭐" },
                { value: "4", label: "4 Sao ⭐⭐⭐⭐" },
                { value: "3", label: "3 Sao ⭐⭐⭐" },
                { value: "2", label: "2 Sao ⭐⭐" },
                { value: "1", label: "1 Sao ⭐" },
              ]}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "pending", label: "Chờ duyệt" },
                { value: "approved", label: "Đã duyệt" },
                { value: "rejected", label: "Từ chối" },
              ]}
            />
          </div>

          <ViewToggle
            viewMode={viewMode}
            onChange={setViewMode}
            gridTitle="Xem dạng thẻ"
            tableTitle="Xem dạng bảng"
          />
        </div>

        <StatusTabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {status === "loading" && (
        <p className={styles.status}>Đang tải danh sách đánh giá…</p>
      )}
      {status === "error" && (
        <p className={styles.status}>Không tải được danh sách đánh giá.</p>
      )}

      {status === "ready" &&
        (filteredTestimonials.length === 0 ? (
          <EmptyState
            icon={
              <ChatBubbleBottomCenterTextIcon
                className="h-10 w-10"
                style={{ width: 40, height: 40, color: "#9c9186" }}
              />
            }
            title="Không tìm thấy đánh giá phù hợp"
            description="Thử thay đổi từ khóa hoặc bộ lọc trạng thái."
          />
        ) : (
          <AdminTestimonialsListView
            testimonials={filteredTestimonials}
            viewMode={viewMode}
            updatingId={updatingId}
            onUpdateStatus={handleUpdateStatus}
            onDelete={requestDelete}
          />
        ))}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={cancelDelete}
        onConfirm={handleConfirmDelete}
        itemName="đánh giá này"
        loading={isDeleting}
      />
    </div>
  );
}
