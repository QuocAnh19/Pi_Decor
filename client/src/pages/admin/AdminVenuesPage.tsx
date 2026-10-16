import { useMemo } from "react";
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
import { VenueDetailPanel } from "./components/VenueDetailPanel";
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

      {status === "loading" && (
        <p className={styles.status}>Đang tải danh sách địa điểm…</p>
      )}
      {status === "error" && (
        <p className={styles.status}>
          Không tải được danh sách địa điểm, vui lòng thử lại.
        </p>
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

          <VenueDetailPanel
            selectedVenueId={selectedVenueId}
            detailLoading={detailLoading}
            selectedVenue={selectedVenue}
            onAddProject={() => {
              setEditingProject(null);
              setProjectFormOpen(true);
            }}
            onEditProject={(project) => {
              setEditingProject(project);
              setProjectFormOpen(true);
            }}
            onDeleteProject={(project) =>
              requestDelete({ type: "project", project })
            }
          />
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
        title={
          deleteTarget?.type === "venue"
            ? "Xác nhận xoá địa điểm"
            : "Xác nhận xoá dự án"
        }
        itemName={
          deleteTarget?.type === "venue"
            ? deleteTarget.venue.name
            : deleteTarget?.project.title
        }
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={cancelDelete}
      />
    </div>
  );
}
