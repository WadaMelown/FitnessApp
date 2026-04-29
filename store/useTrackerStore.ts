import { create } from 'zustand';
import { WorkoutEntry, insertWorkout, getRecentWorkouts } from '@/lib/database';

export interface TrackerState {
  recentWorkouts: WorkoutEntry[];
  isLoading: boolean;
  loadWorkouts: () => Promise<void>;
  addWorkout: (entry: Omit<WorkoutEntry, 'id' | 'createdAt'>) => Promise<void>;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  recentWorkouts: [],
  isLoading: false,

  loadWorkouts: async () => {
    set({ isLoading: true });
    try {
      const workouts = await getRecentWorkouts(50);
      set({ recentWorkouts: workouts });
    } finally {
      set({ isLoading: false });
    }
  },

  addWorkout: async (entry) => {
    await insertWorkout(entry as WorkoutEntry);
    await get().loadWorkouts();
  },
}));
