import { create } from 'zustand';
import { BodyMeasurement, insertMeasurement, getAllMeasurements, getLatestMeasurement } from '@/lib/database';

export interface BodySimState {
  measurements: BodyMeasurement[];
  latest: BodyMeasurement | null;
  isLoading: boolean;
  loadMeasurements: () => Promise<void>;
  addMeasurement: (m: Omit<BodyMeasurement, 'id' | 'createdAt'>) => Promise<void>;
}

export const useBodySimStore = create<BodySimState>((set, get) => ({
  measurements: [],
  latest: null,
  isLoading: false,

  loadMeasurements: async () => {
    set({ isLoading: true });
    try {
      const [all, latest] = await Promise.all([getAllMeasurements(), getLatestMeasurement()]);
      set({ measurements: all, latest });
    } finally {
      set({ isLoading: false });
    }
  },

  addMeasurement: async (m) => {
    await insertMeasurement(m as BodyMeasurement);
    await get().loadMeasurements();
  },
}));

// BMI and body composition helpers
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#64B5F6' };
  if (bmi < 25) return { label: 'Normal', color: '#00E676' };
  if (bmi < 30) return { label: 'Overweight', color: '#FFB300' };
  return { label: 'Obese', color: '#FF5252' };
}

export function estimateBodyFat(bmi: number, age: number, isMale: boolean): number {
  // Deurenberg formula
  const sex = isMale ? 1 : 0;
  return (1.2 * bmi) + (0.23 * age) - (10.8 * sex) - 5.4;
}

export function toKg(value: number, unit: string): number {
  return unit === 'lbs' ? value * 0.453592 : value;
}

export function toCm(value: number, unit: string): number {
  return unit === 'in' ? value * 2.54 : unit === 'ft' ? value * 30.48 : value;
}

// Avatar scale factors derived from BMI
export function getAvatarScale(bmi: number): { torso: number; limbs: number; belly: number } {
  const ref = 22;
  const ratio = bmi / ref;
  return {
    torso: Math.max(0.7, Math.min(1.5, ratio)),
    limbs: Math.max(0.8, Math.min(1.3, Math.sqrt(ratio))),
    belly: Math.max(0.6, Math.min(2.0, ratio * 1.2)),
  };
}
