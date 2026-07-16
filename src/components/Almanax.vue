<script setup lang="ts">
import { computed } from 'vue'
import { buildGroceryList, inDayMonthRange, isGathered, isHarvestable } from '../almanax'
import {
  TYPE_FILTERS, VIEW_MODES, STATUS_FILTERS, BONUS_MODES,
  type TypeFilter, type ViewMode, type StatusFilter, type BonusMode,
} from '../constants'
import { usePersistedRef, numberCodec, dateCodec, optionCodec } from '../composables/usePersistedRef'
import { useAlmanaxItems } from '../composables/useAlmanaxItems'
import DailyView from './DailyView.vue'
import GroceryView from './GroceryView.vue'
import FiltersPanel from './FiltersPanel.vue'
import FilterPills from './FilterPills.vue'

// État de l'UI, persisté dans le LocalStorage.
const count = usePersistedRef('count', 1, numberCodec)
const startDate = usePersistedRef<Date | null>('startDate', new Date(), dateCodec)
const endDate = usePersistedRef<Date | null>('endDate', new Date(), dateCodec)
const typeFilter = usePersistedRef<TypeFilter>('typeFilter', 'all', optionCodec(TYPE_FILTERS))
const statusFilter = usePersistedRef<StatusFilter>('statusFilter', 'all', optionCodec(STATUS_FILTERS))
const bonusMode = usePersistedRef<BonusMode>('bonusMode', 'tooltip', optionCodec(BONUS_MODES))
const viewMode = usePersistedRef<ViewMode>('viewMode', 'daily', optionCodec(VIEW_MODES))

// Données de l'année + état "récupéré" (persisté lui aussi).
const { items, resetPurchased } = useAlmanaxItems()

// Filtres appliqués en cascade : dates → type → statut.
const itemsInRange = computed(() => {
  const start = startDate.value
  const end = endDate.value
  if (!start || !end) return []
  return items.value.filter((item) => inDayMonthRange(item.date, start, end))
})

const itemsOfType = computed(() => {
  switch (typeFilter.value) {
    case 'all':
      return itemsInRange.value
    case 'harvestable':
      return itemsInRange.value.filter((item) => isHarvestable(item.itemType))
    default:
      return itemsInRange.value.filter((item) => item.subtype === typeFilter.value)
  }
})

// Vue liste de courses : items regroupés par nom, quantités sommées.
const groceryList = computed(() => buildGroceryList(itemsOfType.value))

// Listes réellement affichées : filtre de statut appliqué en dernier.
const matchesStatus = (done: boolean) =>
  statusFilter.value === 'all' || done === (statusFilter.value === 'done')

const visibleItems = computed(() => itemsOfType.value.filter((i) => matchesStatus(i.purchased)))
const visibleGrocery = computed(() => groceryList.value.filter((e) => matchesStatus(isGathered(e))))

// Progression : récupérés / total dans la vue courante (avant filtre de statut).
const progress = computed(() => {
  const total = viewMode.value === 'grocery' ? groceryList.value.length : itemsOfType.value.length
  const done = viewMode.value === 'grocery'
    ? groceryList.value.filter(isGathered).length
    : itemsOfType.value.filter((i) => i.purchased).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-full min-h-0">
    <FiltersPanel v-model:count="count" v-model:start-date="startDate" v-model:end-date="endDate"
      v-model:type-filter="typeFilter" v-model:status-filter="statusFilter" v-model:bonus-mode="bonusMode"
      :show-bonus="viewMode === 'daily'" />

    <!-- Résultats -->
    <div class="w-full min-w-0 overflow-y-auto md:max-h-full mt-5 mb-5 px-4">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        <h2 class="text-lg font-semibold text-gray-700">
          Résultats ({{ viewMode === 'grocery' ? visibleGrocery.length : visibleItems.length }})
        </h2>

        <!-- Réinitialiser les objets cochés -->
        <button type="button" @click="resetPurchased" :disabled="progress.done === 0"
          title="Décocher tous les objets récupérés"
          class="px-3 py-1 rounded-xl text-sm border transition-colors flex items-center gap-1
            border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
          <i class="pi pi-refresh" style="font-size: 0.75rem"></i> Réinitialiser
        </button>

        <!-- Bascule de vue (même style pill que les filtres) -->
        <FilterPills v-model="viewMode" :options="VIEW_MODES" class="ml-auto" />
      </div>

      <!-- Barre de progression -->
      <div v-if="progress.total" class="mb-4">
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progression</span>
          <span>{{ progress.done }} / {{ progress.total }} ({{ progress.percent }}%)</span>
        </div>
        <div class="h-2 w-full rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full rounded-xl bg-blue-600 transition-all duration-300" :style="{ width: progress.percent + '%' }"></div>
        </div>
      </div>

      <!-- Vue liste de courses : items regroupés, quantités sommées -->
      <GroceryView v-if="viewMode === 'grocery'" :entries="visibleGrocery" :count="count" />

      <!-- Vue par jour -->
      <DailyView v-else :items="visibleItems" :count="count" :bonus-mode="bonusMode" />
    </div>
  </div>
</template>
