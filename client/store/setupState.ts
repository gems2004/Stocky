import { DatabaseConfigDto, SetupStatusDto, ShopInfoDto } from "@/(api)/type";
import { create } from "zustand";

type Admin = {
  username: string;
  email: string;
  firstName: string;
  lastName: string | undefined;
};

interface SetupStore {
  shopInfo: ShopInfoDto | null;
  databaseConfig: DatabaseConfigDto | null;
  user: Admin | null;
  setShopInfo: (shopInfo: ShopInfoDto) => void;
  setDatabaseConfig: (databaseConfig: DatabaseConfigDto) => void;
  setUser: (user: Admin) => void;

  setupStatus: SetupStatusDto;
  setSetupStatus: (status: SetupStatusDto) => void;
}

export const useSetupStore = create<SetupStore>((set) => ({
  shopInfo: null,
  databaseConfig: null,
  user: null,
  setShopInfo: (shopInfo) => set({ shopInfo: shopInfo }),
  setDatabaseConfig: (databaseConfig) =>
    set({ databaseConfig: databaseConfig }),
  setUser: (user) => set({ user: user }),
  clearUser: () => set({ user: null }),

  setupStatus: {
    isAdminUserCreated: false,
    isDatabaseConfigured: false,
    isShopInfoSet: false,
    isSetupComplete: false,
  },
  setSetupStatus: (status) => set({ setupStatus: status }),
}));
