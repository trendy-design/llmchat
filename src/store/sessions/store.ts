import { TSessionsState } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  activeSessionId: undefined,
};

export const createSessionsStore = () =>
  create<TSessionsState>()(
    persist(
      (set, get) => ({
        ...initialState,
        setActiveSessionId: (id: string) => set({ activeSessionId: id }),
      }),
      {
        name: "active-session",
      },
    ),
  );
