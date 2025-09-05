import { AdminUserDto, DatabaseConfigDto, ShopInfoDto } from "@/api/type";
import { create } from "zustand";

type User = {
  username: string;
  email: string;
  role: "Admin" | "Employee";
  firstName: string;
  lastName: string | undefined;
};

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  getCurrentUser: () => User | null;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user: user }),
  getCurrentUser: () => get().user,
  clearUser: () => set({ user: null }),
}));
