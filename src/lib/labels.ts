import type {
  CampaignChannel,
  CampaignStatus,
  Priority,
  UserRole,
} from '../types/mediaops'

export const roleTextMap: Record<UserRole, string> = {
  admin: '관리자',
  manager: '매니저',
  viewer: '조회 전용',
}

export const campaignStatusTextMap: Record<CampaignStatus, string> = {
  active: '운영 중',
  paused: '일시중지',
  ended: '종료',
}

export const campaignChannelTextMap: Record<CampaignChannel, string> = {
  google: '구글',
  meta: '메타',
  naver: '네이버',
  kakao: '카카오',
}

export const priorityTextMap: Record<Priority, string> = {
  critical: '우선 대응',
  steady: '안정 운영',
  planned: '계획 단계',
}
