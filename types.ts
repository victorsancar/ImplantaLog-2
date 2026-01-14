export interface Deployment {
  id: string;
  createdAt: number;
  type?: string;
  serviceId: string;
  address: string;
  responsible: string;
  date: string;
  time: string;
  
  // Produção
  towers: number;
  floors: string | number;
  apartments: string | number;
  cdoe: string | number;
  
  // Sinais
  signal: string;
  hasSignal: boolean;
  hasHubBox: boolean;
  
  // NOVOS CAMPOS: Materiais (Adicionados agora)
  cableSource?: string; // Qual rolo/bobina usou
  cableUsed?: number;   // Quantos metros
  connectors?: number;  // Conectores
  anchors?: number;     // Alças

  // Status e Outros
  status: string;
  notes?: string;
  facilities?: string;
  team?: string;
  photo?: string;
}

export type UserRole = 'AUXILIAR' | 'OFICIAL';
