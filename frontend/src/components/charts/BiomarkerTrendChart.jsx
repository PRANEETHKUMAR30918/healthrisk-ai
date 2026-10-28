import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

export const BiomarkerTrendChart = ({ biomarker, unit, values, refLow, refHigh }) => {
  if (!values || values.length === 0) {
    return <div className="text-xs text-slate-400 py-6 text-center">No longitudinal readings available.</div>
  }

  const data = values.map((v, i) => ({
    index: i + 1,
    value: v,
    label: i === values.length - 1 ? 'Current' : `Report #${i + 1}`,
  }))

  return (
    <div className="w-full h-56 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit={unit ? ` ${unit}` : ''} />
          <Tooltip
            formatter={(val) => [`${val} ${unit || ''}`, biomarker]}
            labelFormatter={(l) => l}
          />
          {refLow != null && (
            <ReferenceLine y={refLow} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'Low', fontSize: 9 }} />
          )}
          {refHigh != null && (
            <ReferenceLine y={refHigh} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'High', fontSize: 9 }} />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0d9488"
            strokeWidth={2}
            dot={{ r: 4, fill: '#0d9488' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
