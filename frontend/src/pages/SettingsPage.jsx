import React from 'react';
import {
  User,
  HardDrive,
  Sun,
  Moon,
  ShieldCheck,
  UploadCloud,
  LogOut,
  KeyRound,
  Database,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatBytes, formatDate } from '../utils/formatters';

export function SettingsPage({ stats, onSignOut }) {
  const { user, isDemoUser } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Account & Library Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account profile, storage capacity, and application preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.user_metadata?.full_name || 'DocuVault User'}
              </h2>
              {isDemoUser && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email || 'user@docuvault.dev'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-medium">User Identifier (UUID)</span>
            <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 select-all truncate">
              {user?.id || 'demo-user-id'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Account Created</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {formatDate(user?.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cloud Storage Quota
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persistent object storage powered by Supabase
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {stats?.percentUsed || 0}% used
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (stats?.percentUsed || 0) > 85 ? 'bg-rose-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(100, stats?.percentUsed || 0)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>{stats?.formattedTotalSize || '0 B'} used</span>
            <span>{stats?.formattedStorageQuota || '500 MB'} total allocation</span>
          </div>
        </div>

        {/* Storage stats details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Total Docs</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{stats?.totalDocuments || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Max Upload Size</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">50 MB / file</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Batch Limit</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">10 files / upload</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Storage Type</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Encrypted Object</p>
          </div>
        </div>
      </div>

      {/* Appearance & Theme */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interface Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred visual style
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-950/30'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <div>Light Mode</div>
              <div className="text-[10px] font-normal text-slate-400">Crisp daytime contrast</div>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div className="text-left">
              <div>Dark Mode</div>
              <div className="text-[10px] font-normal text-slate-400">Easy on the eyes</div>
            </div>
          </button>
        </div>
      </div>

      {/* Security & Access Restrictions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Security Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enterprise grade privacy and multi-tenant isolation
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p><strong>Row Level Security (RLS):</strong> PostgreSQL policies guarantee that only your authenticated user ID can read or mutate your document records.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p><strong>Private Expiring URLs:</strong> Files are stored in private cloud storage buckets. Previews and downloads are securely generated using short-lived signed URLs.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <Database className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p><strong>Magic Byte Signature Checking:</strong> The backend verifies file signatures so disguised binaries cannot execute on the platform.</p>
          </div>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="pt-2">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
