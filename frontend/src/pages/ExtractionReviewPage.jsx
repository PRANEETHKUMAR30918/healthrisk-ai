import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator'
import { Disclaimer } from '../components/common/Disclaimer'
import { ProgressSteps } from '../components/upload/ProgressSteps'
import { Play, Edit2, Check } from 'lucide-react'

export const ExtractionReviewPage = () => {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const [analyzing, setAnalyzing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editUnit, setEditUnit] = useState('')

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['extraction', reportId],
    queryFn: () => reportService.getExtraction(reportId),
    enabled: !!reportId,
  })

  const handleStartEdit = (b) => {
    setEditingId(b.id)
    setEditValue(b.corrected_value ?? b.numeric_value?.toString() ?? '')
    setEditUnit(b.corrected_unit ?? b.unit ?? '')
  }

  const handleSaveCorrection = async (biomarkerId) => {
    const num = parseFloat(editValue)
    if (isNaN(num)) return
    await reportService.correctBiomarker(reportId, biomarkerId, num, editUnit)
    setEditingId(null)
    refetch()
  }

  const handleRunAnalysis = async () => {
    setAnalyzing(true)
    try {
      await reportService.analyze(reportId)
      navigate(`/reports/${reportId}/summary`)
    } catch (err) {
      alert('Analysis execution failed. Please verify extracted parameters.')
      setAnalyzing(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading extracted findings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Biomarker Verification Review</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Method: <span className="font-semibold text-slate-700 dark:text-slate-300">{data?.extraction_method}</span> · Mean Confidence:{' '}
            <span className="font-semibold text-teal-600 dark:text-teal-400">{((data?.overall_confidence || 0) * 100).toFixed(1)}%</span>
          </p>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="btn-primary gap-2 font-semibold shadow-md"
        >
          <Play className="w-4 h-4 fill-white" />
          {analyzing ? 'Evaluating Engines...' : 'Execute Three-Engine Analysis'}
        </button>
      </div>

      <ProgressSteps currentStage={3} />

      <Disclaimer customText="Before executing analytical risk engines, review automated OCR and NLP extraction. Low-confidence extractions are highlighted. Clinicians can adjust values inline." />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Reported Biomarker</th>
                <th className="px-5 py-3">Canonical Standard</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3">Reference Interval</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data?.biomarkers?.map((b) => {
                const isEditing = editingId === b.id
                const isLowConf = b.confidence_score < 0.65
                return (
                  <tr key={b.id} className={isLowConf ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}>
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">{b.biomarker_name_raw}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{b.biomarker_name_canonical || 'Unmapped'}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-teal-500 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      ) : (
                        b.corrected_value ?? b.numeric_value ?? 'N/A'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className="w-16 px-2 py-1 border border-teal-500 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      ) : (
                        b.corrected_unit || b.unit || '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500">
                      {b.ref_low_extracted !== null && b.ref_high_extracted !== null
                        ? `${b.ref_low_extracted} – ${b.ref_high_extracted}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <ConfidenceIndicator confidence={b.confidence_score} />
                    </td>
                    <td className="px-5 py-3.5">
                      {b.is_corrected ? (
                        <span className="badge-blue text-[10px]">Verified Correction</span>
                      ) : isLowConf ? (
                        <span className="badge-yellow text-[10px]">Review Required</span>
                      ) : (
                        <span className="badge-green text-[10px]">Extracted</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveCorrection(b.id)}
                          className="p-1 rounded bg-teal-600 text-white hover:bg-teal-700"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(b)}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded"
                          title="Correct extraction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
