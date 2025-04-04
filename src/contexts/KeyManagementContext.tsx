
import React, { createContext, useContext, useState } from "react";
import { Car, CarKey, KeyPurpose, KeyTransaction, DashboardStats } from "@/types";
import { mockCars, mockDashboardStats, keyPurposes } from "@/services/mockDataService";
import { toast } from "@/components/ui/use-toast";

interface KeyManagementContextType {
  cars: Car[];
  purposes: KeyPurpose[];
  stats: DashboardStats;
  issueKey: (carId: string, keyId: string, issuedTo: string, purposeId: string, notes?: string) => void;
  returnKey: (carId: string, keyId: string, location: string, notes?: string) => void;
  markKeyMissing: (carId: string, keyId: string, notes?: string) => void;
  markKeyRecovered: (carId: string, keyId: string, location: string, notes?: string) => void;
  addNewKey: (carId: string, keyNumber: number) => void;
  getCar: (carId: string) => Car | undefined;
  getKey: (keyId: string) => CarKey | undefined;
  getFilteredCars: (filter: 'all' | 'missing-keys' | 'issued-keys' | 'recovered-keys') => Car[];
}

const KeyManagementContext = createContext<KeyManagementContextType | undefined>(undefined);

export const KeyManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>(mockCars);
  const [stats, setStats] = useState<DashboardStats>(mockDashboardStats);
  const [purposes] = useState<KeyPurpose[]>(keyPurposes);

  // Helper function to recalculate stats
  const recalculateStats = (updatedCars: Car[]) => {
    let totalKeys = 0;
    let availableKeys = 0;
    let issuedKeys = 0;
    let missingKeys = 0;
    let recoveredKeys = 0;
    
    updatedCars.forEach(car => {
      car.keys.forEach(key => {
        totalKeys++;
        if (key.status === 'available') availableKeys++;
        if (key.status === 'issued') issuedKeys++;
        if (key.status === 'missing') missingKeys++;
        if (key.status === 'recovered') recoveredKeys++;
      });
    });
    
    setStats({
      totalCars: updatedCars.length,
      totalKeys,
      availableKeys,
      issuedKeys,
      missingKeys,
      recoveredKeys
    });
  };

  // Helper function to find car and key
  const findCarAndKey = (carId: string, keyId: string): { car: Car; carIndex: number; key: CarKey; keyIndex: number } | undefined => {
    const carIndex = cars.findIndex(c => c.id === carId);
    if (carIndex === -1) return undefined;
    
    const car = cars[carIndex];
    const keyIndex = car.keys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) return undefined;
    
    return { car, carIndex, key: car.keys[keyIndex], keyIndex };
  };

  // Issue a key
  const issueKey = (carId: string, keyId: string, issuedTo: string, purposeId: string, notes?: string) => {
    const found = findCarAndKey(carId, keyId);
    if (!found) return;
    
    const { car, carIndex, key, keyIndex } = found;
    const purpose = purposes.find(p => p.id === purposeId)?.name || '';
    
    if (key.status === 'issued') {
      toast({ title: "Error", description: "This key is already issued", variant: "destructive" });
      return;
    }
    
    if (key.status === 'missing') {
      toast({ title: "Error", description: "Cannot issue a missing key", variant: "destructive" });
      return;
    }
    
    // Create transaction
    const transaction: KeyTransaction = {
      id: `t-${keyId}-${Date.now()}`,
      keyId,
      carId,
      type: 'issue',
      timestamp: new Date().toISOString(),
      issuedTo,
      purpose,
      notes: notes || "Key issued"
    };
    
    // Update key
    const updatedKey: CarKey = {
      ...key,
      status: 'issued',
      location: 'issued',
      issuedTo,
      purpose,
      transactions: [...key.transactions, transaction]
    };
    
    // Update car
    const updatedCar: Car = {
      ...car,
      keys: [
        ...car.keys.slice(0, keyIndex),
        updatedKey,
        ...car.keys.slice(keyIndex + 1)
      ]
    };
    
    // Update state
    const updatedCars = [
      ...cars.slice(0, carIndex),
      updatedCar,
      ...cars.slice(carIndex + 1)
    ];
    
    setCars(updatedCars);
    recalculateStats(updatedCars);
    
    toast({ title: "Success", description: "Key issued successfully" });
  };

  // Return a key
  const returnKey = (carId: string, keyId: string, location: string, notes?: string) => {
    const found = findCarAndKey(carId, keyId);
    if (!found) return;
    
    const { car, carIndex, key, keyIndex } = found;
    
    if (key.status !== 'issued') {
      toast({ title: "Error", description: "This key is not issued", variant: "destructive" });
      return;
    }
    
    // Create transaction
    const transaction: KeyTransaction = {
      id: `t-${keyId}-${Date.now()}`,
      keyId,
      carId,
      type: 'return',
      timestamp: new Date().toISOString(),
      location,
      notes: notes || "Key returned"
    };
    
    // Update key
    const updatedKey: CarKey = {
      ...key,
      status: 'available',
      location: 'inhouse',
      issuedTo: undefined,
      purpose: undefined,
      transactions: [...key.transactions, transaction]
    };
    
    // Update car
    const updatedCar: Car = {
      ...car,
      keys: [
        ...car.keys.slice(0, keyIndex),
        updatedKey,
        ...car.keys.slice(keyIndex + 1)
      ]
    };
    
    // Update state
    const updatedCars = [
      ...cars.slice(0, carIndex),
      updatedCar,
      ...cars.slice(carIndex + 1)
    ];
    
    setCars(updatedCars);
    recalculateStats(updatedCars);
    
    toast({ title: "Success", description: "Key returned successfully" });
  };

  // Mark a key as missing
  const markKeyMissing = (carId: string, keyId: string, notes?: string) => {
    const found = findCarAndKey(carId, keyId);
    if (!found) return;
    
    const { car, carIndex, key, keyIndex } = found;
    
    if (key.status === 'missing') {
      toast({ title: "Error", description: "This key is already marked as missing", variant: "destructive" });
      return;
    }
    
    // Create transaction
    const transaction: KeyTransaction = {
      id: `t-${keyId}-${Date.now()}`,
      keyId,
      carId,
      type: 'mark-missing',
      timestamp: new Date().toISOString(),
      notes: notes || "Key marked as missing"
    };
    
    // Update key
    const updatedKey: CarKey = {
      ...key,
      status: 'missing',
      location: 'issued',
      transactions: [...key.transactions, transaction]
    };
    
    // Update car
    const updatedCar: Car = {
      ...car,
      keys: [
        ...car.keys.slice(0, keyIndex),
        updatedKey,
        ...car.keys.slice(keyIndex + 1)
      ]
    };
    
    // Update state
    const updatedCars = [
      ...cars.slice(0, carIndex),
      updatedCar,
      ...cars.slice(carIndex + 1)
    ];
    
    setCars(updatedCars);
    recalculateStats(updatedCars);
    
    toast({ title: "Alert", description: "Key marked as missing", variant: "destructive" });
  };

  // Mark a key as recovered
  const markKeyRecovered = (carId: string, keyId: string, location: string, notes?: string) => {
    const found = findCarAndKey(carId, keyId);
    if (!found) return;
    
    const { car, carIndex, key, keyIndex } = found;
    
    if (key.status !== 'missing') {
      toast({ title: "Error", description: "Only missing keys can be marked as recovered", variant: "destructive" });
      return;
    }
    
    // Create transaction
    const transaction: KeyTransaction = {
      id: `t-${keyId}-${Date.now()}`,
      keyId,
      carId,
      type: 'mark-recovered',
      timestamp: new Date().toISOString(),
      location,
      notes: notes || "Key recovered"
    };
    
    // Update key
    const updatedKey: CarKey = {
      ...key,
      status: 'available',
      location: 'inhouse',
      issuedTo: undefined,
      purpose: undefined,
      transactions: [...key.transactions, transaction]
    };
    
    // Update car
    const updatedCar: Car = {
      ...car,
      keys: [
        ...car.keys.slice(0, keyIndex),
        updatedKey,
        ...car.keys.slice(keyIndex + 1)
      ]
    };
    
    // Update state
    const updatedCars = [
      ...cars.slice(0, carIndex),
      updatedCar,
      ...cars.slice(carIndex + 1)
    ];
    
    setCars(updatedCars);
    recalculateStats(updatedCars);
    
    toast({ title: "Success", description: "Key marked as recovered" });
  };

  // Add a new key
  const addNewKey = (carId: string, keyNumber: number) => {
    const carIndex = cars.findIndex(c => c.id === carId);
    if (carIndex === -1) return;
    
    const car = cars[carIndex];
    
    // Check if key number already exists
    if (car.keys.some(k => k.keyNumber === keyNumber)) {
      toast({ title: "Error", description: `Key #${keyNumber} already exists for this car`, variant: "destructive" });
      return;
    }
    
    const keyId = `key-${carId}-${keyNumber}`;
    
    // Create new key
    const newKey: CarKey = {
      id: keyId,
      carId,
      keyNumber,
      status: 'available',
      location: 'inhouse',
      transactions: [{
        id: `t-${keyId}-0`,
        keyId,
        carId,
        type: 'add-new',
        timestamp: new Date().toISOString(),
        notes: "New key added"
      }]
    };
    
    // Update car
    const updatedCar: Car = {
      ...car,
      keys: [...car.keys, newKey]
    };
    
    // Update state
    const updatedCars = [
      ...cars.slice(0, carIndex),
      updatedCar,
      ...cars.slice(carIndex + 1)
    ];
    
    setCars(updatedCars);
    recalculateStats(updatedCars);
    
    toast({ title: "Success", description: `Key #${keyNumber} added successfully` });
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

  const value = {
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
    getFilteredCars
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
