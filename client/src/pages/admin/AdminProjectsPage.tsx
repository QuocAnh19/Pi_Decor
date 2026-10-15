import {
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  useProjects,
  ProjectForm,
  SAMPLE_STOCK_IMAGES,
  PRICE_TIER_OPTIONS,
  type ProjectItem,
} from "../../features/projects";
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
import styles from "./AdminProjectsPage.module.scss";

function getCategoryLabel(catId: string): string {
  if (catId === "piwedding") return "PiWedding";
  if (catId === "pikids") return "PiKids";
  if (catId === "pievent") return "PiEvent";
  return catId;
}

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

  const renderStatusBadge = (status?: string) => {
    const isFeatured = status === "featured";
    const isDraft = status === "draft";
    return (
      <span
        className={`${styles.statusBadge} ${
          isFeatured
            ? styles.statusFeatured
            : isDraft
              ? styles.statusDraft
              : styles.statusActive
        }`}
      >
        {isFeatured ? "Nổi bật" : isDraft ? "Bản nháp" : "Hiển thị"}
      </span>
    );
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
        <div className={styles.grid}>
          {filteredProjects.map((proj) => (
            <div key={proj.id} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <img
                  src={proj.src}
                  alt={proj.title}
                  className={styles.cardImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0];
                  }}
                />

                <div className={styles.badgeRow}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
                    <span className={styles.categoryBadge}>
                      #PiDecor_{proj.tag.replace(/\s+/g, "")}
                    </span>
                    {proj.priceTier === "premium" && (
                      <span className={`${styles.tierBadge} ${styles.tierPremium}`}>
                        Cao cấp
                      </span>
                    )}
                  </div>

                  {renderStatusBadge(proj.status)}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{proj.title}</h3>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <MapPinIcon
                      className="h-3.5 w-3.5 inline"
                      style={{ color: "#a15c2e", width: 14, height: 14 }}
                    />{" "}
                    {proj.location}
                  </span>
                  {proj.date && (
                    <span className={styles.metaItem}>
                      <CalendarIcon
                        className="h-3.5 w-3.5 inline"
                        style={{ color: "#6e6259", width: 14, height: 14 }}
                      />{" "}
                      {proj.date}
                    </span>
                  )}
                </div>

                <p className={styles.cardDesc}>{proj.description}</p>

                <div className={styles.cardFooter}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#b98a3e",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <CurrencyDollarIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />{" "}
                    {proj.budget || "Liên hệ báo giá"}
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleToggleFeatured(proj)}
                      className={styles.iconBtn}
                      title={
                        proj.status === "featured"
                          ? "Bỏ danh hiệu nổi bật"
                          : "Đặt làm dự án nổi bật"
                      }
                      style={{
                        color: proj.status === "featured" ? "#b98a3e" : "#6e6259",
                      }}
                    >
                      {proj.status === "featured" ? (
                        <StarSolid className="h-3.5 w-3.5" style={{ color: "#b98a3e", width: 14, height: 14 }} />
                      ) : (
                        <StarIcon className="h-3.5 w-3.5" style={{ color: "#6e6259", width: 14, height: 14 }} />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(proj)}
                      className={styles.iconBtn}
                      title="Chỉnh sửa dự án"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
                    </button>

                    <button
                      onClick={() => requestDelete(proj.id)}
                      className={`${styles.iconBtn} ${styles.dangerBtn}`}
                      title="Xóa dự án"
                    >
                      <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <AdminTable
          headers={[
            "Hình ảnh & Dự án",
            "Phân mục",
            "Địa điểm",
            "Trạng thái",
            { label: "Thao tác", align: "right" },
          ]}
        >
          {filteredProjects.map((proj) => (
            <AdminTableRow key={proj.id}>
              <td
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <img
                  src={proj.src}
                  alt={proj.title}
                  style={{
                    width: "54px",
                    height: "42px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #e7ded0",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0];
                  }}
                />
                <div>
                  <div style={{ fontWeight: "700", color: "#271620", fontSize: "14px" }}>
                    {proj.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6e6259", marginTop: "2px" }}>
                    {proj.description?.slice(0, 50)}...
                  </div>
                </div>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span className={styles.categoryBadge}>
                  #{getCategoryLabel(proj.categoryId)} • {proj.tag}
                </span>
              </td>
              <td style={{ padding: "12px 16px", color: "#6e6259", fontWeight: "500" }}>
                {proj.location}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  {renderStatusBadge(proj.status)}
                  {proj.priceTier === "premium" && (
                    <span className={`${styles.tierBadge} ${styles.tierPremium}`}>
                      Cao cấp
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleOpenEditModal(proj)}
                    className={styles.iconBtn}
                    title="Chỉnh sửa dự án"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
                  </button>
                  <button
                    onClick={() => requestDelete(proj.id)}
                    className={`${styles.iconBtn} ${styles.dangerBtn}`}
                    title="Xóa dự án"
                  >
                    <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </td>
            </AdminTableRow>
          ))}
        </AdminTable>
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
