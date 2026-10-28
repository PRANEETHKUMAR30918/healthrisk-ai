import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { patientService } from '../services/patientService'
import { Link } from 'react-router-dom'
import {
  User,
  Calendar,
  ChevronRight,
  Activity,
  UserPlus,
  Edit3,
  Trash2,
  FileUp,
  Search,
  X,
  AlertTriangle,
  AlertCircle,
  Check,
  FileText,
} from 'lucide-react'
import { Disclaimer } from '../components/common/Disclaimer'

export const PatientsPage = () => {
  const queryClient = useQueryClient()
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAll(),
  })

  // CRUD & Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [deletingPatient, setDeletingPatient] = useState(null)

  const [createForm, setCreateForm] = useState({
    patient_code: '',
    date_of_birth: '',
    sex: 'M',
  })

  const [editForm, setEditForm] = useState({
    patient_code: '',
    date_of_birth: '',
    sex: 'M',
  })

  const [crudLoading, setCrudLoading] = useState(false)
  const [crudError, setCrudError] = useState(null)
  const [crudSuccess, setCrudSuccess] = useState(null)

  const triggerNotification = (msg) => {
    setCrudSuccess(msg)
    setTimeout(() => setCrudSuccess(null), 4000)
  }

  // Handle Create Patient
  const handleCreatePatient = async (e) => {
    e.preventDefault()
    setCrudLoading(true)
    setCrudError(null)
    try {
      await patientService.create({
        patient_code: createForm.patient_code.trim(),
        date_of_birth: createForm.date_of_birth || null,
        sex: createForm.sex,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }),
      ])
      setShowCreateModal(false)
      setCreateForm({ patient_code: '', date_of_birth: '', sex: 'M' })
      triggerNotification(`Patient ${createForm.patient_code.trim()} successfully enrolled.`)
    } catch (err) {
      setCrudError(err.response?.data?.detail || 'Failed to enroll patient. Check code uniqueness.')
    } finally {
      setCrudLoading(false)
    }
  }

  // Handle Update Patient
  const handleUpdatePatient = async (e) => {
    e.preventDefault()
    if (!editingPatient) return
    setCrudLoading(true)
    setCrudError(null)
    try {
      await patientService.update(editingPatient.id, {
        patient_code: editForm.patient_code.trim(),
        date_of_birth: editForm.date_of_birth || null,
        sex: editForm.sex,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }),
      ])
      setEditingPatient(null)
      triggerNotification(`Patient ${editForm.patient_code.trim()} profile updated.`)
    } catch (err) {
      setCrudError(err.response?.data?.detail || 'Failed to update patient profile.')
    } finally {
      setCrudLoading(false)
    }
  }

  // Handle Delete Patient
  const handleDeletePatient = async () => {
    if (!deletingPatient) return
    setCrudLoading(true)
    setCrudError(null)
    try {
      await patientService.delete(deletingPatient.id)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }),
      ])
      const code = deletingPatient.patient_code
      setDeletingPatient(null)
      triggerNotification(`Patient ${code} and associated records deleted.`)
    } catch (err) {
      setCrudError(err.response?.data?.detail || 'Failed to delete patient.')
    } finally {
      setCrudLoading(false)
    }
  }

  const filteredPatients = (patients || []).filter((p) =>
    p.patient_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading patient cohort...</div>
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Monitored Patient Cohort</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Longitudinal baseline, demographic management &amp; laboratory history</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter patients..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-52"
            />
          </div>

          <button
            onClick={() => {
              setCrudError(null)
              setShowCreateModal(true)
            }}
            className="btn-primary gap-2 text-xs py-2 px-3.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Patient
          </button>
        </div>
      </div>

      <Disclaimer />

      {/* Notifications */}
      {crudSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{crudSuccess}</span>
          </div>
          <button onClick={() => setCrudSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((p) => (
          <div key={p.id} className="card hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm">
                    <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{p.patient_code}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sex: {p.sex || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="badge-blue text-[11px]">{p.report_count} panel(s)</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>DOB: {p.date_of_birth || 'Not recorded'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {/* Doctor Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setCrudError(null)
                    setEditingPatient(p)
                    setEditForm({
                      patient_code: p.patient_code,
                      date_of_birth: p.date_of_birth || '',
                      sex: p.sex || 'M',
                    })
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                  title="Edit Patient Demographics"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setCrudError(null)
                    setDeletingPatient(p)
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Patient Profile & Records"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/upload"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                  title="Ingest Lab Report"
                >
                  <FileUp className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {p.latest_report_id ? (
                  <Link
                    to={`/reports/${p.latest_report_id}/summary`}
                    className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1 shadow-sm"
                    title="View Latest Health Summary"
                  >
                    <FileText className="w-3 h-3" />
                    Summary
                  </Link>
                ) : (
                  <Link
                    to="/upload"
                    className="text-[11px] text-slate-400 hover:text-teal-600 transition-colors"
                    title="No reports ingested yet. Click to upload."
                  >
                    Upload Report
                  </Link>
                )}

                <Link
                  to={`/patients/${p.id}/history`}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-0.5 ml-1"
                  title="View Longitudinal History & Trends"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Trends
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No patients match your search criteria.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ENROLL NEW PATIENT */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Enroll New Patient</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {crudError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{crudError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Code / Clinical ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAT-2026-001 or MRN-8492"
                  value={createForm.patient_code}
                  onChange={(e) => setCreateForm({ ...createForm, patient_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={createForm.date_of_birth}
                    onChange={(e) => setCreateForm({ ...createForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={createForm.sex}
                    onChange={(e) => setCreateForm({ ...createForm, sex: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudLoading}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  {crudLoading ? 'Enrolling...' : 'Enroll Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT PATIENT */}
      {/* ========================================================================= */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Patient Profile</h3>
              </div>
              <button onClick={() => setEditingPatient(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {crudError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{crudError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Code / Clinical ID *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.patient_code}
                  onChange={(e) => setEditForm({ ...editForm, patient_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={editForm.sex}
                    onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudLoading}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  {crudLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-rose-200 dark:border-rose-900 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Patient Record</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400">Irreversible Clinical Deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete patient{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{deletingPatient.patient_code}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              ⚠️ Deleting this patient will also permanently erase all <strong>{deletingPatient.report_count} associated lab reports</strong>, extracted biomarker findings, and baseline analytical models.
            </p>

            {crudError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                {crudError}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingPatient(null)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePatient}
                disabled={crudLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {crudLoading ? 'Deleting...' : 'Yes, Delete Patient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
