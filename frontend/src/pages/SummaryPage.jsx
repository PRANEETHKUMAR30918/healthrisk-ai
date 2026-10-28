import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import { Disclaimer } from '../components/common/Disclaimer'
import { RiskBadge } from '../components/common/RiskBadge'
import { getBiomarkerInsights, detectSuddenShift } from '../utils/biomarkerClinicalKnowledge'
import {
  Heart,
  Droplet,
  Activity,
  ShieldCheck,
  Stethoscope,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Sparkles,
  Smile,
  AlertCircle,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react'


const FRIENDLY_NAMES = {
  'Hemoglobin': 'Hemoglobin (Blood Oxygen Carrier)',
  'Fasting Blood Glucose': 'Fasting Blood Sugar (Energy & Diabetes)',
  'HbA1c': 'HbA1c (3-Month Blood Sugar Memory)',
  'Total Cholesterol': 'Total Cholesterol (Total Blood Fats)',
  'LDL': 'LDL Cholesterol ("Bad" Cholesterol)',
  'HDL': 'HDL Cholesterol ("Good" Protective Cholesterol)',
  'Triglycerides': 'Triglycerides (Stored Blood Fats)',
  'Serum Creatinine': 'Serum Creatinine (Kidney Filter Marker)',
  'eGFR': 'eGFR (Kidney Filtration Efficiency)',
  'ALT': 'ALT / SGPT (Liver Health Enzyme)',
  'AST': 'AST / SGOT (Liver & Cellular Enzyme)',
  'Bilirubin': 'Bilirubin (Liver Bile Breakdown)',
  'TSH': 'TSH (Thyroid Activity Signal)',
  'Free T3': 'Free T3 (Active Thyroid Hormone)',
  'Free T4': 'Free T4 (Thyroid Storage Hormone)',
  'RBC': 'Red Blood Cells (Oxygen Delivery)',
  'WBC': 'White Blood Cells (Immune Defenders)',
  'Platelets': 'Platelets (Blood Clotting Cells)',
  'Vitamin D': 'Vitamin D (Bone & Immune Health)',
  'Vitamin B12': 'Vitamin B12 (Nerves & Energy)',
  'Calcium': 'Calcium (Bones & Muscle Contraction)',
  'Potassium': 'Potassium (Heart Rhythm & Muscle Salt)',
  'Sodium': 'Sodium (Hydration & Blood Pressure Salt)',
  'Uric Acid': 'Uric Acid (Joint & Kidney Health)',
  'ESR': 'ESR (Body Inflammation Indicator)',
}

const formatNum = (v) => {
  if (v == null || v === '') return ''
  const n = Number(v)
  return isNaN(n) ? String(v) : n.toFixed(1)
}

// ─── Clinical Insight Card ────────────────────────────────────────────────────
function BiomarkerInsightCard({ name, status, presentVal, previousVal, refLow, refHigh }) {
  const [expanded, setExpanded] = useState(false)

  const isHigh = status === 'danger' && refHigh != null && Number(presentVal) > Number(refHigh)
  const isLow = status === 'danger' && refLow != null && Number(presentVal) < Number(refLow)
  const isWarning = status === 'warning'

  const { hasSuddenShift, direction } = detectSuddenShift(presentVal, previousVal)

  const insights = getBiomarkerInsights(name, status, isHigh || (isWarning && refHigh != null && Number(presentVal) > Number(refHigh)), isLow || (isWarning && refLow != null && Number(presentVal) < Number(refLow)), direction, hasSuddenShift)

  if (!insights) return null
  const { disadvantages, shiftReasons } = insights
  if (disadvantages.length === 0 && shiftReasons.length === 0) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2 py-1 transition-colors ${
          hasSuddenShift
            ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-950'
            : isHigh || isWarning
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-950'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-950'
        }`}
      >
        {hasSuddenShift ? (
          <><Zap className="w-3 h-3" /> Sudden {direction === 'increase' ? 'Rise' : 'Drop'} — Why?</>
        ) : (
          <><AlertTriangle className="w-3 h-3" /> Health Disadvantages</>
        )}
        {expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {disadvantages.length > 0 && (
            <div className={`rounded-lg p-3 border text-[11px] leading-relaxed ${
              isHigh || isWarning
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
            }`}>
              <p className={`font-bold mb-1.5 flex items-center gap-1 ${isHigh || isWarning ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {isHigh || isWarning ? 'Risks of a High Value' : 'Risks of a Low Value'}
              </p>
              <ul className={`space-y-0.5 list-disc list-inside ${isHigh || isWarning ? 'text-rose-900 dark:text-rose-200/80' : 'text-amber-900 dark:text-amber-200/80'}`}>
                {disadvantages.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
          {shiftReasons.length > 0 && (
            <div className="rounded-lg p-3 border bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/60 text-[11px] leading-relaxed">
              <p className="font-bold mb-1.5 flex items-center gap-1 text-violet-800 dark:text-violet-300">
                <Zap className="w-3 h-3 shrink-0" />
                Possible Reasons for Sudden {direction === 'increase' ? 'Increase' : 'Decrease'}
              </p>
              <ul className="space-y-0.5 list-disc list-inside text-violet-900 dark:text-violet-200/80">
                {shiftReasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Generate simple human opinion comparing Present, Previous, and Reference Range
function generatePatientOpinion(name, currentVal, prevVal, refLow, refHigh, unit) {
  if (currentVal == null || currentVal === '') {
    return {
      opinion: 'No numerical reading recorded in this report.',
      status: 'neutral',
      badge: 'Not Tested',
    }
  }

  const cVal = Number(currentVal)
  const pVal = prevVal != null && prevVal !== '' ? Number(prevVal) : null
  const rLow = refLow != null && refLow !== '' ? Number(refLow) : null
  const rHigh = refHigh != null && refHigh !== '' ? Number(refHigh) : null
  const u = unit || ''

  if (isNaN(cVal)) {
    return {
      opinion: `Recorded as "${currentVal}". Qualitative observation.`,
      status: 'neutral',
      badge: 'Recorded',
    }
  }

  const hasRange = rLow != null && rHigh != null && !isNaN(rLow) && !isNaN(rHigh)
  const isHigh = hasRange && cVal > rHigh
  const isLow = hasRange && cVal < rLow
  const isNormal = hasRange && !isHigh && !isLow

  // Comparison with previous
  const hasPrev = pVal != null && !isNaN(pVal)
  const diff = hasPrev ? cVal - pVal : null
  const increased = hasPrev && diff != null && diff > 0.01 * Math.abs(pVal || 1)
  const decreased = hasPrev && diff != null && diff < -0.01 * Math.abs(pVal || 1)

  if (isHigh) {
    if (hasPrev && increased) {
      return {
        opinion: `Above normal range and rose from your previous checkup (${formatNum(pVal)} ${u} ➔ ${formatNum(cVal)} ${u}). Discuss lifestyle adjustments with your doctor.`,
        status: 'danger',
        badge: 'Higher Than Normal',
      }
    } else if (hasPrev && decreased) {
      return {
        opinion: `Above normal range, but improving compared to your previous checkup (${formatNum(pVal)} ${u}). Good trend, keep monitoring.`,
        status: 'warning',
        badge: 'Above Normal (Improving)',
      }
    }
    return {
      opinion: `Higher than the standard healthy range (${formatNum(rLow)} – ${formatNum(rHigh)} ${u}). Recommended to review with your doctor.`,
      status: 'danger',
      badge: 'Higher Than Normal',
    }
  }

  if (isLow) {
    if (hasPrev && decreased) {
      return {
        opinion: `Lower than normal range and dropped compared to your last test (${formatNum(pVal)} ${u}). Ask your doctor about possible nutritional or supplement support.`,
        status: 'danger',
        badge: 'Lower Than Normal',
      }
    } else if (hasPrev && increased) {
      return {
        opinion: `Still below normal, but heading up towards healthy range from your last test (${formatNum(pVal)} ${u}).`,
        status: 'warning',
        badge: 'Below Normal (Rising)',
      }
    }
    return {
      opinion: `Lower than the standard healthy range (${formatNum(rLow)} – ${formatNum(rHigh)} ${u}). Consider discussing with your doctor.`,
      status: 'danger',
      badge: 'Lower Than Normal',
    }
  }

  if (isNormal) {
    if (hasPrev && Math.abs(diff || 0) < 0.1 * (Math.abs(pVal) || 1)) {
      return {
        opinion: `Healthy and stable. Closely matches your previous checkup (${formatNum(pVal)} ${u}).`,
        status: 'good',
        badge: 'Normal & Stable',
      }
    } else if (hasPrev && increased) {
      return {
        opinion: `Within normal range. Slightly higher than your previous checkup (${formatNum(pVal)} ${u}), but still completely safe.`,
        status: 'good',
        badge: 'Normal (Safe)',
      }
    } else if (hasPrev && decreased) {
      return {
        opinion: `Within normal range. Slightly lower than your previous checkup (${formatNum(pVal)} ${u}), but within healthy limits.`,
        status: 'good',
        badge: 'Normal (Safe)',
      }
    }
    return {
      opinion: `Well within healthy normal bounds (${formatNum(rLow)} – ${formatNum(rHigh)} ${u}).`,
      status: 'good',
      badge: 'Normal',
    }
  }

  // Fallback if no reference ranges available
  if (hasPrev) {
    return {
      opinion: `Measured at ${formatNum(cVal)} ${u} (Previous report was ${formatNum(pVal)} ${u}). Stable trend.`,
      status: 'neutral',
      badge: 'Recorded',
    }
  }

  return {
    opinion: `Recorded at ${formatNum(cVal)} ${u}. First time tested on record.`,
    status: 'neutral',
    badge: 'Recorded',
  }
}

export const SummaryPage = () => {
  const { reportId } = useParams()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState('patient') // 'patient' or 'clinical'
  const [copiedQuestions, setCopiedQuestions] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'attention', 'normal'
  const [runningAnalysis, setRunningAnalysis] = useState(false)

  // Fetch report details (to know patient_id, report_date, filename, processing_status)
  const { data: reportData, isLoading: loadingReport, isError: errorReport } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportService.get(reportId),
    enabled: !!reportId,
  })

  const patientId = reportData?.patient_id

  // Fetch all reports of this patient
  const { data: patientReports } = useQuery({
    queryKey: ['reports', patientId],
    queryFn: () => reportService.list(patientId),
    enabled: !!patientId,
  })

  // Identify immediately preceding report
  const prevReport = useMemo(() => {
    if (!patientReports || patientReports.length <= 1) return null

    // Filter out current report
    const otherReports = patientReports.filter((r) => r.id !== reportId)
    if (otherReports.length === 0) return null

    // Determine current report date / timestamp
    const currentTimestamp = new Date(reportData?.report_date || reportData?.created_at || Date.now()).getTime()

    // Prior reports dated before or equal to current report
    const strictlyPrior = otherReports.filter((r) => {
      const rTime = new Date(r.report_date || r.created_at).getTime()
      return rTime <= currentTimestamp
    })

    const candidateList = strictlyPrior.length > 0 ? strictlyPrior : otherReports

    // Sort descending by date so index 0 is the most recent prior report
    candidateList.sort((a, b) => {
      const aTime = new Date(a.report_date || a.created_at).getTime()
      const bTime = new Date(b.report_date || b.created_at).getTime()
      return bTime - aTime
    })

    return candidateList[0] || null
  }, [patientReports, reportData, reportId])

  // Fetch extractions of immediately preceding report (if any)
  const { data: prevExtractionData } = useQuery({
    queryKey: ['extraction', prevReport?.id],
    queryFn: () => reportService.getExtraction(prevReport.id),
    enabled: !!prevReport?.id,
  })

  // Fetch current report data
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary', reportId],
    queryFn: () => reportService.getSummary(reportId),
    enabled: !!reportId,
    retry: 1,
  })

  const { data: extractionData } = useQuery({
    queryKey: ['extraction', reportId],
    queryFn: () => reportService.getExtraction(reportId),
    enabled: !!reportId,
  })

  const { data: baselineData } = useQuery({
    queryKey: ['baseline', reportId],
    queryFn: () => reportService.getBaseline(reportId),
    enabled: !!reportId,
    retry: 1,
  })

  const { data: riskData } = useQuery({
    queryKey: ['risk', reportId],
    queryFn: () => reportService.getRisk(reportId),
    enabled: !!reportId,
    retry: 1,
  })

  const handleRunAnalysisNow = async () => {
    setRunningAnalysis(true)
    try {
      await reportService.analyze(reportId)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['report', reportId] }),
        queryClient.invalidateQueries({ queryKey: ['summary', reportId] }),
        queryClient.invalidateQueries({ queryKey: ['baseline', reportId] }),
        queryClient.invalidateQueries({ queryKey: ['risk', reportId] }),
      ])
    } catch (err) {
      console.error('Failed to run analysis:', err)
      alert('Analysis execution failed. Please verify extracted parameters.')
    } finally {
      setRunningAnalysis(false)
    }
  }

  const cleanKey = (str) => (str ? String(str).toLowerCase().replace(/[^a-z0-9]/g, '') : '')

  const riskCategoryResults = useMemo(() => {
    return Array.isArray(riskData?.risk_category_results) ? riskData.risk_category_results : []
  }, [riskData])

  const flaggedCategories = useMemo(() => {
    return riskCategoryResults.filter((c) => c && c.is_flagged)
  }, [riskCategoryResults])

  const isHighRisk = summary?.risk_tier === 'Elevated' || summary?.risk_tier === 'Moderate' || flaggedCategories.length > 0

  // 1. Direct Extraction Map from Previous Report
  const prevBiomarkerMap = useMemo(() => {
    const map = {}
    if (prevExtractionData?.biomarkers && Array.isArray(prevExtractionData.biomarkers)) {
      for (const b of prevExtractionData.biomarkers) {
        if (!b) continue
        const val = b.corrected_value != null ? b.corrected_value : b.numeric_value
        if (val == null) continue

        const item = {
          val: Number(val),
          unit: b.corrected_unit || b.unit || '',
          raw: b.biomarker_name_raw || '',
          canonical: b.biomarker_name_canonical || '',
        }

        if (b.biomarker_name_canonical) {
          const c = String(b.biomarker_name_canonical).toLowerCase().trim()
          map[c] = item
          map[cleanKey(b.biomarker_name_canonical)] = item
        }
        if (b.biomarker_name_raw) {
          const r = String(b.biomarker_name_raw).toLowerCase().trim()
          map[r] = item
          map[cleanKey(b.biomarker_name_raw)] = item
        }
      }
    }
    return map
  }, [prevExtractionData])

  // 2. Baseline Engine Results Map
  const baselineMap = useMemo(() => {
    const map = {}
    if (baselineData?.results && Array.isArray(baselineData.results)) {
      for (const b of baselineData.results) {
        if (!b || !b.biomarker_name) continue
        const item = {
          historical_mean: b.historical_mean,
          current_unit: b.current_unit,
          sample_count: b.sample_count,
          trend_direction: b.trend_direction,
          status: b.deviation_status,
        }
        const name = String(b.biomarker_name).toLowerCase().trim()
        map[name] = item
        map[cleanKey(b.biomarker_name)] = item
      }
    }
    return map
  }, [baselineData])

  const comparisonRows = useMemo(() => {
    if (!extractionData?.biomarkers || !Array.isArray(extractionData.biomarkers)) return []

    return extractionData.biomarkers
      .map((b) => {
        if (!b) return null
        const rawName = b.biomarker_name_raw || ''
        const canonicalName = b.biomarker_name_canonical || ''
        const canonical = canonicalName || rawName || 'Biomarker'
        const cleanC = cleanKey(canonical)
        const cleanR = cleanKey(rawName)
        const lowerC = canonical.toLowerCase().trim()
        const lowerR = rawName.toLowerCase().trim()

        const base =
          baselineMap[lowerC] ||
          baselineMap[cleanC] ||
          baselineMap[lowerR] ||
          baselineMap[cleanR]

        const presentVal = b.corrected_value != null ? b.corrected_value : b.numeric_value

        let previousVal = base?.historical_mean ?? null
        if (previousVal == null) {
          const prevExt =
            prevBiomarkerMap[lowerC] ||
            prevBiomarkerMap[cleanC] ||
            prevBiomarkerMap[lowerR] ||
            prevBiomarkerMap[cleanR]

          if (prevExt && prevExt.val != null) {
            previousVal = prevExt.val
          }
        }

        const unit = b.corrected_unit || b.unit || base?.current_unit || ''
        const refLow = b.ref_low_extracted
        const refHigh = b.ref_high_extracted

        const { opinion, status, badge } = generatePatientOpinion(
          canonical,
          presentVal,
          previousVal,
          refLow,
          refHigh,
          unit
        )

        return {
          id: b.id || `${canonical}-${Math.random()}`,
          name: canonical,
          friendlyName: FRIENDLY_NAMES[canonical] || canonical,
          presentVal,
          previousVal,
          unit,
          refLow,
          refHigh,
          opinion,
          status,
          badge,
        }
      })
      .filter(Boolean)
  }, [extractionData, baselineMap, prevBiomarkerMap])

  // Filter rows
  const filteredRows = useMemo(() => {
    return comparisonRows.filter((row) => {
      if (!row) return false
      const rName = String(row.name || '').toLowerCase()
      const fName = String(row.friendlyName || '').toLowerCase()
      const q = String(searchFilter || '').toLowerCase().trim()
      const matchesSearch = !q || rName.includes(q) || fName.includes(q)

      if (statusFilter === 'attention') {
        return matchesSearch && (row.status === 'danger' || row.status === 'warning')
      }
      if (statusFilter === 'normal') {
        return matchesSearch && row.status === 'good'
      }
      return matchesSearch
    })
  }, [comparisonRows, searchFilter, statusFilter])

  // Dynamic questions to ask doctor
  const doctorQuestions = useMemo(() => {
    const questions = []
    const categoryNames = flaggedCategories.map((c) => String(c.risk_category_name || '').toLowerCase())

    if (categoryNames.some((n) => n.includes('metabolic'))) {
      questions.push('My blood sugar and HbA1c are higher than normal. What diet or lifestyle changes should I start today?')
    }
    if (categoryNames.some((n) => n.includes('cardio') || n.includes('lipid'))) {
      questions.push('My cholesterol numbers showed an elevated pattern. Can we try diet changes first or do I need medication?')
    }
    if (categoryNames.some((n) => n.includes('renal') || n.includes('kidney'))) {
      questions.push('My kidney filtration rate (eGFR) or creatinine was flagged. How much water should I drink, and are there medicines I should avoid?')
    }
    if (categoryNames.some((n) => n.includes('haemat') || n.includes('blood') || n.includes('anemia'))) {
      questions.push('My red blood cells / hemoglobin look lower than normal. Could this be causing fatigue, and do I need iron or vitamin B12?')
    }
    if (categoryNames.some((n) => n.includes('thyroid'))) {
      questions.push('My thyroid test (TSH) was out of range. Should we test free T3 and T4, or consider thyroid hormone support?')
    }
    if (questions.length === 0) {
      questions.push('My lab numbers look generally good. What preventive screenings should I plan for over the next year?')
      questions.push('How often do you recommend I repeat routine blood tests?')
    }
    return questions
  }, [flaggedCategories])

  const handleCopyQuestions = () => {
    const text = doctorQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedQuestions(true)
    setTimeout(() => setCopiedQuestions(false), 2500)
  }

  const keyFindingsList = useMemo(() => {
    if (Array.isArray(summary?.key_findings)) return summary.key_findings
    if (typeof summary?.key_findings === 'string') return [summary.key_findings]
    return []
  }, [summary])

  const summarySectionsList = useMemo(() => {
    if (Array.isArray(summary?.summary_sections)) return summary.summary_sections
    return []
  }, [summary])

  const recommendationsList = useMemo(() => {
    if (Array.isArray(summary?.recommendations)) return summary.recommendations
    if (typeof summary?.recommendations === 'string') return [summary.recommendations]
    return []
  }, [summary])

  if (loadingReport) {
    return (
      <div className="p-16 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto animate-spin" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Loading Laboratory Encounter...
        </p>
      </div>
    )
  }

  if (errorReport || (!reportData && !loadingReport)) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto card border-rose-200 dark:border-rose-900 mt-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Report Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We could not locate this laboratory report encounter.
        </p>
        <Link to="/patients" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 mx-auto">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Cohort
        </Link>
      </div>
    )
  }

  if (reportData?.processing_status === 'FAILED') {
    return (
      <div className="p-12 text-center space-y-4 max-w-lg mx-auto card border-rose-200 dark:border-rose-900 mt-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Document Processing Incomplete</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The uploaded file (<strong>{reportData.original_filename}</strong>) could not be extracted or contains no readable biomarker tables. Please upload a clear digital PDF or high-resolution photo.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/upload" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
            Ingest New Report
          </Link>
          <Link
            to={patientId ? `/patients/${patientId}/history` : '/patients'}
            className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Profile
          </Link>
        </div>
      </div>
    )
  }

  if (extractionData && Array.isArray(extractionData.biomarkers) && extractionData.biomarkers.length === 0) {
    return (
      <div className="p-12 text-center space-y-4 max-w-lg mx-auto card border-amber-200 dark:border-amber-900 mt-8">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Biomarkers Found in Report</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The document (<strong>{reportData?.original_filename}</strong>) was parsed, but no recognizable clinical biomarkers or laboratory test values were detected.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/upload" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
            Ingest New Report
          </Link>
          <Link
            to={patientId ? `/patients/${patientId}/history` : '/patients'}
            className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Profile
          </Link>
        </div>
      </div>
    )
  }

  if (loadingSummary && !summary && !extractionData) {
    return (
      <div className="p-16 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto animate-spin" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Preparing your personalized laboratory summary...
        </p>
        <p className="text-xs text-slate-400">Translating findings into plain words and comparing reference values</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Back to Patient Profile / Cohort Link */}
      <div className="flex items-center justify-between">
        <Link
          to={patientId ? `/patients/${patientId}/history` : '/patients'}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Profile &amp; History
        </Link>
        {reportData && (
          <span className="text-xs text-slate-400">
            Report Encounter: <strong className="text-slate-600 dark:text-slate-300">{reportData.original_filename}</strong>
          </span>
        )}
      </div>

      {/* Top Header with Patient vs Clinical View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {viewMode === 'patient' ? 'Your Health Report — In Plain Words' : 'Clinical Multi-Engine Synthesis'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {viewMode === 'patient'
              ? 'Clear comparison of your previous report, present numbers, reference ranges, and AI opinion.'
              : 'Detailed diagnostic Z-scores, biological consistency ratios, and multi-test risk.'}
          </p>
        </div>

        {/* View Mode Switcher Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start md:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('patient')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'patient'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            Patient View (Simple)
          </button>
          <button
            onClick={() => setViewMode('clinical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'clinical'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Doctor View (Technical)
          </button>
        </div>
      </div>

      <Disclaimer customText="This summary is designed to help you understand your blood test. It does not replace your doctor. Please never start or stop any medications without speaking to your doctor first." />

      {reportData && reportData.processing_status !== 'ANALYZED' && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm text-teal-950 dark:text-teal-100">
                Multi-Engine Risk Analysis Not Executed Yet
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5">
                Run the 3-engine analysis to calculate personalized baseline deviations, biological consistency, and multi-test organ risk tiers.
              </p>
            </div>
          </div>
          <button
            onClick={handleRunAnalysisNow}
            disabled={runningAnalysis}
            className="btn-primary text-xs shrink-0 py-2.5 px-4 font-semibold shadow"
          >
            {runningAnalysis ? 'Analyzing Report...' : 'Run Analysis Now'}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PATIENT VIEW (SIMPLE & CLEAR WITH COMPARISON TABLE) */}
      {/* ========================================================================= */}
      {viewMode === 'patient' && (
        <div className="space-y-6">
          {/* Plain English Headline Status Banner */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              !summary
                ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
                : isHighRisk
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm ${
                    !summary
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : isHighRisk
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {!summary ? '📋' : isHighRisk ? '⚠️' : '✅'}
                </div>
                <div>
                  <h3
                    className={`text-lg font-bold ${
                      !summary
                        ? 'text-blue-950 dark:text-blue-100'
                        : isHighRisk
                        ? 'text-amber-950 dark:text-amber-100'
                        : 'text-emerald-950 dark:text-emerald-100'
                    }`}
                  >
                    {!summary
                      ? 'Biomarkers Extracted — Multi-Engine Analysis Ready'
                      : isHighRisk
                      ? `${flaggedCategories.length} body system(s) need attention from your doctor`
                      : 'Your blood test looks mostly balanced and stable!'}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                      !summary
                        ? 'text-blue-800 dark:text-blue-200/90'
                        : isHighRisk
                        ? 'text-amber-800 dark:text-amber-200/90'
                        : 'text-emerald-800 dark:text-emerald-200/90'
                    }`}
                  >
                    {!summary
                      ? 'Extracted laboratory test numbers are listed below. Click "Run Analysis Now" above to evaluate 3-engine organ risk scores and clinical findings.'
                      : isHighRisk
                      ? 'We compared your previous checkup, present numbers, and standard normal ranges below. See the opinion column for clear advice on each test.'
                      : 'We checked your previous checkups and standard ranges. Your numbers are calm and on track.'}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0 text-center sm:text-right">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Overall Health Status</p>
                <div className="mt-1 flex justify-center sm:justify-end">
                  {summary ? (
                    <RiskBadge tier={summary.risk_tier || 'Low'} />
                  ) : (
                    <span className="badge-blue text-xs font-semibold px-2.5 py-1">Pending Analysis</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE PATIENT REPORT TABLE: PREVIOUS vs PRESENT vs REFERENCE vs OPINION */}
          {/* ========================================================================= */}
          <div className="card space-y-4 p-0 overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>📊</span> Your Test Comparison Table
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  See what your numbers were before, what they are now, what is normal, and our clear opinion.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search test name..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    All ({comparisonRows.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('attention')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'attention'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Needs Attention
                  </button>
                  <button
                    onClick={() => setStatusFilter('normal')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'normal'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Normal
                  </button>
                </div>
              </div>
            </div>

            {/* The Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Laboratory Test</th>
                    <th className="px-4 py-3.5 text-center">
                      Previous Report
                      {prevReport && (
                        <span className="block text-[10px] font-normal normal-case text-slate-400 dark:text-slate-500">
                          {prevReport.report_date
                            ? new Date(prevReport.report_date).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Prior Encounter'}
                        </span>
                      )}
                    </th>
                    <th className="px-4 py-3.5 text-center">
                      Present (Today)
                      {reportData?.report_date && (
                        <span className="block text-[10px] font-normal normal-case text-slate-400 dark:text-slate-500">
                          {new Date(reportData.report_date).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </th>
                    <th className="px-4 py-3.5 text-center">Reference (Normal)</th>
                    <th className="px-5 py-3.5 min-w-[260px]">Doctor / AI Opinion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRows.map((row) => {
                    const isDanger = row.status === 'danger'
                    const isWarning = row.status === 'warning'
                    const isGood = row.status === 'good'

                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isDanger
                            ? 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/60 dark:hover:bg-rose-950/30'
                            : isWarning
                            ? 'bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* 1. Test Name */}
                        <td className="px-5 py-3.5 font-medium">
                          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {row.name}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                            {row.friendlyName !== row.name ? row.friendlyName : 'Routine clinical biomarker'}
                          </p>
                        </td>

                        {/* 2. Previous Report */}
                        <td className="px-4 py-3.5 text-center">
                          {row.previousVal != null ? (
                            <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                              {typeof row.previousVal === 'number' ? row.previousVal.toFixed(1) : row.previousVal} {row.unit}
                            </span>
                          ) : prevReport ? (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]" title="Not tested in prior report">
                              Not In Prior Test
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]" title="First encounter on file for this patient">
                              First Record
                            </span>
                          )}
                        </td>

                        {/* 3. Present Report (Today) */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-md text-xs sm:text-sm shadow-sm"
                            style={{
                              backgroundColor: isDanger ? '#ffe4e6' : isWarning ? '#fef3c7' : '#dcfce7',
                              color: isDanger ? '#9f1239' : isWarning ? '#92400e' : '#166534',
                            }}
                          >
                            <span>
                              {row.presentVal != null ? `${row.presentVal} ${row.unit}` : 'N/A'}
                            </span>
                            {row.previousVal != null && row.presentVal != null && (
                              <span>
                                {row.presentVal > row.previousVal ? (
                                  <ArrowUp className="w-3 h-3 text-rose-600" />
                                ) : row.presentVal < row.previousVal ? (
                                  <ArrowDown className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Minus className="w-3 h-3 text-slate-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Reference Values (Normal) */}
                        <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300 font-medium">
                          {row.refLow != null && row.refHigh != null ? (
                            <span className="bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
                              {row.refLow} – {row.refHigh} {row.unit}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* 5. Doctor / AI Opinion */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isDanger
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {row.badge}
                            </span>
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                              {row.opinion}
                            </p>
                            {(isDanger || isWarning) && (
                              <BiomarkerInsightCard
                                name={row.name}
                                status={row.status}
                                presentVal={row.presentVal}
                                previousVal={row.previousVal}
                                refLow={row.refLow}
                                refHigh={row.refHigh}
                              />
                            )}
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No laboratory biomarkers match your current search/filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Questions to Ask Your Doctor (Copyable / Printable) */}
          <div className="card p-6 bg-teal-50/60 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="font-bold text-teal-950 dark:text-teal-100 text-base">
                  Questions to Take to Your Doctor at Your Next Visit
                </h3>
              </div>
              <button
                onClick={handleCopyQuestions}
                className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto flex items-center gap-1.5"
              >
                {copiedQuestions ? '✓ Copied to Clipboard!' : '📋 Copy Questions'}
              </button>
            </div>

            <p className="text-xs text-teal-900/80 dark:text-teal-200/80 leading-relaxed">
              Print or copy these questions so you remember to discuss them at your appointment:
            </p>

            <ul className="space-y-2.5">
              {doctorQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-teal-200/80 dark:border-teal-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5 font-medium shadow-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOCTOR / CLINICAL VIEW (TECHNICAL) */}
      {/* ========================================================================= */}
      {viewMode === 'clinical' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 font-semibold px-2">Detailed Engine Breakdown:</span>
            <Link to={`/reports/${reportId}/baseline`} className="btn-secondary text-xs">
              Engine 1: Personal Baseline (Z-Scores)
            </Link>
            <Link to={`/reports/${reportId}/consistency`} className="btn-secondary text-xs">
              Engine 2: Biological Consistency Check
            </Link>
            <Link to={`/reports/${reportId}/risk`} className="btn-secondary text-xs font-semibold text-teal-600 dark:text-teal-400">
              Engine 3: Multi-Test Disease Risk (HRI) ➔
            </Link>
          </div>

          {/* Engine 3 Clear Doctor Synthesis Card */}
          <div className="card space-y-4 border-l-4 border-l-rose-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Engine 3 Clinical Analysis
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Organ Burden &amp; Co-Occurring Biomarker Scoring
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Multisystem Disease Risk Burden: {((riskData?.overall_health_risk_index ?? 0) * 100).toFixed(1)}% HRI
                </h3>
              </div>

              <Link
                to={`/reports/${reportId}/risk`}
                className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto gap-1"
              >
                Inspect All 6 Organ Pathways ➔
              </Link>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Engine 3 evaluates <strong>6 clinical organ domains</strong> by synthesizing both population reference interval breaches and personal baseline trajectory shifts.
            </p>

            {/* Organ System Distribution Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {riskCategoryResults.map((cat, idx) => {
                if (!cat) return null
                const scorePct = Math.round((cat.normalized_score ?? 0) * 100)
                const isFlag = Boolean(cat.is_flagged)
                const factors = Array.isArray(cat.contributing_factors) ? cat.contributing_factors : []
                const triggeredFactors = factors.filter((f) => f && (f.abnormal || f.feature_score > 0))

                return (
                  <div
                    key={cat.risk_category_id || idx}
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      isFlag
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{cat.risk_category_name || 'Organ Domain'}</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isFlag ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {scorePct}% Risk
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFlag ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(scorePct, 5)}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <p>
                        Severity Weight: <strong className="text-slate-700 dark:text-slate-300">{cat.severity_weight ?? 1.0}x</strong>
                      </p>
                      {triggeredFactors.length > 0 ? (
                        <p className="text-rose-700 dark:text-rose-300 font-medium">
                          Triggered by: {triggeredFactors.map((f) => f.biomarker || 'Biomarker').join(', ')}
                        </p>
                      ) : (
                        <p className="text-emerald-600 dark:text-emerald-400">All parameters within normal bounds</p>
                      )}
                    </div>
                  </div>
                )
              })}
              {riskCategoryResults.length === 0 && (
                <div className="col-span-full py-6 text-center text-slate-400 text-xs italic">
                  No organ risk evaluations recorded for this report.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              {/* Key Findings */}
              <div className="card space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Key Findings &amp; Observations
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                  {keyFindingsList.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                  {keyFindingsList.length === 0 && (
                    <li className="text-slate-400 italic list-none">No notable findings recorded.</li>
                  )}
                </ul>
              </div>

              {/* Structured Sections */}
              {summarySectionsList.map((s, idx) => (
                <div key={idx} className="card space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{s.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.content}</p>
                </div>
              ))}

              {/* Recommendations */}
              <div className="card space-y-3 bg-teal-50/50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/80">
                <h3 className="font-bold text-teal-950 dark:text-teal-200 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  Clinical Guidance &amp; Protocols
                </h3>
                <ul className="space-y-2 text-xs text-teal-900 dark:text-teal-200/90 list-disc list-inside leading-relaxed">
                  {recommendationsList.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                  {recommendationsList.length === 0 && (
                    <li className="text-teal-700 dark:text-teal-400 italic list-none">Continue routine preventative health follow-up.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Sidebar Summary Info */}
            <div className="space-y-5">
              <div className="card space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Overall Risk Assessment</h4>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Risk Stratification Tier</p>
                  <div className="mt-1">
                    <RiskBadge tier={summary?.risk_tier || 'Low'} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Health Risk Index (HRI)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {((summary?.overall_risk_index || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
                  Engine: <span className="font-medium text-slate-600 dark:text-slate-300">{summary?.generated_by}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
