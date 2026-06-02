import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CampaignFilterPresetState,
  CampaignFilters,
} from './types'

type StoredFilterPreset = CampaignFilterPresetState['presets'][number]

function normalizeName(name: string) {
  return name.trim()
}

function buildPreset(
  name: string,
  filters: CampaignFilters,
): StoredFilterPreset {
  const now = new Date().toISOString()

  return {
    id: `preset-${Math.random().toString(36).slice(2, 10)}`,
    name: normalizeName(name),
    filters,
    createdAt: now,
  }
}

export const useCampaignFilterPresetStore = create<CampaignFilterPresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      savePreset: (name, filters) => {
        const presetName = normalizeName(name) || '이름 없는 프리셋'
        const existingPreset = get().presets.find(
          (preset) => preset.name.toLowerCase() === presetName.toLowerCase(),
        )
        const nextPreset = buildPreset(presetName, filters)

        set((state) => ({
          presets: existingPreset
            ? state.presets.map((preset) =>
                preset.id === existingPreset.id
                  ? { ...nextPreset, id: existingPreset.id }
                  : preset,
              )
            : [nextPreset, ...state.presets].slice(0, 8),
        }))

        return existingPreset
          ? { ...nextPreset, id: existingPreset.id }
          : nextPreset
      },
      deletePreset: (presetId) =>
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== presetId),
        })),
    }),
    {
      name: 'mediaops-campaign-filter-presets',
      partialize: (state) => ({ presets: state.presets }),
    },
  ),
)
