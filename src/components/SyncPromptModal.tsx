import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SyncPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export default function SyncPromptModal({ isOpen, onClose, actionName = 'entry' }: SyncPromptModalProps) {
  const { loginWithGoogle, user } = useAuth();

  if (!isOpen || user) return null;

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-200 relative overflow-hidden"
        >
          {/* Subtle decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ink-400 hover:text-ink-800 rounded-full hover:bg-sand-100 transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
              <Cloud size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-900 tracking-tight">
                Save & Sync Across Devices
              </h3>
              <p className="text-xs text-ink-500 font-light">
                Your {actionName} was saved to this browser session.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6 bg-sand-50/80 rounded-2xl p-4 border border-sand-200/90 text-xs text-ink-700">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Sign in with Google to backup your habits, focus logs, and psychological reframes to your secure private Firestore cloud.
              </p>
            </div>
            <p className="text-[11px] text-ink-500 font-light border-t border-sand-200/80 pt-2.5">
              Without signing in, data remains local to this browser tab and will reset when you clear browsing cache.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleSignIn}
              className="w-full flex-1 py-2.5 px-4 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-ink-600 hover:text-ink-900 bg-sand-100 hover:bg-sand-200 text-xs font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
