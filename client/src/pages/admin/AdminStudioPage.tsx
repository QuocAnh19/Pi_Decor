import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { SearchInput, Select } from "../../components/ui";
import {
  AdminPageHeader,
  ViewToggle,
  StatusTabs,
  EmptyState,
  AdminTable,
  AdminTableRow,
  ConfirmDeleteModal,
  useConfirmDelete,
} from "../../components/admin";
import { AdminEditor } from "../../features/studio";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/authContext";
import type { StudioTemplateRow } from "../../lib/types";
import styles from "./AdminStudioPage.module.scss";

/**
 * AdminStudioPage — route /admin/studio
 * Displays the Studio template management interface within AdminLayout.
 * Includes Header, Search bar, Status filters, Grid/Table views, and seamless transition to AdminEditor.
 */
export function AdminStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();

  const [templates, setTemplates] = useState<StudioTemplateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const isEditing = searchParams.get("mode") === "editor";
  const activeTemplateId = searchParams.get("templateId") || undefined;

  const fetchTemplates = () => {
    if (!token) return;
    setLoading(true);
    api
      .getStudioTemplatesAdmin()
      .then((data) => setTemplates(data))
      .catch((err) => console.warn("Failed to load studio templates in admin page:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, [token, isEditing]);

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
        await api.deleteStudioTemplate(item.id);
        setTemplates((prev) => prev.filter((t) => t.id !== item.id));
      } catch (err) {
        console.error("Failed to delete template:", err);
      }
    });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!token) return;
    try {
      const updated = await api.updateStudioTemplate(id, { is_active: !currentActive });
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle active:", err);
    }
  };

  const handleRenamePrompt = async (id: string, currentName: string) => {
    const newName = window.prompt("Nhập tên mới cho mẫu thiết kế này:", currentName);
    if (!newName || newName.trim() === "" || newName.trim() === currentName) return;
    if (!token) return;
    try {
      const updated = await api.updateStudioTemplate(id, { name: newName.trim() });
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, name: updated.name || newName.trim() } : t)));
    } catch (err) {
      console.error("Failed to rename template:", err);
      alert("Không thể đổi tên mẫu: " + (err instanceof Error ? err.message : ""));
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
            fetchTemplates();
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* Top Header Row with Action Button */}
      <AdminPageHeader
        title="Quản Lý Mẫu Thiết Kế Studio"
        subtitle="Tạo mới, chỉnh sửa toạ độ vật liệu 2D hoặc công khai lên Studio khách hàng"
        onAdd={handleCreateNew}
        addLabel="Tạo Thiết Kế Mới"
      />

      {/* Filter & Search Bar */}
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
              onChange={(e) => setFilterStatus(e.target.value as any)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "published", label: "Đang hiển thị" },
                { value: "draft", label: "Bản nháp / Đã ẩn" },
              ]}
            />
          </div>

          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>

        {/* Status / Category Tabs */}
        <StatusTabs
          tabs={tabs}
          activeTab={filterStatus}
          onChange={(id) => setFilterStatus(id as any)}
        />
      </div>

      {/* Content View: Loading / Empty / Grid / Table */}
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
      ) : viewMode === "grid" ? (
        <div className={styles.grid}>
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} className={styles.card}>
              {/* Card Preview */}
              <div
                className={styles.cardImageWrapper}
                onClick={() => handleSelectTemplate(tpl.id)}
              >
                {tpl.thumbnail ? (
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className={styles.cardImage}
                  />
                ) : tpl.svg_base ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: "scale(0.35)",
                      transformOrigin: "center center",
                      pointerEvents: "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: tpl.svg_base }}
                  />
                ) : (
                  <PhotoIcon className="h-10 w-10" style={{ width: 40, height: 40, color: "#9c9186" }} />
                )}

                {/* Status Toggle Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(tpl.id, tpl.is_active);
                  }}
                  className={`${styles.statusBadge} ${tpl.is_active ? styles.statusActive : styles.statusDraft}`}
                >
                  {tpl.is_active ? (
                    <>
                      <EyeIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đang hiển thị
                    </>
                  ) : (
                    <>
                      <EyeSlashIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đã ẩn (Nháp)
                    </>
                  )}
                </button>
              </div>

              {/* Card Body */}
              <div className={styles.cardBody}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <h3
                      className={styles.cardTitle}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRenamePrompt(tpl.id, tpl.name)}
                      title="Nhấp để đổi tên mẫu"
                    >
                      {tpl.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRenamePrompt(tpl.id, tpl.name)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#a15c2e",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Đổi tên mẫu thiết kế"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                  <p className={styles.cardMeta}>
                    Mã: <span style={{ fontFamily: "monospace", color: "#a15c2e" }}>{tpl.id}</span> • Cập nhật: {new Date(tpl.updated_at || tpl.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={styles.editBtn}
                  >
                    <PencilSquareIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                    Chỉnh Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDelete({ id: tpl.id, name: tpl.name })}
                    className={styles.deleteBtn}
                    title="Xóa mẫu thiết kế này"
                  >
                    <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <AdminTable
          headers={[
            "Xem trước & Tên mẫu thiết kế",
            "Trạng thái",
            "Ngày tạo / Cập nhật",
            { label: "Thao tác", align: "right" },
          ]}
        >
          {filteredTemplates.map((tpl) => (
            <AdminTableRow key={tpl.id}>
                  <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "60px",
                        height: "44px",
                        borderRadius: "8px",
                        border: "1px solid #e7ded0",
                        backgroundColor: "#fbf7f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {tpl.thumbnail ? (
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <PhotoIcon className="h-5 w-5" style={{ width: 20, height: 20, color: "#9c9186" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{ fontWeight: "700", color: "#271620", fontSize: "14px", cursor: "pointer" }}
                          onClick={() => handleRenamePrompt(tpl.id, tpl.name)}
                          title="Nhấp để đổi tên mẫu"
                        >
                          {tpl.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRenamePrompt(tpl.id, tpl.name)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#a15c2e",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Đổi tên mẫu"
                        >
                          <PencilSquareIcon className="h-3 w-3" style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                      <div style={{ fontSize: "11px", color: "#9c9186", fontFamily: "monospace" }}>
                        {tpl.id}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(tpl.id, tpl.is_active)}
                      className={`${styles.statusBadge} ${tpl.is_active ? styles.statusActive : styles.statusDraft}`}
                      style={{ position: "static" }}
                    >
                      {tpl.is_active ? (
                        <>
                          <EyeIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đang hiển thị
                        </>
                      ) : (
                        <>
                          <EyeSlashIcon className="h-3 w-3" style={{ width: 12, height: 12 }} /> Đã ẩn
                        </>
                      )}
                    </button>
                  </td>

                  <td style={{ padding: "12px 16px", color: "#6e6259", fontSize: "12px" }}>
                    {new Date(tpl.updated_at || tpl.created_at).toLocaleDateString("vi-VN")}
                  </td>

                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={styles.editBtn}
                        style={{ padding: "6px 12px", flex: "none" }}
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDelete({ id: tpl.id, name: tpl.name })}
                        className={styles.deleteBtn}
                        style={{ padding: "6px 10px" }}
                        title="Xóa mẫu"
                      >
                        <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </AdminTableRow>
              ))}
        </AdminTable>
      )}

      {/* Confirm Delete Modal */}
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
