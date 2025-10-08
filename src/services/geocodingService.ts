/**
 * Geocoding Service using Google Maps Geocoding API
 * Handles address to coordinates conversion and distance calculations
 */

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Convert address string to coordinates using Google Geocoding API
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address || !GOOGLE_MAPS_API_KEY) {
    console.warn('Missing address or API key for geocoding');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        formattedAddress: result.formatted_address,
      };
    } else {
      console.warn('Geocoding failed:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance); // Return rounded distance in km
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Filter organizations by distance from user address
 */
export const filterByDistance = async (
  organizations: Array<{ address?: string; [key: string]: any }>,
  userAddress: string,
  maxDistanceKm: number
): Promise<Array<{ organization: any; distance: number }>> => {
  // Geocode user address
  const userGeocode = await geocodeAddress(userAddress);
  if (!userGeocode) {
    return [];
  }

  // Geocode all organization addresses and calculate distances
  const organizationsWithDistance = await Promise.all(
    organizations.map(async (org) => {
      if (!org.address) {
        return null;
      }

      const orgGeocode = await geocodeAddress(org.address);
      if (!orgGeocode) {
        return null;
      }

      const distance = calculateDistance(userGeocode.coordinates, orgGeocode.coordinates);
      
      if (distance <= maxDistanceKm) {
        return {
          organization: org,
          distance,
        };
      }
      
      return null;
    })
  );

  // Filter out nulls and sort by distance
  return organizationsWithDistance
    .filter((item): item is { organization: any; distance: number } => item !== null)
    .sort((a, b) => a.distance - b.distance);
};
