import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import type { Lead, LeadStatus } from "../../../lib/types";

export function useLeads() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
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

  const loadLeads = useCallback(() => {
    if (!token) return;
    setStatus("loading");
    api
      .getLeads(token, {
        page,
        limit: 20,
        q: debouncedSearch,
        status: statusFilter,
      })
      .then((res) => {
        setLeads(res.data);
        setTotal(res.total);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token, page, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    if (!token || updatingStatusId === id) return;
    setUpdatingStatusId(id);

    // Optimistically update both leads array and selectedLead
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));

    try {
      await api.updateLeadStatus(id, newStatus, token);
    } catch (err) {
      console.error("Failed to update lead status:", err);
      setError(err instanceof Error ? err.message : "Không đổi được trạng thái, thử lại.");
      loadLeads();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

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
