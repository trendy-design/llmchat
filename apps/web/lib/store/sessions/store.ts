import { TSessionsState } from "@repo/shared/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const initialState = {
  activeSessionId: undefined,
};

export const createSessionsStore = () =>
  create<TSessionsState>()(
    devtools(
      persist(
        (set, get) => ({
          ...initialState,
          setActiveSessionId: (id: string) => set({ activeSessionId: id }),
        }),
        {
          name: "active-session",
        },
      ),
    ),
  );
