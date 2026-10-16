import { useMaterials, MaterialList, MaterialForm } from "../../features/materials";
import { ConfirmDeleteModal, useConfirmDelete } from "../../components/admin";
import type { MaterialItem } from "../../lib/types";
import styles from "./AdminMaterialsPage.module.scss";

export function AdminMaterialsPage() {
  const {
    materials,
    filteredMaterials,
    status,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    formOpen,
    setFormOpen,
    editingMaterial,
    setEditingMaterial,
    handleFormSubmit,
    handleDelete,
  } = useMaterials();

  const {
    target: materialToDelete,
    isOpen: isDeleteOpen,
    loading: isDeleting,
    requestDelete,
    cancelDelete,
    executeDelete,
  } = useConfirmDelete<MaterialItem>();

  const handleConfirmDelete = async () => {
    await executeDelete(async (mat) => {
      await handleDelete(mat);
    });
  };

  return (
    <div>
      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {status === "loading" && <p className={styles.status}>Đang tải danh sách vật liệu…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách vật liệu.</p>}

      {status === "ready" && (
        <MaterialList
          materials={filteredMaterials}
          allMaterials={materials}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAdd={() => {
            setEditingMaterial(null);
            setFormOpen(true);
          }}
          onEdit={(mat) => {
            setEditingMaterial(mat);
            setFormOpen(true);
          }}
          onDelete={requestDelete}
        />
      )}

      {formOpen && (
        <MaterialForm
          material={editingMaterial}
          onCancel={() => {
            setFormOpen(false);
            setEditingMaterial(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={cancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={materialToDelete ? `vật liệu "${materialToDelete.name}"` : "vật liệu này"}
        loading={isDeleting}
      />
    </div>
  );
}
