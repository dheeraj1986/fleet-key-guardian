
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
import * as apiService from "@/services/apiService";

const CarsList: React.FC<{ filter?: 'all' | 'missing-keys' | 'issued-keys' | 'recovered-keys' }> = ({ filter = 'all' }) => {
  const { getFilteredCars, isLoading: isContextLoading, isError: isContextError } = useKeyManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("regNumber");
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  
  const cars = getFilteredCars(filter);
  
  const getFilterTitle = () => {
    switch (filter) {
      case 'missing-keys': return "Cars with Missing Keys";
      case 'issued-keys': return "Cars with Issued Keys";
      case 'recovered-keys': return "Cars with Recovered Keys";
      default: return "All Cars";
    }
  };
  
  // Direct search function for specific car numbers
  const performDirectSearch = async (query: string) => {
    if (query.trim().length > 2) {
      setIsSearching(true);
      setSearchError(false);
      
      try {
        console.log(`Searching for car: ${query}`);
        const response = await apiService.searchCars(query);
        console.log("Search response:", response);
        
        if (response && response.data) {
          const adaptedCars = response.data.map(apiService.adaptCarFromApi);
          setFilteredCars(adaptedCars);
          
          // Show a toast notification with search results
          toast({
            title: "Search Results",
            description: `Found ${adaptedCars.length} cars matching "${query}"`,
          });
        } else {
          setFilteredCars([]);
          toast({
            title: "No Results",
            description: `No cars found matching "${query}"`,
          });
        }
      } catch (error) {
        console.error("Error searching cars:", error);
        setSearchError(true);
        toast({
          title: "Search Error",
          description: "Failed to search for cars. Please try again.",
          variant: "destructive",
        });
        setFilteredCars([]);
      } finally {
        setIsSearching(false);
      }
    } else if (query.trim() === "") {
      // If search is cleared, revert to filtered cars from context
      updateFilteredCars(cars, "", sortBy);
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
  
  // Handler for search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performDirectSearch(query);
  };
  
  const isLoading = isContextLoading || isSearching;
  const isError = isContextError || searchError;
  
  if (isLoading) {
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
          placeholder="Search by registration or model..." 
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
      
      {isError && (
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
