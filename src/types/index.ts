
export type KeyStatus = 'available' | 'issued' | 'missing' | 'recovered';
export type KeyLocation = 'inhouse' | 'issued';
export type TransactionType = 'issue' | 'return' | 'mark-missing' | 'mark-recovered' | 'add-new';

export interface KeyPurpose {
  id: string;
  name: string;
}

export interface KeyTransaction {
  id: string;
  keyId: string;
  carId: string;
  type: TransactionType;
  timestamp: string;
  issuedTo?: string;
  purpose?: string;
  location?: string;
  notes?: string;
}

export interface CarKey {
  id: string;
  carId: string;
  keyNumber: number; // 1, 2, or 3
  status: KeyStatus;
  location: KeyLocation;
  issuedTo?: string;
  purpose?: string;
  transactions: KeyTransaction[];
}

export interface Car {
  id: string;
  regNumber: string; // Registration number
  model: string;
  keys: CarKey[];
}

export interface DashboardStats {
  totalCars: number;
  totalKeys: number;
  availableKeys: number;
  issuedKeys: number;
  missingKeys: number;
  recoveredKeys: number;
}
