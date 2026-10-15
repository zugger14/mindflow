import { 
  EnergyLog, 
  CBTEntry, 
  TaskItem, 
  BrainDumpItem, 
  FocusSession, 
  PsychologicalAnalysisResult, 
  DayArchiveSnapshot,
  DayHabitStatus,
  StreakMilestone,
  HabitStreakRecord,
  FocusAchievement,
  QAUserProfile
} from '../types/logs';

const STORAGE_KEYS = {
  ENERGY_LOGS: 'mindflow_energy_logs',
  CBT_ENTRIES: 'mindflow_cbt_entries',
  TASKS: 'mindflow_tasks',
  BRAIN_DUMP: 'mindflow_brain_dump',
  FOCUS_SESSIONS: 'mindflow_focus_sessions',
  SAVED_ANALYSIS: 'mindflow_saved_analysis',
  DATE_ANALYSES: 'mindflow_date_analyses',
  FOCUS_ACHIEVEMENTS: 'mindflow_focus_achievements',
  ACTIVE_QA_USER: 'mindflow_active_qa_user',
};

// In-memory fallback for Node.js test runs and server environments
const memoryStore = new Map<string, string>();
let currentActiveUserId = 'default';

export function setActiveUserId(uid: string): void {
  currentActiveUserId = uid || 'default';
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_QA_USER, currentActiveUserId);
    } catch {
      // ignore
    }
  }
}

export function getActiveUserId(): string {
  if (currentActiveUserId !== 'default') return currentActiveUserId;
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_QA_USER);
      if (saved) {
        currentActiveUserId = saved;
        return saved;
      }
    } catch {
      // ignore
    }
  }
  return currentActiveUserId;
}

function resolveKey(baseKey: string): string {
  const uid = getActiveUserId();
  if (!uid || uid === 'default') {
    return baseKey;
  }
  return `${baseKey}__${uid}`;
}

// Helper to format YYYY-MM-DD
export function getDayOffsetDateStr(offsetDaysAgo: number): string {
  const d = new Date(Date.now() - offsetDaysAgo * 86400000);
  return d.toISOString().split('T')[0];
}

export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDateToHuman(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const today = getTodayDateStr();
  const yesterday = getDayOffsetDateStr(1);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Generate realistic starter 7-day history
export const DEFAULT_ENERGY_LOGS: EnergyLog[] = [
  // Earlier in the 30-day window
  {
    id: 'e-27',
    date: getDayOffsetDateStr(27),
    timestamp: Date.now() - 27 * 86400000,
    emotion: 55,
    energy: 50,
    note: 'Initial trial of MindFlow daily tracking.',
  },
  {
    id: 'e-26',
    date: getDayOffsetDateStr(26),
    timestamp: Date.now() - 26 * 86400000,
    emotion: 60,
    energy: 58,
    note: 'Great morning start, steady afternoon focus.',
  },
  {
    id: 'e-25',
    date: getDayOffsetDateStr(25),
    timestamp: Date.now() - 25 * 86400000,
    emotion: 52,
    energy: 62,
    note: 'Pushed through afternoon dip with outdoor walk.',
  },
  {
    id: 'e-22',
    date: getDayOffsetDateStr(22),
    timestamp: Date.now() - 22 * 86400000,
    emotion: 64,
    energy: 70,
    note: 'Deep work block executed cleanly.',
  },
  {
    id: 'e-21',
    date: getDayOffsetDateStr(21),
    timestamp: Date.now() - 21 * 86400000,
    emotion: 70,
    energy: 65,
    note: 'Hit 21-day threshold awareness. Feeling more centered.',
  },
  {
    id: 'e-20',
    date: getDayOffsetDateStr(20),
    timestamp: Date.now() - 20 * 86400000,
    emotion: 62,
    energy: 60,
    note: 'Structured breaks helped prevent evening slump.',
  },
  {
    id: 'e-18',
    date: getDayOffsetDateStr(18),
    timestamp: Date.now() - 18 * 86400000,
    emotion: 48,
    energy: 45,
    note: 'High email volume caused mental churn.',
  },
  {
    id: 'e-17',
    date: getDayOffsetDateStr(17),
    timestamp: Date.now() - 17 * 86400000,
    emotion: 58,
    energy: 62,
    note: 'Regained control after morning breathing exercises.',
  },
  {
    id: 'e-15',
    date: getDayOffsetDateStr(15),
    timestamp: Date.now() - 15 * 86400000,
    emotion: 66,
    energy: 68,
    note: 'Ultradian 90/20 rhythm felt very natural today.',
  },
  {
    id: 'e-14',
    date: getDayOffsetDateStr(14),
    timestamp: Date.now() - 14 * 86400000,
    emotion: 60,
    energy: 55,
    note: 'Two weeks milestone reflection. Solid progress.',
  },
  {
    id: 'e-11',
    date: getDayOffsetDateStr(11),
    timestamp: Date.now() - 11 * 86400000,
    emotion: 54,
    energy: 58,
    note: 'Moderate pacing maintained throughout client meetings.',
  },
  {
    id: 'e-10',
    date: getDayOffsetDateStr(10),
    timestamp: Date.now() - 10 * 86400000,
    emotion: 68,
    energy: 72,
    note: 'Excellent flow state during morning code review.',
  },
  {
    id: 'e-9',
    date: getDayOffsetDateStr(9),
    timestamp: Date.now() - 9 * 86400000,
    emotion: 50,
    energy: 48,
    note: 'Slight fatigue; rested intentionally in evening.',
  },
  {
    id: 'e-8',
    date: getDayOffsetDateStr(8),
    timestamp: Date.now() - 8 * 86400000,
    emotion: 62,
    energy: 65,
    note: 'Back on track with regular check-ins.',
  },
  // Recent 7-day active streak
  {
    id: 'e-7',
    date: getDayOffsetDateStr(6),
    timestamp: Date.now() - 6 * 86400000,
    emotion: 58,
    energy: 52,
    note: 'Week planning session. Calm initial momentum.',
  },
  {
    id: 'e-6',
    date: getDayOffsetDateStr(5),
    timestamp: Date.now() - 5 * 86400000,
    emotion: 68,
    energy: 62,
    note: 'Completed 2 major tasks before lunch. Strong mood and focus.',
  },
  {
    id: 'e-5',
    date: getDayOffsetDateStr(4),
    timestamp: Date.now() - 4 * 86400000,
    emotion: 62,
    energy: 56,
    note: 'Moderate pacing, slight neck tension in late afternoon.',
  },
  {
    id: 'e-4',
    date: getDayOffsetDateStr(3),
    timestamp: Date.now() - 3 * 86400000,
    emotion: 42,
    energy: 38,
    note: 'Context switching and 3 meetings in a row. Energy dropped sharply.',
  },
  {
    id: 'e-3',
    date: getDayOffsetDateStr(2),
    timestamp: Date.now() - 2 * 86400000,
    emotion: 50,
    energy: 68,
    note: 'High energy post-walk, but backlog anxiety suppressed mood.',
  },
  {
    id: 'e-2',
    date: getDayOffsetDateStr(1),
    timestamp: Date.now() - 1 * 86400000,
    emotion: 38,
    energy: 44,
    note: 'Felt guilty for taking a longer break. Evening fatigue.',
  },
  {
    id: 'e-1',
    date: getDayOffsetDateStr(0),
    timestamp: Date.now(),
    emotion: 65,
    energy: 60,
    note: 'Box breathing and cognitive reframing stabilized afternoon state.',
  },
];

export const DEFAULT_CBT_ENTRIES: CBTEntry[] = [
  {
    id: 'cbt-1',
    date: getDayOffsetDateStr(3),
    timestamp: Date.now() - 3 * 86400000,
    stressor: 'I am falling behind on deliverables and letting the team down.',
    distortions: ['Catastrophizing', 'All-or-Nothing Thinking'],
    reframe: 'A delayed deliverable does not equate to total failure. Communicating early keeps expectations realistic.',
  },
  {
    id: 'cbt-2',
    date: getDayOffsetDateStr(1),
    timestamp: Date.now() - 1 * 86400000,
    stressor: 'I should be able to finish all three complex tasks without feeling tired.',
    distortions: ['"Should" Statements', 'Personalization'],
    reframe: 'Fatigue is a biological signal of human energy limits, not personal incompetence. Rest is a productivity requirement.',
  },
];

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Complete architecture blueprint for team sync',
    completed: true,
    completedAt: Date.now() - 5 * 86400000,
    date: getDayOffsetDateStr(5),
    createdAt: Date.now() - 5 * 86400000,
    steps: [
      { id: 's-1', text: 'Outline user pain points', completed: true },
      { id: 's-2', text: 'Draft system diagram', completed: true },
    ],
    isExpanded: false,
  },
  {
    id: 't-2',
    title: 'Review quarterly client feedback and highlight key themes',
    completed: true,
    completedAt: Date.now() - 4 * 86400000,
    date: getDayOffsetDateStr(4),
    createdAt: Date.now() - 4 * 86400000,
    steps: [
      { id: 's-3', text: 'Categorize top 5 recurring requests', completed: true },
      { id: 's-4', text: 'Draft 3 summary bullet points', completed: true },
    ],
    isExpanded: false,
  },
  {
    id: 't-3',
    title: 'Consolidate performance metrics into clean summary deck',
    completed: true,
    completedAt: Date.now() - 2 * 86400000,
    date: getDayOffsetDateStr(2),
    createdAt: Date.now() - 2 * 86400000,
    steps: [
      { id: 's-5', text: 'Extract charts', completed: true },
    ],
    isExpanded: false,
  },
  {
    id: 't-4',
    title: 'Unplug for 45 minutes of mindful nature walking',
    completed: true,
    completedAt: Date.now(),
    date: getDayOffsetDateStr(0),
    createdAt: Date.now(),
    steps: [
      { id: 's-6', text: 'Leave phone on do-not-disturb', completed: true },
    ],
    isExpanded: false,
  },
  {
    id: 't-5',
    title: 'Refactor core state synchronization module',
    completed: false,
    date: getDayOffsetDateStr(0),
    createdAt: Date.now(),
    steps: [
      { id: 's-7', text: 'Verify reactivity hooks', completed: false },
    ],
    isExpanded: true,
  },
];

export const DEFAULT_BRAIN_DUMP: BrainDumpItem[] = [
  {
    id: 'b-1',
    text: 'Need to remember to email Dr. Chen about test results before Friday',
    timestamp: Date.now() - 3 * 86400000,
    date: getDayOffsetDateStr(3),
  },
  {
    id: 'b-2',
    text: 'Check if grocery order was processed',
    timestamp: Date.now() - 2 * 86400000,
    date: getDayOffsetDateStr(2),
  },
  {
    id: 'b-3',
    text: 'Am I preparing enough for upcoming portfolio review?',
    timestamp: Date.now() - 14400000,
    date: getDayOffsetDateStr(0),
  },
];

export const DEFAULT_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'fs-1',
    type: 'focus',
    durationMinutes: 90,
    timestamp: Date.now() - 5 * 86400000,
    date: getDayOffsetDateStr(5),
  },
  {
    id: 'fs-2',
    type: 'break',
    durationMinutes: 20,
    timestamp: Date.now() - 5 * 86400000 + 5400000,
    date: getDayOffsetDateStr(5),
  },
  {
    id: 'fs-3',
    type: 'focus',
    durationMinutes: 90,
    timestamp: Date.now() - 2 * 86400000,
    date: getDayOffsetDateStr(2),
  },
  {
    id: 'fs-4',
    type: 'focus',
    durationMinutes: 90,
    timestamp: Date.now() - 86400000,
    date: getDayOffsetDateStr(1),
  },
  {
    id: 'fs-5',
    type: 'focus',
    durationMinutes: 90,
    timestamp: Date.now(),
    date: getDayOffsetDateStr(0),
  },
];

export interface BadgeTemplate {
  badgeId: string;
  badgeName: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'emerald' | 'mythic';
  neuroInsight: string;
}

export const FOCUS_BADGE_CATALOGUE: BadgeTemplate[] = [
  {
    badgeId: 'deep_work_guru',
    badgeName: 'Deep Work Guru',
    title: 'Deep Work Guru',
    description: 'Mastered an unbroken 90-minute Ultradian cycle of focused intellectual immersion.',
    category: 'Ultradian Mastery',
    icon: 'Crown',
    rarity: 'gold',
    neuroInsight: 'Your prefrontal cortex achieved sustained gamma-band synchronization, resisting cognitive fragmentation and entering pure flow.',
  },
  {
    badgeId: 'flow_state_artisan',
    badgeName: 'Flow State Artisan',
    title: 'Flow State Artisan',
    description: 'Completed 2 deep work blocks in a single circadian cycle.',
    category: 'Sustained Depth',
    icon: 'Zap',
    rarity: 'silver',
    neuroInsight: 'Dual ultradian intervals consolidate memory engrams and thicken attentional neural pathways.',
  },
  {
    badgeId: 'ultradian_initiate',
    badgeName: 'Ultradian Initiate',
    title: 'Ultradian Initiate',
    description: "Synchronized with Kleitman's Basic Rest-Activity Cycle (BRAC) for optimal 90m focus.",
    category: 'Bio-Rhythm',
    icon: 'Brain',
    rarity: 'bronze',
    neuroInsight: 'Attuning intellectual demands to 90-minute biological rhythms prevents adrenal burnout and cognitive depletion.',
  },
  {
    badgeId: 'cognitive_marathoner',
    badgeName: 'Cognitive Marathoner',
    title: 'Cognitive Marathoner',
    description: 'Achieved 3 or more 90-minute deep work cycles in a day (270+ min of focus).',
    category: 'Elite Focus',
    icon: 'Award',
    rarity: 'emerald',
    neuroInsight: 'Exceptional executive stamina. Paced with restorative intervals to preserve dopaminergic tone.',
  },
  {
    badgeId: 'zen_focus_alchemist',
    badgeName: 'Zen Focus Alchemist',
    title: 'Zen Focus Alchemist',
    description: 'Maintained uninterrupted calm flow amidst daily cognitive noise.',
    category: 'Equilibrium',
    icon: 'Sparkles',
    rarity: 'mythic',
    neuroInsight: 'High theta-alpha coherence indicating effortless concentration without sympathetic distress.',
  },
  {
    badgeId: 'neural_harmony',
    badgeName: 'Neural Harmony',
    title: 'Neural Harmony',
    description: 'Honored the biological transition from 90m deep work to restorative neurological recharge.',
    category: 'Restorative Mastery',
    icon: 'Coffee',
    rarity: 'silver',
    neuroInsight: 'The 20-minute restorative break clears adenosine buildup and reloads prefrontal neurotransmitters.',
  },
];

export const DEFAULT_FOCUS_ACHIEVEMENTS: FocusAchievement[] = [
  {
    id: 'ach-starter-guru',
    badgeId: 'deep_work_guru',
    badgeName: 'Deep Work Guru',
    title: 'Deep Work Guru',
    description: 'Mastered an unbroken 90-minute Ultradian cycle of focused intellectual immersion.',
    category: 'Ultradian Mastery',
    icon: 'Crown',
    rarity: 'gold',
    earnedAt: Date.now() - 86400000,
    completedBlocksCount: 1,
    neuroInsight: 'Your prefrontal cortex achieved sustained gamma-band synchronization, resisting cognitive fragmentation and entering pure flow.',
  },
  {
    id: 'ach-starter-initiate',
    badgeId: 'ultradian_initiate',
    badgeName: 'Ultradian Initiate',
    title: 'Ultradian Initiate',
    description: "Synchronized with Kleitman's Basic Rest-Activity Cycle (BRAC) for optimal 90m focus.",
    category: 'Bio-Rhythm',
    icon: 'Brain',
    rarity: 'bronze',
    earnedAt: Date.now() - 2 * 86400000,
    completedBlocksCount: 2,
    neuroInsight: 'Attuning intellectual demands to 90-minute biological rhythms prevents adrenal burnout and cognitive depletion.',
  },
];

export function clearUnauthenticatedData(): void {
  if (typeof localStorage !== 'undefined') {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => {
        localStorage.removeItem(k);
        localStorage.removeItem(`mindflow_${k}_default`);
      });
    } catch {
      // ignore
    }
  }
  // Clear default keys in memoryStore as well
  Object.values(STORAGE_KEYS).forEach((k) => {
    memoryStore.delete(k);
    memoryStore.delete(`mindflow_${k}_default`);
  });
}

export function resetAllLocalData(): void {
  if (typeof localStorage !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('mindflow') || key.includes('mindflow'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore
    }
  }
  memoryStore.clear();
  currentActiveUserId = 'default';
}

export function getStoredData<T>(key: string, fallback: T): T {
  const resolved = resolveKey(key);
  
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(resolved);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }

  const mem = memoryStore.get(resolved);
  if (mem) {
    try {
      return JSON.parse(mem);
    } catch {
      // fallback
    }
  }
  return fallback;
}

export function setStoredData<T>(key: string, data: T): void {
  const resolved = resolveKey(key);
  const serialized = JSON.stringify(data);
  
  // In-memory update for current session
  memoryStore.set(resolved, serialized);

  // Persist to browser localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(resolved, serialized);
    }
  } catch (e) {
    // ignore
  }
}

export const StorageService = {
  getEnergyLogs: (): EnergyLog[] => getStoredData(STORAGE_KEYS.ENERGY_LOGS, []),
  saveEnergyLogs: (logs: EnergyLog[]) => setStoredData(STORAGE_KEYS.ENERGY_LOGS, logs),

  getCBTEntries: (): CBTEntry[] => getStoredData(STORAGE_KEYS.CBT_ENTRIES, []),
  saveCBTEntries: (entries: CBTEntry[]) => setStoredData(STORAGE_KEYS.CBT_ENTRIES, entries),

  getTasks: (): TaskItem[] => getStoredData(STORAGE_KEYS.TASKS, []),
  saveTasks: (tasks: TaskItem[]) => setStoredData(STORAGE_KEYS.TASKS, tasks),

  getBrainDump: (): BrainDumpItem[] => getStoredData(STORAGE_KEYS.BRAIN_DUMP, []),
  saveBrainDump: (items: BrainDumpItem[]) => setStoredData(STORAGE_KEYS.BRAIN_DUMP, items),

  getFocusSessions: (): FocusSession[] => getStoredData(STORAGE_KEYS.FOCUS_SESSIONS, []),
  saveFocusSessions: (sessions: FocusSession[]) => setStoredData(STORAGE_KEYS.FOCUS_SESSIONS, sessions),

  // Focus Achievements (Badges for 90-min Ultradian blocks)
  getFocusAchievements: (): FocusAchievement[] => getStoredData(STORAGE_KEYS.FOCUS_ACHIEVEMENTS, []),
  saveFocusAchievements: (badges: FocusAchievement[]) => setStoredData(STORAGE_KEYS.FOCUS_ACHIEVEMENTS, badges),

  // Award an achievement upon completing a 90-minute Ultradian focus block
  awardFocusAchievementOnBlockCompletion: (totalCompletedBlocksToday: number): { achievement: FocusAchievement; isNewBadge: boolean } => {
    const existing = StorageService.getFocusAchievements();
    const existingBadgeIds = new Set(existing.map((b) => b.badgeId));

    // Determine candidate badge
    let selectedTemplate: BadgeTemplate;

    if (!existingBadgeIds.has('deep_work_guru')) {
      selectedTemplate = FOCUS_BADGE_CATALOGUE[0]; // 'Deep Work Guru'
    } else if (totalCompletedBlocksToday >= 3 && !existingBadgeIds.has('cognitive_marathoner')) {
      selectedTemplate = FOCUS_BADGE_CATALOGUE.find((b) => b.badgeId === 'cognitive_marathoner') || FOCUS_BADGE_CATALOGUE[0];
    } else if (totalCompletedBlocksToday >= 2 && !existingBadgeIds.has('flow_state_artisan')) {
      selectedTemplate = FOCUS_BADGE_CATALOGUE.find((b) => b.badgeId === 'flow_state_artisan') || FOCUS_BADGE_CATALOGUE[0];
    } else if (!existingBadgeIds.has('zen_focus_alchemist')) {
      selectedTemplate = FOCUS_BADGE_CATALOGUE.find((b) => b.badgeId === 'zen_focus_alchemist') || FOCUS_BADGE_CATALOGUE[0];
    } else if (!existingBadgeIds.has('neural_harmony')) {
      selectedTemplate = FOCUS_BADGE_CATALOGUE.find((b) => b.badgeId === 'neural_harmony') || FOCUS_BADGE_CATALOGUE[0];
    } else if (!existingBadgeIds.has('ultradian_initiate')) {
      selectedTemplate = FOCUS_BADGE_CATALOGUE.find((b) => b.badgeId === 'ultradian_initiate') || FOCUS_BADGE_CATALOGUE[0];
    } else {
      // Leveled up Deep Work Guru
      const guruCount = existing.filter((b) => b.badgeId.startsWith('deep_work_guru')).length + 1;
      selectedTemplate = {
        badgeId: `deep_work_guru_tier_${guruCount}`,
        badgeName: `Deep Work Guru • Tier ${guruCount}`,
        title: `Deep Work Guru (Tier ${guruCount})`,
        description: `Completed ${totalCompletedBlocksToday} Ultradian blocks today with unbroken mastery.`,
        category: 'Ultradian Mastery',
        icon: 'Crown',
        rarity: 'mythic',
        neuroInsight: 'Master-level cognitive stamina. Your brain effortlessly sustains high-order problem solving in flow.',
      };
    }

    const isNew = !existingBadgeIds.has(selectedTemplate.badgeId);
    const newAchievement: FocusAchievement = {
      id: `ach-${Date.now()}`,
      badgeId: selectedTemplate.badgeId,
      badgeName: selectedTemplate.badgeName,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      category: selectedTemplate.category,
      icon: selectedTemplate.icon,
      rarity: selectedTemplate.rarity,
      earnedAt: Date.now(),
      completedBlocksCount: totalCompletedBlocksToday,
      neuroInsight: selectedTemplate.neuroInsight,
      isNewUnlock: isNew,
    };

    const updated = [newAchievement, ...existing];
    StorageService.saveFocusAchievements(updated);
    return { achievement: newAchievement, isNewBadge: isNew };
  },

  getSavedAnalysis: (): PsychologicalAnalysisResult | null => getStoredData(STORAGE_KEYS.SAVED_ANALYSIS, null),
  saveAnalysis: (analysis: PsychologicalAnalysisResult) => setStoredData(STORAGE_KEYS.SAVED_ANALYSIS, analysis),

  // Date-specific saved analyses
  getDateAnalyses: (): Record<string, PsychologicalAnalysisResult> => getStoredData(STORAGE_KEYS.DATE_ANALYSES, {}),
  saveDateAnalysis: (dateStr: string, analysis: PsychologicalAnalysisResult) => {
    const all = StorageService.getDateAnalyses();
    all[dateStr] = analysis;
    setStoredData(STORAGE_KEYS.DATE_ANALYSES, all);
  },

  // Compile day snapshot for historical viewing
  getDaySnapshot: (dateStr: string): DayArchiveSnapshot => {
    const energyLogs = StorageService.getEnergyLogs();
    const cbtEntries = StorageService.getCBTEntries();
    const tasks = StorageService.getTasks();
    const brainDumps = StorageService.getBrainDump();
    const focusSessions = StorageService.getFocusSessions();
    const dateAnalyses = StorageService.getDateAnalyses();

    const energyLog = energyLogs.find((l) => l.date === dateStr);
    const dayCbt = cbtEntries.filter((c) => c.date === dateStr);
    
    // Tasks either created on this date or completed on this date
    const dayTasks = tasks.filter((t) => {
      const taskCreatedDate = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : t.date;
      const taskCompletedDate = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : null;
      return t.date === dateStr || taskCreatedDate === dateStr || taskCompletedDate === dateStr;
    });

    const dayCompletedTasks = dayTasks.filter((t) => t.completed);

    const dayDumps = brainDumps.filter((b) => {
      const bDate = b.date || new Date(b.timestamp).toISOString().split('T')[0];
      return bDate === dateStr;
    });

    const dayFocus = focusSessions.filter((f) => {
      const fDate = f.date || new Date(f.timestamp).toISOString().split('T')[0];
      return fDate === dateStr;
    });

    return {
      dateStr,
      formattedDate: formatDateToHuman(dateStr),
      displayDay: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
      energyLog,
      cbtEntries: dayCbt,
      tasks: dayTasks,
      completedTasks: dayCompletedTasks,
      brainDumps: dayDumps,
      focusSessions: dayFocus,
      analysis: dateAnalyses[dateStr],
    };
  },

  // Get list of all distinct dates with logs recorded
  getAllHistoryDates: (): string[] => {
    const datesSet = new Set<string>();
    const energyLogs = StorageService.getEnergyLogs();
    const cbtEntries = StorageService.getCBTEntries();
    const tasks = StorageService.getTasks();
    const focus = StorageService.getFocusSessions();

    energyLogs.forEach((l) => datesSet.add(l.date));
    cbtEntries.forEach((c) => datesSet.add(c.date));
    tasks.forEach((t) => {
      if (t.date) datesSet.add(t.date);
      if (t.completedAt) datesSet.add(new Date(t.completedAt).toISOString().split('T')[0]);
    });
    focus.forEach((f) => {
      const fDate = f.date || new Date(f.timestamp).toISOString().split('T')[0];
      datesSet.add(fDate);
    });

    // Always ensure today is present
    datesSet.add(getTodayDateStr());

    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  },

  // 30-Day Consistency Habit Status for each individual day
  get30DayHabitStatus: (): DayHabitStatus[] => {
    const energyLogs = StorageService.getEnergyLogs();
    const cbtEntries = StorageService.getCBTEntries();
    const tasks = StorageService.getTasks();
    const brainDumps = StorageService.getBrainDump();
    const focusSessions = StorageService.getFocusSessions();

    const days: DayHabitStatus[] = [];

    // 30 days from 29 days ago up to day 0 (today)
    for (let offset = 29; offset >= 0; offset--) {
      const date = getDayOffsetDateStr(offset);
      const [y, m, d] = date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = formatDateToHuman(date);

      const hasEnergy = energyLogs.some((l) => l.date === date);
      const dayCbt = cbtEntries.filter((c) => c.date === date).length;
      
      const dayTasksCompleted = tasks.filter((t) => {
        const taskCompletedDate = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : null;
        return t.completed && (taskCompletedDate === date || t.date === date);
      }).length;

      const dayFocusMinutes = focusSessions
        .filter((f) => {
          const fDate = f.date || new Date(f.timestamp).toISOString().split('T')[0];
          return fDate === date && f.type === 'focus';
        })
        .reduce((sum, f) => sum + (f.durationMinutes || 0), 0);

      const dayBrainDumps = brainDumps.filter((b) => {
        const bDate = b.date || new Date(b.timestamp).toISOString().split('T')[0];
        return bDate === date;
      }).length;

      const totalActions = (hasEnergy ? 1 : 0) + dayCbt + dayTasksCompleted + (dayFocusMinutes > 0 ? 1 : 0) + dayBrainDumps;
      const isActive = totalActions > 0;

      // Completion score 0-100 based on core habit targets:
      let score = 0;
      if (hasEnergy) score += 30;
      if (dayCbt > 0) score += 25;
      if (dayTasksCompleted > 0) score += 25;
      if (dayFocusMinutes > 0) score += 20;
      if (score === 0 && dayBrainDumps > 0) score = 20;
      score = Math.min(score, 100);

      days.push({
        date,
        dayOffset: offset,
        formattedDate,
        dayOfWeek,
        energyLogged: hasEnergy,
        cbtCount: dayCbt,
        tasksCompleted: dayTasksCompleted,
        focusMinutes: dayFocusMinutes,
        brainDumpCount: dayBrainDumps,
        totalActions,
        isActive,
        completionScore: score,
      });
    }

    return days;
  },

  // Compute 30-Day Streak Statistics and Progress
  calculateHabitStreakStats: (): HabitStreakRecord => {
    const days30 = StorageService.get30DayHabitStatus();
    const dayMap = new Map<number, DayHabitStatus>();
    days30.forEach((d) => dayMap.set(d.dayOffset, d));

    const todayStatus = dayMap.get(0);
    const yesterdayStatus = dayMap.get(1);

    // Calculate current streak
    let currentStreak = 0;
    let startOffset = 0;
    
    if (todayStatus?.isActive) {
      startOffset = 0;
    } else if (yesterdayStatus?.isActive) {
      // Today not logged yet, but yesterday was active => current streak is still intact
      startOffset = 1;
    } else {
      startOffset = -1;
    }

    if (startOffset >= 0) {
      for (let offset = startOffset; offset < 30; offset++) {
        const d = dayMap.get(offset);
        if (d?.isActive) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Longest streak in the 30-day window
    let longestStreak = 0;
    let tempStreak = 0;
    for (let offset = 29; offset >= 0; offset--) {
      const d = dayMap.get(offset);
      if (d?.isActive) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    const activeDaysLast30 = days30.filter((d) => d.isActive).length;
    const totalActionsCount = days30.reduce((acc, d) => acc + d.totalActions, 0);
    const consistencyRate = Math.round((activeDaysLast30 / 30) * 100);

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      activeDaysLast30,
      consistencyRate,
      totalActionsCount,
      updatedAt: Date.now(),
    };
  },

  getStreakMilestones: (currentStreak: number): StreakMilestone[] => {
    return [
      {
        id: 'milestone-3',
        days: 3,
        title: 'Ignition Spark',
        badgeName: '3-Day Spark',
        iconName: 'Flame',
        unlocked: currentStreak >= 3,
        description: 'Completed 3 consecutive days of mindful check-ins.',
        psychologicalInsight: 'Initial dopamine baseline engaged. Breaking initial inertia barrier.',
      },
      {
        id: 'milestone-7',
        days: 7,
        title: 'Neural Rewiring',
        badgeName: '7-Day Rhythm',
        iconName: 'Zap',
        unlocked: currentStreak >= 7,
        description: 'Maintained 7 full days of emotional and focus tracking.',
        psychologicalInsight: 'Synaptic connections strengthening. Self-monitoring transitions into a conscious daily rhythm.',
      },
      {
        id: 'milestone-14',
        days: 14,
        title: 'Cognitive Adaptation',
        badgeName: '14-Day Equilibrium',
        iconName: 'ShieldCheck',
        unlocked: currentStreak >= 14,
        description: 'Two full weeks of continuous ultradian alignment & CBT reframing.',
        psychologicalInsight: 'Cognitive resistance diminishes by over 40% as distress-tolerance skills take hold.',
      },
      {
        id: 'milestone-21',
        days: 21,
        title: 'Automaticity Threshold',
        badgeName: '21-Day Habit',
        iconName: 'Sparkles',
        unlocked: currentStreak >= 21,
        description: 'Reaching the classical neurobiological threshold for habit consolidation.',
        psychologicalInsight: 'Behavioral friction is now minimized; emotional self-regulation is reflexive.',
      },
      {
        id: 'milestone-30',
        days: 30,
        title: 'Mindflow Mastery',
        badgeName: '30-Day Master',
        iconName: 'Crown',
        unlocked: currentStreak >= 30,
        description: 'Flawless 30-day streak of sustainable, burnout-free productivity.',
        psychologicalInsight: 'Total bio-rhythmic integration achieved. Maximum resilience against cognitive fatigue.',
      },
    ];
  },

  resetToDefaultLogs: () => {
    setStoredData(STORAGE_KEYS.ENERGY_LOGS, DEFAULT_ENERGY_LOGS);
    setStoredData(STORAGE_KEYS.CBT_ENTRIES, DEFAULT_CBT_ENTRIES);
    setStoredData(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    setStoredData(STORAGE_KEYS.BRAIN_DUMP, DEFAULT_BRAIN_DUMP);
    setStoredData(STORAGE_KEYS.FOCUS_SESSIONS, DEFAULT_FOCUS_SESSIONS);
    setStoredData(STORAGE_KEYS.FOCUS_ACHIEVEMENTS, DEFAULT_FOCUS_ACHIEVEMENTS);
  },

  resetAllLocalData: () => resetAllLocalData(),

  getActiveUserId: () => getActiveUserId(),

  setActiveUserId: (uid: string) => setActiveUserId(uid),

  getQAProfiles: (): QAUserProfile[] => QA_PROFILES,

  getCurrentQAProfile: (): QAUserProfile | null => {
    const currentUid = getActiveUserId();
    return QA_PROFILES.find((p) => p.uid === currentUid) || null;
  },

  switchUser: (uid: string) => {
    setActiveUserId(uid);
    seedQAUserData(uid);
  },
};

export const QA_PROFILES: QAUserProfile[] = [
  {
    uid: 'qa_elena_neuro',
    displayName: 'Dr. Elena Rostova',
    email: 'elena.rostova@neuroflow.lab',
    title: 'Cognitive Neuroscientist',
    avatarText: 'ER',
    themeColor: 'emerald',
    badgeCount: 3,
    streakDays: 14,
    personaSummary: 'Deep focus researcher validating 90-min ultradian BRAC rhythms with sustained gamma-band flow.',
  },
  {
    uid: 'qa_marcus_architect',
    displayName: 'Marcus Vance',
    email: 'marcus.vance@techscale.io',
    title: 'Staff Systems Architect',
    avatarText: 'MV',
    themeColor: 'amber',
    badgeCount: 2,
    streakDays: 4,
    personaSummary: 'High-stress engineer utilizing CBT cognitive restructuring and box breathing for nervous system regulation.',
  },
  {
    uid: 'qa_amina_designer',
    displayName: 'Amina Patel',
    email: 'amina.patel@designstudio.org',
    title: 'Principal Product Designer',
    avatarText: 'AP',
    themeColor: 'indigo',
    badgeCount: 4,
    streakDays: 30,
    personaSummary: 'Productivity powerhouse with a flawless 30-day streak, extensive task flow matrices, and Zeigarnik offloading.',
  },
];

export function seedQAUserData(uid: string) {
  if (!uid || uid === 'default') return;

  // Check if data already exists for this resolved user
  const resolved = resolveKey(STORAGE_KEYS.ENERGY_LOGS);
  if (memoryStore.has(resolved)) return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem(resolved)) return;

  if (uid === 'qa_elena_neuro') {
    // Elena: 14-day continuous streak, high focus
    const elenaLogs: EnergyLog[] = [];
    const elenaSessions: FocusSession[] = [];
    for (let i = 13; i >= 0; i--) {
      const dateStr = getDayOffsetDateStr(i);
      elenaLogs.push({
        id: `elena-e-${i}`,
        date: dateStr,
        timestamp: Date.now() - i * 86400000,
        emotion: 70 + (i % 3) * 5,
        energy: 75 + (i % 2) * 5,
        note: `Day ${14 - i} ultradian rhythm execution. Sustained concentration without afternoon crash.`,
      });
      elenaSessions.push({
        id: `elena-fs-${i}`,
        type: 'focus',
        durationMinutes: 90,
        timestamp: Date.now() - i * 86400000,
        date: dateStr,
      });
    }

    const elenaBadges: FocusAchievement[] = [
      {
        id: 'ach-elena-1',
        badgeId: 'deep_work_guru',
        badgeName: 'Deep Work Guru',
        title: 'Deep Work Guru',
        description: 'Mastered an unbroken 90-minute Ultradian cycle of focused intellectual immersion.',
        category: 'Ultradian Mastery',
        icon: 'Crown',
        rarity: 'gold',
        earnedAt: Date.now() - 5 * 86400000,
        completedBlocksCount: 14,
        neuroInsight: 'Prefrontal gamma-band coherence maintained throughout demanding research analysis.',
        userId: 'qa_elena_neuro',
      },
      {
        id: 'ach-elena-2',
        badgeId: 'flow_state_artisan',
        badgeName: 'Flow State Artisan',
        title: 'Flow State Artisan',
        description: 'Completed 2 deep work blocks in a single circadian cycle.',
        category: 'Sustained Depth',
        icon: 'Zap',
        rarity: 'silver',
        earnedAt: Date.now() - 3 * 86400000,
        completedBlocksCount: 8,
        neuroInsight: 'Dual ultradian intervals consolidate memory engrams and thicken attentional neural pathways.',
        userId: 'qa_elena_neuro',
      },
      {
        id: 'ach-elena-3',
        badgeId: 'ultradian_initiate',
        badgeName: 'Ultradian Initiate',
        title: 'Ultradian Initiate',
        description: "Synchronized with Kleitman's Basic Rest-Activity Cycle (BRAC) for optimal 90m focus.",
        category: 'Bio-Rhythm',
        icon: 'Brain',
        rarity: 'bronze',
        earnedAt: Date.now() - 13 * 86400000,
        completedBlocksCount: 1,
        neuroInsight: 'Attuning intellectual demands to 90-minute biological rhythms prevents adrenal burnout.',
        userId: 'qa_elena_neuro',
      },
    ];

    const elenaTasks: TaskItem[] = [
      {
        id: 'elena-t1',
        title: 'Analyze EEG gamma synchronization across 90-minute task interval',
        completed: true,
        completedAt: Date.now() - 86400000,
        date: getDayOffsetDateStr(1),
        steps: [{ id: 's1', text: 'Fast Fourier Transform on 32-channel raw trace', completed: true }],
      },
      {
        id: 'elena-t2',
        title: 'Draft discussion section for Journal of Cognitive Neuroscience',
        completed: false,
        date: getDayOffsetDateStr(0),
        steps: [
          { id: 's2', text: 'Synthesize BRAC restorative break findings', completed: true },
          { id: 's3', text: 'Review reviewer comments on dopamine baseline', completed: false },
        ],
      },
    ];

    StorageService.saveEnergyLogs(elenaLogs);
    StorageService.saveFocusSessions(elenaSessions);
    StorageService.saveFocusAchievements(elenaBadges);
    StorageService.saveTasks(elenaTasks);
    StorageService.saveCBTEntries([
      {
        id: 'elena-cbt-1',
        date: getDayOffsetDateStr(2),
        timestamp: Date.now() - 2 * 86400000,
        stressor: 'Reviewer requested additional control sample with tight deadline.',
        distortions: ['Catastrophizing', 'Overgeneralization'],
        reframe: 'A reviewer request is normal academic dialogue, not a rejection of the paper hypothesis.',
      },
    ]);
  } else if (uid === 'qa_marcus_architect') {
    // Marcus: High-stress, CBT focus, low somatic energy
    const marcusLogs: EnergyLog[] = [
      {
        id: 'marcus-e-3',
        date: getDayOffsetDateStr(3),
        timestamp: Date.now() - 3 * 86400000,
        emotion: 35,
        energy: 30,
        note: 'Distributed system outage. High sympathetic arousal and heart rate.',
      },
      {
        id: 'marcus-e-2',
        date: getDayOffsetDateStr(2),
        timestamp: Date.now() - 2 * 86400000,
        emotion: 42,
        energy: 40,
        note: 'Conducted post-mortem review. Somatic fatigue lingering.',
      },
      {
        id: 'marcus-e-1',
        date: getDayOffsetDateStr(1),
        timestamp: Date.now() - 1 * 86400000,
        emotion: 55,
        energy: 48,
        note: 'Used Box Breathing 4-4-4-4 before leadership sync; notably lower tension.',
      },
      {
        id: 'marcus-e-0',
        date: getDayOffsetDateStr(0),
        timestamp: Date.now(),
        emotion: 62,
        energy: 58,
        note: 'CBT reframing relieved catastrophic anticipation about performance review.',
      },
    ];

    const marcusCBT: CBTEntry[] = [
      {
        id: 'marcus-cbt-1',
        date: getDayOffsetDateStr(3),
        timestamp: Date.now() - 3 * 86400000,
        stressor: 'The latency spike is my fault and senior leadership will lose trust in me.',
        distortions: ['Catastrophizing', 'Personalization', 'All-or-Nothing Thinking'],
        reframe: 'Distributed failures are properties of complex systems, not moral failings. My rapid root-cause analysis mitigated customer impact.',
      },
      {
        id: 'marcus-cbt-2',
        date: getDayOffsetDateStr(1),
        timestamp: Date.now() - 1 * 86400000,
        stressor: 'I should be able to review 20 pull requests today without feeling depleted.',
        distortions: ['"Should" Statements', 'Disqualifying the Positive'],
        reframe: 'Cognitive fatigue is a biological boundary. Enforcing 20-minute rest intervals ensures high-fidelity code reviews.',
      },
    ];

    const marcusTasks: TaskItem[] = [
      {
        id: 'marcus-t1',
        title: 'Architect zero-trust service mesh circuit breakers',
        completed: false,
        date: getDayOffsetDateStr(0),
        steps: [
          { id: 'ms-1', text: 'Benchmark Envoy proxy overhead', completed: true },
          { id: 'ms-2', text: 'Document rate limiting fallback policy', completed: false },
        ],
      },
      {
        id: 'marcus-t2',
        title: 'Practice 3 cycles of Box Breathing before standup',
        completed: true,
        completedAt: Date.now() - 3600000,
        date: getDayOffsetDateStr(0),
        steps: [],
      },
    ];

    const marcusBadges: FocusAchievement[] = [
      {
        id: 'ach-marcus-1',
        badgeId: 'ultradian_initiate',
        badgeName: 'Ultradian Initiate',
        title: 'Ultradian Initiate',
        description: "Synchronized with Kleitman's Basic Rest-Activity Cycle (BRAC) for optimal 90m focus.",
        category: 'Bio-Rhythm',
        icon: 'Brain',
        rarity: 'bronze',
        earnedAt: Date.now() - 2 * 86400000,
        completedBlocksCount: 2,
        neuroInsight: 'Attuning intellectual demands to biological rhythms prevents burnout.',
        userId: 'qa_marcus_architect',
      },
      {
        id: 'ach-marcus-2',
        badgeId: 'neural_harmony',
        badgeName: 'Neural Harmony',
        title: 'Neural Harmony',
        description: 'Honored the biological transition from 90m deep work to restorative neurological recharge.',
        category: 'Restorative Mastery',
        icon: 'Coffee',
        rarity: 'silver',
        earnedAt: Date.now() - 86400000,
        completedBlocksCount: 3,
        neuroInsight: '20-minute restorative breaks clear adenosine and replenish prefrontal neurotransmitters.',
        userId: 'qa_marcus_architect',
      },
    ];

    StorageService.saveEnergyLogs(marcusLogs);
    StorageService.saveCBTEntries(marcusCBT);
    StorageService.saveTasks(marcusTasks);
    StorageService.saveFocusAchievements(marcusBadges);
  } else if (uid === 'qa_amina_designer') {
    // Amina: 30-day streak, extensive tasks, brain dump user
    const aminaLogs: EnergyLog[] = [];
    const aminaSessions: FocusSession[] = [];
    for (let i = 29; i >= 0; i--) {
      const dateStr = getDayOffsetDateStr(i);
      aminaLogs.push({
        id: `amina-e-${i}`,
        date: dateStr,
        timestamp: Date.now() - i * 86400000,
        emotion: 65 + (i % 4) * 5,
        energy: 68 + (i % 3) * 5,
        note: `Day ${30 - i} consistency check-in. Balanced design velocity and mental clarity.`,
      });
      if (i % 2 === 0) {
        aminaSessions.push({
          id: `amina-fs-${i}`,
          type: 'focus',
          durationMinutes: 90,
          timestamp: Date.now() - i * 86400000,
          date: dateStr,
        });
      }
    }

    const aminaBadges: FocusAchievement[] = [
      {
        id: 'ach-amina-1',
        badgeId: 'deep_work_guru',
        badgeName: 'Deep Work Guru',
        title: 'Deep Work Guru',
        description: 'Mastered an unbroken 90-minute Ultradian cycle of focused intellectual immersion.',
        category: 'Ultradian Mastery',
        icon: 'Crown',
        rarity: 'gold',
        earnedAt: Date.now() - 15 * 86400000,
        completedBlocksCount: 22,
        neuroInsight: 'Pure flow immersion consolidated.',
        userId: 'qa_amina_designer',
      },
      {
        id: 'ach-amina-2',
        badgeId: 'cognitive_marathoner',
        badgeName: 'Cognitive Marathoner',
        title: 'Cognitive Marathoner',
        description: 'Achieved 3 or more 90-minute deep work cycles in a day (270+ min of focus).',
        category: 'Elite Focus',
        icon: 'Award',
        rarity: 'emerald',
        earnedAt: Date.now() - 7 * 86400000,
        completedBlocksCount: 15,
        neuroInsight: 'Exceptional executive stamina.',
        userId: 'qa_amina_designer',
      },
      {
        id: 'ach-amina-3',
        badgeId: 'flow_state_artisan',
        badgeName: 'Flow State Artisan',
        title: 'Flow State Artisan',
        description: 'Completed 2 deep work blocks in a single circadian cycle.',
        category: 'Sustained Depth',
        icon: 'Zap',
        rarity: 'silver',
        earnedAt: Date.now() - 20 * 86400000,
        completedBlocksCount: 10,
        neuroInsight: 'Dual ultradian intervals consolidate memory engrams.',
        userId: 'qa_amina_designer',
      },
      {
        id: 'ach-amina-4',
        badgeId: 'zen_focus_alchemist',
        badgeName: 'Zen Focus Alchemist',
        title: 'Zen Focus Alchemist',
        description: 'Maintained uninterrupted calm flow amidst daily cognitive noise.',
        category: 'Equilibrium',
        icon: 'Sparkles',
        rarity: 'mythic',
        earnedAt: Date.now() - 2 * 86400000,
        completedBlocksCount: 30,
        neuroInsight: 'Effortless concentration achieved.',
        userId: 'qa_amina_designer',
      },
    ];

    const aminaDumps: BrainDumpItem[] = [
      { id: 'ad-1', text: 'Schedule accessibility contrast audit for dark mode palettes', timestamp: Date.now() - 7200000, date: getDayOffsetDateStr(0) },
      { id: 'ad-2', text: 'Review typography scale on ultra-wide displays', timestamp: Date.now() - 14400000, date: getDayOffsetDateStr(0) },
      { id: 'ad-3', text: 'Prepare motion micro-interactions prototype for client presentation', timestamp: Date.now() - 86400000, date: getDayOffsetDateStr(1) },
    ];

    const aminaTasks: TaskItem[] = [
      {
        id: 'amina-t1',
        title: 'Finalize Design Tokens and Figma Variables Sync',
        completed: true,
        completedAt: Date.now() - 3600000,
        date: getDayOffsetDateStr(0),
        steps: [
          { id: 'as-1', text: 'Export JSON schema', completed: true },
          { id: 'as-2', text: 'Verify semantic color aliases', completed: true },
        ],
      },
      {
        id: 'amina-t2',
        title: 'User Interview Synthesis: Cognitive Load in Multitasking UI',
        completed: false,
        date: getDayOffsetDateStr(0),
        steps: [
          { id: 'as-3', text: 'Transcribe 5 participant audio recordings', completed: true },
          { id: 'as-4', text: 'Cluster affinity map findings', completed: false },
        ],
      },
    ];

    StorageService.saveEnergyLogs(aminaLogs);
    StorageService.saveFocusSessions(aminaSessions);
    StorageService.saveFocusAchievements(aminaBadges);
    StorageService.saveBrainDump(aminaDumps);
    StorageService.saveTasks(aminaTasks);
  }
}
