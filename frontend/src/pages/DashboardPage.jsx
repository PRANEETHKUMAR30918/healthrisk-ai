import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { patientService } from '../services/patientService'
import { Disclaimer } from '../components/common/Disclaimer'
import {
  Users, FileText, CheckCircle2, ArrowUpRight, UserPlus, Edit3, Trash2,
  Calendar, Search, AlertTriangle, X, Activity, FileUp, User,
  AlertCircle, Check, TrendingUp, ShieldCheck, ClipboardList, ChevronRight,
  Stethoscope, BarChart2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatScorePercent } from '../utils/formatters'

// ── Avatar initials helper ──────────────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const initials = name ? name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  const colors = [
    'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700',
  ]
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0]
  const sz = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-9 h-9 text-xs'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent, trend }) {
  const accents = {
    teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600 bg-teal-100',   border: 'border-teal-100',   bar: 'bg-teal-500' },
    sky:    { bg: 'bg-sky-50',    icon: 'text-sky-600 bg-sky-100',     border: 'border-sky-100',    bar: 'bg-sky-500' },
    emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-600 bg-emerald-100', border:'border-emerald-100', bar:'bg-emerald-500' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600 bg-violet-100', border:'border-violet-100', bar: 'bg-violet-500' },
  }
  const a = accents[accent] || accents.teal
  return (
    <div className={`relative bg-white rounded-2xl border ${a.border} p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group overflow-hidden`}>
      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${a.bar}`} />
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${a.icon} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend != null && (
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Modal wrapper ──────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// ── Form Field ─────────────────────────────────────────────────────────────
const fieldCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white focus:outline-none transition-all"

export const DashboardPage = () => {
  const queryClient = useQueryClient()

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardService.getStats(),
  })
  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAll(),
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [deletingPatient, setDeletingPatient] = useState(null)
  const [createForm, setCreateForm] = useState({ patient_code: '', date_of_birth: '', sex: 'M' })
  const [editForm, setEditForm] = useState({ patient_code: '', date_of_birth: '', sex: 'M' })
  const [crudLoading, setCrudLoading] = useState(false)
  const [crudError, setCrudError] = useState(null)
  const [crudSuccess, setCrudSuccess] = useState(null)

  const notify = (msg) => { setCrudSuccess(msg); setTimeout(() => setCrudSuccess(null), 4000) }

  const handleCreatePatient = async (e) => {
    e.preventDefault(); setCrudLoading(true); setCrudError(null)
    try {
      await patientService.create({ patient_code: createForm.patient_code.trim(), date_of_birth: createForm.date_of_birth || null, sex: createForm.sex })
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['patients'] }), queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })])
      setShowCreateModal(false); setCreateForm({ patient_code: '', date_of_birth: '', sex: 'M' })
      notify(`Patient ${createForm.patient_code.trim()} enrolled successfully.`)
    } catch (err) { setCrudError(err.response?.data?.detail || 'Failed to enroll patient.') }
    finally { setCrudLoading(false) }
  }

  const handleUpdatePatient = async (e) => {
    e.preventDefault(); if (!editingPatient) return; setCrudLoading(true); setCrudError(null)
    try {
      await patientService.update(editingPatient.id, { patient_code: editForm.patient_code.trim(), date_of_birth: editForm.date_of_birth || null, sex: editForm.sex })
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['patients'] }), queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })])
      setEditingPatient(null); notify(`Patient ${editForm.patient_code.trim()} updated.`)
    } catch (err) { setCrudError(err.response?.data?.detail || 'Failed to update patient.') }
    finally { setCrudLoading(false) }
  }

  const handleDeletePatient = async () => {
    if (!deletingPatient) return; setCrudLoading(true); setCrudError(null)
    try {
      await patientService.delete(deletingPatient.id)
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['patients'] }), queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })])
      const code = deletingPatient.patient_code; setDeletingPatient(null); notify(`Patient ${code} removed from cohort.`)
    } catch (err) { setCrudError(err.response?.data?.detail || 'Failed to delete patient.') }
    finally { setCrudLoading(false) }
  }

  const filteredPatients = (patients || []).filter(p =>
    p.patient_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loadingMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Doctor Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Patient cohort surveillance · Lab analytics · Risk monitoring</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
            <FileUp className="w-4 h-4 text-teal-500" /> Upload Report
          </Link>
          <button onClick={() => { setCrudError(null); setShowCreateModal(true) }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-all shadow-sm shadow-teal-200">
            <UserPlus className="w-4 h-4" /> Enroll Patient
          </button>
        </div>
      </div>

      <Disclaimer />

      {/* ── Success Toast ── */}
      {crudSuccess && (
        <div className="flex items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium">{crudSuccess}</span>
          </div>
          <button onClick={() => setCrudSuccess(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Monitored Patients" value={metrics?.total_patients ?? 0}
          sub="Total enrolled" accent="teal" trend={`+${metrics?.total_patients ?? 0}`} />
        <StatCard icon={FileText} label="Lab Reports Analysed" value={metrics?.total_reports ?? 0}
          sub="All time" accent="sky" />
        <StatCard icon={CheckCircle2} label="Avg Consistency Score" value={formatScorePercent(metrics?.avg_consistency_score)}
          sub="Cross-engine agreement" accent="emerald" />
        <StatCard icon={BarChart2} label="Avg Reliability Index" value={formatScorePercent(metrics?.avg_reliability_score)}
          sub="Analytical confidence" accent="violet" />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Patient Table (spans 2 cols) ── */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Table header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Patient Cohort</h2>
                <p className="text-[11px] text-slate-400">{filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search patient..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all w-44" />
              </div>
              <button onClick={() => { setCrudError(null); setShowCreateModal(true) }}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all">
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Sex</th>
                  <th className="px-5 py-3">Date of Birth</th>
                  <th className="px-5 py-3 text-center">Reports</th>
                  <th className="px-5 py-3">Enrolled</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPatients ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 bg-slate-100 rounded-full shimmer" style={{ width: `${60 + j * 10}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredPatients.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No patients found</p>
                      <p className="text-xs text-slate-300">Click "Add" to enroll your first patient</p>
                    </div>
                  </td></tr>
                ) : filteredPatients.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-teal-50/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.patient_code} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{p.patient_code}</p>
                          <p className="text-[11px] text-slate-400">{p.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.sex === 'M' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        p.sex === 'F' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {p.sex === 'M' ? '♂ Male' : p.sex === 'F' ? '♀ Female' : p.sex || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{p.date_of_birth || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold ${
                        p.report_count > 0 ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-slate-100 text-slate-400'
                      }`}>{p.report_count}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.latest_report_id && (
                          <Link to={`/reports/${p.latest_report_id}/summary`} title="View Summary"
                            className="p-1.5 rounded-lg text-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link to={`/patients/${p.id}/history`} title="Health History"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                          <Activity className="w-3.5 h-3.5" />
                        </Link>
                        <Link to="/upload" title="Upload Report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                          <FileUp className="w-3.5 h-3.5" />
                        </Link>
                        <button title="Edit Patient"
                          onClick={() => { setCrudError(null); setEditingPatient(p); setEditForm({ patient_code: p.patient_code, date_of_birth: p.date_of_birth || '', sex: p.sex || 'M' }) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button title="Delete Patient"
                          onClick={() => { setCrudError(null); setDeletingPatient(p) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">

          {/* Recent Lab Reports */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Reports</h3>
              </div>
              <Link to="/patients" className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5 transition-colors">
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {metrics?.recent_reports?.length > 0 ? metrics.recent_reports.map((r) => (
                <div key={r.id} className="px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{r.filename}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  </div>
                  <Link to={`/reports/${r.id}/summary`}
                    className="shrink-0 text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-2 py-1 rounded-lg transition-all flex items-center gap-1">
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )) : (
                <div className="px-5 py-10 text-center">
                  <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No reports yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Risk Indicators</h3>
              </div>
              {metrics?.flagged_risk_indicators?.length > 0 && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                  {metrics.flagged_risk_indicators.length} active
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {metrics?.flagged_risk_indicators?.length > 0 ? metrics.flagged_risk_indicators.map((f) => (
                <div key={f.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{f.category}</span>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                      {f.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.explanation}</p>
                </div>
              )) : (
                <div className="px-5 py-10 text-center">
                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">All Clear</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No risk indicators flagged</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL — ENROLL PATIENT */}
      {/* ════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Enroll New Patient</h3>
                <p className="text-xs text-slate-400">Create a new clinical record</p>
              </div>
            </div>
            <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreatePatient} className="px-6 py-5 space-y-4">
            {crudError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {crudError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Code / Clinical ID *</label>
              <input type="text" required placeholder="e.g. PAT-2026-001 or MRN-8492"
                value={createForm.patient_code} onChange={e => setCreateForm({ ...createForm, patient_code: e.target.value })}
                className={fieldCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
                <input type="date" value={createForm.date_of_birth} onChange={e => setCreateForm({ ...createForm, date_of_birth: e.target.value })} className={fieldCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Biological Sex</label>
                <select value={createForm.sex} onChange={e => setCreateForm({ ...createForm, sex: e.target.value })} className={fieldCls}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" disabled={crudLoading}
                className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl disabled:opacity-50 transition-all shadow-sm">
                {crudLoading ? 'Enrolling...' : 'Enroll Patient'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL — EDIT PATIENT */}
      {/* ════════════════════════════════════════════════════════ */}
      {editingPatient && (
        <Modal onClose={() => setEditingPatient(null)}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Edit Patient Profile</h3>
                <p className="text-xs text-slate-400">{editingPatient.patient_code}</p>
              </div>
            </div>
            <button onClick={() => setEditingPatient(null)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleUpdatePatient} className="px-6 py-5 space-y-4">
            {crudError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {crudError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Code / Clinical ID *</label>
              <input type="text" required value={editForm.patient_code} onChange={e => setEditForm({ ...editForm, patient_code: e.target.value })} className={fieldCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
                <input type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} className={fieldCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Biological Sex</label>
                <select value={editForm.sex} onChange={e => setEditForm({ ...editForm, sex: e.target.value })} className={fieldCls}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setEditingPatient(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" disabled={crudLoading}
                className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-400 rounded-xl disabled:opacity-50 transition-all shadow-sm">
                {crudLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL — DELETE CONFIRM */}
      {/* ════════════════════════════════════════════════════════ */}
      {deletingPatient && (
        <Modal onClose={() => setDeletingPatient(null)}>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Patient Record?</h3>
                <p className="text-xs text-rose-500 font-semibold mt-0.5">This action is irreversible</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              You are about to permanently delete{' '}
              <strong className="text-slate-900">{deletingPatient.patient_code}</strong> and all associated data.
            </p>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-700 leading-relaxed">
              ⚠️ This will also erase all <strong>{deletingPatient.report_count} lab reports</strong>, biomarker findings, and analytical models linked to this patient.
            </div>

            {crudError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{crudError}</div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setDeletingPatient(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="button" onClick={handleDeletePatient} disabled={crudLoading}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50 transition-all shadow-sm">
                {crudLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
