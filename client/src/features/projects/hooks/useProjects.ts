import { useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/authContext";
import { toast } from "../../../lib/toast";
import { toProjectItem } from "../../../lib/mappers";
import type { ProjectPayload } from "../../../lib/types";
import {
  ProjectItem,
  ASYMMETRIC_SLOT_DESCS,
} from "../types";
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useCreateVenueProjectMutation,
} from "./projects.queries";

export function useProjects(selectedVenueId?: string | null) {
  const { token } = useAuth();
  const isAdmin = Boolean(token);

  // TanStack Query & Mutations
  const projectsQuery = useProjectsQuery(isAdmin);
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();
  const createVenueProjectMutation = useCreateVenueProjectMutation();

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

  // Chuyển đổi dữ liệu từ DB sang UI model qua lớp mappers tập trung
  const projects = useMemo<ProjectItem[]>(() => {
    if (!Array.isArray(projectsQuery.data)) return [];
    return projectsQuery.data.map(toProjectItem);
  }, [projectsQuery.data]);

  const loadProjects = useCallback(async () => {
    setError(null);
    try {
      await projectsQuery.refetch();
    } catch (err) {
      setError("Không thể nạp dữ liệu từ máy chủ. Vui lòng thử lại sau.");
      toast.error(err, "Lỗi tải danh sách dự án.");
    }
  }, [projectsQuery]);

  const handleDeleteProject = async (id: string) => {
    if (!token) {
      toast.error(new Error("Vui lòng đăng nhập lại."));
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // toast.error được gọi trong onError của deleteMutation
    }
  };

  const handleToggleFeatured = async (proj: ProjectItem) => {
    if (!token) return;
    const nextStatus: "active" | "featured" | "draft" =
      proj.status === "featured" ? "active" : "featured";

    try {
      await updateMutation.mutateAsync({
        id: proj.id,
        payload: {
          status: nextStatus,
          published: true,
        },
      });
    } catch {
      // toast.error được gọi trong onError của updateMutation
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
      toast.error(new Error("Vui lòng nhập tên dự án!"));
      return;
    }
    if (!token) {
      toast.error(new Error("Phiên làm việc hết hạn, vui lòng đăng nhập lại."));
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
        await updateMutation.mutateAsync({ id: editingProject.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsModalOpen(false);
      setEditingProject(null);
    } catch {
      // toast.error đã được mutation xử lý
    } finally {
      setSubmitting(false);
    }
  };

  // Simple payload submit (used when called from venue page)
  const handleSimpleFormSubmit = async (payload: ProjectPayload) => {
    if (!token) return;
    try {
      if (editingProject) {
        await updateMutation.mutateAsync({ id: editingProject.id, payload });
      } else if (selectedVenueId) {
        await createVenueProjectMutation.mutateAsync({
          venueId: selectedVenueId,
          payload,
        });
      }
      setIsModalOpen(false);
      setEditingProject(null);
    } catch {
      // toast.error đã được mutation xử lý
    }
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
    loading: projectsQuery.isLoading,
    submitting,
    error: error ?? (projectsQuery.isError ? "Không thể nạp dữ liệu từ máy chủ. Vui lòng thử lại sau." : null),
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
