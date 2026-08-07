import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Venue, VenueDetail } from "../../lib/types";
import { api } from "../../lib/api";
import { VenuePopupCard } from "./VenuePopupCard";
import styles from "./ProjectMap.module.scss";

interface ProjectMapProps {
  venues: Venue[];
  className?: string;
}

// Accent-colored teardrop pin, drawn once and reused for every marker — same
// palette as the rest of the site instead of Leaflet's default blue pin.
const PIN_SVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.6 26.4 0 17 0z" fill="#A15C2E"/>
    <circle cx="17" cy="17" r="7" fill="#FBF7F1"/>
  </svg>
`);

// Same pin, larger + plum-colored, for whichever venue's popup is open.
const PIN_SVG_ACTIVE = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 34 44">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.6 26.4 0 17 0z" fill="#3B141F"/>
    <circle cx="17" cy="17" r="7" fill="#FBF7F1"/>
  </svg>
`);

const icon = L.icon({ iconUrl: `data:image/svg+xml,${PIN_SVG}`, iconSize: [34, 44], iconAnchor: [17, 44] });
const activeIcon = L.icon({
  iconUrl: `data:image/svg+xml,${PIN_SVG_ACTIVE}`,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
});

const DEFAULT_CENTER: [number, number] = [16.0544, 108.2022]; // Đà Nẵng

interface ActivePopup {
  venueId: string;
  container: HTMLDivElement;
  detail: VenueDetail | null;
  loading: boolean;
}

/**
 * OpenStreetMap tiles via Leaflet, one pin per venue. Clicking a pin opens a
 * small popup anchored right at that marker (Leaflet positions/auto-pans it
 * for us) showing a few real projects done there — the trust-building
 * moment from Mục 3 of the mapping spec, sized to sit next to the pin
 * instead of taking over the map.
 */
export function ProjectMap({ venues, className = "" }: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);
  const activeVenueIdRef = useRef<string | null>(null);
  activeVenueIdRef.current = activePopup?.venueId ?? null;

  function openPopupFor(venue: Venue, marker: L.Marker, map: L.Map) {
    map.closePopup();
    const container = document.createElement("div");
    setActivePopup({ venueId: venue.id, container, detail: null, loading: true });

    L.popup({ maxWidth: 280, minWidth: 240, className: styles.popup, autoPanPadding: [24, 24] })
      .setLatLng(marker.getLatLng())
      .setContent(container)
      .openOn(map);

    api
      .getVenue(venue.id)
      .then((detail) => {
        setActivePopup((prev) => (prev?.venueId === venue.id ? { ...prev, detail, loading: false } : prev));
      })
      .catch(() => {
        setActivePopup((prev) =>
          prev?.venueId === venue.id ? { ...prev, detail: { ...venue, projects: [] }, loading: false } : prev
        );
      });
  }

  // Mount the map + markers once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = venues[0] ? [venues[0].lat, venues[0].lng] : DEFAULT_CENTER;
    const map = L.map(containerRef.current, { center, zoom: venues.length > 1 ? 12 : 14, zoomControl: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on("popupclose", () => setActivePopup(null));

    const points: L.LatLngExpression[] = [];
    venues.forEach((venue) => {
      const marker = L.marker([venue.lat, venue.lng], { icon }).addTo(map);
      marker.on("click", () => openPopupFor(venue, marker, map));
      markersRef.current.set(venue.id, marker);
      points.push([venue.lat, venue.lng]);
    });

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues]);

  // Re-skin the active marker whenever the open popup's venue changes.
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const active = id === activePopup?.venueId;
      marker.setIcon(active ? activeIcon : icon);
      marker.setZIndexOffset(active ? 999 : 0);
    });
  }, [activePopup?.venueId]);

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div ref={containerRef} className={styles.canvas} />
      {activePopup &&
        createPortal(
          <VenuePopupCard venue={activePopup.detail} loading={activePopup.loading} />,
          activePopup.container
        )}
    </div>
  );
}
