import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import { Disclaimer } from '../components/common/Disclaimer'
import { formatScorePercent } from '../utils/formatters'
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'

export const ConsistencyPage = () => {
  const { reportId } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['consistency', reportId],
    queryFn: () => reportService.getConsistency(reportId),
    enabled: !!reportId,
  })

  if (isLoading) return <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading physiological checks...</div>

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/reports/${reportId}/summary`} className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mb-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Summary
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Engine 2: Physiological Consistency &amp; Reliability</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Cross-checks biological relationships to prevent blind reliance on isolated laboratory readings</p>
      </div>

      <Disclaimer customText="Biological consistency checks detect physiological discordance or potential extraction artifacts. Violations do NOT imply diagnosis." />

      {/* Aggregate Score Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Consistency Score</p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">{formatScorePercent(data?.consistency_score)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Aggregate Reliability Index</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatScorePercent(data?.reliability_score)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mean Extraction Confidence</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatScorePercent(data?.avg_extraction_confidence)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Baseline Stability</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatScorePercent(data?.baseline_stability)}</p>
        </div>
      </div>

      {/* Rule Results */}
      <div className="space-y-4">
        {data?.rule_results?.map((r) => {
          const isConsistent = r.status === 'CONSISTENT'
          const isMissing = r.status === 'MISSING_DATA'
          return (
            <div key={r.rule_id} className="card flex items-start gap-4">
              <div className="mt-1">
                {isConsistent ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : isMissing ? (
                  <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {r.biomarker_a_name} ↔ {r.biomarker_b_name}
                  </h3>
                  <span
                    className={
                      isConsistent ? 'badge-green' : isMissing ? 'badge-gray' : 'badge-yellow'
                    }
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{r.explanation}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
