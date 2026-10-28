import React from 'react'

export const ConfidenceIndicator = ({ confidence }) => {
  const pct = Math.round(confidence * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="text-xs font-medium text-slate-600">{pct}%</span>
    </div>
  )
}
