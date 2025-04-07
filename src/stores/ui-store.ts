import { create } from "zustand"

interface UIStore {
  showSidebar: boolean
  setShowSidebar: (value: boolean) => void
  toggleSidebar: () => void
}

const useUIStore = create<UIStore>((set) => ({
  showSidebar: true,
  setShowSidebar: (value) => set({ showSidebar: value }),
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
}))

export default useUIStore
