import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { EnergyLog, CBTEntry, TaskItem, BrainDumpItem, FocusSession, HabitStreakRecord, FocusAchievement } from '../types/logs';

export const FirestoreService = {
  // Sync User Profile
  async saveUserProfile(user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }) {
    if (!user.uid) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      lastLoginAt: Date.now(),
    }, { merge: true });
  },

  // Energy Logs
  async fetchEnergyLogs(userId: string): Promise<EnergyLog[]> {
    try {
      const colRef = collection(db, 'users', userId, 'energyLogs');
      const q = query(colRef, orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as EnergyLog);
    } catch (e) {
      console.warn('Error fetching energy logs from Firestore:', e);
      return [];
    }
  },

  async saveEnergyLog(userId: string, log: EnergyLog) {
    const docRef = doc(db, 'users', userId, 'energyLogs', log.id);
    await setDoc(docRef, { ...log, userId }, { merge: true });
  },

  // CBT Entries
  async fetchCBTEntries(userId: string): Promise<CBTEntry[]> {
    try {
      const colRef = collection(db, 'users', userId, 'cbtEntries');
      const q = query(colRef, orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as CBTEntry);
    } catch (e) {
      console.warn('Error fetching CBT entries from Firestore:', e);
      return [];
    }
  },

  async saveCBTEntry(userId: string, entry: CBTEntry) {
    const docRef = doc(db, 'users', userId, 'cbtEntries', entry.id);
    await setDoc(docRef, { ...entry, userId }, { merge: true });
  },

  // Tasks
  async fetchTasks(userId: string): Promise<TaskItem[]> {
    try {
      const colRef = collection(db, 'users', userId, 'tasks');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as TaskItem);
    } catch (e) {
      console.warn('Error fetching tasks from Firestore:', e);
      return [];
    }
  },

  async saveTasks(userId: string, tasks: TaskItem[]) {
    for (const t of tasks) {
      const docRef = doc(db, 'users', userId, 'tasks', t.id);
      await setDoc(docRef, { ...t, userId }, { merge: true });
    }
  },

  async deleteTask(userId: string, taskId: string) {
    const docRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(docRef);
  },

  // Brain Dumps
  async fetchBrainDumps(userId: string): Promise<BrainDumpItem[]> {
    try {
      const colRef = collection(db, 'users', userId, 'brainDumps');
      const q = query(colRef, orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as BrainDumpItem);
    } catch (e) {
      console.warn('Error fetching brain dumps from Firestore:', e);
      return [];
    }
  },

  async saveBrainDump(userId: string, item: BrainDumpItem) {
    const docRef = doc(db, 'users', userId, 'brainDumps', item.id);
    await setDoc(docRef, { ...item, userId }, { merge: true });
  },

  async deleteBrainDump(userId: string, itemId: string) {
    const docRef = doc(db, 'users', userId, 'brainDumps', itemId);
    await deleteDoc(docRef);
  },

  // Focus Sessions
  async fetchFocusSessions(userId: string): Promise<FocusSession[]> {
    try {
      const colRef = collection(db, 'users', userId, 'focusSessions');
      const q = query(colRef, orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FocusSession);
    } catch (e) {
      console.warn('Error fetching focus sessions from Firestore:', e);
      return [];
    }
  },

  async saveFocusSession(userId: string, session: FocusSession) {
    const docRef = doc(db, 'users', userId, 'focusSessions', session.id);
    await setDoc(docRef, { ...session, userId }, { merge: true });
  },

  // Habit Streak Records
  async fetchHabitStreak(userId: string): Promise<HabitStreakRecord | null> {
    try {
      const docRef = doc(db, 'users', userId, 'habitStreak', 'summary');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as HabitStreakRecord;
      }
      return null;
    } catch (e) {
      console.warn('Error fetching habit streak from Firestore:', e);
      return null;
    }
  },

  async saveHabitStreak(userId: string, streak: HabitStreakRecord) {
    try {
      const docRef = doc(db, 'users', userId, 'habitStreak', 'summary');
      await setDoc(docRef, { ...streak, userId }, { merge: true });
    } catch (e) {
      console.warn('Error saving habit streak to Firestore:', e);
    }
  },

  // Focus Achievements (Badges for 90-min Ultradian blocks)
  async fetchFocusAchievements(userId: string): Promise<FocusAchievement[]> {
    try {
      const colRef = collection(db, 'users', userId, 'focusAchievements');
      const q = query(colRef, orderBy('earnedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FocusAchievement);
    } catch (e) {
      console.warn('Error fetching focus achievements from Firestore:', e);
      return [];
    }
  },

  async saveFocusAchievement(userId: string, achievement: FocusAchievement) {
    try {
      const docRef = doc(db, 'users', userId, 'focusAchievements', achievement.id);
      await setDoc(docRef, { ...achievement, userId }, { merge: true });
    } catch (e) {
      console.warn('Error saving focus achievement to Firestore:', e);
    }
  },

  async saveFocusAchievements(userId: string, achievements: FocusAchievement[]) {
    try {
      for (const ach of achievements) {
        const docRef = doc(db, 'users', userId, 'focusAchievements', ach.id);
        await setDoc(docRef, { ...ach, userId }, { merge: true });
      }
    } catch (e) {
      console.warn('Error bulk saving focus achievements to Firestore:', e);
    }
  },

  // Diagnostics & QA Isolation Tests
  async checkFirestoreHealth(): Promise<{
    connected: boolean;
    databaseId: string;
    projectId: string;
    latencyMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      await getDoc(doc(db, 'system', 'health-check'));
      return {
        connected: true,
        databaseId: 'ai-studio-mindflow-ad6999cb-ee98-4a12-aa65-4524b92d4eda',
        projectId: 'arboreal-acrobat-tct7q',
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const isReachable = err?.code === 'permission-denied' || !err?.message?.includes('the client is offline');
      return {
        connected: isReachable,
        databaseId: 'ai-studio-mindflow-ad6999cb-ee98-4a12-aa65-4524b92d4eda',
        projectId: 'arboreal-acrobat-tct7q',
        latencyMs: Date.now() - startTime,
        error: isReachable ? undefined : err?.message,
      };
    }
  },
};
