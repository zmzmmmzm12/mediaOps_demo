import type { Campaign } from '../../types/mediaops'
import { formatCurrency } from '../../lib/format'

export function deriveCampaignSummary(campaign: Campaign) {
  const budgetGap = campaign.budget - campaign.spend
  const budgetUtilization = campaign.budget > 0 ? (campaign.spend / campaign.budget) * 100 : 0

  return {
    budgetUtilization: Number(budgetUtilization.toFixed(1)),
    pacing:
      budgetGap > 0
        ? `예산 대비 ${formatCurrency(budgetGap)} 남음`
        : '예산을 모두 소진했습니다',
    health:
      campaign.status === 'paused'
        ? '점검을 위해 일시중지됨'
        : campaign.roas < 2
          ? '성과 회복 액션 필요'
          : '안정적으로 운영 중',
    nextMilestone:
      campaign.status === 'ended'
        ? '최종 리포트 정리 및 아카이브 진행'
        : '다음 최적화 체크포인트까지 48시간',
  }
}
