export type UserRole = 'AUXILIAR' | 'OFICIAL';

export interface Deployment {
  id: string; // Internal UUID
  serviceId: string; // ID from the form (Numérico/Texto)
  type: string;
  address: string;
  responsible: string;
  executionDate: string; // YYYY-MM-DD
  executionTime: string; // HH:MM
  
  // Technical Metrics
  towerCount: number;
  floorCount: number;
  apartmentCount: number;
  cdoeCount: number;
  signalStrength: number;
  hasHubBox: boolean;
  hasSignal: boolean; // CRITICAL for bonus
  facilities: string;
  
  // New: Photo
  photoUrl?: string; // Base64 string

  // Team
  teamMember1: string;
  teamMember2: string;
  
  // Status
  statusFinal: 'IMPLANTADO' | 'PENDENTE' | 'CANCELADO';
  comments: string;
  
  createdAt: number;
}

export interface Period {
  start: Date;
  end: Date;
  label: string;
}

export interface BonusCalculation {
  totalTowers: number; // Only counting those with hasSignal = true
  currentTier: number;
  estimatedBonus: number;
  nextTierGap: number;
  potentialNextBonus: number;
}