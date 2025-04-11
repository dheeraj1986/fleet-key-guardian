
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
