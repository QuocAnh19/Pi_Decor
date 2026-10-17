import { useState, useMemo } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import {
  AdminPageHeader,
  StatusTabs,
  EmptyState,
  ConfirmDeleteModal,
  useConfirmDelete,
} from "../../components/admin";
import { SearchInput } from "../../components/ui";
import {
  useServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  AdminServicesListView,
  ServiceFormModal,
} from "../../features/services";
import type { ServiceCategory } from "../../lib/types";
import styles from "./AdminServicesPage.module.scss";

export function AdminServicesPage() {
  const query = useServicesQuery();
  const createMutation = useCreateServiceMutation();
  const updateMutation = useUpdateServiceMutation();
  const deleteMutation = useDeleteServiceMutation();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceCategory | null>(null);

  const {
    target: deleteTarget,
    isOpen: isDeleteOpen,
    loading: isDeleting,
    requestDelete,
    cancelDelete,
    executeDelete,
  } = useConfirmDelete<ServiceCategory>();

  const services = useMemo(() => {
    const list = query.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [query.data]);

  const counts = useMemo(() => {
    return {
      all: services.length,
      featured: services.filter((s) => s.featured).length,
      piwedding: services.filter(
        (s) => s.brand?.toLowerCase().includes("wedding") || s.accent === "wedding"
      ).length,
      pikids: services.filter((s) => s.brand?.toLowerCase().includes("kids") || s.accent === "kids")
        .length,
      pievent: services.filter(
        (s) => s.brand?.toLowerCase().includes("event") || s.accent === "event"
      ).length,
    };
  }, [services]);

  const tabs = [
    { id: "all", label: `Tất cả (${counts.all})` },
    { id: "featured", label: `Nổi bật (${counts.featured})` },
    { id: "piwedding", label: `PiWedding (${counts.piwedding})` },
    { id: "pikids", label: `PiKids (${counts.pikids})` },
    { id: "pievent", label: `PiEvent (${counts.pievent})` },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      // Tab filter
      if (activeTab === "featured" && !item.featured) return false;
      if (activeTab === "piwedding") {
        const isWedding =
          item.brand?.toLowerCase().includes("wedding") || item.accent === "wedding";
        if (!isWedding) return false;
      }
      if (activeTab === "pikids") {
        const isKids = item.brand?.toLowerCase().includes("kids") || item.accent === "kids";
        if (!isKids) return false;
      }
      if (activeTab === "pievent") {
        const isEvent = item.brand?.toLowerCase().includes("event") || item.accent === "event";
        if (!isEvent) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchTagline = item.tagline?.toLowerCase().includes(q);
        const matchItems = Array.isArray(item.items)
          ? item.items.some((it) => it.toLowerCase().includes(q))
          : false;

        return matchTitle || matchBrand || matchTagline || matchItems;
      }

      return true;
    });
  }, [services, activeTab, searchQuery]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: ServiceCategory) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: FormData | Partial<ServiceCategory>) => {
    if (editingService) {
      await updateMutation.mutateAsync({ id: editingService.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleToggleFeatured = async (service: ServiceCategory) => {
    await updateMutation.mutateAsync({
      id: service.id,
      data: { featured: !service.featured },
    });
  };

  const handleMoveOrder = async (service: ServiceCategory, direction: "up" | "down") => {
    const currentIndex = services.findIndex((s) => s.id === service.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const targetService = services[targetIndex];
    const currentOrder = service.order ?? currentIndex;
    const targetOrder = targetService.order ?? targetIndex;

    // Swap order values
    const newCurrentOrder = currentOrder === targetOrder ? targetIndex : targetOrder;
    const newTargetOrder = currentOrder === targetOrder ? currentIndex : currentOrder;

    await Promise.all([
      updateMutation.mutateAsync({ id: service.id, data: { order: newCurrentOrder } }),
      updateMutation.mutateAsync({ id: targetService.id, data: { order: newTargetOrder } }),
    ]);
  };

  const handleConfirmDelete = async () => {
    await executeDelete(async (target) => {
      await deleteMutation.mutateAsync(target.id);
    });
  };

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Quản lý Dịch vụ"
        subtitle="Danh mục các gói dịch vụ Bento hiển thị trên Trang chủ Pi Decor"
        onAdd={handleOpenCreate}
        addLabel="Thêm dịch vụ"
      />

      <div className={styles.filterRow}>
        <StatusTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className={styles.searchWrap}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, thương hiệu, từ khóa..."
          />
        </div>
      </div>

      {query.isLoading ? (
        <div className={styles.loadingWrap}>Đang tải danh sách dịch vụ...</div>
      ) : query.isError ? (
        <div className={styles.errorWrap} role="alert">
          Không thể tải danh sách dịch vụ từ máy chủ. Vui lòng thử lại sau.
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={<SparklesIcon style={{ width: 32, height: 32 }} />}
          title="Không tìm thấy dịch vụ nào"
          description={
            searchQuery.trim()
              ? "Không có kết quả khớp với từ khóa tìm kiếm của bạn."
              : "Chưa có dịch vụ nào trong phân loại này. Bấm Thêm dịch vụ để tạo mới."
          }
          action={
            <button type="button" className={styles.emptyActionBtn} onClick={handleOpenCreate}>
              Tạo dịch vụ mới
            </button>
          }
        />
      ) : (
        <AdminServicesListView
          services={filteredServices}
          onEdit={handleEdit}
          onDelete={requestDelete}
          onToggleFeatured={handleToggleFeatured}
          onMoveOrder={handleMoveOrder}
          updatingId={updateMutation.isPending ? (updateMutation.variables?.id ?? null) : null}
        />
      )}

      {isModalOpen && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
          service={editingService}
          onSubmit={handleFormSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={cancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xoá dịch vụ"
        itemName={deleteTarget?.title}
        message={
          <p>
            Bạn có chắc chắn muốn xoá dịch vụ <strong>{deleteTarget?.title}</strong>? Mọi dữ liệu và
            ảnh liên quan sẽ bị xoá vĩnh viễn.
          </p>
        }
        loading={isDeleting}
      />
    </div>
  );
}
