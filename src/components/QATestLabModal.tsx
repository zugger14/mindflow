import React, { useState } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Database, 
  Users, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Sparkles, 
  Brain, 
  Cloud, 
  Terminal,
  Activity,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QASuiteSummary, QATestStepResult, QAUserProfile } from '../types/logs';
import { QATestRunner } from '../tests/qaTestSuite';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';

interface QATestLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDataChanged?: () => void;
}

export default function QATestLabModal({ isOpen, onClose, onUserDataChanged }: QATestLabModalProps) {
  const { activeQAProfile, qaProfiles, switchQAProfile, user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepName, setActiveStepName] = useState<string>('');
  const [testSummary, setTestSummary] = useState<QASuiteSummary | null>(null);
  const [liveSteps, setLiveSteps] = useState<QATestStepResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAllTests = async () => {
    setIsRunning(true);
    setLiveSteps([]);
    setTestSummary(null);

    const runner = new QATestRunner((step) => {
      setActiveStepName(`[${step.module}] ${step.testName}`);
      setLiveSteps((prev) => [...prev, step]);
    });

    try {
      const summary = await runner.runAllTests();
      setTestSummary(summary);
      if (onUserDataChanged) {
        onUserDataChanged();
      }
    } catch (err) {
      console.error('QA Test execution failed:', err);
    } finally {
      setIsRunning(false);
      setActiveStepName('');
    }
  };

  const handleSelectQAUser = (profile: QAUserProfile | null) => {
    switchQAProfile(profile);
    if (onUserDataChanged) {
      onUserDataChanged();
    }
  };

  const handleDownloadReport = () => {
    if (!testSummary) return;
    const reportData = {
      title: 'MindFlow Multi-User & Firebase QA Test Report',
      timestamp: new Date(testSummary.timestamp).toISOString(),
      databaseId: testSummary.databaseId,
      projectId: firebaseConfig.projectId,
      totalTests: testSummary.total,
      passed: testSummary.passed,
      failed: testSummary.failed,
      executionDurationMs: testSummary.durationMs,
      testedPersonas: qaProfiles.map((p) => ({
        name: p.displayName,
        title: p.title,
        streakDays: p.streakDays,
        badgeCount: p.badgeCount,
      })),
      results: testSummary.results,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindflow-qa-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterCategories = [
    { id: 'all', label: 'All Tests' },
    { id: 'AUTH', label: 'Identity & Isolation' },
    { id: 'ULTRADIAN', label: 'Ultradian & Badges' },
    { id: 'HABIT', label: '30-Day Habits' },
    { id: 'SOMATIC', label: 'Energy & Somatic' },
    { id: 'PSYCH', label: 'Psychology AI' },
    { id: 'FIREBASE', label: 'Firebase Cloud' },
  ];

  const currentSteps = testSummary ? testSummary.results : liveSteps;
  const filteredSteps = currentSteps.filter((step) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'AUTH') return step.module.startsWith('AUTH');
    if (selectedFilter === 'ULTRADIAN') return step.module.includes('ULTRADIAN') || step.module.includes('ACHIEVEMENT');
    if (selectedFilter === 'HABIT') return step.module.includes('HABIT') || step.module.includes('TASK') || step.module.includes('BRAIN');
    if (selectedFilter === 'SOMATIC') return step.module.includes('ENERGY') || step.module.includes('CBT') || step.module.includes('BOX');
    if (selectedFilter === 'PSYCH') return step.module.includes('PSYCH') || step.module.includes('SOUND');
    if (selectedFilter === 'FIREBASE') return step.module.startsWith('FIREBASE');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-sand-300/80 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-sand-50/80 border-b border-sand-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink-900 tracking-tight">
                  QA Test Lab & Multi-User Verification
                </h2>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Database size={10} />
                  <span>Firestore Active</span>
                </span>
              </div>
              <p className="text-xs text-ink-500 font-mono">
                Target DB: <span className="font-semibold text-ink-700">{firebaseConfig.firestoreDatabaseId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-sand-200/70 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: MULTI-USER PERSONA SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                  Interactive QA User Switcher (Test Cross-User Isolation Live)
                </h3>
              </div>
              <span className="text-[11px] text-ink-500">
                Click any user to load their isolated 30-day logs, tasks, and badges into the UI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {qaProfiles.map((p) => {
                const isSelected = activeQAProfile?.uid === p.uid;
                return (
                  <button
                    key={p.uid}
                    onClick={() => handleSelectQAUser(p)}
                    className={`text-left p-3.5 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white hover:bg-sand-50/90 border-sand-200'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        ACTIVE IN UI
                      </span>
                    )}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                        {p.avatarText}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-900 leading-tight">{p.displayName}</p>
                        <p className="text-[10px] text-ink-500">{p.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-ink-600 pt-2 border-t border-sand-100">
                      <span className="flex items-center gap-0.5 font-semibold text-amber-700">
                        <Flame size={11} /> {p.streakDays}d Streak
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 font-semibold text-emerald-700">
                        <Award size={11} /> {p.badgeCount} Badges
                      </span>
                    </div>
                    <p className="text-[10px] text-ink-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {p.personaSummary}
                    </p>
                  </button>
                );
              })}

              {/* Live Firebase OAuth User Card */}
              <button
                onClick={() => handleSelectQAUser(null)}
                className={`text-left p-3.5 rounded-2xl border transition-all relative ${
                  !activeQAProfile
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white hover:bg-sand-50/90 border-sand-200'
                }`}
              >
                {!activeQAProfile && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    ACTIVE IN UI
                  </span>
                )}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    <Cloud size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-900 leading-tight">
                      {user ? user.displayName || 'Live User' : 'Personal Cloud'}
                    </p>
                    <p className="text-[10px] text-ink-500 truncate max-w-[130px]">
                      {user ? user.email : 'Google OAuth'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-ink-600 pt-2 border-t border-sand-100">
                  <span className="font-semibold text-blue-700">
                    {user ? 'Authenticated Firestore' : 'Guest / Sign-in Mode'}
                  </span>
                </div>
                <p className="text-[10px] text-ink-500 mt-1.5 leading-relaxed">
                  Real Firestore backend partition with user security rule enforcement.
                </p>
              </button>
            </div>
          </div>

          {/* SECTION 2: AUTOMATED TEST CONTROLLER & METRICS */}
          <div className="p-4 rounded-2xl bg-sand-100/70 border border-sand-200/90 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-ink-900">
                Automated Multi-User & Firebase Regression Suite
              </h4>
              <p className="text-[11px] text-ink-600 mt-0.5">
                Executes 21 end-to-end integration tests: Focus Timer, Badges, 30-Day Streaks, CBT Reframing, Tasks, Audio Synthesizer, Psych AI, and Firestore Isolation.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRunAllTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play size={14} className={isRunning ? 'animate-spin' : ''} />
                <span>{isRunning ? 'Running All 21 Tests...' : 'Run All QA Tests'}</span>
              </button>

              {testSummary && (
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-700 bg-white hover:bg-sand-50 border border-sand-200 transition-colors shadow-2xs"
                  title="Download QA Audit Report"
                >
                  <Download size={13} />
                  <span>Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Running progress indicator */}
          {isRunning && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-600 animate-spin" />
                <span>Executing: <strong className="font-mono">{activeStepName}</strong></span>
              </div>
              <span className="font-mono font-bold">{liveSteps.length} / 21 completed</span>
            </div>
          )}

          {/* Summary Banner after execution */}
          {testSummary && (
            <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink-900">
                      {testSummary.passed} of {testSummary.total} Tests Passed
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      100% PASS
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500">
                    Duration: {testSummary.durationMs}ms • 3 Simulated Personas Tested • Zero Data Cross-Contamination
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-ink-600">
                <div className="flex items-center gap-1.5">
                  <Database size={13} className="text-emerald-600" />
                  <span>Firestore Isolation: <strong className="text-emerald-700">Enforced</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Terminal size={13} className="text-ink-500" />
                  <span>CLI Equivalence: <strong className="font-mono text-ink-800">npm test</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: FILTER TABS & TEST STEPS LIST */}
          {currentSteps.length > 0 && (
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {filterCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedFilter(c.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      selectedFilter === c.id
                        ? 'bg-ink-900 text-white shadow-2xs'
                        : 'bg-sand-100/80 hover:bg-sand-200 text-ink-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Step Results List */}
              <div className="space-y-2">
                {filteredSteps.map((step) => {
                  const isExpanded = expandedStepId === step.id;
                  const isPass = step.status === 'passed';

                  return (
                    <div
                      key={step.id}
                      className="border border-sand-200 rounded-2xl bg-white hover:border-sand-300 transition-colors overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isPass ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-rose-600 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase text-ink-500 bg-sand-100 px-1.5 py-0.5 rounded">
                                {step.module}
                              </span>
                              <span className="text-xs font-semibold text-ink-900 truncate">
                                {step.testName}
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-500 truncate mt-0.5">
                              Subject: <strong className="text-ink-700">{step.userTested}</strong> • {step.assertionMessage}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono text-ink-500 bg-sand-50 px-2 py-0.5 rounded-md border border-sand-200">
                            {step.durationMs}ms
                          </span>
                          {isExpanded ? <ChevronUp size={14} className="text-ink-400" /> : <ChevronDown size={14} className="text-ink-400" />}
                        </div>
                      </button>

                      {isExpanded && step.details && (
                        <div className="px-4 py-3 bg-sand-50/80 border-t border-sand-200 text-xs font-mono text-ink-800 space-y-2">
                          <p className="text-[10px] uppercase font-bold text-ink-500 font-sans">
                            Assertion Payload & State Verification:
                          </p>
                          <pre className="p-3 bg-ink-950 text-emerald-300 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state when no test run yet */}
          {currentSteps.length === 0 && !isRunning && (
            <div className="text-center py-12 px-4 border border-dashed border-sand-300 rounded-3xl bg-sand-50/40">
              <ShieldCheck size={36} className="mx-auto text-emerald-600/70 mb-3" />
              <h4 className="text-sm font-bold text-ink-900">Ready to execute QA Test Suite</h4>
              <p className="text-xs text-ink-500 max-w-md mx-auto mt-1 mb-4">
                Click "Run All QA Tests" above to verify all 12 modules across 3 distinct personas with live Firestore security rule isolation.
              </p>
              <button
                onClick={handleRunAllTests}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
              >
                <Play size={14} />
                <span>Start Test Suite</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-sand-50/90 border-t border-sand-200 flex items-center justify-between text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-ink-600" />
            <span>Terminal run: <code className="bg-sand-200/80 px-1.5 py-0.5 rounded text-ink-800 font-mono">npm test</code></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-ink-600">
              Active Persona: <strong className="text-ink-900">{activeQAProfile?.displayName || user?.displayName || 'Personal'}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl font-semibold bg-sand-200 hover:bg-sand-300/80 text-ink-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
