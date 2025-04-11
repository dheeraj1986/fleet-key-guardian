import React, { useState, useEffect } from "react";
import { useKeyManagement } from "@/contexts/KeyManagementContext";
import CarCard from "@/components/CarCard";
import SearchBar from "@/components/SearchBar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { searchCarByNumber } from "@/services/apiService";
import { adaptCarFromApi } from "@/services/apiService";

// Define the Car interface to match what we'll get from the API
interface Car {
  id: string;
  regNumber: string;
  model: string;
  keys: any[];
}

const CarsList: React.FC<{ filter?: 'all' | 'missing-keys' | 'issued-keys' | 'recovered-keys' }> = ({ filter = 'all' }) => {
  const { getFilteredCars, isLoading: isContextLoading, isError: isContextError } = useKeyManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("regNumber");
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [apiStep1Response, setApiStep1Response] = useState<any>(null);
  const [apiStep2Response, setApiStep2Response] = useState<any>(null);
  
  const cars = getFilteredCars(filter);
  
  // Setup console log capture for debugging
  useEffect(() => {
    const captureConsoleLog = (event: any) => {
      const logData = event.detail.log;
      
      try {
        if (typeof logData === 'string') {
          // Capture Step 1 results
          if (logData.includes("Step 1 car search results:")) {
            try {
              const jsonStr = logData.substring(logData.indexOf('{'));
              setApiStep1Response(JSON.parse(jsonStr));
            } catch (e) {
              console.error("Failed to parse Step 1 response", e);
            }
          }
          
          // Capture Step 2 results
          if (logData.includes("Key details for car ID")) {
            try {
              const jsonStr = logData.substring(logData.indexOf('{'));
              setApiStep2Response(JSON.parse(jsonStr));
            } catch (e) {
              console.error("Failed to parse Step 2 response", e);
            }
          }
          
          // Capture full response details
          if (logData.includes("Response from")) {
            const endpointType = logData.includes("key API") ? "Key API" : "Car API";
            console.log(`Captured ${endpointType} response`);
          }
        }
      } catch (error) {
        console.error("Error processing console log:", error);
      }
    };

    // Add event listener for custom console log events
    window.addEventListener('consolelog', captureConsoleLog);
    
    // Original console.log capture
    const originalConsoleLog = console.log;
    console.log = function() {
      originalConsoleLog.apply(console, arguments);
      
      // Create a custom event to pass the console log data
      const event = new CustomEvent('consolelog', { 
        detail: { log: arguments[0] } 
      });
      window.dispatchEvent(event);
    };
    
    // Clean up
    return () => {
      window.removeEventListener('consolelog', captureConsoleLog);
      console.log = originalConsoleLog;
    };
  }, []);
  
  const getFilterTitle = () => {
    switch (filter) {
      case 'missing-keys': return "Cars with Missing Keys";
      case 'issued-keys': return "Cars with Issued Keys";
      case 'recovered-keys': return "Cars with Recovered Keys";
      default: return "All Cars";
    }
  };
  
  // Function to directly search the API using the two-step process
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      // If search is cleared, revert to filtered cars from context
      updateFilteredCars(cars, "", sortBy);
      setSearchResults([]);
      setApiStep1Response(null);
      setApiStep2Response(null);
      return;
    }
    
    setIsSearching(true);
    setSearchError(false);
    setApiStep1Response(null);
    setApiStep2Response(null);
    
    try {
      console.log(`Starting two-step search for car with number: ${query}`);
      
      // Using the updated searchCarByNumber function from apiService that implements the two-step process
      const result = await searchCarByNumber(query);
      console.log("Two-step search complete. Results:", JSON.stringify(result));
      
      // Save the raw search results for inspection
      setSearchResults(result.data || []);
      
      if (!result || !result.data || result.data.length === 0) {
        console.log("No cars found in search");
        setFilteredCars([]);
        toast({
          title: "Search Results",
          description: `No cars found matching "${query}"`,
        });
        return;
      }
      
      // Map the API response to our car format
      const carsFound = result.data.map((car: any) => adaptCarFromApi(car));
      
      console.log("Processed car results:", JSON.stringify(carsFound));
      setFilteredCars(carsFound);
      
      toast({
        title: "Search Results",
        description: `Found ${carsFound.length} cars matching "${query}"`,
      });
    } catch (error) {
      console.error("Error searching cars:", error);
      setSearchError(true);
      toast({
        title: "Search Error",
        description: "Failed to search for cars. Please try again.",
        variant: "destructive",
      });
      
      // On error, show empty results
      setFilteredCars([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Update filtered cars when search query, cars, or sorting changes
  const updateFilteredCars = (carsList: any[], query: string, sort: string) => {
    // Filter cars based on search query
    const filtered = carsList.filter(car => 
      car.regNumber.toLowerCase().includes(query.toLowerCase()) ||
      car.model.toLowerCase().includes(query.toLowerCase())
    );
    
    // Sort filtered cars
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "regNumber") {
        return a.regNumber.localeCompare(b.regNumber);
      }
      if (sort === "model") {
        return a.model.localeCompare(b.model);
      }
      return 0;
    });
    
    setFilteredCars(sorted);
  };
  
  // Run on initial load and when cars/sortBy changes
  useEffect(() => {
    if (!isSearching && searchQuery.trim() === "") {
      updateFilteredCars(cars, searchQuery, sortBy);
    }
  }, [cars, sortBy]);
  
  const isLoading = isContextLoading || isSearching;
  const isError = isContextError || searchError;
  
  if (isLoading && !searchQuery && filteredCars.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading cars...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getFilterTitle()}</h1>
        <p className="text-muted-foreground">
          {filteredCars.length} cars {filter !== 'all' ? `with ${filter.replace('-', ' ')}` : ''}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar 
          onSearch={handleSearch} 
          searchType="car"
          placeholder="Search by registration number..." 
          initialValue={searchQuery}
        />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regNumber">Registration Number</SelectItem>
              <SelectItem value="model">Model</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isSearching && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <p>Searching cars...</p>
        </div>
      )}

      {/* Enhanced debug section that works for any search query */}
      {searchQuery && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <h3 className="font-semibold text-sm mb-2">Search Results Debug Info:</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold">API Step 1 (Get Car ID):</h4>
              <pre className="text-xs overflow-auto max-h-32 p-2 bg-gray-100 rounded mt-1">
                {apiStep1Response ? JSON.stringify(apiStep1Response, null, 2) : "No response captured"}
              </pre>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold">API Step 2 (Get Key Details):</h4>
              <pre className="text-xs overflow-auto max-h-32 p-2 bg-gray-100 rounded mt-1">
                {apiStep2Response ? JSON.stringify(apiStep2Response, null, 2) : "No response captured"}
              </pre>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold">Final Search Results:</h4>
              <p className="text-xs">Result count: {searchResults.length}</p>
              <pre className="text-xs overflow-auto max-h-32 p-2 bg-gray-100 rounded mt-1">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      {isError && !isSearching && (
        <div className="text-center py-6 bg-red-50 rounded-lg">
          <p className="text-xl font-semibold text-destructive">Error loading cars</p>
          <p className="text-gray-500">Please try again later or check your connection</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCars.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
      
      {filteredCars.length === 0 && !isLoading && !isError && (
        <div className="text-center py-10">
          <p className="text-xl font-semibold text-gray-500">No cars found</p>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default CarsList;
