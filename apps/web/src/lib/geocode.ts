/**
 * Xử lý bóc tách toạ độ và tra cứu địa chỉ địa lý (Geocoding)
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Trích xuất toạ độ lat/lng từ chuỗi toạ độ trực tiếp hoặc các định dạng liên kết Google Maps.
 */
export function extractCoordsFromUrl(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  const trimmed = input.trim();

  const directMatch = trimmed.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  const queryMatch = trimmed.match(/[?&](?:q|ll|query|center)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  const placeMatch = trimmed.match(/place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeMatch) {
    const lat = parseFloat(placeMatch[1]);
    const lng = parseFloat(placeMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

/**
 * Tra cứu toạ độ từ chuỗi địa chỉ qua OpenStreetMap Nominatim.
 * Sử dụng AbortController với timeout 8s để tránh treo request trên mạng yếu.
 */
export async function geocodeAddress(
  query: string,
  timeoutMs = 8000
): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ", Việt Nam")}`;
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      return null;
    }

    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const lat = parseFloat(first.lat);
      const lng = parseFloat(first.lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          lat,
          lng,
          displayName: first.display_name || "",
        };
      }
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
