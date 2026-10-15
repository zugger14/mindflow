import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { resetAllLocalData } from '../utils/storage';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete?: () => void;
}

export default function ResetDataModal({ isOpen, onClose, onResetComplete }: ResetDataModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (!isOpen) return null;

  const handleConfirmReset = () => {
    setIsDeleting(true);
    try {
      resetAllLocalData();
      setIsDeleting(false);
      setDeleted(true);

      setTimeout(() => {
        if (onResetComplete) {
          onResetComplete();
        } else {
          window.location.reload();
        }
      }, 700);
    } catch (err) {
      console.error('Error resetting local data:', err);
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-200 relative overflow-hidden"
        >
          {/* Top colored accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isDeleting || deleted}
            className="absolute top-4 right-4 p-2 text-ink-400 hover:text-ink-800 rounded-full hover:bg-sand-100 transition-colors cursor-pointer disabled:opacity-40"
            title="Cancel"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {deleted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="text-base font-bold text-ink-900">
                All Local Storage Cleared
              </h3>
              <p className="text-xs text-ink-500">
                Resetting dashboard to pristine defaults...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink-900 tracking-tight">
                    Reset & Delete Local Data
                  </h3>
                  <p className="text-xs text-ink-500 font-light">
                    Clear browser localStorage and reset MindFlow
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mb-6 bg-sand-50/90 rounded-2xl p-4 border border-sand-200 text-xs text-ink-700">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    This will permanently purge all local records from your browser, including:
                  </p>
                </div>
                <ul className="list-disc pl-7 space-y-1 text-ink-600 text-[11px]">
                  <li>Daily energy & mood check-in logs</li>
                  <li>CBT reframing journal entries</li>
                  <li>Tasks, priorities & brain dump clutter</li>
                  <li>Deep work focus sessions & badges</li>
                  <li>Custom model configuration & theme settings</li>
                </ul>
                <p className="text-[11px] text-rose-700 font-medium border-t border-sand-200/80 pt-2">
                  ⚠️ This action cannot be reversed. If you use Google Sign-In, your cloud backup remains intact on Firestore.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleConfirmReset}
                  disabled={isDeleting}
                  className="w-full flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Deleting Data...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Yes, Delete All & Reset</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-ink-600 hover:text-ink-900 bg-sand-100 hover:bg-sand-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
