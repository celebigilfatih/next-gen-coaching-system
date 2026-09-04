import { create } from 'zustand';

interface Club {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

interface ClubState {
  selectedClub: Club | null;
  setSelectedClub: (club: Club | null) => void;
}

export const useClubStore = create<ClubState>((set) => ({
  selectedClub: null,
  setSelectedClub: (club) => set({ selectedClub: club }),
}));
