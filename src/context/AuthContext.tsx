import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from '../firebase';
import { FirestoreService } from '../services/firestoreService';
import { StorageService, QA_PROFILES } from '../utils/storage';
import { QAUserProfile } from '../types/logs';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isCloudSynced: boolean;
  activeQAProfile: QAUserProfile | null;
  qaProfiles: QAUserProfile[];
  userVersion: number;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
  switchQAProfile: (profile: QAUserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isCloudSynced: false,
  activeQAProfile: null,
  qaProfiles: QA_PROFILES,
  userVersion: 0,
  loginWithGoogle: async () => {},
  logout: async () => {},
  syncLocalToCloud: async () => {},
  switchQAProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [activeQAProfile, setActiveQAProfile] = useState<QAUserProfile | null>(() => {
    return StorageService.getCurrentQAProfile();
  });
  const [userVersion, setUserVersion] = useState(0);

  const switchQAProfile = (profile: QAUserProfile | null) => {
    if (profile) {
      StorageService.switchUser(profile.uid);
      setActiveQAProfile(profile);
    } else {
      const uid = user ? user.uid : 'default';
      StorageService.setActiveUserId(uid);
      setActiveQAProfile(null);
    }
    setUserVersion((v) => v + 1);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!activeQAProfile) {
          StorageService.setActiveUserId(currentUser.uid);
        }
        try {
          await FirestoreService.saveUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });

          // Fetch cloud data and merge/populate
          const [cloudEnergy, cloudCbt, cloudTasks, cloudDumps, cloudFocus, cloudAchievements] = await Promise.all([
            FirestoreService.fetchEnergyLogs(currentUser.uid),
            FirestoreService.fetchCBTEntries(currentUser.uid),
            FirestoreService.fetchTasks(currentUser.uid),
            FirestoreService.fetchBrainDumps(currentUser.uid),
            FirestoreService.fetchFocusSessions(currentUser.uid),
            FirestoreService.fetchFocusAchievements(currentUser.uid),
          ]);

          if (cloudEnergy.length > 0) StorageService.saveEnergyLogs(cloudEnergy);
          if (cloudCbt.length > 0) StorageService.saveCBTEntries(cloudCbt);
          if (cloudTasks.length > 0) StorageService.saveTasks(cloudTasks);
          if (cloudDumps.length > 0) StorageService.saveBrainDump(cloudDumps);
          if (cloudFocus.length > 0) StorageService.saveFocusSessions(cloudFocus);
          if (cloudAchievements.length > 0) StorageService.saveFocusAchievements(cloudAchievements);

          setIsCloudSynced(true);
        } catch (e) {
          console.warn('Could not sync cloud data on login:', e);
        }
        setUserVersion((v) => v + 1);
      } else {
        StorageService.setActiveUserId('default');
        setIsCloudSynced(false);
        setUserVersion((v) => v + 1);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        StorageService.setActiveUserId(res.user.uid);
        setUserVersion((v) => v + 1);
        await syncLocalToCloudWithUser(res.user);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      // Popup blocked or canceled
      if (err?.code !== 'auth/popup-closed-by-user') {
        alert(`Google Sign-in failed: ${err?.message || 'Please check your connection.'}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    StorageService.setActiveUserId('default');
    setIsCloudSynced(false);
    setUserVersion((v) => v + 1);
  };

  const syncLocalToCloudWithUser = async (u: User) => {
    try {
      const localEnergy = StorageService.getEnergyLogs();
      const localCbt = StorageService.getCBTEntries();
      const localTasks = StorageService.getTasks();
      const localDumps = StorageService.getBrainDump();
      const localFocus = StorageService.getFocusSessions();
      const localAchievements = StorageService.getFocusAchievements();

      for (const item of localEnergy) {
        await FirestoreService.saveEnergyLog(u.uid, item);
      }
      for (const item of localCbt) {
        await FirestoreService.saveCBTEntry(u.uid, item);
      }
      await FirestoreService.saveTasks(u.uid, localTasks);
      for (const item of localDumps) {
        await FirestoreService.saveBrainDump(u.uid, item);
      }
      for (const item of localFocus) {
        await FirestoreService.saveFocusSession(u.uid, item);
      }
      if (localAchievements.length > 0) {
        await FirestoreService.saveFocusAchievements(u.uid, localAchievements);
      }

      setIsCloudSynced(true);
    } catch (e) {
      console.warn('Error syncing local data to cloud:', e);
    }
  };

  const syncLocalToCloud = async () => {
    if (user) {
      await syncLocalToCloudWithUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudSynced,
        activeQAProfile,
        qaProfiles: QA_PROFILES,
        userVersion,
        loginWithGoogle,
        logout,
        syncLocalToCloud,
        switchQAProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
