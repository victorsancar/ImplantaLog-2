export const APP_NAME = "NetBonus";

export const STATUS_OPTIONS = [
  { value: 'IMPLANTADO', label: 'Implantado OK' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export const USER_ROLES = {
  AUXILIAR: 'AUXILIAR',
  OFICIAL: 'OFICIAL',
} as const;

// Business Rule Constants
export const BONUS_RULES = {
  TIER_1_THRESHOLD: 17, // Starts paying at 17
  TIER_2_THRESHOLD: 23, // Jumps value at 23
  
  // Values per role
  VALUES: {
    AUXILIAR: {
      TIER_1: 30.00, // Per tower
      TIER_2: 50.00, // Per tower
    },
    OFICIAL: {
      TIER_1: 60.00, // Per tower (Double Aux)
      TIER_2: 100.00, // Per tower (Double Aux)
    }
  }
};