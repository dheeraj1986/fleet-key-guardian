
import { Car, CarKey, KeyPurpose, KeyTransaction } from "@/types";

// Generate mock car registration numbers
function generateRegNumber(): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const randomLetters = () => letters[Math.floor(Math.random() * letters.length)];
  const randomDigits = () => Math.floor(Math.random() * 10).toString();
  
  return `${randomLetters()}${randomLetters()} ${randomDigits()}${randomDigits()} ${randomLetters()}${randomLetters()}${randomLetters()}`;
}

// Car models
const carModels = [
  "Toyota Corolla", "Honda Civic", "Ford Focus", "Volkswagen Golf",
  "Hyundai Elantra", "Nissan Sentra", "Chevrolet Malibu", "Kia Forte",
  "Mazda 3", "Subaru Impreza"
];

// Possible purposes
export const keyPurposes: KeyPurpose[] = [
  { id: "1", name: "Driving" },
  { id: "2", name: "Hub Transfer" },
  { id: "3", name: "Recovery" },
  { id: "4", name: "Maintenance" },
  { id: "5", name: "Cleaning" }
];

// Staff members
const staffMembers = [
  "John Smith", "Emma Johnson", "Michael Brown", "Sophia Davis", 
  "William Miller", "Olivia Wilson", "James Moore", "Ava Taylor", 
  "Alexander Anderson", "Charlotte Thomas"
];

// Locations (when inhouse)
const inhouseLocations = [
  "Main Office", "North Hub", "South Hub", "East Hub", "West Hub",
  "Central Depot", "Airport Office", "Downtown Location", "Service Center"
];

// Generate transactions for a key
function generateTransactions(keyId: string, carId: string, count: number): KeyTransaction[] {
  const transactions: KeyTransaction[] = [];
  const types: Array<"issue" | "return" | "mark-missing" | "mark-recovered" | "add-new"> = ["issue", "return"];
  
  // First transaction is always "add-new"
  transactions.push({
    id: `t-${keyId}-0`,
    keyId,
    carId,
    type: "add-new",
    timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    notes: "Key added to the system"
  });
  
  for (let i = 1; i <= count; i++) {
    const isIssue = i % 2 === 1; // Alternate between issue and return
    const type = isIssue ? "issue" : "return";
    const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const randomPurpose = keyPurposes[Math.floor(Math.random() * keyPurposes.length)].name;
    const randomLocation = inhouseLocations[Math.floor(Math.random() * inhouseLocations.length)];
    
    transactions.push({
      id: `t-${keyId}-${i}`,
      keyId,
      carId,
      type,
      timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      issuedTo: isIssue ? randomStaff : undefined,
      purpose: isIssue ? randomPurpose : undefined,
      location: !isIssue ? randomLocation : undefined,
      notes: isIssue ? "Key issued" : "Key returned"
    });
  }
  
  return transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Generate a single car key
function generateCarKey(carId: string, keyNumber: number): CarKey {
  const keyId = `key-${carId}-${keyNumber}`;
  
  // Determine random status with weighted probabilities
  const random = Math.random();
  let status: "available" | "issued" | "missing" | "recovered" = "available";
  let location: "inhouse" | "issued" = "inhouse";
  let issuedTo: string | undefined = undefined;
  let purpose: string | undefined = undefined;
  
  if (random < 0.2) { // 20% chance to be missing
    status = "missing";
    location = "issued";
  } else if (random < 0.4) { // 20% chance to be issued
    status = "issued";
    location = "issued";
    issuedTo = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    purpose = keyPurposes[Math.floor(Math.random() * keyPurposes.length)].name;
  } else if (random < 0.5) { // 10% chance to be recovered
    status = "recovered";
    location = "inhouse";
  } else { // 50% chance to be available
    status = "available";
    location = "inhouse";
  }

  const transactions = generateTransactions(keyId, carId, Math.floor(Math.random() * 10) + 1);
  
  // For recovered keys, add appropriate transactions
  if (status === 'recovered') {
    // Add a missing transaction
    transactions.push({
      id: `t-${keyId}-missing`,
      keyId,
      carId,
      type: "mark-missing",
      timestamp: new Date(Date.now() - Math.random() * 500000000).toISOString(),
      notes: "Key marked as missing"
    });
    
    // Add a recovered transaction
    const randomLocation = inhouseLocations[Math.floor(Math.random() * inhouseLocations.length)];
    transactions.push({
      id: `t-${keyId}-recovered`,
      keyId,
      carId,
      type: "mark-recovered",
      timestamp: new Date(Date.now() - Math.random() * 100000000).toISOString(),
      location: randomLocation,
      notes: "Key recovered and returned to inventory"
    });
    
    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  return {
    id: keyId,
    carId,
    keyNumber,
    status,
    location,
    issuedTo,
    purpose,
    transactions
  };
}

// Generate a set of cars with keys
export function generateCars(count: number): Car[] {
  const cars: Car[] = [];
  
  for (let i = 0; i < count; i++) {
    const carId = `car-${i + 1}`;
    const regNumber = generateRegNumber();
    const model = carModels[Math.floor(Math.random() * carModels.length)];
    
    // Generate 3 keys for this car
    const keys = [
      generateCarKey(carId, 1),
      generateCarKey(carId, 2),
      generateCarKey(carId, 3)
    ];
    
    cars.push({
      id: carId,
      regNumber,
      model,
      keys
    });
  }
  
  return cars;
}

// Calculate dashboard statistics
export function calculateDashboardStats(cars: Car[]) {
  let totalKeys = 0;
  let availableKeys = 0;
  let issuedKeys = 0;
  let missingKeys = 0;
  let recoveredKeys = 0;
  
  cars.forEach(car => {
    car.keys.forEach(key => {
      totalKeys++;
      if (key.status === 'available') availableKeys++;
      if (key.status === 'issued') issuedKeys++;
      if (key.status === 'missing') missingKeys++;
      if (key.status === 'recovered') recoveredKeys++;
    });
  });
  
  return {
    totalCars: cars.length,
    totalKeys,
    availableKeys,
    issuedKeys,
    missingKeys,
    recoveredKeys
  };
}

// Generate initial mock data
export const mockCars = generateCars(100); // Starting with 100 cars for demo
export const mockDashboardStats = calculateDashboardStats(mockCars);
