export interface Deployment {
  id: string;
  createdAt: number;
  type?: string;
  serviceId: string;
  address: string;
  responsible: string;
  date: string;
  time: string;
  towers: number;
  floors: string | number;
  apartments: string | number;
  cdoe: string | number;
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  
  // NOVOS CAMPOS
  cableSource?: string;
  cableUsed?: number;
  connectors?: number;
  anchors?: number;

  status: string;
  notes?: string;
  facilities?: string;
  team?: string;
  photo?: string;
}
export type UserRole = 'AUXILIAR' | 'OFICIAL';
