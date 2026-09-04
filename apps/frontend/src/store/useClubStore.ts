import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Club {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ClubState {
  selectedClub: Club | null;
  setSelectedClub: (club: Club | null) => void;
  clearSelectedClub: () => void;
}

export const useClubStore = create<ClubState>()(
  persist(
    (set) => ({
      selectedClub: null,
      setSelectedClub: (club) => set({ selectedClub: club }),
      clearSelectedClub: () => set({ selectedClub: null }),
    }),
    {
      name: "club-storage",
    }
  )
);
