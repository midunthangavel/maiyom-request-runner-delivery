import { CITY_COORDS } from "@/lib/constants";

interface GeoResult {
    lat: number;
    lng: number;
}

/**
 * Geocode an address using OpenStreetMap Nominatim (free, no API key).
 * Falls back to CITY_COORDS lookup if the API call fails.
 */
export async function geocodeAddress(address: string): Promise<GeoResult | null> {
    if (!address || address.trim().length === 0) return null;

    // 1. Try Nominatim API
    try {
        const query = encodeURIComponent(address.trim() + ", India");
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
            {
                headers: {
                    "Accept": "application/json",
                    // Nominatim requires a User-Agent
                    "User-Agent": "MaiyomMissions/1.0",
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                };
            }
        }
    } catch (error) {
        console.warn("Nominatim geocoding failed, falling back to local lookup:", error);
    }

    // 2. Fallback: local CITY_COORDS lookup
    const foundCity = Object.keys(CITY_COORDS).find((c) =>
        address.toLowerCase().includes(c.toLowerCase())
    );

    if (foundCity) {
        const [baseLat, baseLng] = CITY_COORDS[foundCity];
        // Add small random offset to avoid stacking markers
        return {
            lat: baseLat + (Math.random() - 0.5) * 0.02,
            lng: baseLng + (Math.random() - 0.5) * 0.02,
        };
    }

    return null;
}
