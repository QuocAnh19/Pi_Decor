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
  AdminTable,
  AdminTableRow,
} from "../../../components/admin";
import type { MaterialItem } from "../../../lib/types";
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

const CATEGORY_LABELS: Record<string, string> = {
  fabric: "Rèm nền",
  drape_detail: "Rèm chi tiết",
  drape: "Rèm chi tiết",
  flowers: "Cụm hoa",
  flower: "Cụm hoa",
  text_name: "Dãy chữ số",
  text_date: "Dãy chữ số",
  text: "Dãy chữ số",
};

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
                  #{CATEGORY_LABELS[mat.category] ?? mat.category}
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
                    {CATEGORY_LABELS[mat.category] ?? mat.category}
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
        /* Table View */
        <AdminTable
          headers={[
            "Hình ảnh & Tên vật liệu",
            "Phân loại",
            "Mã màu / Định dạng",
            "Mã định danh (ID)",
            { label: "Thao tác", align: "right" },
          ]}
        >
          {materials.map((mat) => (
            <AdminTableRow key={mat.id}>
                  <td
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "42px",
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
                      {mat.image_url ? (
                        <img
                          src={mat.image_url}
                          alt={mat.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : mat.color_hex ? (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: mat.color_hex,
                            border: "1px solid #e7ded0",
                          }}
                        />
                      ) : (
                        <PhotoIcon
                          className="h-5 w-5"
                          style={{ width: 20, height: 20, color: "#9c9186" }}
                        />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#271620",
                          fontSize: "14px",
                        }}
                      >
                        {mat.name}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        backgroundColor: "#f1e4d8",
                        color: "#a15c2e",
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        border: "1px solid rgba(161, 92, 46, 0.2)",
                      }}
                    >
                      #{CATEGORY_LABELS[mat.category] ?? mat.category}
                    </span>
                  </td>

                  <td style={{ padding: "12px 16px", color: "#6e6259" }}>
                    {mat.color_hex ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: mat.color_hex,
                            border: "1px solid #e7ded0",
                            display: "inline-block",
                          }}
                        />
                        <code
                          style={{ fontSize: "12px", fontFamily: "monospace" }}
                        >
                          {mat.color_hex}
                        </code>
                      </div>
                    ) : mat.image_url ? (
                      <span style={{ fontSize: "12px", color: "#6e6259" }}>
                        Tệp hình ảnh
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#9c9186",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    {mat.id}
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
                        type="button"
                        onClick={() => onEdit(mat)}
                        className={styles.iconBtn}
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
                        onClick={() => onDelete(mat)}
                        className={`${styles.iconBtn} ${styles.dangerBtn}`}
                        title="Xóa vật liệu"
                      >
                        <TrashIcon
                          className="h-3.5 w-3.5"
                          style={{ width: 14, height: 14 }}
                        />
                      </button>
                    </div>
                  </td>
                </AdminTableRow>
              ))}
        </AdminTable>
      )}
    </div>
  );
}
