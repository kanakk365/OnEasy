import { create } from 'zustand';
import { AUTH_CONFIG } from '../config/auth';

const useLogoutModalStore = create((set) => ({
  showLogoutModal: false,
  setShowLogoutModal: (show) => set({ showLogoutModal: show }),
  openLogoutModal: () => set({ showLogoutModal: true }),
  closeLogoutModal: () => set({ showLogoutModal: false }),
  handleLogout: () => {
    // Clear authentication data
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem('selectedPackage');
    localStorage.removeItem('paymentDetails');
    localStorage.removeItem('oneasyTeamFill');
    
    // Close modal
    set({ showLogoutModal: false });
    
    // Redirect to login
    window.location.href = '/';
  },
}));

export default useLogoutModalStore;
