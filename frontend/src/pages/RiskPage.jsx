import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import { Disclaimer } from '../components/common/Disclaimer'
import { RiskBadge } from '../components/common/RiskBadge'
import { formatScorePercent } from '../utils/formatters'
import {
  ArrowLeft,
  Activity,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  BarChart3,
  Layers,
  FileCheck,
} from 'lucide-react'

const CLINICAL_PATHWAYS = {
  Cardiovascular: {
    clinicalRationale: 'Atherogenic lipid dysregulation. Evaluates the balance of atherogenic apoB-containing particles (LDL, VLDL, Triglycerides) relative to anti-atherogenic particles (HDL).',
    actionableGuidance: 'Assess 10-year ASCVD risk. If LDL-C or Triglycerides remain persistently elevated, consider dietary saturated fat reduction, exercise regimen, and formal lipid management according to ACC/AHA guidelines.',
  },
  Metabolic: {
    clinicalRationale: 'Glucoregulatory and insulin sensitivity impairment. Cross-evaluates acute plasma glucose against 90-day non-enzymatic glycation of hemoglobin (HbA1c).',
    actionableGuidance: 'High acute glucose and elevated HbA1c indicate established chronic dysglycemia. Consider repeat confirmatory HbA1c, fasting insulin, lifestyle coaching, and endocrine referral if fasting glucose > 126 mg/dL.',
  },
  Renal: {
    clinicalRationale: 'Glomerular filtration and nitrogenous waste retention. Evaluates serum creatinine clearance, calculated eGFR, and electrolyte equilibrium.',
    actionableGuidance: 'Reduced eGFR (< 60 mL/min/1.73m²) or elevated creatinine suggests renal parenchymal or prerenal hemodynamic stress. Recommend spot urine albumin-to-creatinine ratio (uACR), blood pressure review, and medication nephrotoxicity audit.',
  },
  Hepatic: {
    clinicalRationale: 'Hepatocellular integrity and biliary clearance. Evaluates transaminases (ALT/AST) for hepatocellular leak, and ALP/Bilirubin for cholestatic or infiltrative patterns.',
    actionableGuidance: 'Elevated transaminases (AST/ALT) warrant review for non-alcoholic fatty liver disease (NAFLD/MASLD), viral hepatitides, medication-induced liver injury (DILI), or alcohol intake. Consider liver ultrasound if persistently abnormal.',
  },
  Haematological: {
    clinicalRationale: 'Erythrocyte kinetics, oxygen carrying capacity, and peripheral blood cell counts. Evaluates for microcytic/macrocytic anemia patterns and bone marrow cellularity.',
    actionableGuidance: 'Depressed hemoglobin and RBC count suggest active anemia. Review peripheral smear, serum ferritin, iron saturation, total iron-binding capacity (TIBC), and vitamin B12/folate levels.',
  },
  Thyroid: {
    clinicalRationale: 'Hypothalamic-pituitary-thyroid (HPT) axis feedback loop. TSH serves as an ultra-sensitive logarithmic biomarker for peripheral thyroid hormone adequacy.',
    actionableGuidance: 'Elevated TSH indicates subclinical or primary hypothyroidism. Recommend follow-up Free T4 and anti-thyroperoxidase (Anti-TPO) antibodies to assess autoimmune Hashimoto thyroiditis.',
  },
}

export const RiskPage = () => {
  const { reportId } = useParams()
  const [showFormula, setShowFormula] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { data: riskData, isLoading } = useQuery({
    queryKey: ['risk', reportId],
    queryFn: () => reportService.getRisk(reportId),
    enabled: !!reportId,
  })

  const { data: extractionData } = useQuery({
    queryKey: ['extraction', reportId],
    queryFn: () => reportService.getExtraction(reportId),
    enabled: !!reportId,
  })

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Loading multi-analyte risk model...
      </div>
    )
  }

  // Create lookup for units and reference ranges from extraction
  const extractionLookup = {}
  if (extractionData?.biomarkers) {
    for (const b of extractionData.biomarkers) {
      const key = (b.biomarker_name_canonical || b.biomarker_name_raw).toLowerCase()
      extractionLookup[key] = b
    }
  }

  const hri = riskData?.overall_health_risk_index ?? 0
  const hriPercent = (hri * 100).toFixed(1)
  const categories = riskData?.risk_category_results || []
  const flaggedCount = categories.filter((c) => c.is_flagged).length

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to={`/reports/${reportId}/summary`}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Summary
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔴</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Engine 3: Prioritized Multi-Test Disease Risk Analysis
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent organ-system risk stratification synthesizing multiple co-occurring laboratory anomalies
          </p>
        </div>

        <button
          onClick={() => setShowFormula(!showFormula)}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          {showFormula ? 'Hide Scoring Math' : 'Explain Scoring Math'}
        </button>
      </div>

      <Disclaimer customText="This framework synthesizes weighted laboratory feature indicators across 6 organ systems. It is NOT a definitive diagnosis and does NOT replace physician clinical judgment." />

      {/* Explanatory Collapsible Box for Doctors: How Engine 3 Calculates Risk */}
      {showFormula && (
        <div className="card p-5 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 space-y-3 transition-all text-xs leading-relaxed">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              How Engine 3 Computes the Health Risk Index (HRI)
            </h3>
            <button
              onClick={() => setShowFormula(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                Step 1: Feature Scoring (f)
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Each analyte receives a score:
                <br />• <strong>1.0</strong>: Outside population bounds
                <br />• <strong>0.5</strong>: Normal, but personal |Z| ≥ 2.0
                <br />• <strong>0.0</strong>: Completely normal
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                Step 2: Category Score (R)
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Weighted sum of features divided by total category weights:
                <br />
                <code className="text-teal-600 dark:text-teal-400 font-mono text-[11px]">
                  R = Σ(f_i × w_i) ÷ Σ(w_i)
                </code>
                <br />
                Yields a normalized risk from 0.0 to 1.0 per organ.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                Step 3: Overall HRI
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Severity-weighted sum across all 6 organ domains:
                <br />
                <code className="text-teal-600 dark:text-teal-400 font-mono text-[11px]">
                  HRI = Σ(R_c × Severity_c) ÷ Σ(Severity_c)
                </code>
                <br />
                Reflects overall multisystem clinical burden.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Executive Clinical Summary Banner */}
      <div className="card bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
                Multi-Analyte Composite Risk
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {flaggedCount} of {categories.length} organ domains exceed threshold
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {hriPercent}%
              </span>
              <span className="text-xs text-slate-400">Health Risk Index (HRI)</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Stratified Clinical Tier</p>
              <div className="mt-1">
                <RiskBadge tier={riskData?.risk_tier || 'Low'} />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Multi-Organ Risk Breakdown Bar Chart */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-300">Organ System Burden Distribution:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {categories.map((c) => {
              const scorePct = Math.round(c.normalized_score * 100)
              const isFlag = c.is_flagged
              return (
                <div
                  key={c.risk_category_id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === c.risk_category_id ? null : c.risk_category_id)
                  }
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedCategory === c.risk_category_id
                      ? 'ring-2 ring-teal-400 bg-slate-800'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 truncate">{c.risk_category_name}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isFlag ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {scorePct}%
                    </span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFlag ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(scorePct, 4)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Organ System Deep Dive Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Detailed Clinical Organ Evaluations
          </h3>
          <span className="text-xs text-slate-400">
            Click any organ above to focus, or scroll through evaluations
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {categories
            .filter((c) => (selectedCategory ? c.risk_category_id === selectedCategory : true))
            .map((c) => {
              const meta = CLINICAL_PATHWAYS[c.risk_category_name] || {
                clinicalRationale: c.explanation,
                actionableGuidance: 'Review routine clinical markers and patient presentation.',
              }
              const scorePct = Math.round(c.normalized_score * 100)

              return (
                <div
                  key={c.risk_category_id}
                  className={`card space-y-4 border transition-all ${
                    c.is_flagged
                      ? 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-white to-rose-50/20 dark:from-slate-900 dark:to-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          c.is_flagged
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {c.is_flagged ? '⚠️' : '✓'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {c.risk_category_name} Panel
                        </h4>
                        <p className="text-xs text-slate-400">
                          Domain Severity Weight: <strong className="text-slate-700 dark:text-slate-300">{c.severity_weight}x</strong> · Category Risk Score: <strong className={c.is_flagged ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{scorePct}%</strong>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        c.is_flagged
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {c.is_flagged ? 'Elevated Risk Pattern' : 'Normal / Low Risk'}
                    </span>
                  </div>

                  {/* Clinical Rationale & Guideline Guidance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Pathophysiological Rationale:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {meta.clinicalRationale}
                      </p>
                    </div>

                    <div className="bg-teal-50/50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200/80 dark:border-teal-800/80 space-y-1">
                      <span className="font-semibold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        Recommended Clinical Next Steps:
                      </span>
                      <p className="text-teal-900/90 dark:text-teal-200/90 leading-relaxed">
                        {meta.actionableGuidance}
                      </p>
                    </div>
                  </div>

                  {/* Constituent Biomarkers Table for Doctor */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Constituent Laboratory Analyte Breakdown:
                    </p>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-semibold tracking-wider">
                          <tr>
                            <th className="px-3.5 py-2.5">Biomarker</th>
                            <th className="px-3.5 py-2.5 text-center">Patient Observed Value</th>
                            <th className="px-3.5 py-2.5 text-center">Normal Reference Interval</th>
                            <th className="px-3.5 py-2.5 text-center">Weight in Domain</th>
                            <th className="px-3.5 py-2.5 text-center">Feature Score (f)</th>
                            <th className="px-3.5 py-2.5 text-right">Clinical Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {c.contributing_factors?.map((f) => {
                            const ext = extractionLookup[f.biomarker.toLowerCase()]
                            const unit = ext?.unit || ''
                            const refLow = ext?.ref_low_extracted
                            const refHigh = ext?.ref_high_extracted
                            const hasRange = refLow != null && refHigh != null
                            const val = f.value ?? ext?.numeric_value

                            return (
                              <tr
                                key={f.biomarker}
                                className={
                                  f.abnormal
                                    ? 'bg-rose-50/40 dark:bg-rose-950/20'
                                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                                }
                              >
                                <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">
                                  {f.biomarker}
                                </td>

                                <td className="px-3.5 py-2.5 text-center font-semibold">
                                  {val != null ? (
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs ${
                                        f.abnormal
                                          ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold'
                                          : 'text-slate-800 dark:text-slate-200'
                                      }`}
                                    >
                                      {val} {unit}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Not tested</span>
                                  )}
                                </td>

                                <td className="px-3.5 py-2.5 text-center text-slate-500 dark:text-slate-400">
                                  {hasRange ? `${refLow} – ${refHigh} ${unit}` : '—'}
                                </td>

                                <td className="px-3.5 py-2.5 text-center text-slate-600 dark:text-slate-300 font-mono">
                                  {Math.round(f.weight * 100)}%
                                </td>

                                <td className="px-3.5 py-2.5 text-center font-mono font-semibold">
                                  <span
                                    className={
                                      f.feature_score === 1.0
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : f.feature_score === 0.5
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-slate-400'
                                    }
                                  >
                                    {f.feature_score.toFixed(1)}
                                  </span>
                                </td>

                                <td className="px-3.5 py-2.5 text-right">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      f.abnormal
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : f.feature_score === 0.5
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    }`}
                                  >
                                    {f.abnormal
                                      ? 'Abnormal Flag'
                                      : f.feature_score === 0.5
                                      ? 'Baseline Shift'
                                      : 'Normal'}
                                  </span>
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
            })}
        </div>
      </div>
    </div>
  )
}
