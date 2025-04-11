
// Define constants for API calls
const DEFAULT_CITY_ID = 2; // Updated to use city ID 2 as per provided curl commands
const API_BASE_URL = "https://api-dev.everestfleet.com";
const KEY_API_BASE_URL = "https://dev.everestfleet.com";
const AUTH_TOKEN = "7768c7f4c38e5cf8105bffd663cae9e29e510b1b";

// Helper function to make API calls
const fetchNewApi = async (endpoint: string) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  console.log(`Fetching: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${AUTH_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

// Helper function to make key API calls (different base URL)
const fetchKeyApi = async (endpoint: string) => {
  const url = `${KEY_API_BASE_URL}/${endpoint}`;
  console.log(`Fetching key API: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${AUTH_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Key API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

// Adapters for API responses
export const adaptCarFromApi = (car: any) => {
  return {
    id: car.id || car.car_id || '',
    regNumber: car.reg_number || car.registration_number || '',
    model: car.model || car.car_model || 'Unknown Model',
    keys: car.keys || []
  };
};

export const adaptStatsFromApi = (stats: any) => {
  return {
    total: stats.total || 0,
    available: stats.available || 0,
    issued: stats.issued || 0,
    missing: stats.missing || 0
  };
};

// Function to search for cars by registration number
export const searchCarByNumber = async (carNumber: string) => {
  console.log(`Searching for car with registration number: ${carNumber} in city ID: ${DEFAULT_CITY_ID}`);
  try {
    const trimmedQuery = carNumber.trim();
    if (trimmedQuery.length === 0) {
      return { data: [] };
    }
    
    // Step 1: Get car by registration number
    const endpoint = `jarvis_api/api/car/${DEFAULT_CITY_ID},${encodeURIComponent(trimmedQuery)}/`;
    const carResponse = await fetchNewApi(endpoint);
    console.log(`Step 1 parsed JSON results:`, JSON.stringify(carResponse));
    
    if (!carResponse || !carResponse.length) {
      console.log("No car found in Step 1");
      return { data: [] };
    }
    
    // Step 2: Get key details for the car
    const carId = carResponse[0]?.id;
    if (!carId) {
      console.log("No car ID found in response");
      return { data: [] };
    }
    
    console.log(`Found car ID: ${carId}, fetching key details`);
    const keyEndpoint = `car_key/key-details?car_id=${carId}`;
    const keyResponse = await fetchKeyApi(keyEndpoint);
    console.log(`Key details for car ID ${carId}:`, JSON.stringify(keyResponse));
    
    // Combine car and key data
    const carWithKeys = {
      ...carResponse[0],
      keys: keyResponse?.data || []
    };
    
    return { data: [carWithKeys] };
  } catch (error) {
    console.error("Car search error:", error);
    throw error;
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
    
    const endpoint = `jarvis_api/api/driver/${DEFAULT_CITY_ID},${encodeURIComponent(trimmedQuery)}/`;
    const data = await fetchNewApi(endpoint);
    console.log("Driver search results:", data);
    
    return data;
  } catch (error) {
    console.error("Driver search error:", error);
    throw error;
  }
};

// Additional functions needed by KeyManagementContext
export const searchCars = async () => {
  // Implementation would fetch all cars
  return { data: [] };
};

export const getKeyStatistics = async () => {
  // Implementation would fetch key statistics
  return { data: {} };
};

export const issueKey = async (keyId: string, driverId: string) => {
  // Implementation would issue a key
  return { success: true };
};

export const markKeyAvailable = async (keyId: string) => {
  // Implementation would mark key as available
  return { success: true };
};

export const markKeyMissing = async (keyId: string) => {
  // Implementation would mark key as missing
  return { success: true };
};

export const addNewKey = async (carId: string, keyData: any) => {
  // Implementation would add a new key
  return { success: true };
};
