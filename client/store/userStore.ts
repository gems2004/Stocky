import { CombinedSettingsDto } from "@/api/type";
import { create } from "zustand";

interface UserState {
  user: CombinedSettingsDto | null;
  setUser: (user: CombinedSettingsDto) => void;
  getCurrentUser: () => CombinedSettingsDto | null;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user: user }),
  getCurrentUser: () => get().user,
  clearUser: () => set({ user: null }),
}));
