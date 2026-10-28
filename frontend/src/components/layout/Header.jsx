import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { LogOut, UserCircle, Sun, Moon } from 'lucide-react'

export const Header = () => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
          HealthRisk AI — Clinical Intelligence Platform
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle dark/white theme"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-medium transition-all shadow-sm"
          title={theme === 'dark' ? 'Switch to White (Light) Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="hidden md:inline">Dark Theme</span>
            </>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <UserCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <span className="font-medium text-xs sm:text-sm">{user?.full_name || user?.email || 'Investigator'}</span>
        </div>

        <button
          onClick={logout}
          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
