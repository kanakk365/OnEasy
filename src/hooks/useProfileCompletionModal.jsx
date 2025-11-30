import { useState, useEffect } from 'react';
import { AUTH_CONFIG } from '../config/auth';
import apiClient from '../utils/api';
import SetEmailPasswordModal from '../components/common/SetEmailPasswordModal';

/**
 * Custom hook to show profile completion modal for users without email
 * Modal appears after 5 seconds delay when user reaches dashboard
 * 
 * File renamed from .js to .jsx to support JSX syntax
 */
export const useProfileCompletionModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('🚀 useProfileCompletionModal hook initialized and running');
    
    const checkAndShowModal = async () => {
      try {
        console.log('🔍 useProfileCompletionModal - Starting check...');
        
        // First, check localStorage for user data to see if email exists
        const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        let userFromStorage = null;
        
        if (storedUser) {
          try {
            userFromStorage = JSON.parse(storedUser);
            console.log('📦 User data from localStorage:', {
              id: userFromStorage?.id,
              email: userFromStorage?.email,
              phone: userFromStorage?.phone
            });
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }

        // Always check user data - don't rely solely on flag
        // If user from localStorage has no email, proceed with check
        if (userFromStorage) {
          const hasEmailFromStorage = userFromStorage?.email && 
                                     userFromStorage.email.trim() !== '' && 
                                     userFromStorage.email !== null && 
                                     userFromStorage.email !== undefined;
          
          if (hasEmailFromStorage) {
            console.log('✅ User already has email in localStorage, skipping modal check');
            localStorage.removeItem('should_check_email'); // Clear flag if exists
            setIsChecking(false);
            return;
          } else {
            console.log('⚠️ User in localStorage has no email, will check after 5 seconds');
            // Continue with check even if flag not set
          }
        } else {
          console.log('ℹ️ No user in localStorage, skipping modal check');
          setIsChecking(false);
          return;
        }

        // Check flag (optional - for debugging)
        const shouldCheck = localStorage.getItem('should_check_email');
        console.log('🏁 should_check_email flag:', shouldCheck);

        console.log('⏳ Waiting 5 seconds before checking email status...');
        
        // Wait 5 seconds before showing modal
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('🔍 5 seconds passed, fetching fresh user data from backend...');

        // Fetch fresh user data from backend
        const response = await apiClient.getMe();
        
        console.log('📥 getMe response:', {
          success: response?.success,
          hasData: !!response?.data,
          email: response?.data?.email,
          phone: response?.data?.phone
        });
        
        if (response && response.success && response.data) {
          const user = response.data;
          
          // Check if user has email
          const hasEmail = user?.email && 
                          user.email.trim() !== '' && 
                          user.email !== null && 
                          user.email !== undefined;

          // Check if user must change password (admin-created users)
          const mustChangePassword = user?.must_change_password === true;

          console.log('📊 Email check results:', {
            hasEmail,
            mustChangePassword,
            emailValue: user?.email,
            userId: user?.id,
            userPhone: user?.phone
          });

          // Only show modal if user doesn't have email and is not an admin-created user
          if (!hasEmail && !mustChangePassword) {
            console.log('✅ User missing email, showing profile completion modal after 5 seconds');
            setUserData(user);
            setShowModal(true);
            // Clear the flag so modal doesn't show again on page refresh
            localStorage.removeItem('should_check_email');
          } else {
            console.log('ℹ️ User has email or is admin-created, not showing modal');
            // User has email or is admin-created, clear the flag
            localStorage.removeItem('should_check_email');
          }
        } else {
          console.error('❌ Invalid response from getMe:', response);
          // Fallback: check localStorage user
          if (userFromStorage) {
            const hasEmailFromStorage = userFromStorage?.email && 
                                       userFromStorage.email.trim() !== '' && 
                                       userFromStorage.email !== null && 
                                       userFromStorage.email !== undefined;
            
            if (!hasEmailFromStorage) {
              console.log('⚠️ API failed but user in localStorage has no email, showing modal');
              setUserData(userFromStorage);
              setShowModal(true);
              localStorage.removeItem('should_check_email');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking user email status:', error);
        
        // Fallback: check localStorage if API fails
        const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        if (storedUser) {
          try {
            const userFromStorage = JSON.parse(storedUser);
            const hasEmailFromStorage = userFromStorage?.email && 
                                       userFromStorage.email.trim() !== '' && 
                                       userFromStorage.email !== null && 
                                       userFromStorage.email !== undefined;
            
            if (!hasEmailFromStorage) {
              console.log('⚠️ API error but user in localStorage has no email, showing modal');
              setUserData(userFromStorage);
              setShowModal(true);
            }
          } catch (e) {
            console.error('Error parsing stored user in error handler:', e);
          }
        }
        
        // Clear flag on error to prevent infinite checks
        localStorage.removeItem('should_check_email');
      } finally {
        setIsChecking(false);
      }
    };

    checkAndShowModal();
  }, []);

  const handleModalSuccess = (updatedUser) => {
    console.log('✅ Email and password set successfully from dashboard modal');
    setShowModal(false);
    
    // Dispatch event to notify sidebar and header to refresh
    window.dispatchEvent(new Event('profileUpdated'));
    console.log('📢 Dispatched profileUpdated event');
    
    // Clear the flag
    localStorage.removeItem('should_check_email');
  };

  const handleModalClose = () => {
    // Don't allow closing if required (user must complete profile)
    // But allow closing if user somehow has email now
    const shouldCheck = localStorage.getItem('should_check_email');
    if (!shouldCheck) {
      setShowModal(false);
    }
  };

  const ModalComponent = showModal ? (
    <SetEmailPasswordModal
      isOpen={showModal}
      onClose={handleModalClose}
      onSuccess={handleModalSuccess}
      required={true}
    />
  ) : null;

  return { ModalComponent, isChecking };
};

