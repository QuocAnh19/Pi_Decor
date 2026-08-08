import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { MaterialItem } from "../../lib/types";
import { MaterialList } from "../../components/admin/MaterialList";
import { MaterialForm } from "../../components/admin/MaterialForm";
import styles from "./AdminMaterialsPage.module.scss";

export function AdminMaterialsPage() {
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

  async function handleFormSubmit(formData: FormData) {
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
  }

  async function handleDelete(mat: MaterialItem) {
    if (!token) return;
    if (!confirm(`Xoá vật liệu "${mat.name}"?`)) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
      const res = await fetch(`${API_URL}/materials/${mat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Không xoá được vật liệu.");
      }
      await loadMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi xoá vật liệu.");
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Quản lý Vật liệu (Materials)</h1>

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {status === "loading" && <p className={styles.status}>Đang tải danh sách vật liệu…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách vật liệu.</p>}

      {status === "ready" && (
        <MaterialList
          materials={materials}
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
