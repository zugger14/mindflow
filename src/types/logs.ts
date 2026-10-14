export interface EnergyLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  emotion: number; // 0 - 100
  energy: number; // 0 - 100
  note?: string;
}

export interface CBTEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  stressor: string;
  distortions: string[];
  reframe: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number;
  createdAt?: number;
  date?: string; // YYYY-MM-DD
  steps: { id: string; text: string; completed: boolean }[];
  isExpanded?: boolean;
}

export interface BrainDumpItem {
  id: string;
  text: string;
  timestamp: number;
  date?: string; // YYYY-MM-DD
}

export interface FocusSession {
  id: string;
  type: 'focus' | 'break';
  durationMinutes: number;
  timestamp: number;
  date?: string; // YYYY-MM-DD
}

export interface DistortionInsight {
  distortion: string;
  triggerContext: string;
  antidote: string;
}

export interface DailySuggestion {
  category: string;
  title: string;
  actionableAdvice: string;
  rationale: string;
}

export interface PsychologicalAnalysisResult {
  id: string;
  generatedAt: number;
  mindsetState: string;
  overallSummary: string;
  distortionInsights: DistortionInsight[];
  energyRhythmAnalysis: string;
  dailySuggestions: DailySuggestion[];
  groundingMantra: string;
  recommendedBreathPattern: string;
  targetDate?: string;
  isRetrospective?: boolean;
}

export interface DayArchiveSnapshot {
  dateStr: string; // YYYY-MM-DD
  formattedDate: string;
  displayDay: string;
  energyLog?: EnergyLog;
  cbtEntries: CBTEntry[];
  tasks: TaskItem[];
  completedTasks: TaskItem[];
  brainDumps: BrainDumpItem[];
  focusSessions: FocusSession[];
  analysis?: PsychologicalAnalysisResult;
}

export interface DayHabitStatus {
  date: string; // YYYY-MM-DD
  dayOffset: number; // 0 for today, 29 for 30 days ago
  formattedDate: string;
  dayOfWeek: string;
  energyLogged: boolean;
  cbtCount: number;
  tasksCompleted: number;
  focusMinutes: number;
  brainDumpCount: number;
  totalActions: number;
  isActive: boolean;
  completionScore: number; // 0 - 100
}

export interface StreakMilestone {
  id: string;
  days: number;
  title: string;
  badgeName: string;
  iconName: string;
  unlocked: boolean;
  description: string;
  psychologicalInsight: string;
}

export interface HabitStreakRecord {
  currentStreak: number;
  longestStreak: number;
  activeDaysLast30: number;
  consistencyRate: number; // percentage
  totalActionsCount: number;
  updatedAt: number;
}

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'emerald' | 'mythic';

export interface FocusAchievement {
  id: string;
  badgeId: string;
  badgeName: string; // e.g., 'Deep Work Guru'
  title: string;
  description: string;
  category: string;
  icon: string;
  rarity: BadgeRarity;
  earnedAt: number;
  completedBlocksCount: number;
  neuroInsight: string;
  userId?: string;
  isNewUnlock?: boolean;
}

export interface QAUserProfile {
  uid: string;
  displayName: string;
  email: string;
  title: string;
  avatarText: string;
  themeColor: string;
  badgeCount: number;
  streakDays: number;
  personaSummary: string;
}

export type QATestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface QATestStepResult {
  id: string;
  module: string;
  testName: string;
  userTested: string;
  status: QATestStatus;
  durationMs: number;
  assertionMessage: string;
  details?: Record<string, any>;
  error?: string;
}

export interface QASuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  timestamp: number;
  testedUsersCount: number;
  firebaseStatus: 'connected' | 'offline' | 'simulated';
  databaseId: string;
  results: QATestStepResult[];
}


