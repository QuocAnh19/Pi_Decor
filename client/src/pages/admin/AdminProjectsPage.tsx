import {
  useProjects,
  ProjectForm,
  PRICE_TIER_OPTIONS,
  type ProjectItem,
} from "../../features/projects";
import { SearchInput, Select } from "../../components/ui";
import {
  AdminPageHeader,
  ViewToggle,
  StatusTabs,
  EmptyState,
  ConfirmDeleteModal,
  useConfirmDelete,
} from "../../components/admin";
import { AdminProjectsGridView } from "./components/AdminProjectsGridView";
import { AdminProjectsTableView } from "./components/AdminProjectsTableView";
import styles from "./AdminProjectsPage.module.scss";

export function AdminProjectsPage() {
  const {
    projects,
    filteredProjects,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedPriceTier,
    setSelectedPriceTier,
    viewMode,
    setViewMode,
    isModalOpen,
    setIsModalOpen,
    editingProject,
    setEditingProject,
    handleDeleteProject,
    handleToggleFeatured,
    handleFullFormSubmit,
  } = useProjects();

  const {
    isOpen: isDeleteOpen,
    loading: isDeleting,
    requestDelete,
    cancelDelete,
    executeDelete,
  } = useConfirmDelete<string>();

  const handleConfirmDelete = async () => {
    await executeDelete(async (id) => {
      await handleDeleteProject(id);
    });
  };

  const categoryTabs = [
    { id: "all", label: `Tất cả (${projects.length})` },
    {
      id: "piwedding",
      label: `PiWedding (${projects.filter((p) => p.categoryId === "piwedding").length})`,
    },
    {
      id: "pikids",
      label: `PiKids (${projects.filter((p) => p.categoryId === "pikids").length})`,
    },
    {
      id: "pievent",
      label: `PiEvent (${projects.filter((p) => p.categoryId === "pievent").length})`,
    },
  ];

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản Lý Hồ Sơ Dự Án"
        subtitle="Theo dõi tiến độ triển khai, trạng thái thi công và danh mục công trình đang thực hiện"
        onAdd={handleOpenAddModal}
        addLabel="Thêm Dự Án Mới"
      />

      {error && (
        <div
          style={{
            backgroundColor: "#7f1d1d",
            color: "#fca5a5",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>
          Đang nạp danh sách dự án...
        </p>
      )}

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm kiếm tên dự án, địa điểm, hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "featured", label: "Nổi bật" },
                { value: "active", label: "Đang hiển thị" },
                { value: "draft", label: "Bản nháp" },
              ]}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <Select
              value={selectedPriceTier}
              onChange={(e) => setSelectedPriceTier(e.target.value)}
              options={[
                { value: "all", label: "Tất cả hạng mục" },
                ...PRICE_TIER_OPTIONS,
              ]}
            />
          </div>

          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>

        {/* Category Tabs */}
        <StatusTabs
          tabs={categoryTabs}
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Grid or Table View */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="Không tìm thấy dự án nào phù hợp"
          description="Thử thay đổi từ khóa tìm kiếm hoặc chọn phân mục khác."
        />
      ) : viewMode === "grid" ? (
        <AdminProjectsGridView
          projects={filteredProjects}
          onToggleFeatured={handleToggleFeatured}
          onEdit={handleOpenEditModal}
          onDelete={requestDelete}
        />
      ) : (
        <AdminProjectsTableView
          projects={filteredProjects}
          onEdit={handleOpenEditModal}
          onDelete={requestDelete}
        />
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <ProjectForm
          project={editingProject}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleFullFormSubmit}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={cancelDelete}
        onConfirm={handleConfirmDelete}
        itemName="dự án này"
        loading={isDeleting}
      />
    </div>
  );
}
