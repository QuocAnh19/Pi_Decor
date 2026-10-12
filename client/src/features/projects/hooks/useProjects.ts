import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import { categoryPortfolio } from "../../../lib/content";
import type { ProjectPayload } from "../../../lib/types";
import {
  ProjectItem,
  dbToProjectItem,
  ASYMMETRIC_SLOT_DESCS,
} from "../types";

export function useProjects(selectedVenueId?: string | null) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = token ? await api.getProjectsAdmin(token) : await api.getProjects();
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data.map(dbToProjectItem));
      } else {
        const fallback: ProjectItem[] = categoryPortfolio.map((item: any, idx: number) => ({
          id: String(item.id),
          categoryId: item.categoryId || "piwedding",
          tag: item.tag || "Gia Tiên",
          title: item.title || "Dự án mới",
          location: item.location || "Đà Nẵng",
          src: item.src || "/images/portfolio/piwedding-gia-tien-1.jpg",
          gallery: Array.isArray(item.gallery) ? item.gallery : [],
          description: item.description || `Concept trang trí ${item.tag} ấn tượng tại ${item.location}.`,
          date: item.date || "2026-03-19",
          budget: item.budget || "Thỏa thuận",
          status: "active",
          priceTier: "standard",
          createdAt: Date.now() - idx * 86400000,
        }));
        setProjects(fallback);
      }
    } catch (err) {
      console.error("Failed to load projects from DB:", err);
      setError("Không thể nạp dữ liệu từ máy chủ. Đang hiển thị bản dữ liệu xem trước.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await api.deleteProject(id, token);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Xóa dự án thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định."));
    }
  };

  const handleToggleFeatured = async (proj: ProjectItem) => {
    if (!token) return;
    const nextStatus: "active" | "featured" | "draft" = proj.status === "featured" ? "active" : "featured";
    setProjects((prev) =>
      prev.map((p) => (p.id === proj.id ? { ...p, status: nextStatus } : p))
    );

    try {
      await api.updateProject(
        proj.id,
        {
          status: nextStatus,
          published: true,
        },
        token
      );
    } catch (err) {
      console.error("Failed to update project status:", err);
      await loadProjects();
    }
  };

  // Submit via FormData for full project editor modal
  const handleFullFormSubmit = async (
    formData: Omit<ProjectItem, "id">,
    selectedFile: File | null,
    galleryUrls: string[],
    selectedGalleryFiles: File[],
    customSpans: Record<number, string>
  ) => {
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên dự án!");
      return;
    }
    if (!token) {
      alert("Phiên làm việc hết hạn, vui lòng đăng nhập lại.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("category_id", formData.categoryId);
      payload.append("tag", formData.tag);
      payload.append("location", formData.location);
      payload.append("description", formData.description || "");
      payload.append("budget", formData.budget || "");
      payload.append("status", formData.status || "active");
      payload.append("price_tier", formData.priceTier || "standard");
      payload.append(
        "style_tags",
        JSON.stringify([formData.categoryId, formData.tag])
      );
      payload.append("wedding_date", formData.date || "");
      payload.append("published", String(formData.status !== "draft"));

      const galleryItems = galleryUrls
        .map((url, idx) => {
          if (!url || url.startsWith("data:")) return null;
          const span =
            customSpans[idx] ||
            ASYMMETRIC_SLOT_DESCS[idx % ASYMMETRIC_SLOT_DESCS.length].spanKey;
          return { url, span };
        })
        .filter(Boolean);

      payload.append("gallery", JSON.stringify(galleryItems));

      if (formData.src && !formData.src.startsWith("data:")) {
        payload.append("cover_image", formData.src);
      }

      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      selectedGalleryFiles.forEach((file) => {
        payload.append("gallery_files", file);
      });

      if (editingProject) {
        await api.updateProject(editingProject.id, payload, token);
      } else {
        await api.createProject(payload, token);
      }

      await loadProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Failed to save project:", err);
      alert("Lưu dự án thất bại: " + (err instanceof Error ? err.message : "Lỗi máy chủ."));
    } finally {
      setSubmitting(false);
    }
  };

  // Simple payload submit (used when called from venue page)
  const handleSimpleFormSubmit = async (payload: ProjectPayload) => {
    if (!token) return;
    if (editingProject) {
      await api.updateProject(editingProject.id, payload, token);
    } else if (selectedVenueId) {
      await api.createVenueProject(selectedVenueId, payload, token);
    }
    setIsModalOpen(false);
    setEditingProject(null);
    await loadProjects();
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tag.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || p.categoryId === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || p.status === selectedStatus;

      const matchesPriceTier =
        selectedPriceTier === "all" || p.priceTier === selectedPriceTier;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriceTier;
    });
  }, [projects, searchQuery, selectedCategory, selectedStatus, selectedPriceTier]);

  return {
    projects,
    filteredProjects,
    loading,
    submitting,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedPriceTier,
    setSelectedPriceTier,
    viewMode,
    setViewMode,
    isModalOpen,
    setIsModalOpen,
    editingProject,
    setEditingProject,
    loadProjects,
    handleDeleteProject,
    handleToggleFeatured,
    handleFullFormSubmit,
    handleSimpleFormSubmit,
  };
}
