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
            className="text-sm font-medium text-white"
          >
            Search campaigns
          </label>
          <input
            id="campaign-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by campaign or client"
            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-teal-300"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="campaign-status"
            className="text-sm font-medium text-white"
          >
            Status
          </label>
          <select
            id="campaign-status"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as CampaignStatus | 'all')
            }
            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option === 'all' ? 'All statuses' : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_240px_auto_auto_auto_auto]">
        <div className="space-y-2">
          <label
            htmlFor="campaign-preset-name"
            className="text-sm font-medium text-white"
          >
            Preset name
          </label>
          <input
            id="campaign-preset-name"
            value={presetName}
            onChange={(event) => onPresetNameChange(event.target.value)}
            placeholder="Save current filters"
            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-teal-300"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="campaign-preset-select"
            className="text-sm font-medium text-white"
          >
            Saved presets
          </label>
          <select
            id="campaign-preset-select"
            value={selectedPresetId}
            onChange={(event) => onSelectedPresetIdChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
          >
            <option value="" className="text-slate-900">
              {presets.length === 0 ? 'No presets saved' : 'Choose a preset'}
            </option>
            {presets.map((preset) => (
              <option
                key={preset.id}
                value={preset.id}
                className="text-slate-900"
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
          Save preset
        </Button>
        <Button
          variant="secondary"
          className="self-end"
          onClick={onLoadPreset}
          disabled={!selectedPresetId}
          data-testid="load-preset-button"
        >
          Load preset
        </Button>
        <Button
          variant="secondary"
          className="self-end"
          onClick={onDeletePreset}
          disabled={!selectedPresetId}
          data-testid="delete-preset-button"
        >
          Delete preset
        </Button>
        <div className="flex flex-wrap items-end gap-3">
          <Button variant="secondary" onClick={onReset} data-testid="reset-filters-button">
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={onDownloadCsv}
            data-testid="download-csv-button"
          >
            Download CSV
          </Button>
        </div>
      </div>

      <p
        className="text-sm text-slate-300"
        aria-live="polite"
        data-testid="campaign-results-count"
      >
        {resultCount} campaigns match the current filters.
      </p>
    </div>
  )
}
