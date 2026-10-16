import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/outline";
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
  AdminEditor,
  useStudioTemplatesAdminQuery,
  useUpdateStudioTemplateMutation,
  useDeleteStudioTemplateMutation,
} from "../../features/studio";
import { useAuth } from "../../lib/authContext";
import { AdminStudioTemplatesListView } from "./components/AdminStudioTemplatesListView";
import styles from "./AdminStudioPage.module.scss";

/**
 * AdminStudioPage — route /admin/studio
 * Quản lý danh sách mẫu thiết kế Studio thông qua TanStack Query.
 */
export function AdminStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();

  const query = useStudioTemplatesAdminQuery(Boolean(token));
  const updateMutation = useUpdateStudioTemplateMutation();
  const deleteMutation = useDeleteStudioTemplateMutation();

  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const isEditing = searchParams.get("mode") === "editor";
  const activeTemplateId = searchParams.get("templateId") || undefined;

  const templates = useMemo(() => query.data ?? [], [query.data]);
  const loading = query.isLoading;

  const handleSelectTemplate = (id: string) => {
    setSearchParams({ mode: "editor", templateId: id });
  };

  const handleCreateNew = () => {
    setSearchParams({ mode: "editor", templateId: "new" });
  };

  const {
    target: templateToDelete,
    isOpen: isDeleteOpen,
    loading: isDeleting,
    requestDelete,
    cancelDelete,
    executeDelete,
  } = useConfirmDelete<{ id: string; name?: string }>();

  const handleConfirmDelete = async () => {
    await executeDelete(async (item) => {
      if (!token) return;
      try {
        await deleteMutation.mutateAsync(item.id);
      } catch {
        // toast.error đã được xử lý trong mutation
      }
    });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!token) return;
    try {
      await updateMutation.mutateAsync({ id, payload: { is_active: !currentActive } });
    } catch {
      // toast.error đã được xử lý trong mutation
    }
  };

  const handleRenamePrompt = async (id: string, currentName: string) => {
    const newName = window.prompt("Nhập tên mới cho mẫu thiết kế này:", currentName);
    if (!newName || newName.trim() === "" || newName.trim() === currentName) return;
    if (!token) return;
    try {
      await updateMutation.mutateAsync({ id, payload: { name: newName.trim() } });
    } catch {
      // toast.error đã được xử lý trong mutation
    }
  };

  const publishedCount = templates.filter((t) => t.is_active).length;
  const draftCount = templates.filter((t) => !t.is_active).length;

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterStatus === "published" && !t.is_active) return false;
      if (filterStatus === "draft" && t.is_active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = t.name?.toLowerCase().includes(q);
        const matchId = t.id?.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [templates, filterStatus, searchQuery]);

  const tabs = [
    { id: "all", label: `Tất cả mẫu (${templates.length})` },
    { id: "published", label: `Đang hiển thị (${publishedCount})` },
    { id: "draft", label: `Bản nháp / Đã ẩn (${draftCount})` },
  ];

  if (isEditing) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: "#f4eee3",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <AdminEditor
          templateId={activeTemplateId}
          onBackToHome={() => {
            setSearchParams({});
            query.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <AdminPageHeader
        title="Quản Lý Mẫu Thiết Kế Studio"
        subtitle="Tạo mới, chỉnh sửa toạ độ vật liệu 2D hoặc công khai lên Studio khách hàng"
        onAdd={handleCreateNew}
        addLabel="Tạo Thiết Kế Mới"
      />

      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm theo tên mẫu thiết kế hoặc mã template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "180px" }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "published" | "draft")}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "published", label: "Đang hiển thị" },
                { value: "draft", label: "Bản nháp / Đã ẩn" },
              ]}
            />
          </div>

          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>

        <StatusTabs
          tabs={tabs}
          activeTab={filterStatus}
          onChange={(id) => setFilterStatus(id as "all" | "published" | "draft")}
        />
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <p style={{ fontSize: "15px", margin: 0 }}>Đang nạp thư viện thiết kế từ máy chủ...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          icon={
            <PhotoIcon
              className="h-10 w-10"
              style={{ width: 42, height: 42, color: "#9c9186" }}
            />
          }
          title="Không tìm thấy mẫu thiết kế nào phù hợp"
          description='Thử thay đổi từ khóa tìm kiếm hoặc nhấn nút "Tạo Thiết Kế Mới".'
        />
      ) : (
        <AdminStudioTemplatesListView
          templates={filteredTemplates}
          viewMode={viewMode}
          onSelectTemplate={handleSelectTemplate}
          onToggleActive={handleToggleActive}
          onRenamePrompt={handleRenamePrompt}
          onRequestDelete={requestDelete}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={cancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={templateToDelete?.name ? `mẫu "${templateToDelete.name}"` : "mẫu này"}
        loading={isDeleting}
      />
    </div>
  );
}
