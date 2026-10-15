import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, LogOut, RefreshCw, ChevronDown, Trash2 } from 'lucide-react';
import ResetDataModal from './ResetDataModal';

export default function UserAuthPill() {
  const { user, loading, loginWithGoogle, logout, syncLocalToCloud } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    await syncLocalToCloud();
    setTimeout(() => setSyncing(false), 600);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-ink-500 bg-white/80 px-3 py-1.5 rounded-2xl border border-sand-200">
        <RefreshCw size={13} className="animate-spin text-emerald-500" />
        <span>Connecting...</span>
      </div>
    );
  }

  // Not signed in with Google
  if (!user) {
    return (
      <>
        <div className="flex items-center gap-1.5">
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-2 text-xs font-semibold bg-white hover:bg-sand-50 text-ink-800 px-3 py-1.5 rounded-2xl border border-sand-200/90 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Sign in with Google: Your entries save locally on input and automatically backup to Firestore across devices."
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
            <span>Sign In with Google</span>
            <span className="hidden sm:inline-block text-[10px] text-ink-500 font-normal border-l border-sand-300 pl-2">
              Auto-syncs
            </span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium bg-white/90 hover:bg-rose-50 text-ink-600 hover:text-rose-600 px-2.5 py-1.5 rounded-2xl border border-sand-200/90 shadow-2xs transition-all cursor-pointer"
            title="Delete all local storage data and reset dashboard"
            aria-label="Delete all local storage data and reset"
          >
            <Trash2 size={13} className="text-ink-400 hover:text-rose-500" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>

        <ResetDataModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
        />
      </>
    );
  }

  // Signed in with Google
  return (
    <>
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-xs font-medium bg-white/95 hover:bg-sand-50 text-ink-900 px-3 py-1.5 rounded-2xl border border-sand-200/90 shadow-2xs transition-all cursor-pointer"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                {user.displayName ? user.displayName[0] : 'U'}
              </div>
            )}
            <span className="font-semibold text-xs max-w-[120px] truncate">
              {user.displayName || 'Signed In'}
            </span>
            <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              <Cloud size={10} />
              <span>Synced</span>
            </span>
            <ChevronDown size={12} className="text-ink-400" />
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium bg-white/90 hover:bg-rose-50 text-ink-600 hover:text-rose-600 px-2.5 py-1.5 rounded-2xl border border-sand-200/90 shadow-2xs transition-all cursor-pointer"
            title="Delete all local storage data and reset dashboard"
            aria-label="Delete all local storage data and reset"
          >
            <Trash2 size={13} className="text-ink-400 hover:text-rose-500" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-sand-200 p-3 z-50 space-y-2 text-xs">
            <div className="pb-2 border-b border-sand-200">
              <p className="font-semibold text-ink-900 truncate">{user.displayName || 'MindFlow User'}</p>
              <p className="text-[11px] text-ink-500 truncate">{user.email}</p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-sand-100 text-ink-700 transition-colors"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
              <span>{syncing ? 'Syncing Firestore...' : 'Sync Firestore Now'}</span>
            </button>

            <div className="pt-2 border-t border-sand-200 space-y-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowResetModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete Local Storage & Reset</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-sand-100 text-ink-700 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </>
  );
}
