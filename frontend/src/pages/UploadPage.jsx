import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { patientService } from '../services/patientService'
import { reportService } from '../services/reportService'
import { useAuthStore } from '../store/authStore'
import { ProgressSteps } from '../components/upload/ProgressSteps'
import { Disclaimer } from '../components/common/Disclaimer'
import { UploadCloud, File, AlertCircle, Lock } from 'lucide-react'

export const UploadPage = () => {
  const user = useAuthStore((s) => s.user)
  const isPatient = user?.role === 'patient'
  const patientUserId = user?.patient_id

  const [patientId, setPatientId] = useState(patientUserId || '')
  const [file, setFile] = useState(null)
  const [labName, setLabName] = useState('Standard Clinical Diagnostic Lab')
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [stage, setStage] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // Auto-populate patient ID for patient role on mount
  useEffect(() => {
    if (isPatient && patientUserId) {
      setPatientId(patientUserId)
    }
  }, [isPatient, patientUserId])

  // Only fetch the patient list for doctors
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAll(),
    enabled: !isPatient,
  })

  const handleUploadAndProcess = async (e) => {
    e.preventDefault()
    if (!patientId || !file) {
      setError('Please attach a valid laboratory report file.')
      return
    }

    setUploading(true)
    setError(null)
    try {
      // 1. Upload
      setStage(0)
      const report = await reportService.upload(patientId, file, reportDate, labName)

      // 2. OCR / Text Extraction
      setStage(1)
      await new Promise((r) => setTimeout(r, 600))

      // 3. Clinical NLP
      setStage(2)
      await reportService.extract(report.id)

      // 4. Move to verification review table
      setStage(3)
      navigate(`/reports/${report.id}/extraction`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Document processing failed. Please check file format.')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isPatient ? 'Upload My Lab Report' : 'Ingest Laboratory Report'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isPatient
            ? 'Upload your blood test or lab report (PDF or photo). We will extract your results and prepare a plain-language summary.'
            : 'Upload PDF, scanned documents, or report images for extraction'}
        </p>
      </div>

      <ProgressSteps currentStage={stage} />

      <Disclaimer />

      <div className="card">
        <form onSubmit={handleUploadAndProcess} className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient selector — locked for patient role, dropdown for doctors */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isPatient ? 'Your Patient Profile' : 'Target Patient'}
            </label>
            {isPatient ? (
              <div className="w-full px-3 py-2 border border-teal-300 dark:border-teal-700 rounded-lg text-sm bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span className="font-medium">{user?.full_name || 'Your profile'}</span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 ml-auto">Auto-selected</span>
              </div>
            ) : (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Patient Profile --</option>
                {patients?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_code} ({p.sex || 'Unknown'}, {p.report_count} existing reports)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isPatient ? 'Lab / Hospital Name' : 'Testing Laboratory Name'}
              </label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="e.g. City Diagnostic Lab"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Upload Document (PDF, PNG, JPG)
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-xl p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-teal-600 dark:text-teal-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {isPatient ? 'Click to choose your lab report' : 'Click to choose file or drag here'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                  Supports Digital PDF, Scanned PDF, or Medical Images (Max 20MB)
                </span>
              </label>
              {file && (
                <div className="mt-4 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg inline-flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                  <File className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || (isPatient && !patientId)}
            className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-50"
          >
            {uploading
              ? 'Processing & Extracting Biomarkers...'
              : isPatient
              ? 'Upload & Analyse My Report'
              : 'Extract & Review Biomarkers'}
          </button>
        </form>
      </div>
    </div>
  )
}
