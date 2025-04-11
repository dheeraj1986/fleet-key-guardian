
import { Car, CarKey, KeyStatus, DashboardStats } from "@/types";

const BASE_URL = "https://dev.everestfleet.com";
const API_TOKEN = "7768c7f4c38e5cf8105bffd663cae9e29e510b1b";

// Helper function for making API requests
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${API_TOKEN}`,
      ...options.headers,
    },
  };

  console.log(`Making API request to: ${BASE_URL}/${endpoint}`);
  
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  console.log(`API response status: ${response.status}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("API response data:", data);
  return data;
};

// Search cars by registration or model
export const searchCars = async (query: string) => {
  return fetchApi(`car_key/key-details?search=${encodeURIComponent(query)}`);
};

// Get cars by location and key status
export const getCarsByLocationAndStatus = async (locationId: string, status: KeyStatus) => {
  return fetchApi(`car_key/key-details?loc_id=${locationId}&key_status=${status}`);
};

// Get car details with key information
export const getCarDetails = async (carId: string) => {
  return fetchApi(`car_key/key-details?car_id=${carId}`);
};

// Get key list for a specific car
export const getKeyList = async (carId: string) => {
  return fetchApi(`car_key/keys?car_id=${carId}`);
};

// Get key details
export const getKeyDetails = async (keyId: string) => {
  return fetchApi(`car_key/keys/${keyId}`);
};

// Add new key
export const addNewKey = async (carId: string, keyNumber: string, keyPlace: string, remarks?: string) => {
  return fetchApi(`car_key/keys`, {
    method: 'POST',
    body: JSON.stringify({
      car_id: carId,
      key_number: keyNumber,
      key_place: keyPlace,
      remarks: remarks || ""
    })
  });
};

// Change key status to available
export const markKeyAvailable = async (keyId: string, keyPlace: string, remarks?: string) => {
  return fetchApi(`car_key/keys/${keyId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: "AVAILABLE",
      key_place: keyPlace,
      remarks: remarks || "Key marked as available"
    })
  });
};

// Change key status to missing
export const markKeyMissing = async (keyId: string, remarks?: string) => {
  return fetchApi(`car_key/keys/${keyId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: "MISSING",
      remarks: remarks || "Key marked as missing"
    })
  });
};

// Change key status to issued
export const issueKey = async (keyId: string, driverId: string, purpose: string, remarks?: string) => {
  return fetchApi(`car_key/keys/${keyId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: "ISSUED",
      purpose: purpose,
      driver_id: driverId,
      remarks: remarks || "Key issued"
    })
  });
};

// Get key logs/history
export const getKeyLogs = async (keyId: string, page = 1, pageSize = 10) => {
  return fetchApi(`car_key/history/${keyId}?page=${page}&page_size=${pageSize}`);
};

// Get key statistics for a location
export const getKeyStatistics = async (locationId: string) => {
  return fetchApi(`car_key/statistics?loc_id=${locationId}`);
};

// Adapter functions to convert API response to our app types
export const adaptCarFromApi = (apiCar: any): Car => {
  console.log("Adapting car from API:", apiCar);
  return {
    id: apiCar.car_id?.toString() || apiCar.id?.toString() || "",
    regNumber: apiCar.registration_number || apiCar.reg_number || "",
    model: apiCar.model || "",
    keys: Array.isArray(apiCar.keys) 
      ? apiCar.keys.map(adaptKeyFromApi) 
      : [],
  };
};

export const adaptKeyFromApi = (apiKey: any): CarKey => {
  // Convert API status to our app status
  let status: KeyStatus;
  switch (apiKey.status?.toUpperCase()) {
    case "AVAILABLE":
      status = "available";
      break;
    case "ISSUED":
      status = "issued";
      break;
    case "MISSING":
      status = "missing";
      break;
    default:
      status = "available";
  }

  return {
    id: apiKey.key_id?.toString() || apiKey.id?.toString(),
    carId: apiKey.car_id?.toString() || "",
    keyNumber: Number(apiKey.key_number) || 0,
    status: status,
    location: status === "issued" ? "issued" : "inhouse",
    issuedTo: apiKey.driver_name || undefined,
    purpose: apiKey.purpose || undefined,
    transactions: Array.isArray(apiKey.history) 
      ? apiKey.history.map((h: any) => ({
          id: `t-${h.id || Date.now()}`,
          keyId: apiKey.key_id?.toString() || apiKey.id?.toString(),
          carId: apiKey.car_id?.toString() || "",
          type: h.action?.toLowerCase() || "add-new",
          timestamp: h.timestamp || new Date().toISOString(),
          issuedTo: h.driver_name,
          purpose: h.purpose,
          location: h.key_place,
          notes: h.remarks
        }))
      : []
  };
};

export const adaptStatsFromApi = (apiStats: any): DashboardStats => {
  return {
    totalCars: apiStats.total_cars || 0,
    totalKeys: apiStats.total_keys || 0,
    availableKeys: apiStats.available_keys || 0,
    issuedKeys: apiStats.issued_keys || 0,
    missingKeys: apiStats.missing_keys || 0,
    recoveredKeys: apiStats.recovered_keys || 0,
  };
};
