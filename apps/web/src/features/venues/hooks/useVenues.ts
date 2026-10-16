import { useState, useMemo } from "react";
import { useAuth } from "../../../lib/authContext";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import type { Project, ProjectPayload, Venue, VenuePayload } from "../../../lib/types";
import {
  venuesKeys,
  useVenuesQuery,
  useVenueDetailQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useDeleteVenueMutation,
  useCreateVenueProjectMutation,
  useDeleteVenueProjectMutation,
} from "./venues.queries";

export function useVenues() {
  const { token } = useAuth();

  // Queries
  const venuesQuery = useVenuesQuery();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const detailQuery = useVenueDetailQuery(selectedVenueId);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [venueFormOpen, setVenueFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Mutations
  const createVenueMutation = useCreateVenueMutation();
  const updateVenueMutation = useUpdateVenueMutation();
  const deleteVenueMutation = useDeleteVenueMutation();
  const createProjectMutation = useCreateVenueProjectMutation();
  const deleteProjectMutation = useDeleteVenueProjectMutation();

  const venues = useMemo(() => venuesQuery.data ?? [], [venuesQuery.data]);
  const status: "loading" | "ready" | "error" = venuesQuery.isLoading
    ? "loading"
    : venuesQuery.isError
      ? "error"
      : "ready";

  const selectedVenue = detailQuery.data ?? null;
  const detailLoading = detailQuery.isLoading;

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

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenueId(venue.id);
  };

  const handleVenueFormSubmit = async (payload: VenuePayload) => {
    if (!token) return;
    try {
      if (editingVenue) {
        await updateVenueMutation.mutateAsync({ id: editingVenue.id, payload });
      } else {
        await createVenueMutation.mutateAsync(payload);
      }
      setVenueFormOpen(false);
      setEditingVenue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được địa điểm.");
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    if (!token) return;
    try {
      await deleteVenueMutation.mutateAsync(venue.id);
      if (selectedVenueId === venue.id) {
        setSelectedVenueId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xoá được địa điểm.");
    }
  };

  const handleProjectFormSubmit = async (payload: ProjectPayload) => {
    if (!token || !selectedVenueId) return;
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
        queryClient.invalidateQueries({ queryKey: venuesKeys.detail(selectedVenueId) });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      } else {
        await createProjectMutation.mutateAsync({ venueId: selectedVenueId, payload });
      }
      setProjectFormOpen(false);
      setEditingProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được dự án.");
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!token || !selectedVenueId) return;
    try {
      await deleteProjectMutation.mutateAsync({ projectId: project.id, venueId: selectedVenueId });
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
