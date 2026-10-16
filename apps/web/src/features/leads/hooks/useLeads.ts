import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/authContext";
import type { Lead, LeadStatus } from "../../../lib/types";
import { useLeadsQuery, useUpdateLeadStatusMutation } from "./leads.queries";

/**
 * Hook quản lý danh sách leads/khách hàng tiềm năng.
 * Tích hợp TanStack Query và bảo toàn 100% interface trả về cho UI.
 */
export function useLeads() {
  const { token } = useAuth();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input (~300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useLeadsQuery({
    page,
    limit: 20,
    q: debouncedSearch,
    status: statusFilter,
    enabled: Boolean(token),
  });

  const updateStatusMutation = useUpdateLeadStatusMutation();

  const leads = responseData?.data ?? [];
  const total = responseData?.total ?? 0;

  const status: "loading" | "ready" | "error" = isLoading ? "loading" : isError ? "error" : "ready";

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    if (!token || updatingStatusId === id) return;
    setUpdatingStatusId(id);

    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
      setError(err instanceof Error ? err.message : "Không đổi được trạng thái, thử lại.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  const loadLeads = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    leads,
    total,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    updatingStatusId,
    status,
    selectedLead,
    setSelectedLead,
    error,
    totalPages,
    loadLeads,
    handleStatusChange,
  };
}
