import { useState, useEffect, useCallback } from "react";
import { api } from "../../../lib/api";
import type { Venue, VenueDetail } from "../../../lib/types";

export function useMap(selectedVenueIdFromUrl?: string | null) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(
    selectedVenueIdFromUrl ?? null
  );
  const [selectedVenue, setSelectedVenue] = useState<VenueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadVenues = useCallback(() => {
    setStatus("loading");
    return api
      .getVenues()
      .then((data) => {
        setVenues(data);
        setStatus(data.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    if (!selectedVenueId) {
      setSelectedVenue(null);
      return;
    }
    setDetailLoading(true);
    api
      .getVenue(selectedVenueId)
      .then((data) => setSelectedVenue(data))
      .catch((err) => {
        console.error("Could not fetch venue details:", err);
        setSelectedVenue(null);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedVenueId]);

  return {
    venues,
    status,
    selectedVenueId,
    setSelectedVenueId,
    selectedVenue,
    detailLoading,
    loadVenues,
  };
}
