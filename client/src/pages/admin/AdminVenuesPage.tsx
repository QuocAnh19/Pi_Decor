import { useMemo } from "react";
import {
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { SearchInput, Select } from "../../components/ui";
import {
  AdminPageHeader,
  StatusTabs,
  ConfirmDeleteModal,
  useConfirmDelete,
} from "../../components/admin";
import { useVenues, VenueList, VenueForm } from "../../features/venues";
import { ProjectForm } from "../../features/projects";
import type { Venue, Project } from "../../lib/types";
import styles from "./AdminVenuesPage.module.scss";

type DeleteTarget =
  | { type: "venue"; venue: Venue }
  | { type: "project"; project: Project };

/**
 * /admin/venues — Tab "Bản đồ" (M3 + M4 in the spec).
 */
export function AdminVenuesPage() {
  const {
    venues,
    filteredVenues,
    status,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedVenueId,
    selectedVenue,
    detailLoading,
    venueFormOpen,
    setVenueFormOpen,
    editingVenue,
    setEditingVenue,
    projectFormOpen,
    setProjectFormOpen,
    editingProject,
    setEditingProject,
    handleSelectVenue,
    handleVenueFormSubmit,
    handleDeleteVenue,
    handleProjectFormSubmit,
    handleDeleteProject,
  } = useVenues();

  const {
    target: deleteTarget,
    isOpen: isDeleteOpen,
    loading: isDeleting,
    requestDelete,
    cancelDelete,
    executeDelete,
  } = useConfirmDelete<DeleteTarget>();

  const handleConfirmDelete = async () => {
    await executeDelete(async (target) => {
      if (target.type === "venue") {
        await handleDeleteVenue(target.venue);
      } else {
        await handleDeleteProject(target.project);
      }
    });
  };

  const counts = useMemo(() => {
    return {
      all: venues.length,
      hotel: venues.filter((v) => v.type === "hotel").length,
      restaurant: venues.filter((v) => v.type === "restaurant").length,
      resort: venues.filter((v) => v.type === "resort").length,
      "sảnh tiệc": venues.filter((v) => v.type === "sảnh tiệc").length,
    };
  }, [venues]);

  const typeTabs = [
    { id: "all", label: "Tất cả", count: counts.all },
    { id: "hotel", label: "Khách sạn", count: counts.hotel },
    { id: "restaurant", label: "Nhà hàng", count: counts.restaurant },
    { id: "resort", label: "Resort", count: counts.resort },
    { id: "sảnh tiệc", label: "Sảnh tiệc", count: counts["sảnh tiệc"] },
  ];

  const typeSelectOptions = [
    { value: "all", label: `Tất cả loại hình (${counts.all})` },
    { value: "hotel", label: `Khách sạn (${counts.hotel})` },
    { value: "restaurant", label: `Nhà hàng (${counts.restaurant})` },
    { value: "resort", label: `Resort (${counts.resort})` },
    { value: "sảnh tiệc", label: `Sảnh tiệc (${counts["sảnh tiệc"]})` },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Bản Đồ Phân Bổ Dự Án"
        subtitle="Trực quan hóa vị trí công trình, mật độ khách hàng và khu vực hoạt động trên bản đồ"
        onAdd={() => {
          setEditingVenue(null);
          setVenueFormOpen(true);
        }}
        addLabel="Thêm Địa Điểm Mới"
      />

      {error && (
        <p className={styles.error} onClick={() => setError(null)}>
          {error}
        </p>
      )}

      {/* Unified Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm kiếm theo tên địa điểm, địa chỉ, thành phố..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "180px" }}>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typeSelectOptions}
            />
          </div>
        </div>

        {/* Type Filter Buttons */}
        <StatusTabs
          tabs={typeTabs}
          activeTab={selectedType}
          onChange={setSelectedType}
        />
      </div>

      {status === "loading" && <p className={styles.status}>Đang tải danh sách địa điểm…</p>}
      {status === "error" && (
        <p className={styles.status}>Không tải được danh sách địa điểm, vui lòng thử lại.</p>
      )}

      {status === "ready" && (
        <div className={styles.layout}>
          <VenueList
            venues={filteredVenues}
            allVenues={venues}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedId={selectedVenueId}
            onSelect={handleSelectVenue}
            onAdd={() => {
              setEditingVenue(null);
              setVenueFormOpen(true);
            }}
            onEdit={(venue) => {
              setEditingVenue(venue);
              setVenueFormOpen(true);
            }}
            onDelete={(venue) => requestDelete({ type: "venue", venue })}
          />

          <div className={styles.detailPanel}>
            {!selectedVenueId && (
              <p className={styles.placeholder}>
                Chọn một địa điểm bên trái để xem và quản lý danh sách dự án.
              </p>
            )}

            {selectedVenueId && detailLoading && (
              <p className={styles.placeholder}>Đang tải dự án…</p>
            )}

            {selectedVenueId && !detailLoading && selectedVenue && (
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <p className={styles.detailName}>{selectedVenue.name}</p>
                    <p className={styles.detailMeta}>
                      {selectedVenue.address ?? "Chưa có địa chỉ"}
                      {selectedVenue.city ? `, ${selectedVenue.city}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.addProjectButton}
                    onClick={() => {
                      setEditingProject(null);
                      setProjectFormOpen(true);
                    }}
                  >
                    <PlusIcon
                      className="h-4 w-4"
                      style={{ width: 16, height: 16 }}
                    />{" "}
                    Thêm dự án
                  </button>
                </div>

                {selectedVenue.projects.length === 0 ? (
                  <p className={styles.placeholder}>
                    Chưa có dự án nào tại địa điểm này. Hãy bấm "Thêm dự án" để tạo mới!
                  </p>
                ) : (
                  <ul className={styles.projectList}>
                    {selectedVenue.projects.map((project) => (
                      <li key={project.id} className={styles.projectItem}>
                        <div className={styles.projectThumb}>
                          {project.cover_image ? (
                            <img
                              src={project.cover_image}
                              alt={project.title}
                              className={styles.projectThumbImg}
                            />
                          ) : (
                            <PhotoIcon
                              className="h-4 w-4"
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                        <div className={styles.projectBody}>
                          <p className={styles.projectTitle}>
                            {project.title}
                            {!project.published && (
                              <span className={styles.unpublished}>
                                <EyeSlashIcon
                                  className="h-3 w-3 inline"
                                  style={{ width: 12, height: 12 }}
                                />{" "}
                                Ẩn
                              </span>
                            )}
                          </p>
                          <p className={styles.projectMeta}>
                            {project.wedding_date ?? "Chưa rõ ngày"}
                            {project.style_tags.length > 0 &&
                              ` · ${project.style_tags.map((t) => `#${t}`).join(" ")}`}
                          </p>
                        </div>
                        <div className={styles.projectActions}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => {
                              setEditingProject(project);
                              setProjectFormOpen(true);
                            }}
                            title="Sửa dự án"
                          >
                            <PencilIcon
                              className="h-4 w-4"
                              style={{ width: 16, height: 16 }}
                            />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => requestDelete({ type: "project", project })}
                            title="Xoá dự án"
                          >
                            <TrashIcon
                              className="h-4 w-4"
                              style={{ width: 16, height: 16 }}
                            />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {venueFormOpen && (
        <VenueForm
          venue={editingVenue}
          onCancel={() => {
            setVenueFormOpen(false);
            setEditingVenue(null);
          }}
          onSubmit={handleVenueFormSubmit}
        />
      )}

      {projectFormOpen && selectedVenue && (
        <ProjectForm
          venueName={selectedVenue.name}
          project={editingProject}
          onCancel={() => {
            setProjectFormOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleProjectFormSubmit}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title={deleteTarget?.type === "venue" ? "Xác nhận xoá địa điểm" : "Xác nhận xoá dự án"}
        itemName={deleteTarget?.type === "venue" ? deleteTarget.venue.name : deleteTarget?.project.title}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={cancelDelete}
      />
    </div>
  );
}
