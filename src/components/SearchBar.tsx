
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  useEffect(() => {
    // Set initial value when component mounts or initialValue changes
    setSearchQuery(initialValue);
  }, [initialValue]);
  
  // For advanced console capturing (used for debugging the test case)
  useEffect(() => {
    // Only setup for test cases to capture console logs
    const originalConsoleLog = console.log;
    console.log = function() {
      originalConsoleLog.apply(console, arguments);
      
      // Create a custom event to pass the console log data
      const event = new CustomEvent('consolelog', { 
        detail: { log: arguments[0] } 
      });
      window.dispatchEvent(event);
    };
    
    // Restore on cleanup
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);
  
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
      console.log(`Starting ${searchType} search with query: "${searchQuery}"`);
      
      // Call the onSearch callback with the query
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
      // Let parent component control the loading state
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSearchError(null);
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
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
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
