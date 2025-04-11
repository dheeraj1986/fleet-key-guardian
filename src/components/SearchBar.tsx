
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import * as apiService from "@/services/apiService";

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
  
  useEffect(() => {
    // Set initial value when component mounts or initialValue changes
    setSearchQuery(initialValue);
  }, [initialValue]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Use the appropriate search function based on searchType
      if (searchType === "car") {
        // Try the new car number search API first
        const result = await apiService.searchCarByNumber(searchQuery);
        console.log("Car number search result:", result);
        
        // If no results or error, fall back to the original search
        if (!result || !result.data || result.data.length === 0) {
          console.log("No results from car number search, falling back to regular search");
        }
      } else if (searchType === "driver") {
        // Use driver search API
        await apiService.searchDriverById(searchQuery);
      }
      
      // Call the onSearch callback with the query regardless
      // The parent component can decide how to handle the results
      onSearch(searchQuery);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
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
        } catch (error) {
          console.error("Auto-search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms debounce
      
      setTypingTimeout(timeout);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        disabled={isSearching}
      />
      <Button type="submit" size="icon" variant="outline" disabled={isSearching}>
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default SearchBar;
