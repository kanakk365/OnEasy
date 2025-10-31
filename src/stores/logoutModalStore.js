import { create } from 'zustand';

const useLogoutModalStore = create((set) => ({
  showLogoutModal: false,
  setShowLogoutModal: (show) => set({ showLogoutModal: show }),
  openLogoutModal: () => set({ showLogoutModal: true }),
  closeLogoutModal: () => set({ showLogoutModal: false }),
  handleLogout: () => {
    window.location.href = '/';
  },
}));

export default useLogoutModalStore;
