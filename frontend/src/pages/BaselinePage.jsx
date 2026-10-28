import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import { Disclaimer } from '../components/common/Disclaimer'
import { getDeviationBadge } from '../utils/riskColors'
import { formatZScore } from '../utils/formatters'
import { ArrowLeft } from 'lucide-react'

export const BaselinePage = () => {
  const { reportId } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['baseline', reportId],
    queryFn: () => reportService.getBaseline(reportId),
    enabled: !!reportId,
  })

  if (isLoading) return <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading baseline deviations...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/reports/${reportId}/summary`} className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mb-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Summary
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Engine 1: Personalized Baseline Analysis</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Evaluates personal longitudinal trajectory vs generic reference ranges</p>
        </div>
      </div>

      <Disclaimer customText="Personalized baseline metrics measure patient deviation against their own prior results (μ, σ, Z-score). Where history is below threshold, population reference ranges are used." />

      <div className="grid grid-cols-1 gap-4">
        {data?.results?.map((b) => (
          <div key={b.biomarker_name} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{b.biomarker_name}</h3>
                <span className={getDeviationBadge(b.deviation_status)}>{b.deviation_status}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">({b.data_source})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Observed: <strong className="text-slate-800 dark:text-slate-200">{b.current_value ?? '—'} {b.current_unit}</strong>
                {b.historical_mean !== null && (
                  <> · Historical Baseline: <strong className="text-slate-800 dark:text-slate-200">{b.historical_mean.toFixed(2)} ± {b.historical_std?.toFixed(2)}</strong> ({b.sample_count} points)</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-6 sm:text-right shrink-0">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Z-Score Deviation</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatZScore(b.z_score)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Trend</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{b.trend_direction || 'STABLE'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
