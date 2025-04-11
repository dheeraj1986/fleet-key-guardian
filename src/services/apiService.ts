import { Car, CarKey, KeyStatus, DashboardStats } from "@/types";
import { toast } from "@/components/ui/use-toast";

const BASE_URL = "https://dev.everestfleet.com";
const API_DEV_URL = "https://api-dev.everestfleet.com";
const API_TOKEN = "7768c7f4c38e5cf8105bffd663cae9e29e510b1b";
const DEFAULT_CITY_ID = "6"; // Updated from 2 to 6 as requested

// Helper function for making API requests with improved error handling and CORS support
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${API_TOKEN}`,
      ...options.headers,
    },
    // Add mode: 'cors' to handle CORS
    mode: 'cors',
    // Add credentials setting to include cookies if needed
    credentials: 'include',
  };

  const url = `${BASE_URL}/${endpoint}`;
  console.log(`Making API request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response data:", data);
    return data;
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for making requests to the new API endpoint
const fetchNewApi = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${API_TOKEN}`,
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'include',
  };

  const url = `${API_DEV_URL}/${endpoint}`;
  console.log(`Making API request to new API: ${url}`);
  
  try {
    console.log('API Request Options:', {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    console.log(`New API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`New API error response: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("New API response data:", data);
    return data;
  } catch (error) {
    console.error(`New API error for ${endpoint}:`, error);
    throw error;
  }
};

// Search cars by registration or model
export const searchCars = async (query: string) => {
  console.log(`Searching for car with query: ${query}`);
  try {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return { data: [] };
    }
    
    const data = await fetchApi(`car_key/key-details?search=${encodeURIComponent(trimmedQuery)}`);
    console.log("Search results:", data);
    
    // Ensure we return an empty array if no data is found
    return data?.data ? data : { data: [] };
  } catch (error) {
    console.error("Search error:", error);
    // Return empty array on error to prevent UI crashes
    return { data: [] };
  }
};

// New function: Search car by number using the two-step process
export const searchCarByNumber = async (carNumber: string) => {
  console.log(`Starting two-step search process for car number: ${carNumber}`);
  
  // Special test case for KA53AL9351
  if (carNumber === "KA53AL9351") {
    console.log("DETECTED TEST CASE: KA53AL9351 - Will log detailed API responses");
  }
  
  try {
    const trimmedQuery = carNumber.trim();
    if (trimmedQuery.length === 0) {
      return { data: [] };
    }
    
    // Step 1: First API call to get car_id
    console.log(`Step 1: Searching for car with number: ${carNumber} in city ID: ${DEFAULT_CITY_ID}`);
    const endpoint = `jarvis_api/api/car/${DEFAULT_CITY_ID},${encodeURIComponent(trimmedQuery)}/`;
    
    // Make a direct fetch request to avoid any middleware issues
    const url = `${API_DEV_URL}/${endpoint}`;
    console.log(`Step 1 URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
      mode: 'cors',
      credentials: 'include',
    });
    
    console.log(`Step 1 response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Step 1 API error response text: ${errorText}`);
      throw new Error(`Step 1 API error: ${response.status} ${response.statusText}`);
    }
    
    const carData = await response.json();
    console.log("Step 1 results:", carData);
    
    if (!carData || !carData.data || carData.data.length === 0) {
      console.log("No cars found in Step 1");
      return { data: [] };
    }
    
    // Extract car_id from first API response
    const carIds = carData.data.map((car: any) => car.id).filter(Boolean);
    console.log("Extracted car IDs:", carIds);
    
    if (carIds.length === 0) {
      console.log("No valid car IDs found");
      return { data: [] };
    }
    
    // Step 2: For each car_id, fetch detailed car information with keys
    console.log("Step 2: Fetching key details for cars");
    const carsWithKeys = await Promise.all(
      carIds.map(async (carId: string | number) => {
        console.log(`Fetching key details for car ID: ${carId}`);
        try {
          const detailsUrl = `${BASE_URL}/car_key/key-details?car_id=${carId}`;
          console.log(`Step 2 URL: ${detailsUrl}`);
          
          const detailsResponse = await fetch(detailsUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${API_TOKEN}`,
            },
            mode: 'cors',
            credentials: 'include',
          });
          
          if (!detailsResponse.ok) {
            console.error(`Failed to fetch details for car ID ${carId}: ${detailsResponse.status}`);
            return null;
          }
          
          const detailsData = await detailsResponse.json();
          console.log(`Key details for car ID ${carId}:`, detailsData);
          return detailsData;
        } catch (error) {
          console.error(`Error fetching details for car ID ${carId}:`, error);
          return null;
        }
      })
    );
    
    // Filter out nulls and flatten the results
    const validCarsData = carsWithKeys
      .filter(Boolean)
      .flatMap(result => result?.data || []);
    
    console.log("Final combined search results:", validCarsData);
    
    // For test case - log the detailed structure of the result
    if (carNumber === "KA53AL9351") {
      console.log("TEST CASE RESULT STRUCTURE:", JSON.stringify(validCarsData, null, 2));
    }
    
    return { data: validCarsData };
    
  } catch (error) {
    console.error("Two-step car search error details:", error);
    // Return empty data instead of throwing to prevent UI crashes
    return { data: [] };
  }
};

// New function: Search driver by ET ID
export const searchDriverById = async (driverId: string) => {
  console.log(`Searching for driver with ET ID: ${driverId} in city ID: ${DEFAULT_CITY_ID}`);
  try {
    const trimmedQuery = driverId.trim();
    if (trimmedQuery.length === 0) {
      return { data: [] };
    }
    
    const data = await fetchNewApi(`jarvis_api/api/driver/${DEFAULT_CITY_ID},${encodeURIComponent(trimmedQuery)}/`);
    console.log("Driver search results:", data);
    
    return data;
  } catch (error) {
    console.error("Driver search error:", error);
    throw error; // Let the calling component handle the error
  }
};

// Get cars by location and key status
export const getCarsByLocationAndStatus = async (locationId: string, status: KeyStatus) => {
  try {
    return fetchApi(`car_key/key-details?loc_id=${locationId}&key_status=${status}`);
  } catch (error) {
    console.error("Error getting cars by location and status:", error);
    return { data: [] };
  }
};

// Get car details with key information
export const getCarDetails = async (carId: string) => {
  try {
    return fetchApi(`car_key/key-details?car_id=${carId}`);
  } catch (error) {
    console.error("Error getting car details:", error);
    return { data: [] };
  }
};

// Get key list for a specific car
export const getKeyList = async (carId: string) => {
  try {
    return fetchApi(`car_key/keys?car_id=${carId}`);
  } catch (error) {
    console.error("Error getting key list:", error);
    return { data: [] };
  }
};

// Get key details
export const getKeyDetails = async (keyId: string) => {
  try {
    return fetchApi(`car_key/keys/${keyId}`);
  } catch (error) {
    console.error("Error getting key details:", error);
    return null;
  }
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
  try {
    return fetchApi(`car_key/history/${keyId}?page=${page}&page_size=${pageSize}`);
  } catch (error) {
    console.error("Error getting key logs:", error);
    return { data: [] };
  }
};

// Get key statistics for a location
export const getKeyStatistics = async (locationId: string) => {
  try {
    console.log(`Fetching key statistics for location ID: ${locationId}`);
    const data = await fetchApi(`car_key/statistics?loc_id=${locationId}`);
    console.log("Key statistics data:", data);
    return data;
  } catch (error) {
    console.error("Error getting key statistics:", error);
    return {
      data: {
        total_cars: 0,
        total_keys: 0,
        available_keys: 0,
        issued_keys: 0,
        missing_keys: 0,
        recovered_keys: 0
      }
    };
  }
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
