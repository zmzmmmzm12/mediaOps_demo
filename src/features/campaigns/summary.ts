import type { Campaign } from '../../types/mediaops'
import { formatCurrency } from '../../lib/format'

export function deriveCampaignSummary(campaign: Campaign) {
  const budgetGap = campaign.budget - campaign.spend
  const budgetUtilization = campaign.budget > 0 ? (campaign.spend / campaign.budget) * 100 : 0

  return {
    budgetUtilization: Number(budgetUtilization.toFixed(1)),
    pacing:
      budgetGap > 0
        ? `${formatCurrency(budgetGap)} remaining against budget`
        : 'Budget fully consumed',
    health:
      campaign.status === 'paused'
        ? 'Paused for review'
        : campaign.roas < 2
          ? 'Recovery plan required'
          : 'On track',
    nextMilestone:
      campaign.status === 'ended'
        ? 'Archive and export final report'
        : 'Next optimization checkpoint in 48 hours',
  }
}
