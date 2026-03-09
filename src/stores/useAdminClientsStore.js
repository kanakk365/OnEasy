import { create } from "zustand";

const useAdminClientsStore = create((set) => ({
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}));

export default useAdminClientsStore;
