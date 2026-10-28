import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, FileUp, Activity, HeartPulse, ClipboardList } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Sidebar = () => {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isPatient = user?.role === 'patient'
  const patientId = user?.patient_id

  const doctorLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patient Cohort', icon: Users },
    { to: '/upload', label: 'Upload Lab Report', icon: FileUp },
  ]

  const patientLinks = [
    patientId ? { to: `/patients/${patientId}/history`, label: 'My Health Profile', icon: ClipboardList } : null,
    { to: '/upload', label: 'Upload My Lab Report', icon: FileUp },
  ].filter(Boolean)

  const links = isPatient ? patientLinks : doctorLinks

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex flex-col shrink-0 h-full border-r border-slate-200 dark:border-slate-800 transition-colors overflow-y-auto">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/20 dark:border-teal-500/30">
          <HeartPulse className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight">HealthRisk AI</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isPatient ? 'Patient Health Portal' : 'Clinical Decision Support'}
          </p>
        </div>
      </div>

      {user && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">Logged in as</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
            {user.full_name || user.email}
          </p>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 inline-block ${
            isPatient
              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
              : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
          }`}>
            {isPatient ? '👤 Patient' : '🩺 Doctor'}
          </span>
        </div>
      )}

      <nav className="p-4 space-y-1 flex-1">
        {links.map((item) => {
          const Icon = item.icon
          const active = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-50 dark:bg-teal-600/20 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
          <Activity className="w-4 h-4" />
          <span>Active Architecture</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Triple Analytical Engines, Multi-Test Risk Modeling.
        </p>
      </div>
    </aside>
  )
}
