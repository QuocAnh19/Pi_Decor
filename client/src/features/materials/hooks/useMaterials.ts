import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import type { MaterialItem } from "../../../lib/types";

export function useMaterials() {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

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

  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;

    const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
    const path = editingMaterial ? `/materials/${editingMaterial.id}` : "/materials";
    const method = editingMaterial ? "PATCH" : "POST";

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? "Không lưu được vật liệu.");
    }

    setFormOpen(false);
    setEditingMaterial(null);
    await loadMaterials();
  };

  const handleDelete = async (mat: MaterialItem) => {
    if (!token) return;
    if (!confirm(`Xoá vật liệu "${mat.name}"?`)) return;

    setMaterials((prev) => prev.filter((m) => m.id !== mat.id));

    try {
      await api.deleteMaterial(mat.id, token);
    } catch (err) {
      console.error("Failed to delete material:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi xoá vật liệu.");
      await loadMaterials();
    }
  };

  return {
    materials,
    status,
    error,
    setError,
    formOpen,
    setFormOpen,
    editingMaterial,
    setEditingMaterial,
    handleFormSubmit,
    handleDelete,
  };
}
