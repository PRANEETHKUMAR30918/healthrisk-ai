import React from 'react'
import { getRiskTierBadge } from '../../utils/riskColors'

export const RiskBadge = ({ tier }) => {
  return <span className={getRiskTierBadge(tier)}>{tier}</span>
}
