import { FormEvent, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import type { Venue, VenuePayload, VenueType } from "../../../lib/types";
import { Modal, Input, Select } from "../../../components/ui";
import { extractCoordsFromUrl, geocodeAddress } from "../../../lib/geocode";
import styles from "./VenueForm.module.scss";

export { extractCoordsFromUrl };

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
const previewIcon = L.icon({
  iconUrl: `data:image/svg+xml,${PIN_SVG}`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

interface VenueFormProps {
  venue: Venue | null;
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
  const hasValidCoords =
    lat !== "" && lng !== "" && !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng);

  const initialCenterRef = useRef<[number, number]>(
    hasValidCoords ? [parsedLat, parsedLng] : DEFAULT_CENTER
  );
  const initialZoomRef = useRef<number>(hasValidCoords ? 14 : 11);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      const newLat = e.latlng.lat.toFixed(6);
      const newLng = e.latlng.lng.toFixed(6);
      setLat(newLat);
      setLng(newLng);
      setGmapsSuccessMessage(`✓ Đã chọn vị trí từ bản đồ (${newLat}, ${newLng})`);
    });

    mapRef.current = map;
  }, []);

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
  }, [hasValidCoords, parsedLat, parsedLng]);

  const handleGmapsInputChange = (value: string) => {
    setGmapsInput(value);
    setGmapsSuccessMessage(null);

    const extracted = extractCoordsFromUrl(value);
    if (extracted) {
      setLat(extracted.lat.toFixed(6));
      setLng(extracted.lng.toFixed(6));
      setGmapsSuccessMessage(
        `✓ Đã tự động nhận diện toạ độ Google Maps (${extracted.lat.toFixed(4)}, ${extracted.lng.toFixed(4)})`
      );
    }
  };

  const handleSearchLocation = async () => {
    const query = gmapsInput.trim() || `${name} ${address} ${city}`.trim();
    if (!query) {
      setError("Vui lòng nhập tên địa điểm hoặc đường dẫn Google Maps để tìm kiếm!");
      return;
    }

    const extracted = extractCoordsFromUrl(query);
    if (extracted) {
      setLat(extracted.lat.toFixed(6));
      setLng(extracted.lng.toFixed(6));
      setGmapsSuccessMessage(
        `✓ Đã nhận diện toạ độ Google Maps (${extracted.lat.toFixed(4)}, ${extracted.lng.toFixed(4)})`
      );
      setError(null);
      return;
    }

    setSearchingLocation(true);
    setError(null);
    try {
      const result = await geocodeAddress(query);
      if (result) {
        setLat(result.lat.toFixed(6));
        setLng(result.lng.toFixed(6));
        setGmapsSuccessMessage(`✓ Đã tìm thấy vị trí "${result.displayName.slice(0, 45)}..."`);
      } else {
        setError(
          `Không tìm thấy toạ độ cho "${query}". Hãy dán link Google Maps chuẩn hoặc nhấp chọn trực tiếp trên bản đồ.`
        );
      }
    } catch {
      setError(
        "Không thể tra cứu vị trí tự động. Bạn có thể dán link Google Maps hoặc nhấp trên bản đồ bên dưới."
      );
    } finally {
      setSearchingLocation(false);
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !hasValidCoords) {
      setError(
        "Vui lòng nhập tên địa điểm và dán đường dẫn Google Maps (hoặc nhấp vị trí trên bản đồ)."
      );
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
    <Modal
      isOpen
      onClose={onCancel}
      title={venue ? "Sửa địa điểm tiệc" : "Thêm địa điểm tiệc mới"}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Tên địa điểm tiệc"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Khách sạn Furama Resort Đà Nẵng"
        />

        <Select
          label="Loại địa điểm"
          value={type}
          onChange={(e) => setType(e.target.value as VenueType)}
          options={venueTypes}
        />

        <div className={styles.coordsRow}>
          <Input
            label="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="VD: 105 Võ Nguyên Giáp"
          />

          <Input
            label="Thành phố"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="VD: Đà Nẵng"
          />
        </div>

        <div className={styles.gmapsField}>
          <div className={styles.gmapsHeader}>
            <MapPinIcon className="h-4 w-4 inline" style={{ width: 16, height: 16 }} /> Link Google
            Maps hoặc Tên vị trí *
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Input
              value={gmapsInput}
              onChange={(e) => handleGmapsInputChange(e.target.value)}
              placeholder="Dán link Google Maps (https://maps.google.com/...) hoặc nhập tên địa điểm"
              className={styles.gmapsInput}
            />
            <button
              type="button"
              onClick={handleSearchLocation}
              disabled={searchingLocation}
              className={styles.searchLocationBtn}
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
              {searchingLocation ? "Đang tìm..." : "Tìm vị trí"}
            </button>
          </div>
          <p className={styles.gmapsHint}>
            💡 Dán liên kết Google Maps từ trình duyệt/điện thoại, hoặc nhấp chọn trực tiếp điểm
            ghim trên bản đồ bên dưới.
          </p>

          {gmapsSuccessMessage && (
            <div className={styles.gmapsSuccess}>
              <CheckCircleIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />{" "}
              {gmapsSuccessMessage}
            </div>
          )}
        </div>

        <div ref={mapContainerRef} className={styles.mapPreview} />

        <div>
          <button
            type="button"
            onClick={() => setShowRawCoords(!showRawCoords)}
            className={styles.toggleCoordsBtn}
          >
            {showRawCoords ? (
              <ChevronUpIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
            ) : (
              <ChevronDownIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
            )}
            {showRawCoords ? "Ẩn tọa độ số (lat, lng)" : "Xem/Chỉnh sửa tọa độ số (lat, lng)"}
          </button>

          {showRawCoords && (
            <div className={styles.coordsRow} style={{ marginTop: "8px" }}>
              <Input
                label="Vĩ độ (lat)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
              />
              <Input
                label="Kinh độ (lng)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
              />
            </div>
          )}
        </div>

        <Input
          label="Ảnh bìa địa điểm (URL)"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://... hoặc đường dẫn ảnh bìa"
        />

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
    </Modal>
  );
}
