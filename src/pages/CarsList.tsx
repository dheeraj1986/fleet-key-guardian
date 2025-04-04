
import React, { useState } from "react";
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

const CarsList: React.FC<{ filter?: 'all' | 'missing-keys' | 'issued-keys' | 'recovered-keys' }> = ({ filter = 'all' }) => {
  const { getFilteredCars } = useKeyManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("regNumber");
  
  const cars = getFilteredCars(filter);
  
  const getFilterTitle = () => {
    switch (filter) {
      case 'missing-keys': return "Cars with Missing Keys";
      case 'issued-keys': return "Cars with Issued Keys";
      case 'recovered-keys': return "Cars with Recovered Keys";
      default: return "All Cars";
    }
  };
  
  const filteredCars = cars.filter(car => 
    car.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === "regNumber") {
      return a.regNumber.localeCompare(b.regNumber);
    }
    if (sortBy === "model") {
      return a.model.localeCompare(b.model);
    }
    return 0;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getFilterTitle()}</h1>
        <p className="text-muted-foreground">
          {sortedCars.length} cars {filter !== 'all' ? `with ${filter.replace('-', ' ')}` : ''}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar onSearch={setSearchQuery} placeholder="Search by registration or model..." />
        
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedCars.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
      
      {sortedCars.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl font-semibold text-gray-500">No cars found</p>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default CarsList;
