import { Deployment, Period, BonusCalculation, UserRole } from '../types';
import { BONUS_RULES } from '../constants';

// Get the current accounting period (16th of previous/current month to 15th of current/next)
export const getCurrentPeriod = (): Period => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let start: Date;
  let end: Date;

  if (currentDay <= 15) {
    // We are in the second half of the accounting period (e.g., Jan 10 is period Dec 16 - Jan 15)
    // Start is 16th of previous month
    start = new Date(currentYear, currentMonth - 1, 16);
    // End is 15th of current month
    end = new Date(currentYear, currentMonth, 15);
  } else {
    // We are in the first half of the accounting period (e.g., Jan 20 is period Jan 16 - Feb 15)
    // Start is 16th of current month
    start = new Date(currentYear, currentMonth, 16);
    // End is 15th of next month
    end = new Date(currentYear, currentMonth + 1, 15);
  }

  // Formatting label
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const label = `${start.toLocaleDateString('pt-BR', options)} a ${end.toLocaleDateString('pt-BR', options)}`;

  return { start, end, label };
};

// Calculate bonus based on deployments within the period AND user role
export const calculateBonus = (deployments: Deployment[], period: Period, role: UserRole = 'AUXILIAR'): BonusCalculation => {
  // Filter deployments within range
  const validDeployments = deployments.filter(d => {
    const execDate = new Date(d.executionDate + 'T00:00:00'); // Fix TZ issues by appending time
    return execDate >= period.start && execDate <= period.end;
  });

  // Sum towers ONLY if hasSignal is true
  const totalTowers = validDeployments.reduce((acc, curr) => {
    if (curr.hasSignal && curr.statusFinal === 'IMPLANTADO') {
      return acc + curr.towerCount;
    }
    return acc;
  }, 0);

  let estimatedBonus = 0;
  let currentTier = 0;
  let nextTierGap = 0;
  let potentialNextBonus = 0;

  // Determine values based on role
  const values = BONUS_RULES.VALUES[role];

  // Rule Logic
  if (totalTowers < BONUS_RULES.TIER_1_THRESHOLD) {
    // 0 - 16
    estimatedBonus = 0;
    currentTier = 0;
    nextTierGap = BONUS_RULES.TIER_1_THRESHOLD - totalTowers;
    potentialNextBonus = BONUS_RULES.TIER_1_THRESHOLD * values.TIER_1;
  } else if (totalTowers < BONUS_RULES.TIER_2_THRESHOLD) {
    // 17 - 22
    estimatedBonus = totalTowers * values.TIER_1;
    currentTier = 1;
    nextTierGap = BONUS_RULES.TIER_2_THRESHOLD - totalTowers;
    potentialNextBonus = BONUS_RULES.TIER_2_THRESHOLD * values.TIER_2;
  } else {
    // 23+
    estimatedBonus = totalTowers * values.TIER_2;
    currentTier = 2;
    nextTierGap = 0;
    potentialNextBonus = 0;
  }

  return {
    totalTowers,
    currentTier,
    estimatedBonus,
    nextTierGap,
    potentialNextBonus
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Helper to resize image and convert to base64
export const resizeImage = (file: File, maxWidth: number = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type, 0.7)); // 0.7 quality
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to convert Base64 back to Blob (for sharing)
export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const match = arr[0].match(/:(.*?);/);
  if (!match) throw new Error("Invalid data URL");
  const mime = match[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};