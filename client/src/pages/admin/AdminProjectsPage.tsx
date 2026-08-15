import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  useProjects,
  ProjectForm,
  SAMPLE_STOCK_IMAGES,
} from "../../features/projects";
import { SearchInput, Select } from "../../components/ui";
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

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: any) => {
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quản Lý Dự Án &amp; Bộ Sưu Tập</h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className={styles.addBtn}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <PlusIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Thêm Dự Án Mới
        </button>
      </div>

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

          <div
            style={{
              display: "flex",
              gap: "4px",
              backgroundColor: "#0f172a",
              padding: "3px",
              borderRadius: "8px",
              border: "1px solid #334155",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: viewMode === "grid" ? "#38bdf8" : "transparent",
                color: viewMode === "grid" ? "#0f172a" : "#94a3b8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title="Xem dạng lưới"
            >
              <Squares2X2Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: viewMode === "table" ? "#38bdf8" : "transparent",
                color: viewMode === "table" ? "#0f172a" : "#94a3b8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title="Xem dạng bảng"
            >
              <ListBulletIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabsRow}>
          {[
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
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`${styles.tabButton} ${selectedCategory === tab.id ? styles.tabActive : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table View */}
      {viewMode === "grid" ? (
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
                  <span className={styles.categoryBadge}>
                    #PiDecor_{proj.tag.replace(/\s+/g, "")}
                  </span>

                  <span
                    className={`${styles.statusBadge} ${
                      proj.status === "featured"
                        ? styles.statusFeatured
                        : proj.status === "draft"
                          ? styles.statusDraft
                          : styles.statusActive
                    }`}
                  >
                    {proj.status === "featured"
                      ? "Nổi bật"
                      : proj.status === "draft"
                        ? "Bản nháp"
                        : "Hiển thị"}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{proj.title}</h3>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <MapPinIcon
                      className="h-3.5 w-3.5 inline"
                      style={{ color: "#38bdf8", width: 14, height: 14 }}
                    />{" "}
                    {proj.location}
                  </span>
                  {proj.date && (
                    <span className={styles.metaItem}>
                      <CalendarIcon
                        className="h-3.5 w-3.5 inline"
                        style={{ color: "#94a3b8", width: 14, height: 14 }}
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
                      color: "#fbbf24",
                      fontWeight: "600",
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
                        color: proj.status === "featured" ? "#f59e0b" : "#94a3b8",
                      }}
                    >
                      {proj.status === "featured" ? (
                        <StarSolid className="h-3.5 w-3.5" style={{ color: "#f59e0b", width: 14, height: 14 }} />
                      ) : (
                        <StarIcon className="h-3.5 w-3.5" style={{ color: "#94a3b8", width: 14, height: 14 }} />
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
                      onClick={() => handleDeleteProject(proj.id)}
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
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              color: "#f8fafc",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#0f172a",
                  borderBottom: "1px solid #334155",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "12px 16px" }}>Hình ảnh &amp; Dự án</th>
                <th style={{ padding: "12px 16px" }}>Phân mục</th>
                <th style={{ padding: "12px 16px" }}>Địa điểm</th>
                <th style={{ padding: "12px 16px" }}>Trạng thái</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => (
                <tr key={proj.id} style={{ borderBottom: "1px solid #334155" }}>
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
                        width: "50px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "700", color: "#ffffff" }}>
                        {proj.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {proj.description?.slice(0, 50)}...
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={styles.categoryBadge}>
                      #{getCategoryLabel(proj.categoryId)} • {proj.tag}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#cbd5e1" }}>
                    {proj.location}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      className={`${styles.statusBadge} ${
                        proj.status === "featured"
                          ? styles.statusFeatured
                          : proj.status === "draft"
                            ? styles.statusDraft
                            : styles.statusActive
                      }`}
                    >
                      {proj.status === "featured"
                        ? "Nổi bật"
                        : proj.status === "draft"
                          ? "Bản nháp"
                          : "Hiển thị"}
                    </span>
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
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className={`${styles.iconBtn} ${styles.dangerBtn}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
