import { FormEvent, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Search, MapPin, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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

/**
 * Utility function to extract latitude & longitude from Google Maps URLs or direct coordinates
 */
export function extractCoordsFromUrl(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern 1: Direct lat, lng format like "16.0544, 108.2022" or "16.0544,108.2022"
  const directMatch = trimmed.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Pattern 2: Google Maps @lat,lng format e.g. /@16.054400,108.202200,17z
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Pattern 3: Query string q=lat,lng or ll=lat,lng or query=lat,lng or center=lat,lng
  const queryMatch = trimmed.match(/[?&](?:q|ll|query|center)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Pattern 4: Place URL /place/.../lat,lng or /place/lat,lng
  const placeMatch = trimmed.match(/place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeMatch) {
    const lat = parseFloat(placeMatch[1]);
    const lng = parseFloat(placeMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

interface VenueFormProps {
  venue: Venue | null; // null = create mode
  onCancel: () => void;
  onSubmit: (payload: VenuePayload) => Promise<void>;
}

export function VenueForm({ venue, onCancel, onSubmit }: VenueFormProps) {
  const [name, setName] = useState(venue?.name ?? "");
  const [type, setType] = useState<VenueType>(venue?.type ?? "hotel");
  const [address, setAddress] = useState(venue?.address ?? "");
  const [city, setCity] = useState(venue?.city ?? "");
  const [lat, setLat] = useState(venue ? String(venue.lat) : "");
  const [lng, setLng] = useState(venue ? String(venue.lng) : "");
  const [gmapsInput, setGmapsInput] = useState(
    venue ? `https://www.google.com/maps/@${venue.lat},${venue.lng},16z` : ""
  );

  const [coverImage, setCoverImage] = useState(venue?.cover_image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [gmapsSuccessMessage, setGmapsSuccessMessage] = useState<string | null>(null);
  const [showRawCoords, setShowRawCoords] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const hasValidCoords = lat !== "" && lng !== "" && !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng);

  // Mount the preview map once
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

    // Clicking the preview sets position immediately
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newLat = e.latlng.lat.toFixed(6);
      const newLng = e.latlng.lng.toFixed(6);
      setLat(newLat);
      setLng(newLng);
      setGmapsSuccessMessage(`✓ Đã chọn vị trí từ bản đồ (${newLat}, ${newLng})`);
    });

    mapRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker + view in sync with parsed coords
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

  // Handle Google Maps input change or paste
  const handleGmapsInputChange = (value: string) => {
    setGmapsInput(value);
    setGmapsSuccessMessage(null);

    const extracted = extractCoordsFromUrl(value);
    if (extracted) {
      setLat(extracted.lat.toFixed(6));
      setLng(extracted.lng.toFixed(6));
      setGmapsSuccessMessage(`✓ Đã tự động nhận diện toạ độ Google Maps (${extracted.lat.toFixed(4)}, ${extracted.lng.toFixed(4)})`);
    }
  };

  // Search location using Geocoding API if admin types an address or place name
  const handleSearchLocation = async () => {
    const query = gmapsInput.trim() || `${name} ${address} ${city}`.trim();
    if (!query) {
      setError("Vui lòng nhập tên địa điểm hoặc đường dẫn Google Maps để tìm kiếm!");
      return;
    }

    // Check if input is a Google Maps link or direct coords first
    const extracted = extractCoordsFromUrl(query);
    if (extracted) {
      setLat(extracted.lat.toFixed(6));
      setLng(extracted.lng.toFixed(6));
      setGmapsSuccessMessage(`✓ Đã nhận diện toạ độ Google Maps (${extracted.lat.toFixed(4)}, ${extracted.lng.toFixed(4)})`);
      setError(null);
      return;
    }

    // Otherwise search via Nominatim Geocoding API
    setSearchingLocation(true);
    setError(null);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Việt Nam")}`
      );
      const data = await resp.json();
      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        setLat(foundLat.toFixed(6));
        setLng(foundLng.toFixed(6));
        setGmapsSuccessMessage(`✓ Đã tìm thấy vị trí "${data[0].display_name.slice(0, 45)}..."`);
      } else {
        setError(`Không tìm thấy toạ độ cho "${query}". Hãy dán link Google Maps chuẩn hoặc nhấp chọn trực tiếp trên bản đồ.`);
      }
    } catch (err) {
      setError("Không thể tra cứu vị trí tự động. Bạn có thể dán link Google Maps hoặc nhấp trên bản đồ bên dưới.");
    } finally {
      setSearchingLocation(false);
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !hasValidCoords) {
      setError("Vui lòng nhập tên địa điểm và dán đường dẫn Google Maps (hoặc nhấp vị trí trên bản đồ).");
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
          <h2 className={styles.title}>{venue ? "Sửa địa điểm tiệc" : "Thêm địa điểm tiệc mới"}</h2>
          <button type="button" className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Tên địa điểm tiệc *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Khách sạn Furama Resort Đà Nẵng"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span>Loại địa điểm</span>
            <select value={type} onChange={(e) => setType(e.target.value as VenueType)} className={styles.input}>
              {venueTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className={styles.field}>
              <span>Địa chỉ</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: 105 Võ Nguyên Giáp"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span>Thành phố</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="VD: Đà Nẵng"
                className={styles.input}
              />
            </label>
          </div>

          {/* Google Maps Link / Search Section */}
          <div className={styles.field}>
            <span style={{ fontWeight: '600', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={15} /> Link Google Maps hoặc Tên vị trí *
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={gmapsInput}
                onChange={(e) => handleGmapsInputChange(e.target.value)}
                placeholder="Dán link Google Maps (https://maps.google.com/...) hoặc nhập tên địa điểm"
                className={styles.input}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={searchingLocation}
                style={{
                  padding: '0 14px',
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Search size={14} />
                {searchingLocation ? 'Đang tìm...' : 'Tìm vị trí'}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              💡 Dán liên kết Google Maps từ trình duyệt/điện thoại, hoặc nhấp chọn trực tiếp điểm ghim trên bản đồ bên dưới.
            </p>

            {gmapsSuccessMessage && (
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                <CheckCircle2 size={14} /> {gmapsSuccessMessage}
              </div>
            )}
          </div>

          {/* Interactive Map Preview */}
          <div ref={mapContainerRef} className={styles.mapPreview} />

          {/* Optional Raw Coordinates Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowRawCoords(!showRawCoords)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              {showRawCoords ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showRawCoords ? 'Ẩn tọa độ số (lat, lng)' : 'Xem/Chỉnh sửa tọa độ số (lat, lng)'}
            </button>

            {showRawCoords && (
              <div className={styles.coordsRow} style={{ marginTop: '8px' }}>
                <label className={styles.field}>
                  <span>Vĩ độ (lat)</span>
                  <input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    inputMode="decimal"
                    className={styles.input}
                  />
                </label>
                <label className={styles.field}>
                  <span>Kinh độ (lng)</span>
                  <input
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    inputMode="decimal"
                    className={styles.input}
                  />
                </label>
              </div>
            )}
          </div>

          <label className={styles.field}>
            <span>Ảnh bìa địa điểm (URL)</span>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... hoặc đường dẫn ảnh bìa"
              className={styles.input}
            />
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
