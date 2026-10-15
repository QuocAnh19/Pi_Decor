import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import type { MaterialItem } from "../../../lib/types";

export function useMaterials() {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  const loadMaterials = useCallback(() => {
    return api
      .getMaterials()
      .then((data) => {
        setMaterials(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      // 1. Filter by category
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

      // 2. Filter by search query
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

    if (editingMaterial) {
      await api.updateMaterial(editingMaterial.id, formData);
    } else {
      await api.createMaterial(formData);
    }

    setFormOpen(false);
    setEditingMaterial(null);
    await loadMaterials();
  };

  const handleDelete = async (mat: MaterialItem) => {
    if (!token) return;

    setMaterials((prev) => prev.filter((m) => m.id !== mat.id));

    try {
      await api.deleteMaterial(mat.id);
    } catch (err) {
      console.error("Failed to delete material:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi xoá vật liệu.");
      await loadMaterials();
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
