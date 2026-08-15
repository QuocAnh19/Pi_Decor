import { useMaterials, MaterialList, MaterialForm } from "../../features/materials";
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
          onDelete={handleDelete}
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
    </div>
  );
}
