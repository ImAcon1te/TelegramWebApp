import {create} from "zustand/react";
import {RolesMap} from "../types/common.ts";
import { persist } from 'zustand/middleware';

type Store = {
  activeRole: RolesMap;
  setRole: (role: RolesMap) => void;
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      activeRole: RolesMap.CULTURE,
      setRole: (role) => set({ activeRole: role }),
    }),
    {
      name: 'app-storage', // ключ в localStorage
    }
  )
);