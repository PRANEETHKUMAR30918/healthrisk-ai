import React from 'react'
import { CheckCircle2 } from 'lucide-react'

const STAGES = [
  'Document Upload',
  'Text & OCR Parsing',
  'Clinical NLP Extraction',
  'Verification Review',
  'Three-Engine Analysis',
]

export const ProgressSteps = ({ currentStage }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STAGES.map((label, idx) => {
          const isDone = idx < currentStage
          const isCurrent = idx === currentStage
          return (
            <div key={label} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-colors ${
                  isDone
                    ? 'bg-teal-600 text-white'
                    : isCurrent
                    ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-2 border-teal-600 dark:border-teal-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] mt-2 text-center font-medium ${
                  isCurrent
                    ? 'text-teal-700 dark:text-teal-400 font-semibold'
                    : isDone
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
