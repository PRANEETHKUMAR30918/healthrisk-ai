import React from 'react'
import { AlertCircle } from 'lucide-react'

export const Disclaimer = ({ customText }) => {
  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 rounded-xl p-4 my-4 flex items-start gap-3 transition-colors">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
        <strong className="font-semibold text-amber-950 dark:text-amber-100">Academic / Clinical Decision-Support Prototype: </strong>
        {customText ||
          "This software provides algorithmic analysis of laboratory values and biological consistency modeling. It does NOT claim to replace a doctor, provide a definitive medical diagnosis, prescribe medicines, or replace clinical judgment. All outputs are potential risk indicators that require review by a qualified healthcare professional."}
      </div>
    </div>
  )
}
