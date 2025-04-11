
import React, { createContext, useContext, useState, useEffect } from "react";
import { Car, CarKey, KeyPurpose, KeyTransaction, DashboardStats } from "@/types";
import { keyPurposes } from "@/services/mockDataService";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiService from "@/services/apiService";

interface KeyManagementContextType {
  cars: Car[];
  purposes: KeyPurpose[];
  stats: DashboardStats;
  issueKey: (carId: string, keyId: string, issuedTo: string, purposeId: string, notes?: string) => Promise<void>;
  returnKey: (carId: string, keyId: string, location: string, notes?: string) => Promise<void>;
  markKeyMissing: (carId: string, keyId: string, notes?: string) => Promise<void>;
  markKeyRecovered: (carId: string, keyId: string, location: string, notes?: string) => Promise<void>;
  addNewKey: (carId: string, keyNumber: number) => Promise<void>;
  getCar: (carId: string) => Car | undefined;
  getKey: (keyId: string) => CarKey | undefined;
  getFilteredCars: (filter: 'all' | 'missing-keys' | 'issued-keys' | 'recovered-keys') => Car[];
  isLoading: boolean;
  isError: boolean;
}

const KeyManagementContext = createContext<KeyManagementContextType | undefined>(undefined);

export const KeyManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purposes] = useState<KeyPurpose[]>(keyPurposes);
  const queryClient = useQueryClient();
  
  // Fetch all cars
  const { 
    data: cars = [], 
    isLoading: isLoadingCars,
    isError: isErrorCars
  } = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      try {
        console.log("Fetching all cars data...");
        const response = await apiService.searchCars();
        console.log("Cars data response:", response);
        return response.data?.map(apiService.adaptCarFromApi) || [];
      } catch (error) {
        console.error("Error fetching cars:", error);
        toast({ 
          title: "Error",
          description: "Failed to load cars data. Please try again later.",
          variant: "destructive"
        });
        return [];
      }
    }
  });
  
  // Fetch stats
  const { 
    data: stats = {
      totalCars: 0,
      totalKeys: 0,
      availableKeys: 0,
      issuedKeys: 0,
      missingKeys: 0,
      recoveredKeys: 0
    },
    isLoading: isLoadingStats,
    isError: isErrorStats
  } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      try {
        console.log("Fetching key statistics...");
        const response = await apiService.getKeyStatistics();
        console.log("Key statistics response:", response);
        
        const adaptedStats = apiService.adaptStatsFromApi(response.data);
        // Ensure the return format matches DashboardStats
        return {
          totalCars: adaptedStats.total || 0,
          totalKeys: adaptedStats.total || 0,
          availableKeys: adaptedStats.available || 0,
          issuedKeys: adaptedStats.issued || 0,
          missingKeys: adaptedStats.missing || 0,
          recoveredKeys: 0 // Not provided by API but required by type
        };
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({ 
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again later.",
          variant: "destructive"
        });
        return {
          totalCars: 0,
          totalKeys: 0,
          availableKeys: 0,
          issuedKeys: 0,
          missingKeys: 0,
          recoveredKeys: 0
        };
      }
    }
  });
  
  // Issue key mutation
  const issueMutation = useMutation({
    mutationFn: async ({ 
      keyId, 
      driverId, 
      purpose, 
      remarks 
    }: { 
      keyId: string; 
      driverId: string; 
      purpose: string; 
      remarks?: string 
    }) => {
      return apiService.issueKey(keyId, driverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: "Success", description: "Key issued successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to issue key", 
        variant: "destructive" 
      });
    }
  });
  
  // Return key mutation (mark as available)
  const returnMutation = useMutation({
    mutationFn: async ({ 
      keyId, 
      keyPlace, 
      remarks 
    }: { 
      keyId: string; 
      keyPlace: string; 
      remarks?: string 
    }) => {
      return apiService.markKeyAvailable(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: "Success", description: "Key returned successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to return key", 
        variant: "destructive" 
      });
    }
  });
  
  // Mark key missing mutation
  const missingMutation = useMutation({
    mutationFn: async ({ 
      keyId, 
      remarks 
    }: { 
      keyId: string; 
      remarks?: string 
    }) => {
      return apiService.markKeyMissing(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: "Alert", description: "Key marked as missing", variant: "destructive" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to mark key as missing", 
        variant: "destructive" 
      });
    }
  });
  
  // Add new key mutation
  const addKeyMutation = useMutation({
    mutationFn: async ({ 
      carId, 
      keyNumber, 
      keyPlace,
      remarks 
    }: { 
      carId: string; 
      keyNumber: string; 
      keyPlace: string;
      remarks?: string 
    }) => {
      return apiService.addNewKey(carId, { 
        keyNumber, 
        keyPlace,
        remarks
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({ title: "Success", description: "Key added successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add new key", 
        variant: "destructive" 
      });
    }
  });

  // Issue a key
  const issueKey = async (carId: string, keyId: string, issuedTo: string, purposeId: string, notes?: string) => {
    const purpose = purposes.find(p => p.id === purposeId)?.name || '';
    
    await issueMutation.mutateAsync({ 
      keyId, 
      driverId: issuedTo, 
      purpose, 
      remarks: notes 
    });
  };

  // Return a key
  const returnKey = async (carId: string, keyId: string, location: string, notes?: string) => {
    await returnMutation.mutateAsync({ 
      keyId, 
      keyPlace: location, 
      remarks: notes 
    });
  };

  // Mark a key as missing
  const markKeyMissing = async (carId: string, keyId: string, notes?: string) => {
    await missingMutation.mutateAsync({ 
      keyId, 
      remarks: notes 
    });
  };

  // Mark a key as recovered (same as marking it available with special note)
  const markKeyRecovered = async (carId: string, keyId: string, location: string, notes?: string) => {
    const combinedNotes = `Key recovered. ${notes || ''}`;
    await returnMutation.mutateAsync({ 
      keyId, 
      keyPlace: location, 
      remarks: combinedNotes 
    });
  };

  // Add a new key
  const addNewKey = async (carId: string, keyNumber: number) => {
    await addKeyMutation.mutateAsync({ 
      carId, 
      keyNumber: keyNumber.toString(), 
      keyPlace: "inhouse",
      remarks: "New key added" 
    });
  };

  // Get a car by ID
  const getCar = (carId: string) => {
    return cars.find(c => c.id === carId);
  };

  // Get a key by ID
  const getKey = (keyId: string) => {
    for (const car of cars) {
      const key = car.keys.find(k => k.id === keyId);
      if (key) return key;
    }
    return undefined;
  };

  // Get filtered cars
  const getFilteredCars = (filter: 'all' | 'missing-keys' | 'issued-keys' | 'recovered-keys') => {
    switch (filter) {
      case 'missing-keys':
        return cars.filter(car => car.keys.some(key => key.status === 'missing'));
      case 'issued-keys':
        return cars.filter(car => car.keys.some(key => key.status === 'issued'));
      case 'recovered-keys':
        return cars.filter(car => car.keys.some(key => key.status === 'recovered'));
      default:
        return cars;
    }
  };

  const isLoading = isLoadingCars || isLoadingStats;
  const isError = isErrorCars || isErrorStats;

  const value: KeyManagementContextType = {
    cars,
    purposes,
    stats,
    issueKey,
    returnKey,
    markKeyMissing,
    markKeyRecovered,
    addNewKey,
    getCar,
    getKey,
    getFilteredCars,
    isLoading,
    isError
  };

  return (
    <KeyManagementContext.Provider value={value}>
      {children}
    </KeyManagementContext.Provider>
  );
};

export const useKeyManagement = () => {
  const context = useContext(KeyManagementContext);
  if (context === undefined) {
    throw new Error("useKeyManagement must be used within a KeyManagementProvider");
  }
  return context;
};
