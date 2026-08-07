import { FormEvent, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import type { Venue, VenuePayload, VenueType } from "../../lib/types";
import styles from "./VenueForm.module.scss";

const venueTypes: { value: VenueType; label: string }[] = [
  { value: "hotel", label: "Khách sạn" },
  { value: "restaurant", label: "Nhà hàng" },
  { value: "resort", label: "Resort" },
  { value: "sảnh tiệc", label: "Sảnh tiệc" },
];

const DEFAULT_CENTER: [number, number] = [16.0544, 108.2022]; // Đà Nẵng

const PIN_SVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 34 44">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.6 26.4 0 17 0z" fill="#A15C2E"/>
    <circle cx="17" cy="17" r="7" fill="#FBF7F1"/>
  </svg>
`);
const previewIcon = L.icon({ iconUrl: `data:image/svg+xml,${PIN_SVG}`, iconSize: [30, 40], iconAnchor: [15, 40] });

interface VenueFormProps {
  venue: Venue | null; // null = create mode
  onCancel: () => void;
  onSubmit: (payload: VenuePayload) => Promise<void>;
}

/**
 * Add/edit venue. lat/lng are still typed by hand — geocoding is a later
 * milestone (M1 of PiDecor_MappingProject.md) — so §7's risk note applies:
 * a small live preview map here is the "xem trước trên bản đồ nhỏ" check
 * so a typo doesn't silently put a pin in the wrong city.
 */
export function VenueForm({ venue, onCancel, onSubmit }: VenueFormProps) {
  const [name, setName] = useState(venue?.name ?? "");
  const [type, setType] = useState<VenueType>(venue?.type ?? "hotel");
  const [address, setAddress] = useState(venue?.address ?? "");
  const [city, setCity] = useState(venue?.city ?? "");
  const [lat, setLat] = useState(venue ? String(venue.lat) : "");
  const [lng, setLng] = useState(venue ? String(venue.lng) : "");
  const [coverImage, setCoverImage] = useState(venue?.cover_image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const hasValidCoords = lat !== "" && lng !== "" && !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng);

  // Mount the preview map once.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const initialCenter: [number, number] = hasValidCoords ? [parsedLat, parsedLng] : DEFAULT_CENTER;
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: hasValidCoords ? 14 : 11,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    // Clicking the preview is a quicker way to set coordinates than typing.
    map.on("click", (e: L.LeafletMouseEvent) => {
      setLat(e.latlng.lat.toFixed(6));
      setLng(e.latlng.lng.toFixed(6));
    });

    mapRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker + view in sync with typed lat/lng.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasValidCoords) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const position: [number, number] = [parsedLat, parsedLng];
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: previewIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng(position);
    }
    map.setView(position, Math.max(map.getZoom(), 13));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCoords, parsedLat, parsedLng]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !hasValidCoords) {
      setError("Vui lòng nhập tên và toạ độ hợp lệ (có thể bấm vào bản đồ để lấy toạ độ).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        address: address.trim() || null,
        city: city.trim() || null,
        lat: parsedLat,
        lng: parsedLng,
        cover_image: coverImage.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{venue ? "Sửa địa điểm" : "Thêm địa điểm"}</h2>
          <button type="button" className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Tên địa điểm *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} />
          </label>

          <label className={styles.field}>
            <span>Loại</span>
            <select value={type} onChange={(e) => setType(e.target.value as VenueType)} className={styles.input}>
              {venueTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Địa chỉ</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={styles.input} />
          </label>

          <label className={styles.field}>
            <span>Thành phố</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={styles.input} />
          </label>

          <div className={styles.coordsRow}>
            <label className={styles.field}>
              <span>Vĩ độ (lat) *</span>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                required
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              <span>Kinh độ (lng) *</span>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
                required
                className={styles.input}
              />
            </label>
          </div>

          <p className={styles.hint}>Bấm vào bản đồ bên dưới để lấy toạ độ nhanh, hoặc nhập tay hai ô trên.</p>
          <div ref={mapContainerRef} className={styles.mapPreview} />

          <label className={styles.field}>
            <span>Ảnh bìa (URL)</span>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={styles.input} />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Huỷ
            </button>
            <button type="submit" disabled={submitting} className={styles.submitButton}>
              {submitting ? "Đang lưu…" : "Lưu địa điểm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
