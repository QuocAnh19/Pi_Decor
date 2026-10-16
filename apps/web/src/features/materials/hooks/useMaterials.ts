import { useState, useMemo } from "react";
import { useAuth } from "../../../lib/authContext";
import type { MaterialItem } from "../../../lib/types";
import {
  useMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} from "./materials.queries";

/**
 * Hook quản lý vật liệu của admin.
 * Sử dụng TanStack Query cho cache, refetch và optimistic updates; giữ nguyên interface trả về.
 */
export function useMaterials() {
  const { token } = useAuth();
  const { data: materials = [], isLoading, isError } = useMaterialsQuery();
  const createMutation = useCreateMaterialMutation();
  const updateMutation = useUpdateMaterialMutation();
  const deleteMutation = useDeleteMaterialMutation();

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  const status: "loading" | "ready" | "error" = isLoading ? "loading" : isError ? "error" : "ready";

  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      // 1. Lọc theo category
      if (selectedCategory !== "all") {
        if (selectedCategory === "fabric" && mat.category !== "fabric") return false;
        if (
          selectedCategory === "drape_detail" &&
          mat.category !== "drape_detail" &&
          mat.category !== "drape"
        )
          return false;
        if (
          selectedCategory === "flowers" &&
          mat.category !== "flowers" &&
          mat.category !== "flower"
        )
          return false;
        if (
          selectedCategory === "text_name" &&
          mat.category !== "text_name" &&
          mat.category !== "text_date" &&
          mat.category !== "text"
        )
          return false;
      }

      // 2. Lọc theo search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = mat.name?.toLowerCase().includes(q);
        const matchCat = mat.category?.toLowerCase().includes(q);
        const matchHex = mat.color_hex?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchHex) return false;
      }

      return true;
    });
  }, [materials, selectedCategory, searchQuery]);

  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;

    try {
      if (editingMaterial) {
        await updateMutation.mutateAsync({ id: editingMaterial.id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormOpen(false);
      setEditingMaterial(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu vật liệu.");
    }
  };

  const handleDelete = async (mat: MaterialItem) => {
    if (!token) return;
    try {
      await deleteMutation.mutateAsync(mat.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi xoá vật liệu.");
    }
  };

  return {
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
  };
}
