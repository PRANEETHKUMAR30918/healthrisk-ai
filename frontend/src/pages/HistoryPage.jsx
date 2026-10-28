import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { patientService } from '../services/patientService'
import { reportService } from '../services/reportService'
import { BiomarkerTrendChart } from '../components/charts/BiomarkerTrendChart'
import { Disclaimer } from '../components/common/Disclaimer'
import { ArrowLeft, Activity, Calendar, Sparkles, FileUp, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

const COMMON_BIOMARKERS = [
  'Hemoglobin',
  'Fasting Blood Glucose',
  'Total Cholesterol',
  'Serum Creatinine',
  'RBC',
  'HbA1c',
  'MCV',
  'LDL',
]

export const HistoryPage = () => {
  const { patientId } = useParams()
  const [selectedBiomarker, setSelectedBiomarker] = useState('Hemoglobin')

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.get(patientId),
    enabled: !!patientId,
  })

  const { data: reports } = useQuery({
    queryKey: ['reports', patientId],
    queryFn: () => reportService.list(patientId),
    enabled: !!patientId,
  })

  const { data: trend } = useQuery({
    queryKey: ['trend', patientId, selectedBiomarker],
    queryFn: () => patientService.getBiomarkerTrend(patientId, selectedBiomarker),
    enabled: !!patientId && !!selectedBiomarker,
  })

  const latestReport = reports && reports.length > 0 ? reports[0] : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/patients" className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mb-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cohort
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Longitudinal Patient Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Patient: <strong className="text-slate-800 dark:text-slate-200">{patient?.patient_code}</strong> · Sex: {patient?.sex || 'N/A'} · DOB: {patient?.date_of_birth || 'N/A'}
          </p>
        </div>

        {latestReport && (
          <div className="flex items-center gap-2">
            <Link
              to={`/reports/${latestReport.id}/summary`}
              className="btn-primary text-xs py-2 px-3.5 font-semibold flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-4 h-4" />
              View Latest Summary
            </Link>
            <Link
              to="/upload"
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <FileUp className="w-4 h-4" />
              Upload Report
            </Link>
          </div>
        )}
      </div>

      <Disclaimer customText="Longitudinal graphs illustrate biomarker trends over time. Declines or surges within population bounds can be clinically meaningful." />

      {/* Trend Visualizer */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Longitudinal Trend Analysis</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Biomarker:</label>
            <select
              value={selectedBiomarker}
              onChange={(e) => setSelectedBiomarker(e.target.value)}
              className="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {COMMON_BIOMARKERS.map((bm) => (
                <option key={bm} value={bm}>
                  {bm}
                </option>
              ))}
            </select>
          </div>
        </div>

        <BiomarkerTrendChart
          biomarker={selectedBiomarker}
          unit=""
          values={trend?.historical_values || []}
        />
      </div>

      {/* Historical Reports List */}
      <div className="card space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Recorded Laboratory Encounters
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports?.map((r) => {
            const isAnalyzed = r.processing_status === 'ANALYZED'
            const isFailed = r.processing_status === 'FAILED'
            const isExtractionDone = r.processing_status === 'EXTRACTION_DONE'

            return (
              <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.original_filename}</p>
                    {isAnalyzed ? (
                      <span className="badge-emerald text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Analyzed
                      </span>
                    ) : isFailed ? (
                      <span className="badge-red text-[11px] font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    ) : isExtractionDone ? (
                      <span className="badge-blue text-[11px] font-semibold">Extracted</span>
                    ) : (
                      <span className="badge-amber text-[11px] font-semibold">{r.processing_status}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Date: {r.report_date || 'Undated'} · Lab: {r.lab_name || 'Standard Lab'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isFailed ? (
                    <Link
                      to="/upload"
                      className="btn-secondary text-xs py-1.5 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Re-upload
                    </Link>
                  ) : (
                    <Link
                      to={`/reports/${r.id}/summary`}
                      className={`text-xs py-1.5 px-3 font-semibold flex items-center gap-1.5 ${
                        isAnalyzed ? 'btn-primary' : 'btn-secondary text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Summary
                    </Link>
                  )}
                  {isExtractionDone && (
                    <Link
                      to={`/reports/${r.id}/extraction`}
                      className="btn-secondary text-xs py-1.5 px-2.5 text-slate-500"
                      title="Review Extracted Biomarkers"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
          {(!reports || reports.length === 0) && (
            <p className="text-xs text-slate-400 py-4 text-center">No reports on file for this patient.</p>
          )}
        </div>
      </div>
    </div>
  )
}
