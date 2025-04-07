import { create } from "zustand"

interface FinancialFunctionStore {
  isAddNewFinancialPeriod: boolean
  setIsAddNewFinancialPeriod: (value: boolean) => void
}

const useFinancialFunctionStore = create<FinancialFunctionStore>((set) => ({
  isAddNewFinancialPeriod: false,
  setIsAddNewFinancialPeriod: (value) =>
    set({ isAddNewFinancialPeriod: value }),
}))

export default useFinancialFunctionStore
