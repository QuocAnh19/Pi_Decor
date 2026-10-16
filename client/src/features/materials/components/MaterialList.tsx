import { useMemo } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { SearchInput, Select } from "../../../components/ui";
import {
  AdminPageHeader,
  ViewToggle,
  StatusTabs,
  EmptyState,
} from "../../../components/admin";
import type { MaterialItem } from "../../../lib/types";
import {
  MaterialTableView,
  MATERIAL_CATEGORY_LABELS,
} from "./MaterialTableView";
import styles from "./MaterialList.module.scss";

interface MaterialListProps {
  materials: MaterialItem[];
  allMaterials: MaterialItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onAdd: () => void;
  onEdit: (material: MaterialItem) => void;
  onDelete: (material: MaterialItem) => void;
}

export function MaterialList({
  materials,
  allMaterials,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onAdd,
  onEdit,
  onDelete,
}: MaterialListProps) {
  const categoryCounts = useMemo(() => {
    return {
      all: allMaterials.length,
      fabric: allMaterials.filter((m) => m.category === "fabric").length,
      drape_detail: allMaterials.filter(
        (m) => m.category === "drape_detail" || m.category === "drape",
      ).length,
      flowers: allMaterials.filter(
        (m) => m.category === "flowers" || m.category === "flower",
      ).length,
      text_name: allMaterials.filter(
        (m) =>
          m.category === "text_name" ||
          m.category === "text_date" ||
          m.category === "text",
      ).length,
    };
  }, [allMaterials]);

  const categoryTabs = [
    { id: "all", label: `Tất cả (${categoryCounts.all})` },
    { id: "fabric", label: `Rèm Nền (${categoryCounts.fabric})` },
    {
      id: "drape_detail",
      label: `Rèm Chi Tiết (${categoryCounts.drape_detail})`,
    },
    { id: "flowers", label: `Cụm Hoa (${categoryCounts.flowers})` },
    { id: "text_name", label: `Dãy Chữ Số (${categoryCounts.text_name})` },
  ];

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <AdminPageHeader
        title="Danh Mục &amp; Kho Vật Liệu"
        subtitle="Quản lý kho nguyên vật liệu, đơn giá nhà cung cấp và thông số kỹ thuật chi tiết"
        onAdd={onAdd}
        addLabel="Thêm Vật Liệu Mới"
      />

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm theo tên vật liệu, danh mục, mã màu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "180px" }}>
            <Select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={[
                { value: "all", label: "Tất cả phân mục" },
                { value: "fabric", label: "Rèm nền (fabric)" },
                { value: "drape_detail", label: "Rèm chi tiết (drape_detail)" },
                { value: "flowers", label: "Cụm hoa (flowers)" },
                { value: "text_name", label: "Dãy chữ số (text_name)" },
              ]}
            />
          </div>

          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        </div>

        {/* Category Tabs */}
        <StatusTabs
          tabs={categoryTabs}
          activeTab={selectedCategory}
          onChange={onCategoryChange}
        />
      </div>

      {/* Main List Display */}
      {materials.length === 0 ? (
        <EmptyState
          icon={
            <PhotoIcon
              className="h-10 w-10"
              style={{ width: 40, height: 40, color: "#9c9186" }}
            />
          }
          title="Không tìm thấy vật liệu phù hợp"
          description='Thử thay đổi từ khóa tìm kiếm hoặc bấm "Thêm Vật Liệu Mới" để tạo vật liệu.'
        />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className={styles.grid}>
          {materials.map((mat) => (
            <div key={mat.id} className={styles.card}>
              <div className={styles.preview}>
                <span className={styles.badgeTag}>
                  #{MATERIAL_CATEGORY_LABELS[mat.category] ?? mat.category}
                </span>

                {mat.image_url ? (
                  <img
                    src={mat.image_url}
                    alt={mat.name}
                    className={styles.image}
                  />
                ) : mat.color_hex ? (
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: mat.color_hex }}
                  />
                ) : (
                  <PhotoIcon
                    className="h-8 w-8"
                    style={{ width: 36, height: 36, color: "#9c9186" }}
                  />
                )}
              </div>

              <div className={styles.body}>
                <div className={styles.name}>{mat.name}</div>
                <div className={styles.categorySubtext}>
                  <span>Phân loại:</span>
                  <strong style={{ color: "#a15c2e" }}>
                    {MATERIAL_CATEGORY_LABELS[mat.category] ?? mat.category}
                  </strong>
                </div>
                {mat.color_hex && (
                  <div className={styles.colorMeta}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: mat.color_hex }}
                    />
                    <span>{mat.color_hex}</span>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => onEdit(mat)}
                  title="Chỉnh sửa vật liệu"
                >
                  <PencilSquareIcon
                    className="h-3.5 w-3.5"
                    style={{ width: 14, height: 14 }}
                  />{" "}
                  Sửa
                </button>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.dangerBtn}`}
                  onClick={() => onDelete(mat)}
                  title="Xóa vật liệu"
                >
                  <TrashIcon
                    className="h-3.5 w-3.5"
                    style={{ width: 14, height: 14 }}
                  />{" "}
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <MaterialTableView
          materials={materials}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
