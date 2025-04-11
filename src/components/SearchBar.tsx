
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
    onSearch(searchQuery);
    setIsSearching(false);
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
      const timeout = setTimeout(() => {
        setIsSearching(true);
        onSearch(newValue);
        setIsSearching(false);
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
