
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import * as apiService from "@/services/apiService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchType?: "car" | "driver";
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  searchType = "car",
  placeholder = "Search car registration...",
  initialValue = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  useEffect(() => {
    // Set initial value when component mounts or initialValue changes
    setSearchQuery(initialValue);
  }, [initialValue]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    
    if (searchQuery.trim().length === 0) {
      toast({
        title: "Search Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log(`Starting search for ${searchType} with query: ${searchQuery}`);
      
      // Use the appropriate search function based on searchType
      if (searchType === "car") {
        // Try the new car number search API first
        try {
          const result = await apiService.searchCarByNumber(searchQuery);
          console.log("Car number search result:", result);
          
          // If no results, fall back to the original search
          if (!result || !result.data || result.data.length === 0) {
            console.log("No results from car number search, falling back to regular search");
            
            // Add a small delay before the fallback search to avoid potential rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const fallbackResult = await apiService.searchCars(searchQuery);
            console.log("Fallback search result:", fallbackResult);
          }
        } catch (error) {
          console.error("New API search failed, falling back to original search:", error);
          const fallbackResult = await apiService.searchCars(searchQuery);
          console.log("Fallback search result:", fallbackResult);
        }
      } else if (searchType === "driver") {
        // Use driver search API
        await apiService.searchDriverById(searchQuery);
      }
      
      // Call the onSearch callback with the query regardless
      // The parent component can decide how to handle the results
      onSearch(searchQuery);
      setSearchError(null);
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to perform search";
      setSearchError(errorMessage);
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSearchError(null);
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Only trigger search if value is not empty and has at least 3 characters
    if (newValue.trim().length >= 3) {
      // Set a timeout to trigger search after user stops typing
      const timeout = setTimeout(async () => {
        setIsSearching(true);
        try {
          if (searchType === "car") {
            // Try the new car number search API
            await apiService.searchCarByNumber(newValue);
          } else if (searchType === "driver") {
            // Use driver search API
            await apiService.searchDriverById(newValue);
          }
          onSearch(newValue);
          setSearchError(null);
        } catch (error) {
          console.error("Auto-search error:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to perform search";
          setSearchError(errorMessage);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms debounce
      
      setTypingTimeout(timeout);
    }
  };
  
  return (
    <div className="space-y-2 w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          disabled={isSearching}
          className={searchError ? "border-red-500" : ""}
        />
        <Button type="submit" size="icon" variant="outline" disabled={isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      {searchError && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {searchError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SearchBar;
