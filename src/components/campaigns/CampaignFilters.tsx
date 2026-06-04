import type { CampaignStatus, FilterPreset } from '../../types/mediaops'
import { Button } from '../ui/Button'

const statusOptions: Array<CampaignStatus | 'all'> = [
  'all',
  'active',
  'paused',
  'ended',
]

interface CampaignFiltersProps {
  search: string
  status: CampaignStatus | 'all'
  onSearchChange: (value: string) => void
  onStatusChange: (value: CampaignStatus | 'all') => void
  presetName: string
  onPresetNameChange: (value: string) => void
  presets: FilterPreset[]
  selectedPresetId: string
  onSelectedPresetIdChange: (presetId: string) => void
  onSavePreset: () => void
  onLoadPreset: () => void
  onDeletePreset: () => void
  onReset: () => void
  onDownloadCsv: () => void
  resultCount: number
}

export function CampaignFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  presetName,
  onPresetNameChange,
  presets,
  selectedPresetId,
  onSelectedPresetIdChange,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onReset,
  onDownloadCsv,
  resultCount,
}: CampaignFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label
            htmlFor="campaign-search"
            className="field-label text-sm font-medium"
          >
            캠페인 검색
          </label>
          <input
            id="campaign-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="캠페인명 또는 담당자로 검색"
            className="field-shell focus-ring px-4 py-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="campaign-status"
            className="field-label text-sm font-medium"
          >
            상태
          </label>
          <select
            id="campaign-status"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as CampaignStatus | 'all')
            }
            className="field-shell focus-ring px-4 py-3 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all'
                  ? '전체 상태'
                  : option === 'active'
                    ? '운영 중'
                    : option === 'paused'
                      ? '일시중지'
                      : '종료'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_240px_auto_auto_auto_auto]">
        <div className="space-y-2">
          <label
            htmlFor="campaign-preset-name"
            className="field-label text-sm font-medium"
          >
            프리셋 이름
          </label>
          <input
            id="campaign-preset-name"
            value={presetName}
            onChange={(event) => onPresetNameChange(event.target.value)}
            placeholder="현재 필터 조건 저장"
            className="field-shell focus-ring px-4 py-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="campaign-preset-select"
            className="field-label text-sm font-medium"
          >
            저장된 프리셋
          </label>
          <select
            id="campaign-preset-select"
            value={selectedPresetId}
            onChange={(event) => onSelectedPresetIdChange(event.target.value)}
            className="field-shell focus-ring px-4 py-3 text-sm"
          >
            <option value="">
              {presets.length === 0 ? '저장된 프리셋이 없습니다' : '프리셋 선택'}
            </option>
            {presets.map((preset) => (
              <option
                key={preset.id}
                value={preset.id}
              >
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          className="self-end"
          onClick={onSavePreset}
          data-testid="save-preset-button"
        >
          프리셋 저장
        </Button>
        <Button
          variant="secondary"
          className="self-end"
          onClick={onLoadPreset}
          disabled={!selectedPresetId}
          data-testid="load-preset-button"
        >
          불러오기
        </Button>
        <Button
          variant="secondary"
          className="self-end"
          onClick={onDeletePreset}
          disabled={!selectedPresetId}
          data-testid="delete-preset-button"
        >
          삭제
        </Button>
        <div className="flex flex-wrap items-end gap-3">
          <Button variant="secondary" onClick={onReset} data-testid="reset-filters-button">
            초기화
          </Button>
          <Button
            variant="secondary"
            onClick={onDownloadCsv}
            data-testid="download-csv-button"
          >
            CSV 다운로드
          </Button>
        </div>
      </div>

      <p
        className="text-sm text-[var(--text-tertiary)]"
        aria-live="polite"
        data-testid="campaign-results-count"
      >
        현재 조건에 맞는 캠페인 {resultCount}개
      </p>
    </div>
  )
}
