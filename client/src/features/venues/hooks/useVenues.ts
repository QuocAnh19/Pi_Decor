import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import type { Project, ProjectPayload, Venue, VenueDetail, VenuePayload } from "../../../lib/types";

export function useVenues() {
  const { token } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [venueFormOpen, setVenueFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadVenues = useCallback(() => {
    return api
      .getVenues()
      .then((data) => {
        setVenues(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (selectedType !== "all" && venue.type !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = venue.name?.toLowerCase().includes(q);
        const matchCity = venue.city?.toLowerCase().includes(q);
        const matchAddr = venue.address?.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchAddr) return false;
      }
      return true;
    });
  }, [venues, selectedType, searchQuery]);

  const loadVenueDetail = useCallback((id: string) => {
    setDetailLoading(true);
    api
      .getVenue(id)
      .then(setSelectedVenue)
      .catch(() => setError("Không tải được chi tiết địa điểm."))
      .finally(() => setDetailLoading(false));
  }, []);

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenueId(venue.id);
    loadVenueDetail(venue.id);
  };

  const handleVenueFormSubmit = async (payload: VenuePayload) => {
    if (!token) return;
    if (editingVenue) {
      await api.updateVenue(editingVenue.id, payload);
    } else {
      await api.createVenue(payload);
    }
    setVenueFormOpen(false);
    setEditingVenue(null);
    await loadVenues();
    if (editingVenue && selectedVenueId === editingVenue.id) {
      loadVenueDetail(editingVenue.id);
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    if (!token) return;
    if (!confirm(`Xoá địa điểm "${venue.name}"? Toàn bộ dự án bên trong cũng sẽ mất pin trên bản đồ.`)) return;
    try {
      await api.deleteVenue(venue.id);
      if (selectedVenueId === venue.id) {
        setSelectedVenueId(null);
        setSelectedVenue(null);
      }
      await loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xoá được địa điểm.");
    }
  };

  const handleProjectFormSubmit = async (payload: ProjectPayload) => {
    if (!token || !selectedVenueId) return;
    if (editingProject) {
      await api.updateProject(editingProject.id, payload);
    } else {
      await api.createVenueProject(selectedVenueId, payload);
    }
    setProjectFormOpen(false);
    setEditingProject(null);
    loadVenueDetail(selectedVenueId);
    loadVenues();
  };

  const handleDeleteProject = async (project: Project) => {
    if (!token || !selectedVenueId) return;
    if (!confirm(`Xoá dự án "${project.title}"?`)) return;
    try {
      await api.deleteProject(project.id);
      loadVenueDetail(selectedVenueId);
      loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xoá được dự án.");
    }
  };

  return {
    venues,
    filteredVenues,
    status,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedVenueId,
    selectedVenue,
    detailLoading,
    venueFormOpen,
    setVenueFormOpen,
    editingVenue,
    setEditingVenue,
    projectFormOpen,
    setProjectFormOpen,
    editingProject,
    setEditingProject,
    handleSelectVenue,
    handleVenueFormSubmit,
    handleDeleteVenue,
    handleProjectFormSubmit,
    handleDeleteProject,
  };
}
