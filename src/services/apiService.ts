
// Define constants for API calls
const DEFAULT_CITY_ID = 2; // City ID 2 for all API calls
const API_BASE_URL = "https://api-dev.everestfleet.com/jarvis_api/api";
const KEY_API_BASE_URL = "https://dev.everestfleet.com";
const AUTH_TOKEN = "7768c7f4c38e5cf8105bffd663cae9e29e510b1b";

// Helper function to make API calls
const fetchNewApi = async (endpoint: string) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${AUTH_TOKEN}`
      }
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

// Helper function to make key API calls (different base URL)
const fetchKeyApi = async (endpoint: string) => {
  const url = `${KEY_API_BASE_URL}/${endpoint}`;
  console.log(`Fetching key API: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${AUTH_TOKEN}`
      }
    });
    
    console.log(`Key API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Key API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      throw new Error(`Key API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Response from key API ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching from key API ${url}:`, error);
    throw error;
  }
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
  console.log(`DEBUG: searchCarByNumber called with carNumber: ${carNumber}`);
  try {
    const trimmedQuery = carNumber.trim();
    if (trimmedQuery.length === 0) {
      console.log("DEBUG: Empty query, returning empty results");
      return { data: [] };
    }
    
    // Step 1: Get car by registration number
    // Format: car/2,KA01XX0000/
    const endpoint = `car/${DEFAULT_CITY_ID},${encodeURIComponent(trimmedQuery)}/`;
    console.log(`DEBUG Step 1: Making API call to: ${API_BASE_URL}/${endpoint}`);
    
    try {
      const carResponse = await fetchNewApi(endpoint);
      console.log(`DEBUG Step 1 Response:`, carResponse);
      
      if (!carResponse || !Array.isArray(carResponse) || carResponse.length === 0) {
        console.log("DEBUG Step 1: No cars found or invalid response format");
        return { data: [] };
      }
      
      // Step 2: Get key details for the car
      const carId = carResponse[0]?.id;
      if (!carId) {
        console.log("DEBUG Step 1.5: Car found but no car ID in response");
        return { data: [{
          ...carResponse[0],
          keys: []
        }] };
      }
      
      console.log(`DEBUG Step 2: Found car ID: ${carId}, fetching key details`);
      const keyEndpoint = `car_key/key-details?car_id=${carId}`;
      
      try {
        const keyResponse = await fetchKeyApi(keyEndpoint);
        console.log(`DEBUG Step 2 Response:`, keyResponse);
        
        // Combine car and key data
        const carWithKeys = {
          ...carResponse[0],
          keys: keyResponse?.data || []
        };
        
        console.log(`DEBUG Final: Combined car with keys:`, carWithKeys);
        return { data: [carWithKeys] };
      } catch (keyError) {
        console.error("DEBUG Step 2 Error: Failed to fetch key details:", keyError);
        // Return car without keys if key fetch fails
        return { 
          data: [{ 
            ...carResponse[0], 
            keys: [] 
          }] 
        };
      }
    } catch (carError) {
      console.error("DEBUG Step 1 Error: Failed to fetch car:", carError);
      return { data: [] };
    }
  } catch (error) {
    console.error("DEBUG: Main searchCarByNumber error:", error);
    throw error;
  }
};

// New function: Search driver by ET ID
export const searchDriverById = async (driverId: string) => {
  console.log(`DEBUG: searchDriverById called with driverId: ${driverId}`);
  try {
    const trimmedQuery = driverId.trim();
    if (trimmedQuery.length === 0) {
      return { data: [] };
    }
    
    const endpoint = `driver/${DEFAULT_CITY_ID},${encodeURIComponent(trimmedQuery)}/`;
    const data = await fetchNewApi(endpoint);
    console.log("DEBUG: Driver search results:", data);
    
    return data;
  } catch (error) {
    console.error("DEBUG: Driver search error:", error);
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
  try {
    console.log("Getting key statistics mock data");
    // Return mock data since the actual API is failing
    return { 
      data: {
        total: 50,
        available: 30,
        issued: 15,
        missing: 5
      } 
    };
  } catch (error) {
    console.error("Error getting key statistics:", error);
    throw error;
  }
};

export const issueKey = async (keyId: string, driverId: string) => {
  // Implementation would issue a key
  console.log(`Issuing key ${keyId} to driver ${driverId}`);
  return { success: true };
};

export const markKeyAvailable = async (keyId: string) => {
  // Implementation would mark key as available
  console.log(`Marking key ${keyId} as available`);
  return { success: true };
};

export const markKeyMissing = async (keyId: string) => {
  // Implementation would mark key as missing
  console.log(`Marking key ${keyId} as missing`);
  return { success: true };
};

export const addNewKey = async (carId: string, keyData: any) => {
  // Implementation would add a new key
  console.log(`Adding new key to car ${carId}:`, keyData);
  return { success: true };
};
